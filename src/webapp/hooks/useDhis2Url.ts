import { useAppContext } from "../contexts/app-context";
import { PluginVisualization } from "../../domain/entities/PluginVisualization";
import { LegacyReportType } from "../../domain/entities/Dashboard";
import { findAppByVisualization } from "../../domain/entities/App";
import React from "react";

export function useDhis2Url(url = "") {
    const { api } = useAppContext();
    // if the url is absolute, return as is
    if (/^https?:\/\//.test(url)) {
        if (process.env.NODE_ENV === "development") {
            // in dev server it can lead to cross-origin issues
            // need to go through baseUrl (proxied)
            return api.baseUrl + new URL(url).pathname;
        }
        return url;
    }
    return api.baseUrl + url;
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
