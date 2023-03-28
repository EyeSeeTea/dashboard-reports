import { Dashboard, DashboardItem } from "../entities/Dashboard";
import { FutureData } from "../entities/Future";

export interface DashboardRepository {
    get(): FutureData<Dashboard[]>;
    getVisualizations(dashboardItems: DashboardItem[]): FutureData<any>;
}
