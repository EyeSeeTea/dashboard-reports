import _ from "lodash";
import { FutureData } from "../../domain/entities/Future";
import { OrgUnit } from "../../domain/entities/OrgUnit";
import { Id } from "../../domain/entities/Ref";
import { OrgUnitRepository } from "../../domain/repositories/OrgUnitRepository";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";

const orgUnitFields = { id: true, displayName: true, path: true, level: true } as const;

type D2OrgUnit = MetadataPick<{
    organisationUnits: { fields: typeof orgUnitFields };
}>["organisationUnits"][number];

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
            return orgUnits.objects.map(d2OrgUnit => this.convertToOrgUnit(d2OrgUnit));
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
            return orgUnits.objects.map(d2OrgUnit => this.convertToOrgUnit(d2OrgUnit));
        });
    }

    private convertToOrgUnit(orgUnitResponse: D2OrgUnit): OrgUnit {
        return {
            ..._.omit(orgUnitResponse, ["displayName"]),
            name: orgUnitResponse.displayName,
        };
    }
}
