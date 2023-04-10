import React from "react";
import { useAppContext } from "../contexts/app-context";
import { useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Settings } from "../../domain/entities/Settings";

export function useSettings() {
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { compositionRoot, api } = useAppContext();
    const [settings, setSettings] = React.useState<Settings>();

    React.useEffect(() => {
        function fetchSettings() {
            compositionRoot.settings.get.execute().run(
                settings => {
                    setSettings(settings);
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
        saveSettings,
        settings,
    };
}
