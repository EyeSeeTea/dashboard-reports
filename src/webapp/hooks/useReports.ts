import React from "react";
import { useAppContext } from "../contexts/app-context";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { DashboardFilterData } from "../components/dashboard-filter/DashboardFilter";

type useReportsType = {
    dashboard?: DashboardFilterData;
};

export function useReports({ dashboard }: useReportsType) {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const filterIsEmpty = !dashboard?.dashboard;

    React.useEffect(() => {
        if (filterIsEmpty) return;

        if (dashboard.dashboard?.dashboardItems) {
            loading.show();

            compositionRoot.dashboards.getReports.execute(dashboard.dashboard?.dashboardItems, dashboard.dateMonth).run(
                visualizationsData => {
                    visualizationsData.forEach(visualization => {
                        window[visualization.reportType]?.load([visualization]);
                    });
                    loading.hide();
                },
                err => {
                    snackbar.openSnackbar("error", err);
                    loading.hide();
                }
            );
        }
    }, [dashboard, filterIsEmpty, snackbar, compositionRoot, loading]);

    return;
}
