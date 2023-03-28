export type reportType = "reportTablePlugin" | "chartPlugin" | "mapPlugin" | "eventChartPlugin" | "eventReportPlugin";

// const obj = {
//     eventReport: { id: 1 },
//     eventChart: { id: 2 },
//     map: { id: 3 },
//     visualization: {
//         id: 4,
//         type: "PIVOT_TABLE", // anything else belongs to chartPlugin
//     },
//     pluginName: "",
// };

export interface DashboardData {
    id: string;
    name: string;
    dashboardItems: DashboardItem[];
}

export interface DashboardItem {
    id: string;
    type: string;
    reportId: string;
    reportType: reportType;
    reportTitle?: string;
    map: Map;
    visualization: Visualization;
    eventReport: EventReport;
    eventChart: EventChart;
}

export interface Visualization {
    id: string;
    name: string;
    type: string;
    rows: any;
    columns: any;
    filters: any;
}

export interface Map {
    id: string;
    name: string;
}

export interface EventReport {
    id: string;
    name: string;
}

export interface EventChart {
    id: string;
    name: string;
}

export class Dashboard {
    public readonly id: string;
    public readonly name: string;
    public readonly dashboardItems: DashboardItem[];

    constructor(data: DashboardData) {
        this.id = data.id;
        this.name = data.name;
        this.dashboardItems = data.dashboardItems
            .filter(dashboardItem => {
                return dashboardItem.visualization || dashboardItem.map;
            })
            .map(dashboardItem => {
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
