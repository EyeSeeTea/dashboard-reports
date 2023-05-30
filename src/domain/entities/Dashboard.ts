import _ from "lodash";
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
    columns?: ItemRef[];
    el: string;
    filters?: ItemRef[];
    mapViews?: MapView[];
    reportType: ReportType;
    rows?: ItemRef[];
}

export type MapView = {
    columns: ItemRef[];
    rows: ItemRef[];
    filters: ItemRef[];
};

export interface ItemRef {
    id: "pe";
    dimension: "pe";
    items: Ref[];
}

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
    width: number;
    height: number;
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

        this.dashboardItems = _(data.dashboardItems)
            .filter(dashboardItem => {
                return Boolean(
                    dashboardItem.visualization ||
                        dashboardItem.map ||
                        dashboardItem.eventChart ||
                        dashboardItem.eventReport
                );
            })
            .map(dashboardItem => {
                return {
                    ...this.getReportInformation(dashboardItem),
                    elementId: dashboardItem.id,
                    width: dashboardItem.width,
                    height: dashboardItem.height,
                };
            })
            .uniqBy("reportId")
            .value();
    }

    private getReportInformation(dashboardItem: DashboardItem): DashboardItem {
        if (dashboardItem.map) {
            return {
                ...dashboardItem,
                reportType: "mapPlugin",
                reportTitle: dashboardItem.map.name.trim(),
                reportId: dashboardItem.map.id,
            };
        } else if (dashboardItem.eventChart) {
            return {
                ...dashboardItem,
                reportType: "eventChartPlugin",
                reportTitle: dashboardItem.eventChart.name.trim(),
                reportId: dashboardItem.eventChart.id,
            };
        } else if (dashboardItem.eventReport) {
            return {
                ...dashboardItem,
                reportType: "eventReportPlugin",
                reportTitle: dashboardItem.eventReport.name.trim(),
                reportId: dashboardItem.eventReport.id,
            };
        } else {
            const isVisualization = dashboardItem.type === "VISUALIZATION";
            const isPivot = dashboardItem.visualization.type === "PIVOT_TABLE";
            const reportType = isVisualization && isPivot ? "reportTablePlugin" : "chartPlugin";
            return {
                ...dashboardItem,
                reportType,
                reportTitle: dashboardItem.visualization.name.trim(),
                reportId: dashboardItem.visualization.id,
            };
        }
    }
}
