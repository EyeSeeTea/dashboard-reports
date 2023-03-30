import React from "react";
import * as docx from "docx";
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
import { useAppContext } from "../../contexts/app-context";
import { Dashboard, DashboardItem, ReportItem } from "../../../domain/entities/Dashboard";
import { DashboardFilter, DashboardFilterData } from "../../components/dashboard-filter/DashboardFilter";
import { DashboardSettings } from "../../components/dashboard-settings/DashboardSettings";
import { useSnackbar, useLoading } from "@eyeseetea/d2-ui-components";
import i18n from "../../../locales";
import { Settings } from "../../../domain/entities/Settings";

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
    const snackbar = useSnackbar();
    const loading = useLoading();
    const { compositionRoot, isDev, api } = useAppContext();
    const [dialogState, setDialogState] = React.useState(false);
    const [dashboards, setDashboards] = React.useState<Dashboard[]>([]);
    const [dashboard, setDashboard] = React.useState<DashboardFilterData>();
    const [report, setReport] = React.useState<string>("");
    const [settings, setSettings] = React.useState<Settings>();

    const filterIsEmpty = !dashboard?.dashboard;

    React.useEffect(() => {
        const url = isDev ? "https://play.dhis2.org/2.37.9" : api.baseUrl;

        const username = "admin";
        const password = "district";

        window.reportTablePlugin.url = url;
        window.chartPlugin.url = url;
        window.mapPlugin.url = url;
        window.eventChartPlugin.url = url;
        window.eventReportPlugin.url = url;

        window.eventChartPlugin.username = username;
        window.eventChartPlugin.password = password;

        window.eventReportPlugin.username = username;
        window.eventReportPlugin.password = password;

        window.reportTablePlugin.username = username;
        window.reportTablePlugin.password = password;

        window.chartPlugin.username = username;
        window.chartPlugin.password = password;

        window.mapPlugin.username = username;
        window.mapPlugin.password = password;

        function fetchDashboardsAndSettings() {
            compositionRoot.settings.get.execute().run(
                settings => {
                    setSettings(settings);
                },
                err => {
                    snackbar.openSnackbar("error", err);
                }
            );

            compositionRoot.dashboards.get.execute().run(
                dashboards => {
                    setDashboards(dashboards);
                },
                err => {
                    snackbar.openSnackbar("error", err);
                }
            );
        }

        fetchDashboardsAndSettings();
    }, [compositionRoot, snackbar, api, isDev]);

    React.useEffect(() => {
        if (filterIsEmpty) return;

        if (dashboard.dashboard?.dashboardItems) {
            loading.show();
            compositionRoot.dashboards.getMaps.execute(dashboard.dashboard?.dashboardItems, dashboard.dateMonth).run(
                mapsData => {
                    window.mapPlugin.load(mapsData);
                },
                err => {
                    snackbar.openSnackbar("error", err);
                }
            );
            compositionRoot.dashboards.getVisualizations
                .execute(dashboard.dashboard?.dashboardItems, dashboard.dateMonth)
                .run(
                    visualizationsData => {
                        visualizationsData.forEach(visualization => {
                            window[visualization.reportType]?.load([visualization]);
                        });
                        loading.hide();
                    },
                    err => {
                        snackbar.openSnackbar("error", err);
                        loading.hide();
                    }
                );
        }
    }, [dashboard, filterIsEmpty, snackbar, compositionRoot, loading]);

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
        loading.show();
        compositionRoot.settings.save.execute(settings).run(
            newSettings => {
                setSettings(newSettings);
                loading.hide();
            },
            err => {
                snackbar.openSnackbar("error", err);
                loading.hide();
            }
        );
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
        if (dashboard?.dashboard && settings) {
            const imagesPromises = getImagesFromDom(dashboard.dashboard.dashboardItems);
            const maxWidth = 600;

            Promise.all(imagesPromises)
                .then(canvasEls => {
                    const images = canvasEls.map(canvas => {
                        const imageWidth = canvas.width;
                        const imageHeight = canvas.height;
                        return new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    size: `${Number(settings.fontSize)}pt`,
                                    break: 4,
                                    text: canvas.title,
                                }),
                                new docx.ImageRun({
                                    data: canvas.base64,
                                    transformation: {
                                        width: imageWidth > maxWidth ? maxWidth : imageWidth,
                                        height: imageHeight,
                                    },
                                }),
                            ],
                        });
                    });

                    const doc = new docx.Document({
                        sections: [
                            {
                                children: [
                                    new docx.Paragraph({
                                        alignment: docx.AlignmentType.CENTER,
                                        children: [
                                            new docx.TextRun({
                                                size: `${Number(settings.fontSize)}pt`,
                                                text: dashboard.dashboard?.name,
                                            }),
                                            ...images,
                                        ],
                                    }),
                                ],
                            },
                        ],
                    });

                    docx.Packer.toBlob(doc).then(blob => {
                        saveAs(blob, "raw.docx");
                    });
                }, console.error)
                .finally(() => {
                    loading.hide();
                });
        }
    };

    const generateComplexReport = () => {
        if (dashboard?.dashboard && settings) {
            const maxWidth = 200;
            const maxHeight = 200;
            const FONT_NAME = "Arial";
            const imagesPromises = getImagesFromDom(dashboard.dashboard.dashboardItems);

            Promise.all(imagesPromises)
                .then(canvasEls => {
                    const tableRowHeader = new docx.TableRow({
                        tableHeader: true,
                        children: [
                            new docx.TableCell({
                                children: [
                                    new docx.Paragraph({
                                        children: [
                                            new docx.TextRun({
                                                size: `${Number(settings.fontSize)}pt`,
                                                font: FONT_NAME,
                                                text: "MO",
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new docx.TableCell({
                                children: [
                                    new docx.Paragraph({
                                        children: [
                                            new docx.TextRun({
                                                size: `${Number(settings.fontSize)}pt`,
                                                font: FONT_NAME,
                                                text: "IND",
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new docx.TableCell({
                                children: [
                                    new docx.Paragraph({
                                        children: [
                                            new docx.TextRun({
                                                size: `${Number(settings.fontSize)}pt`,
                                                font: FONT_NAME,
                                                text: "In Line?",
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new docx.TableCell({
                                children: [
                                    new docx.Paragraph({
                                        children: [
                                            new docx.TextRun({
                                                size: `${Number(settings.fontSize)}pt`,
                                                font: FONT_NAME,
                                                text: "Comments",
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                        ],
                    });

                    const tableRows = canvasEls.map(canvas => {
                        const tableRowVisualization = new docx.TableRow({
                            children: [
                                new docx.TableCell({
                                    textDirection: docx.TextDirection.TOP_TO_BOTTOM_RIGHT_TO_LEFT,
                                    children: [
                                        new docx.Paragraph({
                                            alignment: docx.AlignmentType.CENTER,
                                            children: [
                                                new docx.TextRun({
                                                    size: `${Number(settings.fontSize)}pt`,
                                                    font: FONT_NAME,
                                                    text: canvas.title,
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new docx.TableCell({
                                    children: [
                                        new docx.Paragraph({
                                            children: [
                                                new docx.ImageRun({
                                                    data: canvas.base64,
                                                    transformation: {
                                                        width: canvas.width > maxWidth ? maxWidth : canvas.width,
                                                        height: canvas.height > maxHeight ? maxHeight : canvas.height,
                                                    },
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new docx.TableCell({
                                    children: [
                                        new docx.Paragraph({
                                            children: [
                                                new docx.TextRun({
                                                    size: `${Number(settings.fontSize)}pt`,
                                                    text: " ",
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                new docx.TableCell({
                                    children: [
                                        new docx.Paragraph({
                                            children: [
                                                new docx.TextRun({
                                                    size: `${Number(settings.fontSize)}pt`,
                                                    text: " ",
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                            ],
                        });
                        return tableRowVisualization;
                    });

                    const table = new docx.Table({
                        rows: [tableRowHeader, ...tableRows],
                    });

                    const doc = new docx.Document({
                        sections: [
                            {
                                children: [table],
                            },
                        ],
                    });

                    docx.Packer.toBlob(doc).then(blob => {
                        saveAs(blob, "complex.docx");
                    });
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
