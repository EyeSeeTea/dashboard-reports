import { DashboardItem, ReportItem } from "../entities/Dashboard";
import { DateMonth } from "../entities/DateMonth";
import { FutureData } from "../entities/Future";
import { DashboardRepository } from "../repositories/DashboardRepository";

export class GetVisualizationsUseCase {
    constructor(private dashboardsRepository: DashboardRepository) {}

    public execute(dashboardItems: DashboardItem[], periodValue: DateMonth): FutureData<ReportItem[]> {
        return this.dashboardsRepository.getVisualizations(dashboardItems, periodValue);
    }
}
