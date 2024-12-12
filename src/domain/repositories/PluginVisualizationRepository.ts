import { FutureData } from "../entities/Future";
import { Id } from "../entities/Ref";
import { PluginVisualization } from "../entities/PluginVisualization";
import { DashboardItem } from "../entities/Dashboard";
import { ReportPeriod } from "../entities/DateMonth";

export interface PluginVisualizationRepository {
    get(options: {
        dashboardItem: DashboardItem;
        orgUnitId?: Id;
        period: ReportPeriod;
    }): FutureData<PluginVisualization>;
}
