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
    useLegacy: boolean;
    legacyReportType: LegacyReportType;
    reportTitle: string;
    elementId: string;
    map?: Map;
    visualization?: Visualization;
    eventVisualization?: Visualization;
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
            useLegacy: this.getItemShouldUseLegacy(dashboardItem),
            legacyReportType: this.getItemLegacyReportType(dashboardItem),
        };
    }

    /**
     * @returns true when Legacy Plugin is preferred.
     */
    private getItemShouldUseLegacy(dashboardItem: DashboardItem): boolean {
        return (
            // EVENT_CHART is not working with the new dhis-data-visualizer iframe
            dashboardItem.type === "EVENT_CHART" ||
            // EVENT_REPORT only works with the line-listing iframe
            (dashboardItem.type === "EVENT_REPORT" && dashboardItem.eventVisualization?.type !== "LINE_LIST") ||
            // VISUALIZATION type PIVOT_TABLE: dhis-data-visualizer iframe modifies dom on scroll. Prefer legacy for easy image export
            (dashboardItem.type === "VISUALIZATION" && dashboardItem.visualization?.type === "PIVOT_TABLE")
        );
    }

    private getItemData(dashboardItem: DashboardItem) {
        const data = dashboardItem.map ?? dashboardItem.eventVisualization ?? dashboardItem.visualization;
        if (!data) {
            throw new Error("Missing property - one of: map, eventVisualization, visualization");
        }
        return data;
    }

    private getItemTitle(dashboardItem: DashboardItem): string {
        return this.getItemData(dashboardItem).name.trim();
    }

    private getItemReportId(dashboardItem: DashboardItem): string {
        return this.getItemData(dashboardItem).id;
    }

    private getItemLegacyReportType(dashboardItem: DashboardItem): LegacyReportType {
        if (dashboardItem.map) {
            return "mapPlugin";
        } else if (dashboardItem.type === "EVENT_CHART") {
            return "eventChartPlugin";
        } else if (dashboardItem.type === "EVENT_REPORT") {
            return "eventReportPlugin";
        } else if (dashboardItem.visualization && dashboardItem.visualization.type === "PIVOT_TABLE") {
            return "reportTablePlugin";
        } else {
            return "chartPlugin";
        }
    }
}
