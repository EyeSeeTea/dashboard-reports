import React from "react";
import { useAppContext } from "../contexts/app-context";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Settings, TemplateReport } from "../../domain/entities/Settings";
import i18n from "../../locales";

export function useSettings() {
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { compositionRoot, api } = useAppContext();
    const [settings, setSettings] = React.useState<Settings>();
    const [selectedReport, setSelectedReport] = React.useState<TemplateReport | undefined>();

    React.useEffect(() => {
        function fetchSettings() {
            compositionRoot.settings.get.execute().run(
                settings => {
                    setSettings(settings);
                    if (settings.templates.length > 0) {
                        setSelectedReport(settings.templates[0]);
                    } else {
                        snackbar.warning(i18n.t("Templates not found"));
                    }
                },
                err => {
                    snackbar.openSnackbar("error", err);
                }
            );
        }

        fetchSettings();
    }, [compositionRoot, snackbar, api]);

    const saveSettings = React.useCallback(
        (settings: Settings) => {
            loading.show();
            compositionRoot.settings.save.execute(settings).run(
                newSettings => {
                    setSettings(newSettings);
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
        selectedReport,
        saveSettings,
        settings,
        setSelectedReport,
    };
}
