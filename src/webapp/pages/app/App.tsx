import { HeaderBar } from "@dhis2/ui";
import { SnackbarProvider, LoadingProvider } from "@eyeseetea/d2-ui-components";
import { Feedback } from "@eyeseetea/feedback-component";
import { MuiThemeProvider } from "@material-ui/core/styles";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { appConfig } from "../../../app-config";
import { getCompositionRoot } from "../../../CompositionRoot";
import { Instance } from "../../../data/entities/Instance";
import { Settings, StorageName } from "../../../domain/entities/Settings";
import { D2Api } from "../../../types/d2-api";
import { Maybe } from "../../../types/utils";
import { AppContext, AppContextState } from "../../contexts/app-context";
import { Router } from "../Router";
import "./App.css";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";

export interface AppProps {
    api: D2Api;
    d2: D2;
    instance: Instance;
}

function getSettings(settingsFromStorage: Maybe<Settings>, defaultSettings: Maybe<Settings>): Maybe<Settings> {
    if (!settingsFromStorage) throw new Error("Cannot load settings");
    const hasTemplates = settingsFromStorage ? settingsFromStorage.templates.length > 0 : false;
    const settings = hasTemplates ? settingsFromStorage : defaultSettings;
    return settings;
}

export const App: React.FC<AppProps> = React.memo(function App({ api, d2, instance }) {
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            const isDev = process.env.NODE_ENV === "development";
            const defaultSettings = await fetch("default-settings.json").then<Maybe<Settings>>(res => res.json());
            const storageName = (process.env.REACT_APP_STORAGE as StorageName) || "datastore";
            const compositionRoot = getCompositionRoot(api, instance, storageName);
            const currentUser = (await compositionRoot.users.getCurrent.execute().runAsync()).data;
            const settingsFromStorage = (await compositionRoot.settings.get.execute().runAsync()).data;
            const settings = getSettings(settingsFromStorage, defaultSettings);
            if (!currentUser) throw new Error("User not logged in");

            setAppContext({ api, currentUser, compositionRoot, isDev, settings, setAppContext });
            setLoading(false);
        }
        setup();
    }, [d2, api, instance]);

    if (loading) return null;

    return (
        <MuiThemeProvider theme={muiTheme}>
            <OldMuiThemeProvider muiTheme={muiThemeLegacy}>
                <LoadingProvider>
                    <SnackbarProvider>
                        <HeaderBar appName="Dashboard Reports" />

                        {appConfig.feedback && appContext && appContext.settings?.showFeedback && (
                            <Feedback options={appConfig.feedback} username={appContext.currentUser.username} />
                        )}

                        <div id="app" className="content">
                            <AppContext.Provider value={appContext}>
                                <Router />
                            </AppContext.Provider>
                        </div>
                    </SnackbarProvider>
                </LoadingProvider>
            </OldMuiThemeProvider>
        </MuiThemeProvider>
    );
});

type D2 = object;
