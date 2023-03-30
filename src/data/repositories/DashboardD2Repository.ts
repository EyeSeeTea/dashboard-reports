import { Dashboard, DashboardItem, D2MapView, ReportItem } from "../../domain/entities/Dashboard";
import { DateMonth } from "../../domain/entities/DateMonth";
import { FutureData, Future } from "../../domain/entities/Future";
import { DashboardRepository } from "../../domain/repositories/DashboardRepository";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";

const MAX_CONCURRENCY = 5;

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

    public getVisualizations(dashboardItems: DashboardItem[], periodValue: DateMonth): FutureData<ReportItem[]> {
        const visualizationIds = dashboardItems.filter(
            x => x.reportType === "chartPlugin" || x.reportType === "reportTablePlugin"
        );

        const eventChartIds = dashboardItems.filter(x => x.reportType === "eventChartPlugin");

        const eventReportIds = dashboardItems.filter(x => x.reportType === "eventReportPlugin");

        const requestsVisualizations = visualizationIds.map(visualization => {
            return apiToFuture(
                this.api.get<ReportItem>(`/visualizations/${visualization.reportId}`, {
                    fields: "id,type,name,rows[*],columns[*],filters[*]",
                })
            );
        });

        const requestsEventReports = eventReportIds.map(visualization => {
            return apiToFuture(
                this.api.get<ReportItem>(`/eventReports/${visualization.reportId}`, {
                    fields: "id,type,name,rows[*],columns[*],filters[*]",
                })
            );
        });

        const requestsEventCharts = eventChartIds.map(visualization => {
            return apiToFuture(
                this.api.get<ReportItem>(`/eventCharts/${visualization.reportId}`, {
                    fields: "id,type,name,rows[*],columns[*],filters[*]",
                })
            );
        });

        return Future.parallel([...requestsVisualizations, ...requestsEventCharts, ...requestsEventReports], {
            maxConcurrency: MAX_CONCURRENCY,
        }).map(d2Response => {
            const customPeriod = periodValue.lastMonths || periodValue.period.length > 0;
            const itemsPeriod = customPeriod ? this.generatePeriods(periodValue) : [];
            return d2Response.map(item => {
                const periodId = "pe";
                const dashboardInfo = dashboardItems.find(x => x.reportId === item.id) as DashboardItem;
                const reportItem: ReportItem = {
                    id: item.id,
                    el: dashboardInfo.elementId,
                    reportType: "reportTablePlugin",
                };

                if (dashboardInfo) {
                    reportItem.reportType = dashboardInfo.reportType;
                }

                if (itemsPeriod.length > 0) {
                    if (item.rows) {
                        item.rows.forEach(row => {
                            if (row.id === periodId) {
                                row.items = itemsPeriod;
                                reportItem.rows = item.rows;
                            }
                        });
                    }

                    if (item.filters) {
                        item.filters.forEach(filter => {
                            if (filter.id === periodId) {
                                filter.items = itemsPeriod;
                                reportItem.filters = item.filters;
                            }
                        });
                    }

                    if (item.columns) {
                        item.columns.forEach(column => {
                            if (column.id === periodId) {
                                column.items = itemsPeriod;
                                reportItem.columns = item.columns;
                            }
                        });
                    }
                }

                return reportItem;
            });
        });
    }

    public getMaps(dashboardItems: DashboardItem[], periodValue: DateMonth): FutureData<ReportItem[]> {
        const mapIds = dashboardItems.filter(x => x.reportType === "mapPlugin");

        const requestsMaps = mapIds.map(map => {
            return apiToFuture(
                this.api.get<D2Map>(`/maps/${map.reportId}`, {
                    fields: "id,mapViews[filterDimensions[*],rows[*],columns[*],filters[*]]",
                })
            );
        });

        return Future.parallel(requestsMaps, {
            maxConcurrency: MAX_CONCURRENCY,
        }).map(d2Response => {
            return d2Response.map((map: D2Map) => {
                const dashboardInfo = dashboardItems.find(x => x.reportId === map.id) as DashboardItem;
                const reportItem: ReportItem = {
                    id: map.id,
                    el: dashboardInfo.elementId,
                    reportType: "mapPlugin",
                    mapViews: map.mapViews,
                };

                const customPeriod = periodValue.lastMonths || periodValue.period.length > 0;
                const itemsPeriod = customPeriod ? this.generatePeriods(periodValue) : [];
                if (itemsPeriod.length > 0) {
                    map.mapViews.forEach(mapView => {
                        mapView.filters.forEach(filter => {
                            if (filter.dimension === "pe") {
                                filter.items = itemsPeriod;
                            }
                        });
                    });
                }

                return reportItem;
            });
        });
    }

    private convertToDashboard(d2Dashboard: D2Dashboard) {
        return new Dashboard({
            id: d2Dashboard.id,
            name: d2Dashboard.name,
            dashboardItems: d2Dashboard.dashboardItems,
        });
    }

    private generatePeriods(dateMonth: DateMonth) {
        const lastFourMonths = dateMonth.lastMonths;
        const items = [];
        if (lastFourMonths) {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            const currentMonthTwoDigits = ("0" + currentMonth).slice(-2);
            items.push({ id: `${currentYear}${currentMonthTwoDigits}` });
            for (let index = 0; index < 3; index++) {
                currentDate.setDate(1);
                currentDate.setMonth(currentDate.getMonth() - 1);
                const prevMonthNumber = currentDate.getMonth() + 1;
                const twoDigitsPrevMonth = ("0" + prevMonthNumber).slice(-2);
                items.push({ id: `${currentDate.getFullYear()}${twoDigitsPrevMonth}` });
            }
        } else {
            items.push({ id: dateMonth.period.replace("-", "") });
        }
        return items;
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
            filterDimensions: true,
            rowDimensions: true,
            columnDimensions: true,
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

type D2Map = {
    id: string;
    mapViews: D2MapView[];
};
