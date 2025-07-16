import { FutureData } from "../entities/Future";
import { Id } from "../entities/Ref";
import { PluginVisualization } from "../entities/PluginVisualization";
import { DashboardItem } from "../entities/Dashboard";
import { ReportPeriod } from "../entities/DateMonth";
import { Maybe } from "../../types/utils";

export interface PluginVisualizationRepository {
    get(options: {
        dashboardItem: DashboardItem;
        orgUnitIds: Maybe<Id[]>;
        period: ReportPeriod;
    }): FutureData<PluginVisualization>;
}
