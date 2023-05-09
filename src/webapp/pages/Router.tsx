import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { LandingPage } from "./landing/LandingPage";

export const Router: React.FC = React.memo(() => {
    return (
        <HashRouter>
            <Switch>
                {/* Default route */}
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
});
