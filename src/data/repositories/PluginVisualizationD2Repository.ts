import { processFieldsFilterParams } from "@eyeseetea/d2-api/api/common";
import { Id } from "../../domain/entities/Ref";
import { PluginMapVisualization, PluginVisualization } from "../../domain/entities/PluginVisualization";
import { PluginVisualizationRepository } from "../../domain/repositories/PluginVisualizationRepository";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { FutureData } from "../../domain/entities/Future";
import { apiToFuture } from "../../utils/futures";
import { DashboardItem } from "../../domain/entities/Dashboard";
import { generatePeriods, PeriodItem, ReportPeriod } from "../../domain/entities/DateMonth";

export class PluginVisualizationD2Repository implements PluginVisualizationRepository {
    constructor(private api: D2Api) {}

    get(options: {
        dashboardItem: DashboardItem;
        orgUnitId?: Id;
        period: ReportPeriod;
    }): FutureData<PluginVisualization> {
        const params = processFieldsFilterParams({ fields: visualizationFields, filter: {} });

        const model = options.dashboardItem.map
            ? "maps"
            : options.dashboardItem.eventVisualization
            ? "eventVisualizations"
            : "visualizations";

        const res$ = apiToFuture(
            this.api.get<D2PluginVisualization>(`/${model}/${options.dashboardItem.reportId}`, params)
        );
        return res$
            .map(res => this.applyPeriodFilters(res, options.period))
            .map(res => (options.orgUnitId ? this.applyOrgUnitFilters(res, options.orgUnitId) : res))
            .map(res => ("mapViews" in res ? ({ ...res, type: "MAP" } as PluginMapVisualization) : res));
    }

    private applyPeriodFilters(item: D2PluginVisualization, reportPeriod: ReportPeriod) {
        const itemsPeriod = generatePeriods(reportPeriod);
        if (itemsPeriod.length === 0) {
            return item;
        }
        if ("mapViews" in item) {
            return {
                ...item,
                mapViews: item.mapViews.map((mapView: any) => ({
                    ...mapView,
                    ...this.applyPeriodToDimensionAttrs(mapView as WithDimensionAttributes, itemsPeriod),
                })),
            };
        }
        return {
            ...item,
            ...this.applyPeriodToDimensionAttrs(item as WithDimensionAttributes, itemsPeriod),
        };
    }

    private applyOrgUnitFilters(item: D2PluginVisualization, _orgUnit: string) {
        // TODO: filter by org unit
        return item;
    }

    private applyPeriodToDimensionAttrs(obj: WithDimensionAttributes, period: PeriodItem[]) {
        return {
            rows: this.applyPeriodToDimensions(obj.rows, period),
            columns: this.applyPeriodToDimensions(obj.columns, period),
            filters: this.applyPeriodToDimensions(obj.filters, period),
        };
    }

    private applyPeriodToDimensions(dimensions: D2Dimension[], period: PeriodItem[]) {
        return dimensions.map(dimension => ({
            ...dimension,
            items: dimension.dimension === "pe" ? period : dimension.items,
        }));
    }
}

const dimensionQuery = {
    dimension: true,
    legendSet: {
        id: true,
    },
    filter: true,
    programStage: true,
    items: {
        dimensionItem: { $fn: { name: "rename", to: "id" } },
        displayName: { $fn: { name: "rename", to: "name" } },
        dimensionItemType: true,
    },
} as const;

// TODO: review "$all: true" and use only required fields
const visualizationFields = {
    $all: true,
    columns: dimensionQuery,
    rows: dimensionQuery,
    filters: dimensionQuery,
    mapViews: {
        $all: true,
        columns: dimensionQuery,
        rows: dimensionQuery,
        filters: dimensionQuery,
    },
} as const;

export type D2PluginVisualization = D2EventVisualization | D2Visualization | D2MapVisualization;

// We don't have eventVisualization in d2-api, use similar eventReports
export type D2EventVisualization = MetadataPick<{
    eventReports: typeof visualizationFields;
}>["eventReports"][number] & { type: string };

export type D2Visualization = MetadataPick<{
    visualizations: typeof visualizationFields;
}>["visualizations"][number] & {};

export type D2MapVisualization = MetadataPick<{
    maps: typeof visualizationFields;
}>["maps"][number] & {
    mapViews: MapView[];
};

type DimensionType = "ou" | "pe" | (string & {});

interface D2DimensionItem {
    dimensionItemType?: string;
    id: string;
    name: string;
}

interface D2Dimension {
    dimension: DimensionType;
    items: D2DimensionItem[];
}

interface WithDimensionAttributes {
    rows: D2Dimension[];
    columns: D2Dimension[];
    filters: D2Dimension[];
}

interface MapView extends WithDimensionAttributes {}
