import { Future, FutureData } from "../entities/Future";
import { Settings } from "../entities/Settings";
import { SettingsRepository } from "../repositories/SettingsRepository";
import { DefaultSettingsRepository } from "../repositories/DefaultSettingsRepository";

export class InitDefaultSettingsUseCase {
    constructor(
        private settingsRepository: SettingsRepository,
        private defaultSettingsRepository: DefaultSettingsRepository
    ) {}

    public execute(): FutureData<Settings> {
        return this.defaultSettingsRepository.get().flatMap(defaultSettings => {
            return this.settingsRepository.save(defaultSettings).flatMap(() => Future.success(defaultSettings));
        });
    }
}
