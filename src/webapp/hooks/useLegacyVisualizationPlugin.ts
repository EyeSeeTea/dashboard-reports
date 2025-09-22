import React from "react";
import { loadJsPlugin } from "../../utils/plugin";
import { DashboardItem } from "../../domain/entities/Dashboard";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { useDhis2Url, useLegacyVisualizationScriptUrl } from "./useDhis2Url";
import { PluginVisualization } from "../../domain/entities/PluginVisualization";
import { LoaderState } from "./useLoader";
import i18n from "../../utils/i18n";

export function useLegacyVisualizationPlugin(dashboardItem: DashboardItem, visualization: PluginVisualization) {
    const snackbar = useSnackbar();
    const pluginFileName = useLegacyVisualizationScriptUrl(dashboardItem.legacyReportType);
    const dhisUrl = useDhis2Url();
    const [state, setState] = React.useState<LoaderState<undefined>>({ type: "loading" });
    React.useEffect(() => {
        async function loadPluginWithDependencies() {
            if (!pluginFileName || !dashboardItem.legacyReportType) {
                console.warn("Trying to load legacy plugin for non-legacy dashboard item", dashboardItem);
                return;
            }
            // legacy js plugins require ExtJS
            const DEPENDENCIES = ["/js/ext-all.js"];
            try {
                await Promise.all(DEPENDENCIES.map(dep => loadJsPlugin(dep)));
                await loadJsPlugin(pluginFileName);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                snackbar.error(message);
                setState({ type: "error", message: message });
                return;
            }
            const plugin = window[dashboardItem.legacyReportType];
            if (!plugin) {
                throw new Error(
                    i18n.t(`Legacy plugin "{{legacyReportType}}" not found`, {
                        legacyReportType: dashboardItem.legacyReportType,
                    })
                );
            }
            plugin.url = dhisUrl;
            plugin.loadingIndicator = true;
            plugin.dashboard = true;
            plugin.load([{ ...visualization, el: dashboardItem.elementId }]);
            setState({ type: "loaded", value: undefined });
        }
        loadPluginWithDependencies();
    }, [dashboardItem, visualization, pluginFileName, snackbar, dhisUrl]);
    return state;
}
