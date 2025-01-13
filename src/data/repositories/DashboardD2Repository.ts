import { Dashboard } from "../../domain/entities/Dashboard";
import { FutureData } from "../../domain/entities/Future";
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
            filters: true,
            rows: true,
            columns: true,
        },
        width: true,
        height: true,
        reportType: true,
        map: {
            id: true,
            name: true,
        },
        eventVisualization: {
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
