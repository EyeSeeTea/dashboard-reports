import React from "react";
import { Ref } from "../../../domain/entities/Ref";
import { LinearProgress } from "material-ui";
import { VisualizationContents } from "./VisualizationContents";
import { useVisualizationLoader } from "../../hooks/useVisualizationLoader";
import { DashboardItem } from "../../../domain/entities/Dashboard";
import { ReportPeriod } from "../../../domain/entities/DateMonth";
import { LegacyVisualizationContents } from "./LegacyVisualizationContents";
import { PluginVisualization } from "../../../domain/entities/PluginVisualization";

export interface VisualizationProps {
    dashboardItem: DashboardItem;
    orgUnit?: Ref;
    period: ReportPeriod;
}

/**
 * Determines which kind of plugin to use.
 * EVENT_CHART is not working with the new dhis-data-visualizer iframe
 * EVENT_REPORT only works with the line-listing iframe
 * VISUALIZATION type PIVOT_TABLE dhis-data-visualizer modifies dom on scroll so image export does not work
 */
function showLegacyVisualization(dashboardItem: DashboardItem, visualization: PluginVisualization): boolean {
    // TODO: move this to domain - check if possible
    return (
        dashboardItem.type === "EVENT_CHART" ||
        (dashboardItem.type === "EVENT_REPORT" && visualization.type !== "LINE_LIST") ||
        (dashboardItem.type === "VISUALIZATION" && visualization.type === "PIVOT_TABLE")
    );
}

export const Visualization: React.FC<VisualizationProps> = React.memo(props => {
    const { dashboardItem, orgUnit, period } = props;

    const visualizationLoader = useVisualizationLoader({
        dashboardItem: dashboardItem,
        orgUnitId: orgUnit?.id,
        period,
    });
    switch (visualizationLoader.type) {
        case "loaded":
            return showLegacyVisualization(dashboardItem, visualizationLoader.value) ? (
                <LegacyVisualizationContents visualization={visualizationLoader.value} dashboardItem={dashboardItem} />
            ) : (
                <VisualizationContents visualization={visualizationLoader.value} dashboardItem={dashboardItem} />
            );
        case "loading":
            return <LinearProgress />;
        case "error":
            return <div>{visualizationLoader.message}</div>;
    }
});
