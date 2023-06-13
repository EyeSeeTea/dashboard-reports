import { FutureData } from "../../domain/entities/Future";
import { DATA_STORE_KEY_NAME, DEFAULT_FONT_SIZE, Settings, SETTINGS_CODE } from "../../domain/entities/Settings";
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
                    fontSize: DEFAULT_FONT_SIZE,
                    showFeedback: false,
                    templates: [],
                };

            return {
                id: d2DataStore.id,
                fontSize: d2DataStore.fontSize,
                showFeedback: d2DataStore.showFeedback,
                templates: d2DataStore.templates,
            };
        });
    }

    public save(settings: Settings): FutureData<Settings> {
        const dataStore = this.api.dataStore(SETTINGS_CODE);
        return apiToFuture(
            dataStore
                .save(DATA_STORE_KEY_NAME, {
                    fontSize: settings.fontSize,
                    templates: settings.templates,
                    showFeedback: settings.showFeedback,
                })
                .map(() => settings)
        );
    }
}
