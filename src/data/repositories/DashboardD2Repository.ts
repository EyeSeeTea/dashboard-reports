import { Dashboard, DashboardItem, Visualization } from "../../domain/entities/Dashboard";
import { FutureData, Future } from "../../domain/entities/Future";
import { DashboardRepository } from "../../domain/repositories/DashboardRepository";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { apiToFuture } from "../../utils/futures";

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

    public getVisualizations(dashboardItems: DashboardItem[]): FutureData<any> {
        const visualizationIds = dashboardItems.filter(
            x => x.reportType === "chartPlugin" || x.reportType === "reportTablePlugin"
        );

        // const mapIds = dashboardItems.filter(x => x.reportType === "mapPlugin");

        const requestsVisualizations = visualizationIds.map(visualization => {
            return apiToFuture(
                this.api.get<D2Dashboard>(`/visualizations/${visualization.reportId}`, {
                    fields: "id,type,name,rows[id,items],columns[id,items]",
                })
            );
        });

        // const requestsMaps = mapIds.map(map => {
        //     return apiToFuture(
        //         this.api.get<D2Dashboard>(`/maps/${map.reportId}`, {
        //             fields: "id,type,mapViews[id,rows[id,items],columns[id,items]]",
        //         })
        //     );
        // });

        return Future.parallel(requestsVisualizations).map(console.log);
    }

    private convertToDashboard(d2Dashboard: D2Dashboard) {
        return new Dashboard({
            id: d2Dashboard.id,
            name: d2Dashboard.name,
            dashboardItems: d2Dashboard.dashboardItems,
        });
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
