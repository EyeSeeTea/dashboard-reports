import { DashboardExportDocxRepository } from "../../data/repositories/DashboardExportDocxRepository";
import { DashboardImage } from "../DashboardImage";
import { Settings } from "../entities/Settings";

export class SaveRawReportUseCase {
    constructor(private dashboardExportRepository: DashboardExportDocxRepository) {}

    public execute(docxItems: DashboardImage[], title: string, settings: Settings): Promise<Blob> {
        return this.dashboardExportRepository.saveRawReport(docxItems, title, settings);
    }
}
