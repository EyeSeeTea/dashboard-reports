import { FutureData } from "../entities/Future";
import { Settings } from "../entities/Settings";

export interface DefaultSettingsRepository {
    get(): FutureData<Settings>;
}
