import { DashboardExportDocxRepository } from "../../data/repositories/DashboardExportDocxRepository";
import { DashboardImage } from "../DashboardImage";
import { Settings, TemplateReport } from "../entities/Settings";

export class SaveRawReportUseCase {
    constructor(private dashboardExportRepository: DashboardExportDocxRepository) {}

    public execute(
        docxItems: DashboardImage[],
        title: string,
        settings: Settings,
        template: TemplateReport
    ): Promise<Blob> {
        return this.dashboardExportRepository.saveReport(docxItems, title, settings, template);
    }
}
