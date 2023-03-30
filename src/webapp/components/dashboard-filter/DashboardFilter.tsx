import React from "react";
import styled from "styled-components";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { Dashboard } from "../../../domain/entities/Dashboard";
import { DateMonth } from "../../../domain/entities/DateMonth";
import i18n from "../../../locales";

export type DashboardFilterData = {
    dashboard?: Dashboard;
    dateMonth: DateMonth;
};

export const DashboardFilter: React.FC<DashboardFilterProps> = React.memo(({ children, dashboards, onChange }) => {
    const [dashboard, setDashboard] = React.useState<string>("");
    const [month, setMonth] = React.useState<string>("");
    const [lastMonths, setLastMonths] = React.useState<boolean>(false);

    const onChangeSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as string;
        setDashboard(value);
        const dashboardSelected = dashboards.find(d => d.id === value);
        const dashboardData: DashboardFilterData = {
            dashboard: dashboardSelected,
            dateMonth: {
                period: month,
                lastMonths,
            },
        };
        onChange(dashboardData);
    };

    const inputLabelProps = React.useMemo(() => {
        return { shrink: true };
    }, []);

    const onChangeMonth = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const dashboardSelected = dashboards.find(d => d.id === dashboard);
        const dashboardData: DashboardFilterData = {
            dashboard: dashboardSelected,
            dateMonth: {
                period: value,
                lastMonths,
            },
        };
        setMonth(event.target.value);
        onChange(dashboardData);
    };

    const onChangeLastMonths = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked;
        const dashboardSelected = dashboards.find(d => d.id === dashboard);
        const dashboardData: DashboardFilterData = {
            dashboard: dashboardSelected,
            dateMonth: {
                period: month,
                lastMonths: value,
            },
        };
        setLastMonths(value);
        onChange(dashboardData);
    };

    return (
        <Container>
            <FormControlContainer>
                <InputLabel id="select-dashboard-label">{i18n.t("Select Dashboard")}</InputLabel>

                <Select
                    labelId="select-dashboard-label"
                    id="dashboards-select"
                    name="dashboards-select"
                    value={dashboard}
                    onChange={onChangeSelect}
                >
                    {dashboards.map(dashboard => {
                        return (
                            <MenuItem key={dashboard.id} value={dashboard.id}>
                                {dashboard.name}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControlContainer>

            <DateContainer>
                <TextField
                    id="month-filter"
                    name="month-filter"
                    label={i18n.t("Select Month")}
                    type="month"
                    InputLabelProps={inputLabelProps}
                    disabled={lastMonths}
                    onChange={onChangeMonth}
                />
            </DateContainer>

            <FormControlLabel
                control={<Checkbox name="last-four-months" checked={lastMonths} onChange={onChangeLastMonths} />}
                label={i18n.t("Last four months")}
            />

            {children}
        </Container>
    );
});

const Container = styled.div`
    column-gap: 20px;
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    padding: 30px;
    @media (min-width: 768px) {
        flex-direction: row;
        row-gap: 0;
    }
`;

const DateContainer = styled.div`
    margin-left: 0px;
`;

const FormControlContainer = styled(FormControl)`
    min-width: 150px;
`;

export interface DashboardFilterProps {
    children?: React.ReactNode;
    dashboards: Dashboard[];
    onChange: (dashboard: DashboardFilterData) => void;
}

DashboardFilter.displayName = "DashboardFilter";
