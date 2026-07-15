/// <reference types="vitest" />
import { HttpProxy, UserConfig, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import nodePolyfills from "vite-plugin-node-stdlib-browser";
import * as path from "path";
import type { IncomingMessage, ServerResponse } from "http";

const PLUGIN_HTML_PATH = /\/dhis-web-[^/]+\/plugin\.html$/;

export default ({ mode }): UserConfig => {
    const env = { ...process.env, ...loadEnv(mode, process.cwd()) };
    const proxy = getProxy(env as Record<string, string>);

    // https://vitejs.dev/config/
    return defineConfig({
        base: "", // Relative paths
        plugins: [
            nodePolyfills(),
            react(),
            checker({
                overlay: false,
                typescript: true,
                eslint: {
                    lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
                    dev: { logLevel: ["warning"] },
                },
            }),
        ],
        test: {
            environment: "jsdom",
            include: ["**/*.spec.{ts,tsx}"],
            setupFiles: "./src/tests/setup.js",
            exclude: ["node_modules", "cypress"],
            globals: true,
        },
        server: {
            port: parseInt(env.VITE_PORT || "8081", 10),
            proxy: proxy,
        },
        resolve: {
            alias: {
                $: path.resolve(__dirname, "./src"),
            },
        },
    });
};

function getProxy(env: Record<string, string>) {
    const dhis2UrlVar = "VITE_DHIS2_BASE_URL";
    const dhis2AuthVar = "VITE_DHIS2_AUTH";
    const targetUrl = env[dhis2UrlVar];
    const auth = env[dhis2AuthVar];
    const isBuild = env.NODE_ENV === "production";

    if (isBuild) {
        return {};
    } else if (!targetUrl) {
        console.error(`Set ${dhis2UrlVar}`);
        process.exit(1);
    } else if (!auth) {
        console.error(`Set ${dhis2AuthVar}`);
        process.exit(1);
    } else {
        let cookieHeader: string | undefined;
        getD2Cookie(targetUrl, auth).then(cookie => {
            cookieHeader = cookie;
        });

        return {
            "/dhis2": {
                target: targetUrl,
                changeOrigin: true,
                auth: auth,
                rewrite: (pathName: string) => pathName.replace(/^\/dhis2/, ""),
                // proxyRes below pipes every non-plugin.html response through untouched, so this
                // doesn't add buffering cost to the rest of the proxied traffic.
                selfHandleResponse: true,
                configure: (proxyServer: HttpProxy.Server) => {
                    proxyServer.on("proxyReq", (proxyReq: { setHeader(name: string, value: string): void }) => {
                        if (cookieHeader) {
                            proxyReq.setHeader("cookie", cookieHeader);
                        }
                    });
                    proxyServer.on(
                        "proxyRes",
                        (proxyRes: IncomingMessage, req: IncomingMessage, res: ServerResponse) => {
                            // DHIS2 apps (e.g. dhis-web-data-visualizer) register a Workbox service worker
                            // that precaches plugin.html, which would otherwise keep serving the stale
                            // unrewritten page from cache after the first load, bypassing the rewrite
                            // below. 404 here just makes the browser skip installing it (no error, no
                            // retry) and fall back to always fetching over the network — safe in dev,
                            // where there's nothing to cache for and no offline scenario to preserve.
                            // The Service-Worker header is the spec-defined signal for this request (sent
                            // regardless of file name/path); the URL suffix is a fallback for browsers
                            // that omit it before the worker is installed.
                            const isServiceWorkerRequest =
                                req.headers["service-worker"] === "script" ||
                                /\/service-worker\.js$/.test(req.url ?? "");
                            const isPluginHtmlRequest = !!req.url && PLUGIN_HTML_PATH.test(req.url);

                            if (isServiceWorkerRequest) {
                                res.writeHead(404);
                                res.end();
                            } else if (isPluginHtmlRequest) {
                                const proxyOrigin = `http://${req.headers.host}/dhis2`;
                                rewriteBaseUrlInPluginHtml(proxyRes, res, proxyOrigin, targetUrl);
                            } else {
                                res.writeHead(proxyRes.statusCode ?? 200, proxyRes.headers);
                                proxyRes.pipe(res);
                            }
                        }
                    );
                },
            },
        };
    }
}

/**
 * DHIS2 plugin.html pages embed an absolute <meta name="dhis2-base-url"> pointing at the
 * real DHIS2 server. The app-runtime SDK running inside the plugin iframe reads that tag to
 * know which host to call, bypassing this proxy (and its injected session cookie) entirely,
 * which causes 401s in local dev. Rewrite it to point back at the proxy's own origin.
 */
function rewriteBaseUrlInPluginHtml(
    proxyRes: IncomingMessage,
    res: ServerResponse,
    proxyOrigin: string,
    targetUrl: string
): void {
    const chunks: Buffer[] = [];
    proxyRes.on("data", (chunk: Buffer) => chunks.push(chunk));
    proxyRes.on("end", () => {
        const originHtml = Buffer.concat(chunks as unknown as Uint8Array[]).toString("utf-8");
        const rewrittenHtml = originHtml.split(targetUrl).join(proxyOrigin);
        res.writeHead(proxyRes.statusCode ?? 200, {
            ...proxyRes.headers,
            "content-length": String(Buffer.byteLength(rewrittenHtml)),
        });
        res.end(rewrittenHtml);
    });
}

async function getD2Cookie(targetUrl: string, auth: string): Promise<string | undefined> {
    if (!targetUrl || !auth) return undefined;
    const authBase64 = Buffer.from(auth, "utf-8").toString("base64");
    const res = await fetch(`${targetUrl}/api/me.json`, {
        headers: {
            Authorization: `Basic ${authBase64}`,
            "Content-Type": "application/json",
        },
    });
    return res.headers.get("set-cookie") ?? undefined;
}
