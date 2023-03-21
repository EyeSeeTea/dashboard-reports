import { Dashboard } from "../entities/Dashboard";

export interface DashboardRepository {
    get(): Promise<Dashboard[]>;
}
