import React, { useEffect } from "react";
import { useAppContext } from "../../contexts/app-context";
import { Dashboard } from "../../../domain/entities/Dashboard";
import { DashboardFilter } from "../../components/dashboard-filter/DashboardFilter";
import { DashboardSettings } from "../../components/dashboard-settings/DashboardSettings";

export const LandingPage: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const [dialogState, setDialogState] = React.useState(false);
    const [dashboards, setDashboards] = React.useState<Dashboard[]>([]);
    const [dashboard, setDashboard] = React.useState<string>("");

    useEffect(() => {
        async function fetchData() {
            const dashboards = await compositionRoot.dashboards.get.execute();
            setDashboards(dashboards);
            if (dashboards[0]) {
                setDashboard(dashboards[0].id);
            }
        }

        fetchData();
    }, [compositionRoot]);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setDashboard(event.target.value as string);
    };

    const onSettings: React.MouseEventHandler<HTMLButtonElement> = () => {
        setDialogState(true);
    };

    const onDialogClose = () => {
        setDialogState(false);
    };

    const onSubmitForm: React.FormEventHandler<HTMLFormElement> = e => {
        e.preventDefault();
        setDialogState(false);
    };

    return (
        <>
            <DashboardFilter
                dashboards={dashboards}
                dashboard={dashboard}
                handleChange={handleChange}
                onSettings={onSettings}
            />
            <DashboardSettings onSubmitForm={onSubmitForm} onDialogClose={onDialogClose} dialogState={dialogState} />
        </>
    );
});

LandingPage.displayName = "LandingPage";
