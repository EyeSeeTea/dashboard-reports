import React, { useState } from "react";
// @ts-ignore
import postRobot from "@krakenjs/post-robot";
import { LinearProgress } from "material-ui";
import { PluginVisualization } from "../../../domain/entities/PluginVisualization";
import { useVisualizationIframeUrl } from "../../hooks/useDhis2Url";
import { DashboardItem } from "../../../domain/entities/Dashboard";

export interface VisualizationContentProps {
    dashboardItem: DashboardItem;
    visualization: PluginVisualization;
}

export const VisualizationContents: React.FunctionComponent<VisualizationContentProps> = React.memo(props => {
    const { dashboardItem, visualization } = props;
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const dataVisualizerPluginUrl = useVisualizationIframeUrl(visualization);
    const isPluginReady = useVisualizationPlugin(iframeRef, visualization);
    return (
        <div style={styles.container} id={dashboardItem.elementId} className="iframe-visualization">
            <>
                {!isPluginReady && <LinearProgress />}
                <iframe title="Visualization" src={dataVisualizerPluginUrl} ref={iframeRef} style={styles.iframe} />
            </>
        </div>
    );
});

const styles = {
    iframe: { border: "none", overflow: "hidden", width: "100%", height: "100%" },
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "right",
        height: "100%",
    },
};

function useVisualizationPlugin(iframeRef: React.RefObject<HTMLIFrameElement>, visualization: object) {
    React.useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || !visualization) return;

        const pluginProps = {
            isVisualizationLoaded: false,
            displayProperty: "shortName",
            visualization: visualization,
        };

        postRobot
            .send(iframe.contentWindow, "newProps", pluginProps, { timeout: 15000 })
            .catch((err: any) => console.error(err));

        const listener = postRobot.on("getProps", { window: iframeRef.current.contentWindow }, () => pluginProps);

        return () => listener.cancel();
    }, [iframeRef, visualization]);

    const [isPluginReady, setPluginReady] = useState(false);

    React.useEffect(() => {
        if (!iframeRef?.current) return;

        const listener = postRobot.on(
            "installationStatus",
            { window: iframeRef.current.contentWindow },
            (ev: { data: { installationStatus: "READY" | "INSTALLING" | "UNKNOWN" } }) => {
                if (ev.data.installationStatus === "READY") {
                    setPluginReady(true);
                }
            }
        );

        return () => listener.cancel();
    }, [iframeRef, setPluginReady]);

    return isPluginReady;
}
