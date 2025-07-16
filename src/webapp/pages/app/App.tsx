import { HeaderBar } from "@dhis2/ui";
import { SnackbarProvider, LoadingProvider } from "@eyeseetea/d2-ui-components";
import { Feedback } from "@eyeseetea/feedback-component";
import { MuiThemeProvider } from "@material-ui/core/styles";
//@ts-ignore
import OldMuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import React, { useEffect, useState } from "react";
import { appConfig } from "../../../app-config";
import { CompositionRoot, getCompositionRoot } from "../../../CompositionRoot";
import { Instance } from "../../../data/entities/Instance";
import { areSettingsInitialized, Settings, StorageName } from "../../../domain/entities/Settings";
import { D2Api } from "../../../types/d2-api";
import { Maybe } from "../../../types/utils";
import { AppContext, AppContextState } from "../../contexts/app-context";
import { Router } from "../Router";
import "./App.css";
import muiThemeLegacy from "./themes/dhis2-legacy.theme";
import { muiTheme } from "./themes/dhis2.theme";
import _ from "lodash";
import { CustomHeader } from "../../components/custom-header/CustomHeader";
import { CustomFooter } from "../../components/custom-footer/CustomFooter";

export interface AppProps {
    api: D2Api;
    d2: D2;
    instance: Instance;
}

async function getSettingsOrInitialize(compositionRoot: CompositionRoot): Promise<Settings> {
    const settingsFromStorage = (await compositionRoot.settings.get.execute().runAsync()).data;
    if (!settingsFromStorage) {
        throw new Error("Cannot load settings");
    } else if (!areSettingsInitialized(settingsFromStorage)) {
        const defaultSettings = (await compositionRoot.settings.initDefaults.execute().runAsync()).data;
        if (!defaultSettings) throw new Error("Error initializing default settings");
        return defaultSettings;
    } else {
        return settingsFromStorage;
    }
}

export const App: React.FC<AppProps> = React.memo(function App({ api, d2, instance }) {
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            const isDev = process.env.NODE_ENV === "development";
            const storageName = (process.env.REACT_APP_STORAGE as Maybe<StorageName>) || "datastore";
            const compositionRoot = getCompositionRoot(api, instance, storageName);
            const currentUser = (await compositionRoot.users.getCurrent.execute().runAsync()).data;
            const pluginVersion = `${_.get(d2, "system.version.major")}${_.get(d2, "system.version.minor")}`;
            const settings = await getSettingsOrInitialize(compositionRoot);
            if (!currentUser) throw new Error("User not logged in");

            setAppContext({ api, currentUser, compositionRoot, isDev, settings, setAppContext, pluginVersion });
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
                        {appConfig.header && <CustomHeader {...appConfig.header} />}
                        {appContext?.currentUser.isAdmin() ? <HeaderBar appName="Dashboard Reports" /> : null}
                        {appConfig.feedback && appContext && appContext.settings?.showFeedback && (
                            <Feedback options={appConfig.feedback} username={appContext.currentUser.username} />
                        )}

                        <div id="app" className="content">
                            <AppContext.Provider value={appContext}>
                                <Router />
                            </AppContext.Provider>
                        </div>
                        {appConfig.footer && <CustomFooter {...appConfig.footer} />}
                    </SnackbarProvider>
                </LoadingProvider>
            </OldMuiThemeProvider>
        </MuiThemeProvider>
    );
});

type D2 = object;
