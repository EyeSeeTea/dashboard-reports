import { FutureData } from "../entities/Future";
import { OrgUnit } from "../entities/OrgUnit";
import { Id } from "../entities/Ref";

export interface OrgUnitRepository {
    getOrgUnitRoots(): FutureData<OrgUnit[]>;
    getOrgUnitsByIds(ids: Id[]): FutureData<OrgUnit[]>;
}
