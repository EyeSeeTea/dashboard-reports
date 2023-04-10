import _ from "lodash";
import { Dashboard, DashboardItem, ReportItem, ItemRef } from "../../domain/entities/Dashboard";
import { PeriodItem, ReportPeriod, generatePeriods } from "../../domain/entities/DateMonth";
import { FutureData, Future } from "../../domain/entities/Future";
import { DashboardRepository } from "../../domain/repositories/DashboardRepository";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";

const MAX_CONCURRENCY = 5;
const FIELDS_ATTRIBUTES = "id,type,name,rows[*],columns[*],filters[*]";

export class DashboardD2Repository implements DashboardRepository {
    constructor(private api: D2Api) {}

    public get(): FutureData<Dashboard[]> {
        return apiToFuture(
            this.api.metadata.get({
                dashboards: {
                    fields: dashboardFields,
                },
            })
        ).map(d2Response => {
            return d2Response.dashboards.map(d2Dashboard => this.convertToDashboard(d2Dashboard));
        });
    }

    public getReportItems(dashboardItems: DashboardItem[], reportPeriod: ReportPeriod): FutureData<ReportItem[]> {
        const visualizationIds = dashboardItems.filter(
            x => x.reportType === "chartPlugin" || x.reportType === "reportTablePlugin"
        );
        const eventChartIds = dashboardItems.filter(x => x.reportType === "eventChartPlugin");
        const eventReportIds = dashboardItems.filter(x => x.reportType === "eventReportPlugin");

        const requestsVisualizations = this.getVisualizationsRequests(visualizationIds, "visualizations");
        const requestsEventReports = this.getVisualizationsRequests(eventReportIds, "eventReports");
        const requestsEventCharts = this.getVisualizationsRequests(eventChartIds, "eventCharts");

        return Future.parallel([...requestsVisualizations, ...requestsEventCharts, ...requestsEventReports], {
            maxConcurrency: MAX_CONCURRENCY,
        }).map(d2Response => {
            const reportItemsVisualizations = _(d2Response)
                .map(item => {
                    const dashboardItem = dashboardItems.find(x => x.reportId === item.id);
                    return dashboardItem ? this.generateReportItems(item, reportPeriod, dashboardItem) : undefined;
                })
                .compact()
                .value();

            const onlyMaps = dashboardItems.filter(x => x.reportType === "mapPlugin");
            const reportMaps = onlyMaps.map(map => {
                const reportItem: ReportItem = {
                    id: map.reportId,
                    el: map.elementId,
                    reportType: "mapPlugin",
                };
                return reportItem;
            });

            return [...reportItemsVisualizations, ...reportMaps];
        });
    }

    private generateReportItems(item: ReportItem, reportPeriod: ReportPeriod, dashboardItem: DashboardItem) {
        const itemsPeriod = generatePeriods(reportPeriod);

        const reportItem: ReportItem = {
            id: item.id,
            el: dashboardItem.elementId,
            reportType: dashboardItem.reportType,
            ...(itemsPeriod.length > 0 ? { rows: item.rows?.map(row => this.applyPeriod(row, itemsPeriod)) } : {}),
            ...(itemsPeriod.length > 0
                ? { columns: item.columns?.map(column => this.applyPeriod(column, itemsPeriod)) }
                : {}),
            ...(itemsPeriod.length > 0
                ? { filters: item.filters?.map(filter => this.applyPeriod(filter, itemsPeriod)) }
                : {}),
        };

        return reportItem;
    }

    private getVisualizationsRequests(dashboards: DashboardItem[], url: eventUrlType) {
        return dashboards.map(visualization => {
            return apiToFuture(
                this.api.get<ReportItem>(`/${url}/${visualization.reportId}`, {
                    fields: FIELDS_ATTRIBUTES,
                })
            );
        });
    }

    private convertToDashboard(d2Dashboard: D2Dashboard) {
        return new Dashboard({
            id: d2Dashboard.id,
            name: d2Dashboard.name,
            dashboardItems: d2Dashboard.dashboardItems,
        });
    }

    private applyPeriod(row: ItemRef, itemsPeriod: PeriodItem[]) {
        if (row.dimension === "pe") {
            row.items = itemsPeriod;
        }
        return row;
    }
}

const dashboardFields = {
    id: true,
    name: true,
    dashboardItems: {
        id: true,
        name: true,
        visualization: {
            id: true,
            name: true,
            type: true,
            filters: true,
            rows: true,
            columns: true,
        },
        reportType: true,
        map: {
            id: true,
            name: true,
        },
        eventReport: {
            id: true,
            name: true,
        },
        eventChart: {
            id: true,
            name: true,
        },
        eventType: {
            id: true,
            name: true,
        },
        type: true,
    },
} as const;

type D2Dashboard = MetadataPick<{ dashboards: { fields: typeof dashboardFields } }>["dashboards"][number];
type eventUrlType = "visualizations" | "eventReports" | "eventCharts";
