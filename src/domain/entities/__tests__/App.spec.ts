import { shouldUseAppRuntimePlugin, findAppByVisualization, appVersionIsGreaterOrEqualTo } from "../App";
import { App } from "../App";
import { PluginVisualization } from "../PluginVisualization";

describe("App", () => {
    describe("appVersionIsGreaterOrEqualTo", () => {
        it("should return true when version is greater than minVersion", () => {
            expect(appVersionIsGreaterOrEqualTo("2.0.0", "1.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1.1.0", "1.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1.0.1", "1.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("10.0.0", "9.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("100.10.0", "100.2.0")).toBe(true);
        });

        it("should return true when version is equal to minVersion", () => {
            expect(appVersionIsGreaterOrEqualTo("1.0.0", "1.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("2.5.3", "2.5.3")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("101.0.0", "101.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("101.0.0", "101")).toBe(true);
        });

        it("should return false when version is less than minVersion", () => {
            expect(appVersionIsGreaterOrEqualTo("1.0.0", "2.0.0")).toBe(false);
            expect(appVersionIsGreaterOrEqualTo("1.0.0", "1.1.0")).toBe(false);
            expect(appVersionIsGreaterOrEqualTo("1.0.0", "1.0.1")).toBe(false);
            expect(appVersionIsGreaterOrEqualTo("9.0.0", "10.0.0")).toBe(false);
            expect(appVersionIsGreaterOrEqualTo("101.9.99", "101.10.0")).toBe(false);
        });

        it("should handle versions with different lengths correctly", () => {
            expect(appVersionIsGreaterOrEqualTo("1.0.0.1", "1.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1.0.1.0", "1.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1.0.0.0", "1.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1.0.0", "1.0.0.1")).toBe(false);
            expect(appVersionIsGreaterOrEqualTo("1.0.0", "1.0.1.0")).toBe(false);
            expect(appVersionIsGreaterOrEqualTo("1.0.0", "1.0.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1.1.0", "1.0.0.0")).toBe(true);
        });

        it("should treat missing version parts as 0", () => {
            expect(appVersionIsGreaterOrEqualTo("1", "1.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1.0", "1")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1", "1.0.0")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1.0.0", "1")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("2", "1.9.9")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1.9.9", "2")).toBe(false);
        });

        it("should handle single digit versions", () => {
            expect(appVersionIsGreaterOrEqualTo("2", "1")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1", "1")).toBe(true);
            expect(appVersionIsGreaterOrEqualTo("1", "2")).toBe(false);
        });
    });

    describe("shouldUseAppRuntimePlugin", () => {
        it("should return true for apps meeting minimum version requirements", () => {
            const appsWithNewVersions: App[] = [
                {
                    version: "101.0.0",
                    name: "Maps",
                    key: "maps",
                    baseUrl: "http://example.com/maps",
                    pluginLaunchUrl: "http://example.com/maps/plugin",
                },
                {
                    version: "102.0.0",
                    name: "Line Listing",
                    key: "line-listing",
                    baseUrl: "http://example.com/line-listing",
                    pluginLaunchUrl: "http://example.com/line-listing/plugin",
                },
                {
                    version: "101.0.0",
                    name: "Data Visualizer",
                    key: "data-visualizer",
                    baseUrl: "http://example.com/data-visualizer",
                    pluginLaunchUrl: "http://example.com/data-visualizer/plugin",
                },
            ];
            const mapVisualization: PluginVisualization = { type: "MAP" } as PluginVisualization;
            const lineListVisualization: PluginVisualization = { type: "LINE_LIST" } as PluginVisualization;
            const pivotVisualization: PluginVisualization = { type: "PIVOT_TABLE" } as PluginVisualization;

            expect(shouldUseAppRuntimePlugin(appsWithNewVersions, mapVisualization)).toBe(true);
            expect(shouldUseAppRuntimePlugin(appsWithNewVersions, lineListVisualization)).toBe(true);
            expect(shouldUseAppRuntimePlugin(appsWithNewVersions, pivotVisualization)).toBe(true);
        });

        it("should return false for apps below minimum version requirements", () => {
            const appsWithOldVersions: App[] = [
                {
                    version: "100.0.0", // maps below 101.0.0
                    name: "Maps",
                    key: "maps",
                    baseUrl: "http://example.com/maps",
                    pluginLaunchUrl: "http://example.com/maps/plugin",
                },
                {
                    version: "101.0.0", // line-listing below 102.0.0
                    name: "Line Listing",
                    key: "line-listing",
                    baseUrl: "http://example.com/line-listing",
                    pluginLaunchUrl: "http://example.com/line-listing/plugin",
                },
                {
                    version: "100.0.0", // data-visualizer below 101.0.0
                    name: "Data Visualizer",
                    key: "data-visualizer",
                    baseUrl: "http://example.com/data-visualizer",
                    pluginLaunchUrl: "http://example.com/data-visualizer/plugin",
                },
            ];

            const mapVisualization: PluginVisualization = { type: "MAP" } as PluginVisualization;
            const lineListVisualization: PluginVisualization = { type: "LINE_LIST" } as PluginVisualization;
            const pivotVisualization: PluginVisualization = { type: "PIVOT_TABLE" } as PluginVisualization;

            expect(shouldUseAppRuntimePlugin(appsWithOldVersions, mapVisualization)).toBe(false);
            expect(shouldUseAppRuntimePlugin(appsWithOldVersions, lineListVisualization)).toBe(false);
            expect(shouldUseAppRuntimePlugin(appsWithOldVersions, pivotVisualization)).toBe(false);
        });

        it("should return true when app is not found (default behavior)", () => {
            const emptyApps: App[] = [];
            const mapVisualization: PluginVisualization = { type: "MAP" } as PluginVisualization;

            expect(shouldUseAppRuntimePlugin(emptyApps, mapVisualization)).toBe(true);
        });
    });

    describe("findAppByVisualization", () => {
        const mockApps: App[] = [
            {
                version: "101.0.0",
                name: "Maps",
                key: "maps",
                baseUrl: "http://example.com/maps",
                pluginLaunchUrl: "http://example.com/maps/plugin",
            },
            {
                version: "102.0.0",
                name: "Line Listing",
                key: "line-listing",
                baseUrl: "http://example.com/line-listing",
                pluginLaunchUrl: "http://example.com/line-listing/plugin",
            },
            {
                version: "101.0.0",
                name: "Data Visualizer",
                key: "data-visualizer",
                baseUrl: "http://example.com/data-visualizer",
                pluginLaunchUrl: "http://example.com/data-visualizer/plugin",
            },
        ];

        it("should find the correct app for MAP visualization", () => {
            const mapVisualization: PluginVisualization = { type: "MAP" } as PluginVisualization;
            const result = findAppByVisualization(mockApps, mapVisualization);
            expect(result?.key).toBe("maps");
        });

        it("should find the correct app for LINE_LIST visualization", () => {
            const lineListVisualization: PluginVisualization = { type: "LINE_LIST" } as PluginVisualization;
            const result = findAppByVisualization(mockApps, lineListVisualization);
            expect(result?.key).toBe("line-listing");
        });

        it("should find the correct app for PIVOT_TABLE visualization", () => {
            const pivotVisualization: PluginVisualization = { type: "PIVOT_TABLE" } as PluginVisualization;
            const result = findAppByVisualization(mockApps, pivotVisualization);
            expect(result?.key).toBe("data-visualizer");
        });

        it("should return data-visualizer for other visualization types", () => {
            const unknownVisualization: PluginVisualization = { type: "UNKNOWN_TYPE" as any } as PluginVisualization;
            const result = findAppByVisualization(mockApps, unknownVisualization);
            expect(result?.key).toBe("data-visualizer");
        });

        it("should return undefined when app is not found", () => {
            const emptyApps: App[] = [];
            const mapVisualization: PluginVisualization = { type: "MAP" } as PluginVisualization;
            const result = findAppByVisualization(emptyApps, mapVisualization);
            expect(result).toBeUndefined();
        });
    });
});
