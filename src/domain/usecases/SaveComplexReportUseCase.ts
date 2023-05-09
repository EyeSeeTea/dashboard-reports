import { DashboardExportDocxRepository } from "../../data/repositories/DashboardExportDocxRepository";
import { DashboardImage } from "../DashboardImage";
import { Settings } from "../entities/Settings";

export class SaveComplexReportUseCase {
    constructor(private dashboardExportRepository: DashboardExportDocxRepository) {}

    public execute(dashboardImages: DashboardImage[], settings: Settings): Promise<Blob> {
        return this.dashboardExportRepository.saveComplexReport(dashboardImages, settings);
    }
}
