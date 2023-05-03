import { DashboardImage } from "../DashboardImage";
import { Settings, TemplateReport } from "../entities/Settings";

export interface DashboardExportRepository {
    saveReport(
        dashboardImages: DashboardImage[],
        title: string,
        settings: Settings,
        template: TemplateReport
    ): Promise<Blob>;
}
