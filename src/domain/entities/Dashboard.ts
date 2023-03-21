export interface DashboardData {
    id: string;
    name: string;
}

export class Dashboard {
    public readonly id: string;
    public readonly name: string;

    constructor(data: DashboardData) {
        this.id = data.id;
        this.name = data.name;
    }
}
