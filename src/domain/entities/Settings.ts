export const SETTINGS_CODE = "dashboard-reports";
export const DEFAULT_FONT_SIZE = "8";

export type TemplateReport = {
    name: string;
    fileName: string;
    template: string;
    maxHeight: number;
    maxWidth: number;
};
export interface Settings {
    id: string;
    fontSize: string;
    templates: TemplateReport[];
}
