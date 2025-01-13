import React from "react";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";
import { AboutButtonFloat } from "./about/AboutButtonFloat";
import { AboutPage } from "./about/AboutPage";
import { LandingPage } from "./landing/LandingPage";
import { SettingsPage } from "./settings/SettingsPage";
import { useAppContext } from "../contexts/app-context";

export const Router: React.FC = React.memo(() => {
    const { currentUser } = useAppContext();
    return (
        <HashRouter>
            <Switch>
                <Route path="/about" render={() => <AboutPage />} />
                <Route
                    path="/settings"
                    render={() => (currentUser.isAdmin() ? <SettingsPage /> : <Redirect to="/" />)}
                />
                <Route path="/" render={() => <LandingPage />} />
            </Switch>
            <AboutButtonFloat visible />
        </HashRouter>
    );
});
