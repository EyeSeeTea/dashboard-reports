import React from "react";
import { getIdFromPath, OrgUnitPath } from "../../domain/entities/OrgUnit";
import { useLoader } from "./useLoader";
import { Future } from "../../domain/entities/Future";

export function useOrgUnitLoader({ paths }: { paths: OrgUnitPath[] }) {
    return useLoader(
        React.useCallback(
            compositionRoot => {
                if (!paths.length) {
                    return Future.success([]);
                }
                const ids = paths.map(getIdFromPath);
                return compositionRoot.orgUnits.getByIds.execute(ids);
            },
            [paths]
        )
    );
}
