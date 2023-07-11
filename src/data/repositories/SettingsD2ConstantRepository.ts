import { FutureData } from "../../domain/entities/Future";
import { getDefaultValues, Settings, SETTINGS_CODE } from "../../domain/entities/Settings";
import { SettingsRepository } from "../../domain/repositories/SettingsRepository";
import { D2Api } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";
import { getUid } from "../../utils/uid";
import { runMetadata } from "../response";

export class SettingsD2ConstantRepository implements SettingsRepository {
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
            const descriptionJson = (constant ? JSON.parse(constant.description) : getDefaultValues()) as Settings;
            const settings: Settings = {
                id: constant?.id || "",
                fontSize: descriptionJson.fontSize,
                templates: descriptionJson.templates,
                showFeedback: descriptionJson.showFeedback,
            };
            return settings;
        });
    }

    public save(settings: Settings): FutureData<void> {
        return runMetadata(
            this.api.metadata.post({
                constants: [
                    {
                        id: settings.id ? settings.id : getUid("settings"),
                        code: SETTINGS_CODE,
                        name: "Dashboard Reports Storage",
                        description: JSON.stringify(
                            {
                                fontSize: settings.fontSize,
                                templates: settings.templates,
                                showFeedback: settings.showFeedback,
                            },
                            null,
                            2
                        ),
                        value: 1,
                    },
                ],
            })
        );
    }
}
