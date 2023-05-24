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
import { D2Api } from "../../../types/d2-api";
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

export const App: React.FC<AppProps> = React.memo(function App({ api, d2, instance }) {
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            const isDev = process.env.NODE_ENV === "development";
            const compositionRoot = getCompositionRoot(api, instance);
            const currentUser = (await compositionRoot.users.getCurrent.execute().runAsync()).data;
            const settings = (await compositionRoot.settings.get.execute().runAsync()).data;
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
