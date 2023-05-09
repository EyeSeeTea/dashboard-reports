import { DashboardItem, ReportItem } from "../entities/Dashboard";
import { ReportPeriod } from "../entities/DateMonth";
import { FutureData } from "../entities/Future";
import { DashboardRepository } from "../repositories/DashboardRepository";

export class GetReportsUseCase {
    constructor(private dashboardsRepository: DashboardRepository) {}

    public execute(dashboardItems: DashboardItem[], reportPeriod: ReportPeriod): FutureData<ReportItem[]> {
        return this.dashboardsRepository.getReportItems(dashboardItems, reportPeriod);
    }
}
