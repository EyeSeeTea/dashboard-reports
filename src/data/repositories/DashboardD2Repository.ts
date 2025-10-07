import { Dashboard, DashboardItem, LegacyReportType } from "../../domain/entities/Dashboard";
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
            dashboardItems: d2Dashboard.dashboardItems
                .map(DashboardItemMapper.transformLegacyDashboardItem)
                .filter(DashboardItemMapper.hasVisualizationData)
                .map(DashboardItemMapper.map),
        });
    }
}

class DashboardItemMapper {
    /**
     * Convert legacy eventChart and eventReport fields to the new eventVisualization field
     */
    static transformLegacyDashboardItem(d2DashboardItem: D2DashboardItemWithLegacy): D2DashboardItem {
        const { eventChart, eventReport, ...otherProps } = d2DashboardItem;
        const legacyVisualization = eventChart || eventReport;
        if (legacyVisualization) {
            return {
                ...otherProps,
                eventVisualization: { ...legacyVisualization },
            };
        }
        return d2DashboardItem;
    }

    static hasVisualizationData(dashboardItem: D2DashboardItem): boolean {
        return Boolean(dashboardItem.visualization || dashboardItem.map || dashboardItem.eventVisualization);
    }

    static map(dashboardItem: D2DashboardItem): DashboardItem {
        return {
            ...dashboardItem,
            elementId: dashboardItem.id,
            width: dashboardItem.width,
            height: dashboardItem.height,
            reportTitle: DashboardItemMapper.getItemTitle(dashboardItem),
            reportId: DashboardItemMapper.getItemReportId(dashboardItem),
            useLegacy: DashboardItemMapper.getItemShouldUseLegacy(dashboardItem),
            legacyReportType: DashboardItemMapper.getItemLegacyReportType(dashboardItem),
        };
    }

    /**
     * @returns true when Legacy Plugin is preferred.
     */
    private static getItemShouldUseLegacy(dashboardItem: D2DashboardItem): boolean {
        return (
            // EVENT_CHART is not working with the new dhis-data-visualizer iframe
            dashboardItem.type === "EVENT_CHART" ||
            // EVENT_REPORT only works with the line-listing iframe
            (dashboardItem.type === "EVENT_REPORT" && dashboardItem.eventVisualization?.type !== "LINE_LIST")
        );
    }

    private static getItemData(dashboardItem: D2DashboardItem) {
        const data = dashboardItem.map ?? dashboardItem.eventVisualization ?? dashboardItem.visualization;
        if (!data) {
            throw new Error(
                `Dashboard item (id: ${dashboardItem.id}, type: ${dashboardItem.type}) is missing required property - one of: map, eventVisualization, visualization`
            );
        }
        return data;
    }

    private static getItemTitle(dashboardItem: D2DashboardItem): string {
        return DashboardItemMapper.getItemData(dashboardItem).name.trim();
    }

    private static getItemReportId(dashboardItem: D2DashboardItem): string {
        return DashboardItemMapper.getItemData(dashboardItem).id;
    }

    private static getItemLegacyReportType(dashboardItem: D2DashboardItem): LegacyReportType | null {
        if (dashboardItem.type === "EVENT_CHART") {
            return "eventChartPlugin";
        } else if (dashboardItem.type === "EVENT_REPORT") {
            return "eventReportPlugin";
        }
        return null;
    }
}

const dashboardItemLegacyFields = {
    // eventChart and eventReport are legacy fields available in <=2.40
    // removed in 2.41+ and included in eventVisualization instead
    eventChart: {
        id: true,
        name: true,
        type: true,
    },
    eventReport: {
        id: true,
        name: true,
        type: true,
    },
} as const;

type D2DashboardItemLegacyFields = {
    eventChart?: { id: string; name: string; type: string };
    eventReport?: { id: string; name: string; type: string };
};

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
            type: true,
        },
        eventType: {
            id: true,
            name: true,
        },
        type: true,
        ...dashboardItemLegacyFields,
    },
} as const;

type D2Dashboard = MetadataPick<{ dashboards: { fields: typeof dashboardFields } }>["dashboards"][number];

type D2DashboardItem = Omit<
    MetadataPick<{
        dashboardItems: { fields: typeof dashboardFields["dashboardItems"] };
    }>["dashboardItems"][number] & {
        eventVisualization?: { id: string; name: string; type: string };
    },
    keyof typeof dashboardItemLegacyFields
>;

type D2DashboardItemWithLegacy = D2DashboardItem & D2DashboardItemLegacyFields;
