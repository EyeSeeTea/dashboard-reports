import React from "react";
import { useAppContext } from "../contexts/app-context";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Settings, TemplateReport } from "../../domain/entities/Settings";
import i18n from "../../locales";

export function useSettings(template: TemplateReport | undefined) {
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { compositionRoot } = useAppContext();

    React.useEffect(() => {
        if (!template) {
            snackbar.warning(i18n.t("Templates not found"));
        }
    }, [snackbar, template]);

    const saveSettings = React.useCallback(
        (settings: Settings) => {
            loading.show();
            compositionRoot.settings.save.execute(settings).run(
                () => {
                    loading.hide();
                },
                err => {
                    snackbar.openSnackbar("error", err);
                    loading.hide();
                }
            );
        },
        [loading, compositionRoot, snackbar]
    );

    return {
        saveSettings,
    };
}
