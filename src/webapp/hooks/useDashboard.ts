import React from "react";
import { useAppContext } from "../contexts/app-context";
import { Dashboard } from "../../domain/entities/Dashboard";
import { useSnackbar } from "@eyeseetea/d2-ui-components";

export function useDashboard() {
    const snackbar = useSnackbar();
    const { compositionRoot, isDev, api } = useAppContext();
    const [dashboards, setDashboards] = React.useState<Dashboard[]>([]);

    React.useEffect(() => {
        const url = isDev ? "/dhis2" : api.baseUrl;

        window.reportTablePlugin.url = url;
        window.chartPlugin.url = url;
        window.mapPlugin.url = url;
        window.eventChartPlugin.url = url;
        window.eventReportPlugin.url = url;

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
    }, [compositionRoot, snackbar, api, isDev]);

    return {
        dashboards,
    };
}
