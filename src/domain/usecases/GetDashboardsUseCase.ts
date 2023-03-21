import { Dashboard } from "../entities/Dashboard";
import { DashboardRepository } from "../repositories/DashboardRepository";

export class GetDashboardsUseCase {
    constructor(private dashboardsRepository: DashboardRepository) {}

    public execute(): Promise<Dashboard[]> {
        return this.dashboardsRepository.get();
    }
}
