import { FutureData } from "../../domain/entities/Future";
import { OrgUnit } from "../../domain/entities/OrgUnit";
import { Id } from "../../domain/entities/Ref";
import { OrgUnitRepository } from "../../domain/repositories/OrgUnitRepository";
import { D2Api } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";

const orgUnitFields = { id: true, name: true, displayName: true, path: true, level: true };

export class OrgUnitD2Repository implements OrgUnitRepository {
    constructor(private api: D2Api) {}

    public getOrgUnitRoots(): FutureData<OrgUnit[]> {
        return apiToFuture(
            this.api.models.organisationUnits.get({
                paging: false,
                filter: { level: { eq: "1" } },
                fields: orgUnitFields,
            })
        ).map(orgUnits => {
            return orgUnits.objects;
        });
    }

    public getOrgUnitsByIds(ids: Id[]): FutureData<OrgUnit[]> {
        return apiToFuture(
            this.api.models.organisationUnits.get({
                paging: false,
                fields: orgUnitFields,
                filter: { id: { in: ids } },
            })
        ).map(orgUnits => {
            return orgUnits.objects;
        });
    }
}
