import { useAppContext } from "../contexts/app-context";
import { PluginVisualization } from "../../domain/entities/PluginVisualization";
import { LegacyReportType } from "../../domain/entities/Dashboard";
import { findAppByVisualization } from "../../domain/entities/App";
import React from "react";

export function useDhis2Url(path = "") {
    const { api } = useAppContext();
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

export function useLegacyVisualizationScriptUrl(reportType: LegacyReportType) {
    const { pluginVersion } = useAppContext();
    const pluginFileName = `${pluginVersion}/${getPluginName(reportType)}.min.js`;
    return pluginFileName;
}
