import { FutureData } from "../entities/Future";
import { Settings } from "../entities/Settings";

export interface SettingsRepository {
    get(): FutureData<Settings>;
    save(settings: Settings): FutureData<void>;
}
