import React from "react";
import { DashboardReports } from "../../components/dashboard-reports/DashboardReports";

export const LandingPage: React.FC = React.memo(() => {
    return <DashboardReports />;
});

LandingPage.displayName = "LandingPage";
