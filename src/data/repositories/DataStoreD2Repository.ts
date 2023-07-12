import { FutureData } from "../../domain/entities/Future";
import { DATA_STORE_KEY_NAME, getDefaultValues, Settings, SETTINGS_CODE } from "../../domain/entities/Settings";
import { SettingsRepository } from "../../domain/repositories/SettingsRepository";
import { D2Api } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";

export class DataStoreD2Repository implements SettingsRepository {
    constructor(private api: D2Api) {}

    public get(): FutureData<Settings> {
        const dataStore = this.api.dataStore(SETTINGS_CODE);
        return apiToFuture(dataStore.get<Settings>(DATA_STORE_KEY_NAME)).map(d2DataStore => {
            if (!d2DataStore)
                return {
                    id: "",
                    ...getDefaultValues(),
                };

            return {
                id: SETTINGS_CODE,
                fontSize: d2DataStore.fontSize,
                showFeedback: d2DataStore.showFeedback,
                templates: d2DataStore.templates,
            };
        });
    }

    public save(settings: Settings): FutureData<void> {
        const dataStore = this.api.dataStore(SETTINGS_CODE);
        return apiToFuture(
            dataStore.save(DATA_STORE_KEY_NAME, {
                id: SETTINGS_CODE,
                fontSize: settings.fontSize,
                templates: settings.templates,
                showFeedback: settings.showFeedback,
            })
        );
    }
}
