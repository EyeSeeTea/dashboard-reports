import { Dashboard, DashboardItem, ReportItem } from "../entities/Dashboard";
import { ReportPeriod } from "../entities/DateMonth";
import { FutureData } from "../entities/Future";

export interface DashboardRepository {
    get(): FutureData<Dashboard[]>;
    getReportItems(dashboardItems: DashboardItem[], reportPeriod: ReportPeriod): FutureData<ReportItem[]>;
}
