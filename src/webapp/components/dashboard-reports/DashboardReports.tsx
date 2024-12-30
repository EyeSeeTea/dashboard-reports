import React from "react";
import styled from "styled-components";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import SettingsIcon from "@material-ui/icons/Settings";
import Typography from "@material-ui/core/Typography";
import { useSnackbar, useLoading } from "@eyeseetea/d2-ui-components";
import { DashboardItem } from "../../../domain/entities/Dashboard";
import { DashboardFilter, DashboardFilterData } from "../../components/dashboard-filter/DashboardFilter";
import { DashboardSettings } from "../../components/dashboard-settings/DashboardSettings";
import i18n from "../../../locales";
import { Settings, TemplateReport } from "../../../domain/entities/Settings";
import { useDashboard } from "../../hooks/useDashboard";
import { useSettings } from "../../hooks/useSettings";
import { useGenerateDocxReport } from "../../hooks/useGenerateDocxReport";
import { useAppContext } from "../../contexts/app-context";
import { Visualization } from "../visualization/Visualization";
import { getIdFromPath } from "../../../domain/entities/OrgUnit";

export const DashboardReports: React.FC = React.memo(() => {
    const appContext = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const settings = appContext.settings;
    const { dashboards } = useDashboard();
    const [selectedReport, setSelectedReport] = React.useState<TemplateReport | undefined>(settings?.templates[0]);
    const { saveSettings } = useSettings(settings?.templates[0]);
    const [dialogState, setDialogState] = React.useState(false);
    const [dashboard, setDashboard] = React.useState<DashboardFilterData>();
    const { generateDocxReport } = useGenerateDocxReport({ dashboard, settings });

    const filterIsEmpty = !dashboard?.dashboard;

    const onChange = (dashboardFilter: DashboardFilterData) => {
        setDashboard(dashboardFilter);
    };

    const onSettings = () => {
        setDialogState(true);
    };

    const closeDialog = () => {
        setDialogState(false);
    };

    const onSubmitSettings = (settings: Settings) => {
        saveSettings(settings);
        setDialogState(false);
        appContext.setAppContext(prev => {
            if (!prev) return null;
            return {
                ...prev,
                settings,
            };
        });
    };

    const onChangeExport = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as string;
        const template = settings?.templates.find(t => t.name === value);
        if (template) {
            setSelectedReport(template);
        }
    };

    const onExport = () => {
        if (selectedReport) {
            loading.show();
            generateDocxReport(selectedReport);
        } else {
            snackbar.openSnackbar("info", i18n.t("Select a Report"), {
                autoHideDuration: 3000,
            });
        }
    };

    let dashboardItems: DashboardItem[] = [];
    const currentDashboard = dashboards.find(d => d.id === dashboard?.dashboard?.id);
    if (currentDashboard && !filterIsEmpty) {
        dashboardItems = currentDashboard.dashboardItems;
    }

    const orgUnitIds = dashboard?.orgUnits?.length ? dashboard.orgUnits.map(getIdFromPath) : undefined;

    return (
        <>
            <DashboardFilter dashboards={dashboards} onChange={onChange}>
                {dashboard?.dashboard && (
                    <>
                        {settings && selectedReport && (
                            <SelectReportContainer>
                                <InputLabel id="select-report-label">{i18n.t("Select Report")}</InputLabel>

                                <Select
                                    labelId="select-report-label"
                                    id="reports-select"
                                    name="reports-select"
                                    onChange={onChangeExport}
                                    value={selectedReport.name}
                                    fullWidth
                                >
                                    {settings?.templates.map(template => {
                                        return (
                                            <MenuItem key={template.name} value={template.name}>
                                                {template.name}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </SelectReportContainer>
                        )}

                        <Button color="primary" variant="contained" onClick={onExport}>
                            {i18n.t("Export to Word")}
                        </Button>
                    </>
                )}
                <IconContainer>
                    <IconButton onClick={onSettings}>
                        <SettingsIcon />
                    </IconButton>
                </IconContainer>
            </DashboardFilter>

            <ContainerItems>
                <ContainerVisualizations>
                    {dashboardItems.map((dashboardItem, index) => {
                        return (
                            <VisualizationItem key={`${dashboardItem.reportId}-${index}`}>
                                <Typography variant="subtitle1" component="p">
                                    {dashboardItem.reportTitle}
                                </Typography>

                                <VisualizationFrame className="visualization">
                                    {dashboard && (
                                        <Visualization
                                            dashboardItem={dashboardItem}
                                            period={dashboard.dateMonth}
                                            orgUnits={orgUnitIds}
                                        />
                                    )}
                                </VisualizationFrame>
                            </VisualizationItem>
                        );
                    })}
                </ContainerVisualizations>
            </ContainerItems>

            {settings && dialogState && (
                <DashboardSettings
                    settings={settings}
                    onSubmitForm={onSubmitSettings}
                    onDialogClose={closeDialog}
                    dialogState={dialogState}
                />
            )}
        </>
    );
});

const ContainerItems = styled.div`
    padding: 0 30px;
`;

const SelectReportContainer = styled.div`
    min-width: 150px;
`;

const ContainerVisualizations = styled.div`
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr;
    @media (min-width: 768px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        flex-direction: row;
    }
`;

const VisualizationItem = styled.div`
    font-size: 16px;
`;

const VisualizationFrame = styled.div`
    height: 400px;
    overflow: auto;
`;

const IconContainer = styled.div`
    margin-left: auto;
`;

DashboardReports.displayName = "DashboardReports";
