import React from "react";
import { useAppContext } from "../contexts/app-context";
import { Dashboard } from "../../domain/entities/Dashboard";
import { useSnackbar } from "@eyeseetea/d2-ui-components";

export function useDashboard() {
    const snackbar = useSnackbar();
    const { compositionRoot } = useAppContext();
    const [dashboards, setDashboards] = React.useState<Dashboard[]>([]);

    React.useEffect(() => {
        function fetchDashboards() {
            compositionRoot.dashboards.get.execute().run(
                dashboards => {
                    setDashboards(dashboards);
                },
                err => {
                    snackbar.openSnackbar("error", err);
                }
            );
        }

        fetchDashboards();
    }, [compositionRoot, snackbar]);

    return {
        dashboards,
    };
}
