/// <reference types="vitest" />
import { UserConfig, defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";
import nodePolyfills from "vite-plugin-node-stdlib-browser";
import * as path from "path";

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
                configure: (proxyServer: { on(event: string, handler: (...args: unknown[]) => void): void }) => {
                    proxyServer.on("proxyReq", (...args: unknown[]) => {
                        const proxyReq = args[0] as { setHeader(name: string, value: string): void };
                        if (cookieHeader) {
                            proxyReq.setHeader("cookie", cookieHeader);
                        }
                    });
                },
            },
        };
    }
}
