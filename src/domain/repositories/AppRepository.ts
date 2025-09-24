import { App } from "../entities/App";
import { FutureData } from "../entities/Future";

export interface AppRepository {
    get(): FutureData<App[]>;
}
