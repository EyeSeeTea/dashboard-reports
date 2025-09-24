import { App } from "../entities/App";
import { FutureData } from "../entities/Future";
import { AppRepository } from "../repositories/AppRepository";

export class GetAppsUseCase {
    constructor(private appRepository: AppRepository) {}

    public execute(): FutureData<App[]> {
        return this.appRepository.get();
    }
}
