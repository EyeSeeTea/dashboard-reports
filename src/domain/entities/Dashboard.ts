import { Id, Ref } from "./Ref";

export type ReportType = "reportTablePlugin" | "chartPlugin" | "mapPlugin" | "eventChartPlugin" | "eventReportPlugin";

export interface ItemRef {
    dimension: "pe";
    items: Ref[];
    filters: Ref[];
    columns: Ref[];
}

export interface ReportItem {
    id: Id;
    el: DOMSelectorId;
    columns?: ItemRef[];
    rows?: ItemRef[];
    filters?: ItemRef[];
    reportType: ReportType;
    mapViews?: D2MapView[];
}

export type D2MapView = {
    columns: ItemRef[];
    rows: ItemRef[];
    filters: ItemRef[];
};

export interface ItemRef {
    id: "pe";
    dimension: "pe";
    items: Ref[];
}

type DOMSelectorId = string;

export interface DashboardData {
    id: Id;
    name: string;
    dashboardItems: DashboardItem[];
}

export interface DashboardItem {
    id: Id;
    type: string;
    reportId: string;
    reportType: ReportType;
    reportTitle: string;
    elementId: string;
    map: Map;
    visualization: Visualization;
    eventReport: EventReport;
    eventChart: EventChart;
}

export interface Visualization {
    id: Id;
    name: string;
    type: string;
}

export interface Map {
    id: Id;
    name: string;
}

export interface EventReport {
    id: Id;
    name: string;
}

export interface EventChart {
    id: Id;
    name: string;
}

export class Dashboard {
    public readonly id: Id;
    public readonly name: string;
    public readonly dashboardItems: DashboardItem[];

    constructor(data: DashboardData) {
        this.id = data.id;
        this.name = data.name;
        this.dashboardItems = data.dashboardItems
            .filter(dashboardItem => {
                return (
                    dashboardItem.visualization ||
                    dashboardItem.map ||
                    dashboardItem.eventChart ||
                    dashboardItem.eventReport
                );
            })
            .map(dashboardItem => {
                dashboardItem.elementId = dashboardItem.id;
                const isVisualization = dashboardItem.type === "VISUALIZATION";
                if (isVisualization) {
                    const isPivot = dashboardItem.visualization.type === "PIVOT_TABLE";
                    dashboardItem.reportTitle = dashboardItem.visualization.name;
                    if (isPivot) {
                        dashboardItem.reportType = "reportTablePlugin";
                        dashboardItem.reportId = dashboardItem.visualization.id;
                    } else {
                        dashboardItem.reportType = "chartPlugin";
                        dashboardItem.reportId = dashboardItem.visualization.id;
                    }
                } else if (dashboardItem.map) {
                    dashboardItem.reportType = "mapPlugin";
                    dashboardItem.reportId = dashboardItem.map.id;
                    dashboardItem.reportTitle = dashboardItem.map.name;
                } else if (dashboardItem.eventChart) {
                    dashboardItem.reportType = "eventChartPlugin";
                    dashboardItem.reportId = dashboardItem.eventChart.id;
                    dashboardItem.reportTitle = dashboardItem.eventChart.name;
                } else if (dashboardItem.eventReport) {
                    dashboardItem.reportType = "eventReportPlugin";
                    dashboardItem.reportId = dashboardItem.eventReport.id;
                    dashboardItem.reportTitle = dashboardItem.eventReport.name;
                }
                return dashboardItem;
            });
    }
}
