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
            bundledApps: this.fetchBundledApps().map(response => response.map(d2App => this.buildBundledApp(d2App))),
        }).map(({ installedApps, bundledApps }) => {
            const installedAppKeys = new Set(installedApps.map(app => app.key));
            // exclude any bundled app that has been installed and returned from /apps, giving precedence to updated apps
            const filteredBundledApps = bundledApps.filter(bundledApp => !installedAppKeys.has(bundledApp.key));
            return [...filteredBundledApps, ...installedApps];
        });
    }

    private fetchBundledApps(): FutureData<BundledD2App[]> {
        return Future.fromPromise<BundledD2App[]>(
            fetch(`${this.api.baseUrl}/dhis-web-apps/apps-bundle.json`).then(response => response.json())
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

    private buildBundledApp(d2App: BundledD2App): App {
        return {
            version: d2App.version,
            name: d2App.name,
            key: d2App.name,
            baseUrl: `/${d2App.webName}/`,
            pluginLaunchUrl: `/${d2App.webName}/plugin.html`,
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

interface BundledD2App {
    name: string;
    webName: string;
    version: string;
    buildDate: string;
    sourceRepo: string;
    sourceRef: string;
    source: string;
}
