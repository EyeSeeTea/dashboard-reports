import { processFieldsFilterParams } from "@eyeseetea/d2-api/api/common";
import { Id } from "../../domain/entities/Ref";
import { PluginVisualization } from "../../domain/entities/PluginVisualization";
import { PluginVisualizationRepository } from "../../domain/repositories/PluginVisualizationRepository";
import { D2Api, MetadataPick } from "../../types/d2-api";
import { FutureData } from "../../domain/entities/Future";
import { apiToFuture } from "../../utils/futures";
import { DashboardItem } from "../../domain/entities/Dashboard";
import { generatePeriods, ReportPeriod } from "../../domain/entities/DateMonth";
import { Maybe } from "../../types/utils";

export class PluginVisualizationD2Repository implements PluginVisualizationRepository {
    constructor(private api: D2Api) {}

    get(options: {
        dashboardItem: DashboardItem;
        orgUnitIds: Maybe<Id[]>;
        period: ReportPeriod;
    }): FutureData<PluginVisualization> {
        const params = processFieldsFilterParams({ fields: visualizationFields, filter: {} });
        const model = this.getModelEndpointName(options.dashboardItem);
        const res$ = apiToFuture(
            this.api.get<D2PluginVisualization>(`/${model}/${options.dashboardItem.reportId}`, params)
        );
        return res$
            .map(res => this.applyPeriodFilters(res, options.period))
            .map(res => this.applyOrgUnitFilters(res, options.orgUnitIds))
            .map(res => (isD2Map(res) ? { ...res, type: "MAP" } : res));
    }

    private getModelEndpointName(dashboardItem: DashboardItem): string {
        return dashboardItem.map ? "maps" : dashboardItem.eventVisualization ? "eventVisualizations" : "visualizations";
    }

    private applyPeriodFilters(item: D2PluginVisualization, reportPeriod: ReportPeriod) {
        const itemsPeriod = generatePeriods(reportPeriod);
        if (itemsPeriod.length === 0) {
            return item;
        } else {
            return this.applyFilters(item, dimension => ({
                ...dimension,
                items: dimension.dimension === "pe" ? itemsPeriod : dimension.items,
            }));
        }
    }

    private applyOrgUnitFilters(item: D2PluginVisualization, orgUnitIds: Maybe<Id[]>) {
        if (!orgUnitIds || orgUnitIds.length === 0) {
            return item;
        }
        const newItems = orgUnitIds.map(id => ({ id, dimensionItemType: "ORGANISATION_UNIT" }));
        return this.applyFilters(item, dimension => ({
            ...dimension,
            items: dimension.dimension === "ou" ? newItems : dimension.items,
        }));
    }

    private applyFilters(item: D2PluginVisualization, mapper: (dimension: D2Dimension) => D2Dimension) {
        if (isD2Map(item)) {
            return {
                ...item,
                mapViews: item.mapViews.map((mapView: MapView) => ({
                    ...mapView,
                    ...this.applyFilterToDimensionAttrs(mapView as WithDimensionAttributes, mapper),
                })),
            } as D2MapVisualization;
        } else {
            return {
                ...item,
                ...this.applyFilterToDimensionAttrs(item as WithDimensionAttributes, mapper),
            };
        }
    }

    private applyFilterToDimensionAttrs(obj: WithDimensionAttributes, mapper: (dimension: D2Dimension) => D2Dimension) {
        return {
            rows: obj.rows.map(mapper),
            columns: obj.columns.map(mapper),
            filters: obj.filters.map(mapper),
        };
    }
}

function isD2Map(visualization: D2PluginVisualization): visualization is D2MapVisualization {
    return "mapViews" in visualization;
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
    name?: string;
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
