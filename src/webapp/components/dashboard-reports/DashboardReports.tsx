import React, { useEffect } from "react";
import * as docx from "docx";
import { toCanvas } from "html-to-image";
import styled from "styled-components";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import InputLabel from "@material-ui/core/InputLabel";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import SettingsIcon from "@material-ui/icons/Settings";
import { useAppContext } from "../../contexts/app-context";
import { Dashboard, DashboardItem } from "../../../domain/entities/Dashboard";
import { DashboardFilter, DashboardFilterData } from "../../components/dashboard-filter/DashboardFilter";
import { DashboardSettings } from "../../components/dashboard-settings/DashboardSettings";
import { useSnackbar } from "@eyeseetea/d2-ui-components";
import i18n from "../../../locales";

export const DashboardReports: React.FC = React.memo(() => {
    const snackbar = useSnackbar();
    const { compositionRoot } = useAppContext();
    const [dialogState, setDialogState] = React.useState(false);
    const [dashboards, setDashboards] = React.useState<Dashboard[]>([]);
    const [dashboard, setDashboard] = React.useState<DashboardFilterData>();
    const [report, setReport] = React.useState<string>("");

    const filterIsEmpty = !dashboard?.dashboard || !dashboard?.dateMonth?.period;

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

    React.useEffect(() => {
        if (filterIsEmpty) return;

        const url = "https://play.dhis2.org/2.37.9";

        window.reportTablePlugin.url = url;
        window.reportTablePlugin.username = "admin";
        window.reportTablePlugin.password = "district";

        window.chartPlugin.url = url;
        window.chartPlugin.username = "admin";
        window.chartPlugin.password = "district";

        window.mapPlugin.url = url;
        window.mapPlugin.username = "admin";
        window.mapPlugin.password = "district";

        window.eventReportPlugin.url = url;
        window.eventReportPlugin.username = "admin";
        window.eventReportPlugin.password = "district";

        window.eventChartPlugin.url = url;
        window.eventChartPlugin.username = "admin";
        window.eventChartPlugin.password = "district";

        const lastFourMonths = dashboard.dateMonth?.period === "LAST_4_MONTHS";
        const items: Ref[] = [];
        if (lastFourMonths) {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            const currentMonthTwoDigits = ("0" + currentMonth).slice(-2);
            items.push({ id: `${currentYear}${currentMonthTwoDigits}` });
            for (let index = 0; index < 3; index++) {
                currentDate.setMonth(currentDate.getMonth() - 1);
                const prevMonthNumber = currentDate.getMonth() + 1;
                const twoDigitsPrevMonth = ("0" + prevMonthNumber).slice(-2);
                items.push({ id: `${currentDate.getFullYear()}${twoDigitsPrevMonth}` });
            }
        } else if (dashboard.dateMonth?.period) {
            items.push({ id: dashboard.dateMonth?.period.replace("-", "") });
        }

        // const ids = dashboard.dashboard?.dashboardItems.map(x => x.reportId) || [];

        // if (dashboard.dashboard?.dashboardItems) {
        //     compositionRoot.dashboards.getVisualizations.execute(dashboard.dashboard?.dashboardItems).run(
        //         () => {
        //             console.log("Called");
        //         },
        //         err => {
        //             console.log("Err", err);
        //         }
        //     );
        // }

        dashboard.dashboard?.dashboardItems.forEach(dashboardItem => {
            const item: ReportItem = {
                id: dashboardItem.reportId,
                el: `vis-${dashboardItem.reportId}`,
            };
            if (dashboardItem.reportId === "Juj0mETi7L2") {
                console.log("adding filter");
                item.mapViews = [
                    {
                        filters: [{ dimension: "pe", items }],
                    },
                ];
            }
            window[dashboardItem.reportType]?.load([item]);
        });
    }, [dashboard, filterIsEmpty]);

    const onChange = (dashboardFilter: DashboardFilterData) => {
        setDashboard(dashboardFilter);
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

    function getImagesFromDom(dashboardItems: DashboardItem[]) {
        return dashboardItems
            .map(dashboardItem => {
                const newEl: any = {
                    title: dashboardItem.reportTitle,
                    domEl: null,
                    base64: "",
                    width: 0,
                    height: 0,
                };
                const $vizDomEl = document.querySelector(`#vis-${dashboardItem.reportId}`);

                if (dashboardItem.reportType === "mapPlugin") {
                    const canvasEl = $vizDomEl?.querySelector("canvas") as HTMLCanvasElement;
                    if (canvasEl) {
                        newEl.base64 = canvasEl.toDataURL();
                        newEl.width = canvasEl.width;
                        newEl.height = canvasEl.height;
                    }
                } else if (dashboardItem.reportType === "chartPlugin") {
                    newEl.domEl = $vizDomEl;
                } else if (dashboardItem.reportType === "reportTablePlugin") {
                    newEl.domEl = $vizDomEl?.querySelector("table");
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
                    return toCanvas(dashboardItem.domEl).then(canvas => {
                        return {
                            ...dashboardItem,
                            base64: canvas.toDataURL(),
                            width: dashboardItem.width ? dashboardItem.width : canvas.width,
                            height: dashboardItem.height ? dashboardItem.height : canvas.width,
                        };
                    });
                } else {
                    return dashboardItem;
                }
            });
    }

    const generateRawReport = () => {
        if (dashboard?.dashboard) {
            const imagesPromises = getImagesFromDom(dashboard.dashboard.dashboardItems);

            Promise.all(imagesPromises).then(canvasEls => {
                const images = canvasEls.map(canvas => {
                    return new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                size: 30,
                                break: 4,
                                text: canvas.title,
                            }),
                            new docx.ImageRun({
                                data: canvas.base64,
                                transformation: {
                                    width: Number(canvas.width),
                                    height: Number(canvas.height),
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
                                            size: 60,
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
                    window.saveAs(blob, "example.docx");
                });
            }, console.error);
        }
    };

    const generateComplexReport = () => {
        if (dashboard?.dashboard) {
            const FONT_NAME = "Arial";
            const FONT_POINTS = "16pt";
            const FONT_POINTS_SMALL = "10pt";
            const imagesPromises = getImagesFromDom(dashboard.dashboard.dashboardItems);

            Promise.all(imagesPromises).then(canvasEls => {
                const tableRowHeader = new docx.TableRow({
                    tableHeader: true,
                    children: [
                        new docx.TableCell({
                            children: [
                                new docx.Paragraph({
                                    children: [
                                        new docx.TextRun({
                                            size: FONT_POINTS,
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
                                            size: FONT_POINTS,
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
                                            size: FONT_POINTS,
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
                                            size: FONT_POINTS,
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
                                        // text: canvas.title,
                                        alignment: docx.AlignmentType.CENTER,
                                        children: [
                                            new docx.TextRun({
                                                size: FONT_POINTS_SMALL,
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
                                                    width: 200,
                                                    height: 200,
                                                    // width: Number(canvas.width),
                                                    // height: Number(canvas.height),
                                                },
                                            }),
                                        ],
                                    }),
                                ],
                            }),
                            new docx.TableCell({
                                children: [new docx.Paragraph("")],
                            }),
                            new docx.TableCell({
                                children: [new docx.Paragraph("")],
                            }),
                        ],
                    });
                    return tableRowVisualization;
                });

                const table = new docx.Table({
                    // layout: docx.TableLayoutType.AUTOFIT,
                    // columnWidths: [30, 100, 30, 30],
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
                    window.saveAs(blob, "table.docx");
                });
            });
        }
    };

    const onChangeExport = (event: React.ChangeEvent<{ value: unknown }>) => {
        const value = event.target.value as string;
        setReport(value);
    };

    const onExport = () => {
        if (report) {
            if (report === "raw") {
                generateRawReport();
            } else {
                generateComplexReport();
            }
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
                <IconContainer>
                    <IconButton onClick={onSettings}>
                        <SettingsIcon />
                    </IconButton>
                </IconContainer>
            </DashboardFilter>

            {/* <DashboardPreview /> */}
            <ContainerItems>
                {dashboard?.dashboard && dashboard?.dateMonth?.period && (
                    <ContainerReportOptions>
                        <SelectReportContainer>
                            <InputLabel id="select-report-label">{i18n.t("Select Report")}</InputLabel>
                            <Select
                                labelId="select-report-label"
                                id="reports-select"
                                name="reports-select"
                                onChange={onChangeExport}
                                value={report}
                            >
                                <MenuItem value="raw">Raw Report</MenuItem>
                                <MenuItem value="complex">Complex Report</MenuItem>
                            </Select>
                        </SelectReportContainer>
                        <div>
                            <Button onClick={onExport}>Export</Button>
                        </div>
                    </ContainerReportOptions>
                )}
                <ContainerVisualizations>
                    {dashboardItems.map((dashboardItem, index) => {
                        return (
                            <VisualizationItem key={`${dashboardItem.reportId}-${index}`}>
                                <p>{dashboardItem.reportTitle}</p>
                                <VisualizationFrame
                                    className="vis"
                                    data-repid={dashboardItem.reportType}
                                    id={`vis-${dashboardItem.reportId}`}
                                ></VisualizationFrame>
                            </VisualizationItem>
                        );
                    })}
                </ContainerVisualizations>
            </ContainerItems>

            <DashboardSettings onSubmitForm={onSubmitForm} onDialogClose={closeDialog} dialogState={dialogState} />
        </>
    );
});

const ContainerItems = styled.div`
    padding: 0 30px;
`;

const SelectReportContainer = styled.div`
    min-width: 150px;
`;

const ContainerReportOptions = styled.div`
    align-items: center;
    display: flex;
    column-gap: 20px;
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
        reportTablePlugin: PluginData;
        chartPlugin: PluginData;
        eventChartPlugin: PluginData;
        eventReportPlugin: PluginData;
        mapPlugin: PluginData;
        [key: string]: PluginData;
        saveAs: (blob: Blob, filename: string) => void;
        html2canvas: (domEl: Element | null | undefined) => Promise<HTMLCanvasElement>;
    }
}

interface PluginData {
    url: string;
    username: string;
    password: string;
    load(reports: ReportItem[]): void;
}

interface ReportItem {
    id: string;
    el: DOMSelectorId;
    rows?: ItemRef[];
    filters?: ItemRef[];
    filter?: any[];
    mapViews?: any[];
}

interface ItemRef {
    dimension: "pe";
    items: Ref[];
}

interface Ref {
    id: Id;
}

type Id = string;

type DOMSelectorId = string;

DashboardReports.displayName = "DashboardReports";
