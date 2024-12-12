import _ from "lodash";
import { Id } from "./Ref";

export type LegacyReportType =
    | "reportTablePlugin"
    | "chartPlugin"
    | "mapPlugin"
    | "eventChartPlugin"
    | "eventReportPlugin";

export interface DashboardData {
    id: Id;
    name: string;
    dashboardItems: DashboardItem[];
}

export interface DashboardItem {
    id: Id;
    type: string;
    reportId: string;
    legacyReportType: LegacyReportType;
    reportTitle: string;
    elementId: string;
    map: Map;
    visualization: Visualization;
    eventVisualization: Visualization;
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

export class Dashboard {
    public readonly id: Id;
    public readonly name: string;
    public readonly dashboardItems: DashboardItem[];

    constructor(data: DashboardData) {
        this.id = data.id;
        this.name = data.name;

        this.dashboardItems = _(data.dashboardItems)
            .filter(dashboardItem => this.showInDashboard(dashboardItem))
            .map(dashboardItem => {
                return {
                    ...this.getReportInformation(dashboardItem),
                    elementId: dashboardItem.id,
                    width: dashboardItem.width,
                    height: dashboardItem.height,
                };
            })
            .uniqBy("reportId")
            .sortBy(dashboard => dashboard.reportTitle)
            .value();
    }

    private showInDashboard(dashboardItem: DashboardItem): boolean {
        return Boolean(dashboardItem.visualization || dashboardItem.map || dashboardItem.eventVisualization);
    }

    private getReportInformation(dashboardItem: DashboardItem): DashboardItem {
        return {
            ...dashboardItem,
            reportTitle: this.getItemTitle(dashboardItem),
            reportId: this.getItemReportId(dashboardItem),
            legacyReportType: this.getItemLegacyReportType(dashboardItem),
        };
    }

    private getItemTitle(dashboardItem: DashboardItem): string {
        const data = dashboardItem.map ?? dashboardItem.eventVisualization ?? dashboardItem.visualization;
        return data.name.trim();
    }

    private getItemReportId(dashboardItem: DashboardItem): string {
        const data = dashboardItem.map ?? dashboardItem.eventVisualization ?? dashboardItem.visualization;
        return data.id;
    }

    private getItemLegacyReportType(dashboardItem: DashboardItem): LegacyReportType {
        if (dashboardItem.map) {
            return "mapPlugin";
        }
        if (dashboardItem.type === "EVENT_CHART") {
            return "eventChartPlugin";
        }
        if (dashboardItem.type === "EVENT_REPORT") {
            return "eventReportPlugin";
        }
        if (dashboardItem.visualization && dashboardItem.visualization.type === "PIVOT_TABLE") {
            return "reportTablePlugin";
        }
        return "chartPlugin";
    }
}
