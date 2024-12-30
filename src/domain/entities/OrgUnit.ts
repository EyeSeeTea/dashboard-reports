import _ from "lodash";
import { Id } from "./Ref";

export type OrgUnitPath = string;

export interface OrgUnit {
    id: Id;
    path: OrgUnitPath;
    name: string;
    displayName: string;
    level: number;
}

const pathSeparator = "/";

export function getIdFromPath(path: OrgUnitPath): Id {
    return _.last(path.split(pathSeparator)) as Id;
}

export function getOrgUnitParentPath(path: OrgUnitPath) {
    return _(path).split(pathSeparator).initial().join(pathSeparator);
}
