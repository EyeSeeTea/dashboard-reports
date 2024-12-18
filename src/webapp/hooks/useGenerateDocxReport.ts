import React from "react";
import { saveAs } from "file-saver";
import { useAppContext } from "../contexts/app-context";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { DashboardFilterData } from "../components/dashboard-filter/DashboardFilter";
import { getImagesFromDom } from "../utils/images";
import { Settings, TemplateReport } from "../../domain/entities/Settings";

type useGenerateDocxReportArgs = {
    dashboard?: DashboardFilterData;
    settings: Settings | undefined;
};

export function useGenerateDocxReport({ dashboard, settings }: useGenerateDocxReportArgs) {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();

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
                    .catch(err => snackbar.error(err.message))
                    .finally(() => {
                        loading.hide();
                    });
            }
        },
        [dashboard, compositionRoot.export.save, loading, settings, snackbar]
    );

    return { generateDocxReport };
}
