import { Dashboard } from "../../domain/entities/Dashboard";
import { DashboardRepository } from "../../domain/repositories/DashboardRepository";
import { D2Api } from "../../types/d2-api";

export class DashboardD2Repository implements DashboardRepository {
    constructor(private api: D2Api) {}

    public async get(): Promise<Dashboard[]> {
        const method = this.api.models.dashboards.get({
            fields: {
                id: true,
                name: true,
            },
            paging: false,
        });

        const data = await method.getData();
        const dashboards = data.objects.map(d2Dashboard => {
            return this.converToDashboard(d2Dashboard);
        });
        return dashboards;
    }

    private converToDashboard(d2User: any) {
        return new Dashboard({
            id: d2User.id,
            name: d2User.name,
        });
    }
}
