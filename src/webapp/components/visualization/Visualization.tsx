import React from "react";
import { Ref } from "../../../domain/entities/Ref";
import { LinearProgress } from "material-ui";
import { VisualizationContents } from "./VisualizationContents";
import { useVisualizationLoader } from "../../hooks/useVisualizationLoader";
import { DashboardItem } from "../../../domain/entities/Dashboard";
import { ReportPeriod } from "../../../domain/entities/DateMonth";
import { LegacyVisualizationContents } from "./LegacyVisualizationContents";
import { useAppContext } from "../../contexts/app-context";

export interface VisualizationProps {
    dashboardItem: DashboardItem;
    orgUnit?: Ref;
    period: ReportPeriod;
}

export const Visualization: React.FC<VisualizationProps> = React.memo(props => {
    const { dashboardItem, orgUnit, period } = props;

    const visualizationLoader = useVisualizationLoader({
        dashboardItem: dashboardItem,
        orgUnitId: orgUnit?.id,
        period,
    });
    const onlyLegacySupported = useOnlyLegacySupported();

    switch (visualizationLoader.type) {
        case "loaded":
            return onlyLegacySupported || dashboardItem.useLegacy ? (
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

function useOnlyLegacySupported(): boolean {
    const IFRAME_PLUGIN_SUPPORT_MIN_VERSION = 239;
    const { pluginVersion } = useAppContext();
    return Number(pluginVersion) < IFRAME_PLUGIN_SUPPORT_MIN_VERSION;
}
