import { DashboardImage } from "../DashboardImage";
import { Settings } from "../entities/Settings";

export interface DashboardExportRepository {
    saveRawReport(dashboardImages: DashboardImage[], title: string, settings: Settings): Promise<Blob>;
    saveComplexReport(dashboardImages: DashboardImage[], settings: Settings): Promise<Blob>;
}
