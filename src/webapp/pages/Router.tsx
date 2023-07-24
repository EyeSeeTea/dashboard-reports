import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { AboutButtonFloat } from "./about/AboutButtonFloat";
import { AboutPage } from "./about/AboutPage";
import { LandingPage } from "./landing/LandingPage";

export const Router: React.FC = React.memo(() => {
    return (
        <HashRouter>
            <Switch>
                {/* Default route */}
                <Route path="/about" render={() => <AboutPage />} />
                <Route path="/" render={() => <LandingPage />} />
            </Switch>
            <AboutButtonFloat visible />
        </HashRouter>
    );
});
