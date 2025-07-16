import { Id } from "../entities/Ref";
import { OrgUnitRepository } from "../repositories/OrgUnitRepository";

export class GetOrgUnitsByIdsUseCase {
    constructor(private orgUnitRepository: OrgUnitRepository) {}

    execute(ids: Id[]) {
        return this.orgUnitRepository.getOrgUnitsByIds(ids);
    }
}
