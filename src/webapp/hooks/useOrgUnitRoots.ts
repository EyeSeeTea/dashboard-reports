import React from "react";
import { useAppContext } from "../contexts/app-context";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import { Id } from "../../domain/entities/Ref";

export function useOrgUnitRoots() {
    const snackbar = useSnackbar();
    const { compositionRoot } = useAppContext();
    const [orgUnitRootIds, setOrgUnitRootIds] = React.useState<Id[] | undefined>();

    React.useEffect(() => {
        function fetchOrgUnitRoots() {
            return compositionRoot.orgUnits.getRoots.execute().run(
                orgUnitRoots => {
                    setOrgUnitRootIds(orgUnitRoots.map(ou => ou.id));
                },
                err => {
                    snackbar.openSnackbar("error", err);
                }
            );
        }
        const cancel = fetchOrgUnitRoots();

        return () => cancel();
    }, [compositionRoot, snackbar]);

    return {
        orgUnitRootIds,
    };
}
