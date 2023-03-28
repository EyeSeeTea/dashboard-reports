import { DashboardItem } from "../entities/Dashboard";
import { FutureData } from "../entities/Future";
import { DashboardRepository } from "../repositories/DashboardRepository";

export class GetVisualizationsUseCase {
    constructor(private dashboardsRepository: DashboardRepository) {}

    public execute(dashboardItems: DashboardItem[]): FutureData<any> {
        return this.dashboardsRepository.getVisualizations(dashboardItems);
    }
}
