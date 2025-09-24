import _ from "lodash";
import { Id } from "./Ref";

export type OrgUnitPath = Id[];

export interface OrgUnit {
    id: Id;
    path: OrgUnitPath;
    name: string;
    level: number;
}

export function getIdFromPath(path: OrgUnitPath): Id {
    return _.last(path) as Id;
}

export function getOrgUnitParentPath(path: OrgUnitPath): OrgUnitPath {
    return _.initial(path);
}
