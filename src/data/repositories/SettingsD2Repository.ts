import { FutureData } from "../../domain/entities/Future";
import { DEFAULT_FONT_SIZE, Settings, SETTINGS_CODE } from "../../domain/entities/Settings";
import { SettingsRepository } from "../../domain/repositories/SettingsRepository";
import { D2Api } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";
import { getUid } from "../../utils/uid";

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
                id: constant ? constant.id : getUid("settings"),
                fontSize: constant ? (JSON.parse(constant.description) as Settings).fontSize : DEFAULT_FONT_SIZE,
                templates: constant ? (JSON.parse(constant.description) as Settings).templates : [],
            };
            return settings;
        });
    }

    public save(settings: Settings): FutureData<Settings> {
        return apiToFuture(
            this.api.metadata.post({
                constants: [
                    {
                        id: settings.id,
                        code: SETTINGS_CODE,
                        name: SETTINGS_CODE,
                        description: JSON.stringify(
                            {
                                fontSize: settings.fontSize,
                                templates: settings.templates,
                            },
                            null,
                            2
                        ),
                        value: 1,
                    },
                ],
            })
        ).map(() => {
            return settings;
        });
    }
}
