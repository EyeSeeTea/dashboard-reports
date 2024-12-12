import _ from "lodash";
import { useAppContext } from "../contexts/app-context";
import { PluginVisualization } from "../../domain/entities/PluginVisualization";
import { LegacyReportType } from "../../domain/entities/Dashboard";

export function useDhis2Url(path = "") {
    const { api, isDev } = useAppContext();
    return (isDev ? "/dhis2" : api.baseUrl) + path;
}

export function useVisualizationIframeUrl(visualization: PluginVisualization) {
    const VISUALIZATION_IFRAME_URLS = {
        LINE_LIST: "/api/apps/line-listing/plugin.html",
        MAP: "/dhis-web-maps/plugin.html",
    };
    const DEFAULT_VISUALIZATION_IFRAME_URL = "/dhis-web-data-visualizer/plugin.html";
    const visualizationPath = _.get(VISUALIZATION_IFRAME_URLS, visualization.type, DEFAULT_VISUALIZATION_IFRAME_URL);
    return useDhis2Url(visualizationPath);
}

function getPluginName(reportType: LegacyReportType): string {
    return reportType.toLowerCase().replace(/plugin$/, "");
}

export function useLegacyVisualizationScriptUrl(reportType: LegacyReportType) {
    const { pluginVersion } = useAppContext();
    const pluginFileName = `${pluginVersion}/${getPluginName(reportType)}.min.js`;
    return pluginFileName;
}
