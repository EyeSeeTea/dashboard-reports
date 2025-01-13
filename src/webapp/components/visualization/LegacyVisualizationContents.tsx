import React from "react";
import { PluginVisualization } from "../../../domain/entities/PluginVisualization";
import { useLegacyVisualizationPlugin } from "../../hooks/useLegacyVisualizationPlugin";
import { DashboardItem } from "../../../domain/entities/Dashboard";
import { LinearProgress } from "material-ui";

export interface LegacyVisualizationProps {
    dashboardItem: DashboardItem;
    visualization: PluginVisualization;
}

export const LegacyVisualizationContents: React.FunctionComponent<LegacyVisualizationProps> = React.memo(props => {
    const { visualization, dashboardItem } = props;
    const pluginState = useLegacyVisualizationPlugin(dashboardItem, visualization);
    return (
        <>
            {pluginState.type === "loading" && <LinearProgress />}
            <div style={styles.container} id={dashboardItem.elementId} className="legacy-visualization"></div>
        </>
    );
});

const styles = {
    container: {
        height: "100%",
    },
};
