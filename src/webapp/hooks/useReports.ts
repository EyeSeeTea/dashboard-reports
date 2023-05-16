import React from "react";
import { saveAs } from "file-saver";
import { useAppContext } from "../contexts/app-context";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { DashboardFilterData } from "../components/dashboard-filter/DashboardFilter";
import { getImagesFromDom } from "../utils/images";
import { Settings, TemplateReport } from "../../domain/entities/Settings";

type useReportsType = {
    dashboard?: DashboardFilterData;
    settings: Settings | undefined;
};

export function useReports({ dashboard, settings }: useReportsType) {
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

    const generateDocxReport = React.useCallback(
        (template: TemplateReport) => {
            if (dashboard?.dashboard?.name && settings) {
                const dashboardTitle = dashboard?.dashboard?.name;
                const imagesPromises = getImagesFromDom(dashboard.dashboard.dashboardItems);

                Promise.all(imagesPromises)
                    .then(docxItems => {
                        return compositionRoot.export.save.execute(docxItems, dashboardTitle, settings, template);
                    })
                    .then(blob => {
                        saveAs(blob, `${template.fileName}.docx`);
                    })
                    .finally(() => {
                        loading.hide();
                    });
            }
        },
        [dashboard, compositionRoot.export.save, loading, settings]
    );

    return { generateDocxReport };
}
