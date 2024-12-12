import { Dashboard } from "../entities/Dashboard";
import { FutureData } from "../entities/Future";

export interface DashboardRepository {
    get(): FutureData<Dashboard[]>;
}
