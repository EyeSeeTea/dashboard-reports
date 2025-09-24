import React from "react";
import { useAppContext } from "../contexts/app-context";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Settings, TemplateReport } from "../../domain/entities/Settings";
import i18n from "../../utils/i18n";

export function useSettings(template: TemplateReport | undefined) {
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { compositionRoot, currentUser } = useAppContext();

    React.useEffect(() => {
        if (!template) {
            snackbar.warning(i18n.t("Templates not found"));
        }
    }, [snackbar, template]);

    const saveSettings = React.useCallback(
        (settings: Settings) => {
            loading.show();
            compositionRoot.settings.save.execute({ settings, currentUser }).run(
                () => {
                    loading.hide();
                    snackbar.openSnackbar("success", i18n.t("Settings saved"), {
                        autoHideDuration: 3000,
                    });
                },
                err => {
                    snackbar.openSnackbar("error", err);
                    loading.hide();
                }
            );
        },
        [loading, compositionRoot, snackbar, currentUser]
    );

    return {
        saveSettings,
    };
}
