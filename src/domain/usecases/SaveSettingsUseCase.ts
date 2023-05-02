import { FutureData } from "../entities/Future";
import { Settings } from "../entities/Settings";
import { SettingsRepository } from "../repositories/SettingsRepository";

export class SaveSettingsUseCase {
    constructor(private settingsRepository: SettingsRepository) {}

    public execute(settings: Settings): FutureData<Settings> {
        return this.settingsRepository.save(settings);
    }
}
