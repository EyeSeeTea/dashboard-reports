import { DashboardExportDocxRepository } from "../../data/repositories/DashboardExportDocxRepository";
import { DocxItem } from "../DocxItem";
import { Settings } from "../entities/Settings";

export class SaveComplexReportUseCase {
    constructor(private dashboardExportRepository: DashboardExportDocxRepository) {}

    public execute(docxItems: DocxItem[], settings: Settings): Promise<Blob> {
        return this.dashboardExportRepository.saveComplexReport(docxItems, settings);
    }
}
