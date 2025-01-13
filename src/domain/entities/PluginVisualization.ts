export type PluginVisualization =
    | {
          type: "LINE_LIST" | "PIVOT_TABLE" | (string & {});
      }
    | PluginMapVisualization;

export type PluginMapVisualization = {
    type: "MAP";
    mapViews: object;
};
