import React from "react";
import { Maybe } from "../../types/utils";
import { useLoader } from "./useLoader";
import { DashboardItem } from "../../domain/entities/Dashboard";
import { ReportPeriod } from "../../domain/entities/DateMonth";
import { Id } from "../../domain/entities/Ref";

interface UseVisualizationLoaderArgs {
    dashboardItem: DashboardItem;
    orgUnitId: Maybe<Id>;
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
