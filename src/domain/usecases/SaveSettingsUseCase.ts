import { Future, FutureData } from "../entities/Future";
import { Settings } from "../entities/Settings";
import { User } from "../entities/User";
import { SettingsRepository } from "../repositories/SettingsRepository";
import i18n from "../../locales";

export class SaveSettingsUseCase {
    constructor(private settingsRepository: SettingsRepository) {}

    public execute(options: { settings: Settings; currentUser: User }): FutureData<void> {
        if (!options.currentUser.isAdmin()) {
            return Future.error(i18n.t("Not authorized - only admins can save settings"));
        }
        return this.settingsRepository.save(options.settings);
    }
}
