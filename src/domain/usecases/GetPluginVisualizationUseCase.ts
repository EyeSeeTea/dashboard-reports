import { Maybe } from "../../types/utils";
import { DashboardItem } from "../entities/Dashboard";
import { ReportPeriod } from "../entities/DateMonth";
import { FutureData } from "../entities/Future";
import { PluginVisualization } from "../entities/PluginVisualization";
import { Id } from "../entities/Ref";
import { PluginVisualizationRepository } from "../repositories/PluginVisualizationRepository";

export class GetPluginVisualizationUseCase {
    constructor(private visualizationRepository: PluginVisualizationRepository) {}

    execute(options: {
        dashboardItem: DashboardItem;
        orgUnitId: Maybe<Id>;
        period: ReportPeriod;
    }): FutureData<PluginVisualization> {
        return this.visualizationRepository.get(options);
    }
}
