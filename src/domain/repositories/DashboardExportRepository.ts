import { DocxItem } from "../DocxItem";
import { Settings } from "../entities/Settings";

export interface DashboardExportRepository {
    saveRawReport(docxItems: DocxItem[], title: string, settings: Settings): Promise<Blob>;
    saveComplexReport(docsItems: DocxItem[], settings: Settings): Promise<Blob>;
}
