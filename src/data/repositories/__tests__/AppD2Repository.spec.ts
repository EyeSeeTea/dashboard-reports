import { MockWebServer } from "../../../utils/tests/MockWebServer";
import { Instance } from "../../entities/Instance";
import { getD2APiFromInstance } from "../../../utils/d2-api";
import { AppD2Repository } from "../AppD2Repository";
import { App } from "../../../domain/entities/App";

const mockWebServer = new MockWebServer();
const instance = new Instance({ url: "http://localhost" });
const api = getD2APiFromInstance(instance);
const appD2Repository = new AppD2Repository(api);

describe("App repository", () => {
    beforeAll(() => mockWebServer.start());
    afterEach(() => mockWebServer.resetHandlers());
    afterAll(() => mockWebServer.close());

    it("builds apps from /apps using the server-provided baseUrl and pluginLaunchUrl (DHIS2 2.40-2.43)", async () => {
        givenInstalledApps([dataVisualizerInstalledApp()]);
        givenBundleNotFound();

        const apps = await whenGettingApps();

        expect(apps).toEqual<App[]>([
            {
                version: "101.6.0",
                name: "Data Visualizer",
                key: "data-visualizer",
                baseUrl: "http://localhost/dhis-web-data-visualizer",
                pluginLaunchUrl: "http://localhost/dhis-web-data-visualizer/plugin.html",
            },
        ]);
    });

    it("parses the legacy apps-bundle.json format (DHIS2 <= 2.42: plain array with webName)", async () => {
        givenInstalledApps([]);
        givenLegacyBundledApps([dataVisualizerLegacyBundledApp()]);

        const apps = await whenGettingApps();

        expect(apps).toEqual<App[]>([
            {
                version: "101.6.0",
                name: "data-visualizer",
                key: "data-visualizer",
                baseUrl: "/dhis-web-data-visualizer/",
                pluginLaunchUrl: "/dhis-web-data-visualizer/plugin.html",
            },
        ]);
    });

    it("infers webName from the app name in the new apps-bundle.json format (DHIS2 >= 2.43: { apps: [...] }, no webName)", async () => {
        givenInstalledApps([]);
        givenBundledApps([dataVisualizerBundledApp()]);

        const apps = await whenGettingApps();

        // webName is not provided by DHIS2 2.43+; it's derived as dhis-web-<name without "-app">,
        // verified empirically against a real 2.43 instance's installed /apps baseUrl folders.
        expect(apps).toEqual<App[]>([
            {
                version: "101.5.2",
                name: "data-visualizer-app",
                key: "data-visualizer",
                baseUrl: "/dhis-web-data-visualizer/",
                pluginLaunchUrl: "/dhis-web-data-visualizer/plugin.html",
            },
        ]);
    });

    it("gives precedence to /apps over apps-bundle.json when the same app is present in both", async () => {
        givenInstalledApps([{ ...dataVisualizerInstalledApp(), version: "999.0.0" }]);
        givenBundledApps([dataVisualizerBundledApp()]);

        const apps = await whenGettingApps();

        expect(apps).toHaveLength(1);
        expect(apps[0]?.version).toBe("999.0.0");
    });

    it("does not fail the whole app list when apps-bundle.json is unreachable (e.g. redirected to login HTML)", async () => {
        givenInstalledApps([dataVisualizerInstalledApp()]);
        givenBundleRedirectedToLoginPage();

        const apps = await whenGettingApps();

        expect(apps).toEqual<App[]>([
            {
                version: "101.6.0",
                name: "Data Visualizer",
                key: "data-visualizer",
                baseUrl: "http://localhost/dhis-web-data-visualizer",
                pluginLaunchUrl: "http://localhost/dhis-web-data-visualizer/plugin.html",
            },
        ]);
    });
});

function whenGettingApps(): Promise<App[]> {
    return appD2Repository.get().toPromise();
}

function dataVisualizerInstalledApp() {
    return {
        version: "101.6.0",
        name: "Data Visualizer",
        key: "data-visualizer",
        baseUrl: "http://localhost/dhis-web-data-visualizer",
        pluginLaunchUrl: "http://localhost/dhis-web-data-visualizer/plugin.html",
    };
}

function dataVisualizerLegacyBundledApp() {
    return {
        name: "data-visualizer",
        webName: "dhis-web-data-visualizer",
        version: "101.6.0",
        buildDate: "Thu May 7 17:35:08 2026 +0000",
        sourceRepo: "https://github.com/d2-ci/data-visualizer-app",
        sourceRef: "v101.6.0",
        source: "https://github.com/d2-ci/data-visualizer-app#af70914",
    };
}

function dataVisualizerBundledApp() {
    return {
        name: "data-visualizer-app",
        url: "https://github.com/d2-ci/data-visualizer-app#v101.5.2",
        branch: "v101.5.2",
        etag: "4635811127006d14da36333b4ce7b8bd2dc10d3964b9b53f81b32706d567a3c7",
        downloadDate: "Wed Jun 10 12:06:14 UTC 2026",
        version: "101.5.2",
        buildDate: "Thu Apr 09 2026 14:42:56 GMT+0000",
        commitUrl: "https://github.com/dhis2/data-visualizer-app/commit/6f8e5dd",
    };
}

function givenInstalledApps(apps: object[]) {
    mockWebServer.addRequestHandlers([
        {
            method: "get",
            endpoint: "http://localhost/api/apps",
            httpStatusCode: 200,
            response: apps,
        },
    ]);
}

function givenLegacyBundledApps(apps: unknown[]) {
    mockWebServer.addRequestHandlers([
        {
            method: "get",
            endpoint: "http://localhost/dhis-web-apps/apps-bundle.json",
            httpStatusCode: 200,
            response: apps,
        },
    ]);
}

function givenBundledApps(apps: unknown[]) {
    mockWebServer.addRequestHandlers([
        {
            method: "get",
            endpoint: "http://localhost/dhis-web-apps/apps-bundle.json",
            httpStatusCode: 200,
            response: { buildDate: "Wed Jun 10 12:06:13 UTC 2026", apps },
        },
    ]);
}

function givenBundleNotFound() {
    mockWebServer.addRequestHandlers([
        {
            method: "get",
            endpoint: "http://localhost/dhis-web-apps/apps-bundle.json",
            httpStatusCode: 404,
            response: "",
        },
    ]);
}

function givenBundleRedirectedToLoginPage() {
    mockWebServer.addRequestHandlers([
        {
            method: "get",
            endpoint: "http://localhost/dhis-web-apps/apps-bundle.json",
            httpStatusCode: 200,
            response: "<!DOCTYPE html><html>login page</html>",
        },
    ]);
}

export {};
