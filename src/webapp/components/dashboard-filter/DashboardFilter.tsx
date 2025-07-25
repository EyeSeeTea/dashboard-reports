import React from "react";
import styled from "styled-components";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { DatePicker } from "@eyeseetea/d2-ui-components";
import { Dashboard } from "../../../domain/entities/Dashboard";
import { ReportPeriod } from "../../../domain/entities/DateMonth";
import i18n from "../../../utils/i18n";

export type DashboardFilterData = {
    dashboard?: Dashboard;
    dateMonth: ReportPeriod;
};

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
              value: {
                  ...formatDate(date),
                  lastFourMonths: lastMonths,
              },
          }
        : {
              type: "dateMonth",
              value: {
                  ...formatDate(date),
                  lastFourMonths: lastMonths,
              },
          };
}

export const DashboardFilter: React.FC<DashboardFilterProps> = React.memo(({ children, dashboards, onChange }) => {
    const [dashboard, setDashboard] = React.useState<string>("");
    const [month, setMonth] = React.useState<string | null>(null);
    const [lastMonths, setLastMonths] = React.useState<boolean>(false);

    const onChangeSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as string;
        setDashboard(value);
        const dashboardSelected = dashboards.find(d => d.id === value);
        const dashboardData: DashboardFilterData = {
            dashboard: dashboardSelected,
            dateMonth: getPeriod(lastMonths, month || ""),
        };

        onChange(dashboardData);
    };

    const onChangeMonth = (moment: MomentProps) => {
        const value = moment ? moment.format() : null;
        const dashboardSelected = dashboards.find(d => d.id === dashboard);
        const dashboardData: DashboardFilterData = {
            dashboard: dashboardSelected,
            dateMonth: getPeriod(lastMonths, value || ""),
        };
        setMonth(value);
        onChange(dashboardData);
    };

    const onChangeLastMonths = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked;
        const dashboardSelected = dashboards.find(d => d.id === dashboard);
        const dashboardData: DashboardFilterData = {
            dashboard: dashboardSelected,
            dateMonth: getPeriod(value, month || ""),
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
                <DatePicker
                    format="YYYY-MM"
                    value={month}
                    views={["year", "month"]}
                    onChange={onChangeMonth}
                    label={i18n.t("Select Month")}
                    style={{ margin: 0, padding: 0 }}
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

type MomentProps = {
    format: () => string;
};

DashboardFilter.displayName = "DashboardFilter";
