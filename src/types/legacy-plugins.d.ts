import { LegacyReportType } from "../domain/entities/Dashboard";
import { PluginVisualization } from "../domain/entities/PluginVisualization";
import { Maybe } from "./utils";

declare global {
    interface PluginLoadOptions extends PluginVisualization {
        /** DOM element id */
        el: string;
    }
    interface PluginData {
        url: string;
        username: string;
        password: string;
        loadingIndicator: boolean;
        dashboard: boolean;
        load(reports: PluginLoadOptions[]): void;
    }
    interface Window extends Record<LegacyReportType, Maybe<PluginData>> {}
}
