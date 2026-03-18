import React, { useState } from "react";
// @ts-ignore
import postRobot from "@krakenjs/post-robot";
import { PluginVisualization } from "../../../domain/entities/PluginVisualization";
import { useVisualizationIframeUrl } from "../../hooks/useDhis2Url";
import { DashboardItem } from "../../../domain/entities/Dashboard";
import { Plugin } from "@dhis2/app-runtime/experimental";
import { useAppContext } from "../../contexts/app-context";
import { shouldUseAppRuntimePlugin } from "../../../domain/entities/App";

export interface VisualizationContentProps {
    dashboardItem: DashboardItem;
    visualization: PluginVisualization;
}

export const VisualizationContents: React.FunctionComponent<VisualizationContentProps> = React.memo(props => {
    const { dashboardItem, visualization } = props;
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const dataVisualizerPluginUrl = useVisualizationIframeUrl(visualization);
    const pluginProps = useVisualizationPluginProps(visualization);
    useIframePlugin(iframeRef, pluginProps);
    const shouldUseAppRuntime = useShouldUseAppRuntime(visualization);
    return (
        <div style={styles.container} id={dashboardItem.elementId} className="iframe-visualization">
            {shouldUseAppRuntime ? (
                <Plugin pluginSource={dataVisualizerPluginUrl} width="100%" height="100%" {...pluginProps} />
            ) : (
                <iframe title="Visualization" src={dataVisualizerPluginUrl} ref={iframeRef} style={styles.iframe} />
            )}
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

function useVisualizationPluginProps(visualization: object) {
    const props = React.useMemo(() => {
        return {
            isVisualizationLoaded: true,
            forDashboard: true,
            displayProperty: "name",
            visualization: visualization,
        };
    }, [visualization]);
    return props;
}

function useShouldUseAppRuntime(visualization: PluginVisualization): boolean {
    const { apps } = useAppContext();
    const result = React.useMemo(() => {
        return shouldUseAppRuntimePlugin(apps, visualization);
    }, [apps, visualization]);
    return result;
}

function useIframePlugin(iframeRef: React.RefObject<HTMLIFrameElement>, pluginProps: object) {
    React.useEffect(() => {
        const iframe = iframeRef.current;
        if (!iframe || !pluginProps) return;

        postRobot
            .send(iframe.contentWindow, "newProps", pluginProps, { timeout: 15000 })
            .catch((err: any) => console.error(err));

        const listener = postRobot.on("getProps", { window: iframeRef.current.contentWindow }, () => pluginProps);

        return () => listener.cancel();
    }, [iframeRef, pluginProps]);

    const [isPluginReady, setPluginReady] = useState(false);

    React.useEffect(() => {
        if (!iframeRef?.current) return;

        const listener = postRobot.on(
            "installationStatus",
            { window: iframeRef.current.contentWindow },
            (ev: { data: { installationStatus: "READY" | "INSTALLING" | "UNKNOWN" } }) => {
                // TODO: ev.data.installationStatus sometimes is null, is this a bug in the plugins?
                if (ev.data.installationStatus === "READY") {
                    setPluginReady(true);
                }
            }
        );

        return () => listener.cancel();
    }, [iframeRef, setPluginReady]);

    return isPluginReady;
}
