export const SETTINGS_CODE = "DASHBOARD_REPORTS";
export const DEFAULT_FONT_SIZE = "8";
export const DATA_STORE_KEY_NAME = "settings";

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

export function getDefaultValues(): Omit<Settings, "id"> {
    return {
        fontSize: DEFAULT_FONT_SIZE,
        templates: [],
        showFeedback: false,
    };
}

export function areSettingsInitialized(settings: Settings): boolean {
    return !!settings.id && settings.templates.length > 0;
}

export type StorageName = "constants" | "datastore";
