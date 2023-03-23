import React from "react";
import styled from "styled-components";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import { Dashboard } from "../../../domain/entities/Dashboard";
import { DateMonth } from "../../../domain/entities/DateMonth";
import i18n from "../../../locales";

export type DashboardFilterData = {
    dashboard: Dashboard;
    dateMonth: DateMonth;
};

export const DashboardFilter: React.FC<DashboardFilterProps> = React.memo(
    ({ children, dashboard, dashboards, onChange }) => {
        const onChangeSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
            const value = event.target.value as string;
            const dashboard = dashboards.find(d => d.id === value);
            if (dashboard) {
                const dashboardData: DashboardFilterData = {
                    dashboard,
                    // I'm going to change this in a next commit
                    // since I don't really know the format I need right now
                    dateMonth: {
                        month: 3,
                        year: 2023,
                    },
                };
                onChange(dashboardData);
            }
        };

        const onFocus = () => {
            const $domEl = window.document.querySelector("input#month-filter") as HTMLInputElement;
            $domEl.showPicker();
        };

        const inputLabelProps = React.useMemo(() => {
            return { shrink: true };
        }, []);

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
                        onFocus={onFocus}
                    />
                </DateContainer>

                {children}
            </Container>
        );
    }
);

const Container = styled.div`
    display: flex;
    margin-left: 30px;
    margin-top: 30px;
`;

const DateContainer = styled.div`
    margin-left: 10px;
`;

const FormControlContainer = styled(FormControl)`
    min-width: 150px;
`;

export interface DashboardFilterProps {
    children?: React.ReactNode;
    dashboards: Dashboard[];
    dashboard: string;
    onChange: (dashboard: DashboardFilterData) => void;
}

DashboardFilter.displayName = "DashboardFilter";
