import { OrgUnitRepository } from "../repositories/OrgUnitRepository";

export class GetRootOrgUnitsUseCase {
    constructor(private orgUnitRepository: OrgUnitRepository) {}

    execute() {
        return this.orgUnitRepository.getOrgUnitRoots();
    }
}
