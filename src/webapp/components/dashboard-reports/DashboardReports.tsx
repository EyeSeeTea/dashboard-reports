import React from "react";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import styled from "styled-components";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import SettingsIcon from "@material-ui/icons/Settings";
import Typography from "@material-ui/core/Typography";
import { useSnackbar, useLoading } from "@eyeseetea/d2-ui-components";
import { DashboardItem, ReportItem } from "../../../domain/entities/Dashboard";
import { DashboardFilter, DashboardFilterData } from "../../components/dashboard-filter/DashboardFilter";
import { DashboardSettings } from "../../components/dashboard-settings/DashboardSettings";
import i18n from "../../../locales";
import { Settings } from "../../../domain/entities/Settings";
import { useDashboard } from "../../hooks/useDashboard";
import { useSettings } from "../../hooks/useSettings";
import { useReports } from "../../hooks/useReports";
import { useAppContext } from "../../contexts/app-context";

function convertSvgToPng(input: HTMLElement): Promise<HTMLCanvasElement> {
    const promise = new Promise<HTMLCanvasElement>((resolve, reject) => {
        const svgData = new XMLSerializer().serializeToString(input);
        const svgDataBase64 = btoa(unescape(encodeURIComponent(svgData)));
        const svgDataUrl = `data:image/svg+xml;charset=utf-8;base64,${svgDataBase64}`;

        const image = new Image();

        image.addEventListener("load", () => {
            const width = input.getAttribute("width") || "0";
            const height = input.getAttribute("height") || "0";
            const canvas = document.createElement("canvas");

            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);

            const context = canvas.getContext("2d") as CanvasRenderingContext2D;
            context.drawImage(image, 0, 0, Number(width), Number(height));

            resolve(canvas);
        });

        image.addEventListener("error", reject);

        image.src = svgDataUrl;
    });

    return promise;
}

function getCanvasInformation(dashboardItem: DocxItem, canvas: HTMLCanvasElement) {
    return {
        ...dashboardItem,
        base64: canvas.toDataURL(),
        width: dashboardItem.width ? dashboardItem.width : canvas.width,
        height: dashboardItem.height ? dashboardItem.height : canvas.width,
    };
}

export const DashboardReports: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { dashboards } = useDashboard();
    const { settings, saveSettings } = useSettings();
    const [dialogState, setDialogState] = React.useState(false);
    const [dashboard, setDashboard] = React.useState<DashboardFilterData>();
    const [report, setReport] = React.useState<string>("");
    useReports({ dashboard });

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
    };

    function getImagesFromDom(dashboardItems: DashboardItem[]) {
        return dashboardItems
            .map(dashboardItem => {
                const newEl: DocxItem = {
                    title: dashboardItem.reportTitle,
                    domEl: null,
                    base64: "",
                    width: 0,
                    height: 0,
                };
                const $vizDomEl = document.querySelector(`#${dashboardItem.elementId}`);

                if (dashboardItem.reportType === "mapPlugin") {
                    const canvasEl = $vizDomEl?.querySelector("canvas") as HTMLCanvasElement;
                    if (canvasEl) {
                        newEl.base64 = canvasEl.toDataURL();
                        newEl.width = canvasEl.width;
                        newEl.height = canvasEl.height;
                    }
                } else if (
                    dashboardItem.reportType === "chartPlugin" ||
                    dashboardItem.reportType === "eventChartPlugin"
                ) {
                    newEl.domEl = $vizDomEl?.querySelector("svg") as SVGElement;
                } else if (
                    dashboardItem.reportType === "reportTablePlugin" ||
                    dashboardItem.reportType === "eventReportPlugin"
                ) {
                    newEl.domEl = $vizDomEl?.querySelector("table") as HTMLTableElement;
                    const tableRects = newEl.domEl?.getClientRects();
                    if (tableRects[0]) {
                        newEl.width = tableRects[0].width;
                        newEl.height = tableRects[0].height;
                    }
                }
                return newEl;
            })
            .map(dashboardItem => {
                if (dashboardItem.domEl) {
                    if (dashboardItem.domEl.tagName === "svg") {
                        return convertSvgToPng(dashboardItem.domEl as HTMLElement).then(canvas =>
                            getCanvasInformation(dashboardItem, canvas)
                        );
                    } else {
                        return html2canvas(dashboardItem.domEl as HTMLElement).then(canvas =>
                            getCanvasInformation(dashboardItem, canvas)
                        );
                    }
                } else {
                    return dashboardItem;
                }
            });
    }

    const generateRawReport = () => {
        if (dashboard?.dashboard?.name && settings) {
            const dashboardTitle = dashboard?.dashboard?.name;
            const imagesPromises = getImagesFromDom(dashboard.dashboard.dashboardItems);

            Promise.all(imagesPromises)
                .then(docxItems => {
                    return compositionRoot.exportRepository.saveRawReport.execute(docxItems, dashboardTitle, settings);
                })
                .then(blob => {
                    saveAs(blob, "raw.docx");
                })
                .finally(() => {
                    loading.hide();
                });
        }
    };

    const generateComplexReport = () => {
        if (dashboard?.dashboard && settings) {
            const imagesPromises = getImagesFromDom(dashboard.dashboard.dashboardItems);

            Promise.all(imagesPromises)
                .then(docxItems => {
                    return compositionRoot.exportRepository.saveComplexReport.execute(docxItems, settings);
                })
                .then(blob => {
                    saveAs(blob, "complex.docx");
                })
                .finally(() => {
                    loading.hide();
                });
        }
    };

    const onChangeExport = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as string;
        setReport(value);
    };

    const onExport = () => {
        if (report) {
            loading.show();
            if (report === "raw") {
                generateRawReport();
            } else {
                generateComplexReport();
            }
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

    return (
        <>
            <DashboardFilter dashboards={dashboards} onChange={onChange}>
                {dashboard?.dashboard && (
                    <>
                        <SelectReportContainer>
                            <InputLabel id="select-report-label">{i18n.t("Select Report")}</InputLabel>

                            <Select
                                labelId="select-report-label"
                                id="reports-select"
                                name="reports-select"
                                onChange={onChangeExport}
                                value={report}
                                fullWidth
                            >
                                <MenuItem value="raw">{i18n.t("Raw Report")}</MenuItem>
                                <MenuItem value="complex">{i18n.t("Complex Report")}</MenuItem>
                            </Select>
                        </SelectReportContainer>

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

                                <VisualizationFrame
                                    className="vis"
                                    data-repid={dashboardItem.reportId}
                                    data-reptype={dashboardItem.reportType}
                                    id={dashboardItem.elementId}
                                ></VisualizationFrame>
                            </VisualizationItem>
                        );
                    })}
                </ContainerVisualizations>
            </ContainerItems>

            {settings && (
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

declare global {
    interface Window {
        eventChartPlugin: PluginData;
        eventReportPlugin: PluginData;
        reportTablePlugin: PluginData;
        chartPlugin: PluginData;
        mapPlugin: PluginData;
        [key: string]: PluginData;
    }
}

interface PluginData {
    url: string;
    username: string;
    password: string;
    load(reports: ReportItem[]): void;
}

interface DocxItem {
    title: string;
    domEl: Element | null;
    base64: string;
    width: number;
    height: number;
}

DashboardReports.displayName = "DashboardReports";
