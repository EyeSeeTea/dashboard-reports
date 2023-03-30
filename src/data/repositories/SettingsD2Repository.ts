import { FutureData } from "../../domain/entities/Future";
import { DEFAULT_FONT_SIZE, Settings, SETTINGS_CODE } from "../../domain/entities/Settings";
import { SettingsRepository } from "../../domain/repositories/SettingsRepository";
import { D2Api } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";

export class SettingsD2Repository implements SettingsRepository {
    constructor(private api: D2Api) {}

    public get(): FutureData<Settings> {
        return apiToFuture(
            this.api.models.constants.get({
                fields: {
                    id: true,
                    description: true,
                    code: true,
                    name: true,
                },
                filter: {
                    code: {
                        eq: SETTINGS_CODE,
                    },
                },
            })
        ).map(d2Response => {
            const constant = d2Response.objects[0];
            const settings: Settings = {
                fontSize: DEFAULT_FONT_SIZE,
            };
            if (constant) {
                const settingsJson = JSON.parse(constant.description) as Settings;
                settings.id = constant.id;
                settings.fontSize = settingsJson.fontSize;
            }
            return settings;
        });
    }

    public save(settings: Settings): FutureData<Settings> {
        const method = settings.id ? "put" : "post";
        return apiToFuture(
            this.api.models.constants[method]({
                id: settings.id ? settings.id : "",
                code: SETTINGS_CODE,
                name: SETTINGS_CODE,
                description: JSON.stringify({ fontSize: settings.fontSize }),
                value: 1,
            })
        ).map(d2Response => {
            settings.id = d2Response.response.uid;
            return settings;
        });
    }
}
