import { useAppContext } from "../contexts/app-context";
import { PluginVisualization } from "../../domain/entities/PluginVisualization";
import { LegacyReportType } from "../../domain/entities/Dashboard";
import { findAppByVisualization } from "../../domain/entities/App";
import React from "react";

/**
 * In development, the server may return plugin URLs with a version or environment prefix
 * (e.g. /stable-2-42-4/dhis-web-data-visualizer/plugin.html). Local instances typically
 * serve DHIS2 web apps at /dhis-web-<app>/ without that prefix. We normalize by using
 * only the path from the first "/dhis-web-" segment, so it works for any prefix.
 */
function normalizePluginPathForLocalDev(path: string): string {
    if (!import.meta.env.DEV) return path;
    const dhisWebIndex = path.indexOf("/dhis-web-");
    if (dhisWebIndex === -1) return path;
    const normalized = path.slice(dhisWebIndex);
    return normalized;
}

export function useDhis2Url(url = "") {
    const { api } = useAppContext();
    // if the url is absolute, return as is
    if (/^https?:\/\//.test(url)) {
        if (import.meta.env.DEV) {
            // in dev server it can lead to cross-origin issues
            // need to go through baseUrl (proxied)

            const path = normalizePluginPathForLocalDev(new URL(url).pathname);
            return api.baseUrl + path;
        }
        return url;
    }
    const path = normalizePluginPathForLocalDev(url);
    return api.baseUrl + path;
}

export function useVisualizationIframeUrl(visualization: PluginVisualization) {
    const { apps } = useAppContext();
    const url = React.useMemo(() => {
        const app = findAppByVisualization(apps, visualization);
        return app?.pluginLaunchUrl;
    }, [apps, visualization]);
    return useDhis2Url(url);
}

function getPluginName(reportType: LegacyReportType): string {
    return reportType.toLowerCase().replace(/plugin$/, "");
}

export function useLegacyVisualizationScriptUrl(reportType: LegacyReportType | null) {
    const { pluginVersion } = useAppContext();
    if (!reportType) {
        return null;
    }
    const pluginFileName = `${pluginVersion}/${getPluginName(reportType)}.min.js`;
    return pluginFileName;
}
