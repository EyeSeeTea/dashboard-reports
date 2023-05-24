export const SETTINGS_CODE = "DASHBOARD_REPORTS";
export const DEFAULT_FONT_SIZE = "8";

type Base64String = string;

export type TemplateReport = {
    name: string;
    fileName: string;
    template: Base64String;
    maxHeight: number;
    maxWidth: number;
};
export interface Settings {
    id: string;
    fontSize: string;
    showFeedback: boolean;
    templates: TemplateReport[];
}
