import React from "react";
import { Maybe } from "../../types/utils";
import { useLoader } from "./useLoader";
import { DashboardItem } from "../../domain/entities/Dashboard";
import { ReportPeriod } from "../../domain/entities/DateMonth";

interface UseVisualizationLoaderArgs {
    dashboardItem: DashboardItem;
    orgUnitId: Maybe<string>;
    period: ReportPeriod;
}

export function useVisualizationLoader({ dashboardItem, orgUnitId, period }: UseVisualizationLoaderArgs) {
    return useLoader(
        React.useCallback(
            compositionRoot => {
                return compositionRoot.pluginVisualizations.get.execute({ dashboardItem, orgUnitId, period });
            },
            [dashboardItem, orgUnitId, period]
        )
    );
}
