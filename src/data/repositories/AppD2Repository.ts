import { Future, FutureData } from "../../domain/entities/Future";
import { App } from "../../domain/entities/App";
import { AppRepository } from "../../domain/repositories/AppRepository";
import { D2Api } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";

export class AppD2Repository implements AppRepository {
    constructor(private api: D2Api) {}

    public get(): FutureData<App[]> {
        return Future.joinObj({
            installedApps: apiToFuture(this.api.get<D2AppsResponse>("/apps")).map(response =>
                response.map(d2App => this.buildApp(d2App))
            ),
            bundledApps: this.fetchBundledApps(),
        }).map(({ installedApps, bundledApps }) => {
            const installedAppKeys = new Set(installedApps.map(app => app.key));
            // exclude any bundled app that has been installed and returned from /apps, giving precedence to updated apps
            const filteredBundledApps = bundledApps.filter(bundledApp => !installedAppKeys.has(bundledApp.key));
            return [...filteredBundledApps, ...installedApps];
        });
    }

    private fetchBundledApps(): FutureData<App[]> {
        return Future.fromPromise<App[]>(
            fetch(`${this.api.baseUrl}/dhis-web-apps/apps-bundle.json`)
                .then(response => (response.ok ? response.json() : []))
                .then(json =>
                    // DHIS2 <= 2.42 returns a plain array; DHIS2 >= 2.43 wraps it as { apps: [...] }
                    // and drops webName, so the app folder name has to be derived from its name instead.
                    Array.isArray(json)
                        ? json.map(buildBundledAppLegacy)
                        : Array.isArray(json?.apps)
                        ? json.apps.map(buildBundledApp)
                        : []
                )
                .catch(() => [])
        );
    }

    private buildApp(d2App: D2App): App {
        return {
            version: d2App.version,
            name: d2App.name,
            key: d2App.key,
            baseUrl: d2App.baseUrl,
            pluginLaunchUrl: d2App.pluginLaunchUrl,
        };
    }
}

interface D2App {
    version: string;
    name: string;
    key: string;
    baseUrl: string;
    pluginLaunchUrl: string;
}

type D2AppsResponse = D2App[];

// DHIS2 <= 2.42 apps-bundle.json format: plain array with an explicit webName (server folder name).
interface BundledD2AppLegacy {
    name: string;
    webName: string;
    version: string;
}

// DHIS2 >= 2.43 apps-bundle.json format: { apps: [...] }, no webName.
interface BundledD2App {
    name: string; // e.g. "data-visualizer-app"
    version: string;
}

function buildBundledAppLegacy(d2App: BundledD2AppLegacy): App {
    return {
        version: d2App.version,
        name: d2App.name,
        key: d2App.name,
        baseUrl: `/${d2App.webName}/`,
        pluginLaunchUrl: `/${d2App.webName}/plugin.html`,
    };
}

function buildBundledApp(d2App: BundledD2App): App {
    const key = d2App.name.replace(/-app$/, "");
    const webName = `dhis-web-${key}`;
    return {
        version: d2App.version,
        name: d2App.name,
        key,
        baseUrl: `/${webName}/`,
        pluginLaunchUrl: `/${webName}/plugin.html`,
    };
}
