import _ from "lodash";
import { Id } from "./Ref";

export type LegacyReportType = "eventChartPlugin" | "eventReportPlugin";

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
    legacyReportType: LegacyReportType | null;
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
            .uniqBy("reportId")
            .sortBy(dashboard => dashboard.reportTitle)
            .value();
    }
}

export function isLineListing(dashboardItem: DashboardItem): boolean {
    return dashboardItem.eventVisualization?.type === "LINE_LIST";
}
