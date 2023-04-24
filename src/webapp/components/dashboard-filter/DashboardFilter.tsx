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
import { ReportPeriod } from "../../../domain/entities/DateMonth";
import i18n from "../../../locales";

export type DashboardFilterData = {
    dashboard?: Dashboard;
    dateMonth: ReportPeriod;
};

const inputLabelProps = { shrink: true };

function formatDate(value: string) {
    if (!value) return { year: 0, month: 0 };

    const year = value.split("-")[0];
    const month = value.split("-")[1];
    return {
        month: Number(month),
        year: Number(year),
    };
}

function getPeriod(lastMonths: boolean, date: string): ReportPeriod {
    return lastMonths
        ? {
              type: "lastMonths",
              value: lastMonths,
          }
        : {
              type: "dateMonth",
              value: formatDate(date),
          };
}

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
            dateMonth: getPeriod(lastMonths, month),
        };

        onChange(dashboardData);
    };

    const onChangeMonth = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        const dashboardSelected = dashboards.find(d => d.id === dashboard);
        const dashboardData: DashboardFilterData = {
            dashboard: dashboardSelected,
            dateMonth: getPeriod(lastMonths, value),
        };
        setMonth(event.target.value);
        onChange(dashboardData);
    };

    const onChangeLastMonths = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked;
        const dashboardSelected = dashboards.find(d => d.id === dashboard);
        const dashboardData: DashboardFilterData = {
            dashboard: dashboardSelected,
            dateMonth: getPeriod(value, month),
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
