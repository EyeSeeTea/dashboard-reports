import { Dashboard, DashboardItem, ReportItem } from "../entities/Dashboard";
import { DateMonth } from "../entities/DateMonth";
import { FutureData } from "../entities/Future";

export interface DashboardRepository {
    get(): FutureData<Dashboard[]>;
    getVisualizations(dashboardItems: DashboardItem[], periodValue: DateMonth): FutureData<ReportItem[]>;
    getMaps(dashboardItems: DashboardItem[], periodValue: DateMonth): FutureData<ReportItem[]>;
}
