import { Dashboard } from "../entities/Dashboard";
import { FutureData } from "../entities/Future";
import { DashboardRepository } from "../repositories/DashboardRepository";

export class GetDashboardsUseCase {
    constructor(private dashboardsRepository: DashboardRepository) {}

    public execute(): FutureData<Dashboard[]> {
        return this.dashboardsRepository.get();
    }
}
