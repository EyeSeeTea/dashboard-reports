import React from "react";
import { Id } from "../../../domain/entities/Ref";
import { LinearProgress } from "material-ui";
import { VisualizationContents } from "./VisualizationContents";
import { useVisualizationLoader } from "../../hooks/useVisualizationLoader";
import { DashboardItem } from "../../../domain/entities/Dashboard";
import { ReportPeriod } from "../../../domain/entities/DateMonth";
import { LegacyVisualizationContents } from "./LegacyVisualizationContents";
import { Maybe } from "../../../types/utils";

export interface VisualizationProps {
    dashboardItem: DashboardItem;
    orgUnits: Maybe<Id[]>;
    period: ReportPeriod;
}

export const Visualization: React.FC<VisualizationProps> = React.memo(props => {
    const { dashboardItem, orgUnits, period } = props;

    const visualizationLoader = useVisualizationLoader({
        dashboardItem: dashboardItem,
        orgUnitIds: orgUnits,
        period,
    });

    switch (visualizationLoader.type) {
        case "loaded":
            return dashboardItem.useLegacy ? (
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
