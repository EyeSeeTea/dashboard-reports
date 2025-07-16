import { FutureData } from "../../domain/entities/Future";
import { Settings } from "../../domain/entities/Settings";
import { DefaultSettingsRepository } from "../../domain/repositories/DefaultSettingsRepository";
import { getJSON } from "../../utils/futures";

export class DefaultSettingsHTTPRepository implements DefaultSettingsRepository {
    public get(): FutureData<Settings> {
        const DEFAULT_SETTINGS_URL = "default-settings.json";
        return getJSON<Settings>(DEFAULT_SETTINGS_URL);
    }
}
