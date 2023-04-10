import { DashboardExportDocxRepository } from "../../data/repositories/DashboardExportDocxRepository";
import { DocxItem } from "../DocxItem";
import { Settings } from "../entities/Settings";

export class SaveRawReportUseCase {
    constructor(private dashboardExportRepository: DashboardExportDocxRepository) {}

    public execute(docxItems: DocxItem[], title: string, settings: Settings): Promise<Blob> {
        return this.dashboardExportRepository.saveRawReport(docxItems, title, settings);
    }
}
