import { Maybe } from "../../types/utils";
import { PluginVisualization } from "./PluginVisualization";

export interface App {
    version: string;
    name: string;
    key: string;
    baseUrl: string;
    pluginLaunchUrl: string;
}

const knownApps = ["maps", "line-listing", "data-visualizer"] as const;

type KnownApp = typeof knownApps[number];

/**
 * Returns true if the visualization should use the runtime plugin, else use regular iframes + postRobot
 * @see https://github.com/dhis2/dashboard-app/releases/tag/v101.0.0
 */
export function shouldUseAppRuntimePlugin(apps: App[], visualization: PluginVisualization): boolean {
    const DEFAULT_RESULT = true; // default to newer runtime plugin if not found
    const minVersions = {
        maps: "101.0.0",
        "line-listing": "102.0.0",
        "data-visualizer": "101.0.0",
    };
    const app = findAppByVisualization(apps, visualization);
    if (!app) {
        return DEFAULT_RESULT;
    }
    const minVersion = minVersions[app.key as KnownApp];
    if (!minVersion) {
        return DEFAULT_RESULT;
    }
    return appVersionIsGreaterOrEqualTo(app.version, minVersion);
}

export function findAppByVisualization(apps: App[], visualization: PluginVisualization): Maybe<App> {
    const typesToKeys: Record<PluginVisualization["type"], KnownApp> = {
        MAP: "maps",
        LINE_LIST: "line-listing",
        PIVOT_TABLE: "data-visualizer",
    };
    // defaults to data-visualizer.
    // TODO: revisit if need to support more app types
    const key = typesToKeys[visualization.type] ?? "data-visualizer";
    return apps.find(app => app.key === key);
}

export function appVersionIsGreaterOrEqualTo(version: string, minVersion: string): boolean {
    const v1 = version.split(".").map(Number);
    const v2 = minVersion.split(".").map(Number);

    const maxLength = Math.max(v1.length, v2.length);

    for (let i = 0; i < maxLength; i++) {
        const a = v1[i] ?? 0;
        const b = v2[i] ?? 0;
        if (a < b) return false;
        if (a > b) return true;
    }

    return true;
}
