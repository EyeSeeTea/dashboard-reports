import React, { useEffect } from "react";
import styled from "styled-components";
import IconButton from "@material-ui/core/IconButton";
import SettingsIcon from "@material-ui/icons/Settings";
import { useAppContext } from "../../contexts/app-context";
import { Dashboard } from "../../../domain/entities/Dashboard";
import { DashboardFilter, DashboardFilterData } from "../../components/dashboard-filter/DashboardFilter";
import { DashboardSettings } from "../../components/dashboard-settings/DashboardSettings";
import { useSnackbar } from "@eyeseetea/d2-ui-components";

export const DashboardReports: React.FC = React.memo(() => {
    const snackbar = useSnackbar();
    const { compositionRoot } = useAppContext();
    const [dialogState, setDialogState] = React.useState(false);
    const [dashboards, setDashboards] = React.useState<Dashboard[]>([]);
    const [dashboard, setDashboard] = React.useState<string>("");

    useEffect(() => {
        function fetchData() {
            compositionRoot.dashboards.get.execute().run(
                dashboards => {
                    setDashboards(dashboards);
                },
                err => {
                    snackbar.openSnackbar("error", err);
                }
            );
        }

        fetchData();
    }, [compositionRoot, snackbar]);

    const onChange = (dashboardFilter: DashboardFilterData) => {
        setDashboard(dashboardFilter.dashboard.id);
    };

    const onSettings = () => {
        setDialogState(true);
    };

    const closeDialog = () => {
        setDialogState(false);
    };

    const onSubmitForm = () => {
        setDialogState(false);
    };

    return (
        <>
            <DashboardFilter dashboards={dashboards} dashboard={dashboard} onChange={onChange}>
                <IconContainer>
                    <IconButton onClick={onSettings}>
                        <SettingsIcon />
                    </IconButton>
                </IconContainer>
            </DashboardFilter>

            <DashboardSettings onSubmitForm={onSubmitForm} onDialogClose={closeDialog} dialogState={dialogState} />
        </>
    );
});

const IconContainer = styled.div`
    margin-left: auto;
`;

DashboardReports.displayName = "DashboardReports";
