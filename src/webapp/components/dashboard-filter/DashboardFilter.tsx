import React from "react";
import styled from "styled-components";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import SettingsIcon from "@material-ui/icons/Settings";
import TextField from "@material-ui/core/TextField";
import { Dashboard } from "../../../domain/entities/Dashboard";

export const DashboardFilter: React.FC<DashboardFilterProps> = React.memo(
    ({ dashboard, dashboards, handleChange, onSettings }) => {
        return (
            <Container>
                <Select
                    label="select a dashboard"
                    id="dashboards-select"
                    name="dashboards-select"
                    value={dashboard}
                    onChange={handleChange}
                >
                    {dashboards.map((item: any) => {
                        return (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        );
                    })}
                </Select>
                <DateContainer>
                    <TextField
                        id="month-filter"
                        name="month-filter"
                        label="Select Month"
                        type="month"
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </DateContainer>
                <IconContainer>
                    <IconButton onClick={onSettings}>
                        <SettingsIcon />
                    </IconButton>
                </IconContainer>
            </Container>
        );
    }
);

const Container = styled.div`
    display: flex;
    margin-left: 30px;
    margin-top: 30px;
`;

const IconContainer = styled.div`
    margin-left: auto;
`;

const DateContainer = styled.div`
    margin-left: 10px;
`;

export interface DashboardFilterProps {
    dashboards: Dashboard[];
    dashboard: string;
    handleChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
    onSettings: React.MouseEventHandler<HTMLButtonElement>;
}

DashboardFilter.displayName = "DashboardFilter";
