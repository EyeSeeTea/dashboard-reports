import html2canvas from "html2canvas";
import { DashboardItem, isLineListing } from "../../domain/entities/Dashboard";

export interface DocxItem {
    title: string;
    domEl: Element | null;
    iframeEl: HTMLIFrameElement | null;
    base64: string;
    width: number;
    height: number;
    isVirtualized?: boolean; // if the item is virtualized, we need to trigger rendering full contents before export
    excludeElements?: HTMLElement[]; // elements inside the container to be hidden before export
}

function convertSvgToPng(input: HTMLElement): Promise<HTMLCanvasElement> {
    const promise = new Promise<HTMLCanvasElement>((resolve, reject) => {
        const svgData = new XMLSerializer().serializeToString(input);
        const svgDataBase64 = btoa(unescape(encodeURIComponent(svgData)));
        const svgDataUrl = `data:image/svg+xml;charset=utf-8;base64,${svgDataBase64}`;

        const image = new Image();

        image.addEventListener("load", () => {
            const width = input.getAttribute("width") || "0";
            const height = input.getAttribute("height") || "0";
            const canvas = document.createElement("canvas");

            canvas.setAttribute("width", width);
            canvas.setAttribute("height", height);

            const context = canvas.getContext("2d") as CanvasRenderingContext2D;
            context.drawImage(image, 0, 0, Number(width), Number(height));

            resolve(canvas);
        });

        image.addEventListener("error", reject);

        image.src = svgDataUrl;
    });

    return promise;
}

function getCanvasInformation(dashboardItem: DocxItem, canvas: HTMLCanvasElement) {
    return {
        ...dashboardItem,
        base64: canvas.toDataURL(),
        width: dashboardItem.width ? dashboardItem.width : canvas.width,
        height: dashboardItem.height ? dashboardItem.height : canvas.height,
    };
}

function getVisualizationElement(dashboardItem: DashboardItem): HTMLElement | HTMLIFrameElement | null {
    const itemElement = document.getElementById(dashboardItem.elementId);
    if (!itemElement) {
        return null;
    }
    if (itemElement.classList.contains("iframe-visualization")) {
        return itemElement.querySelector<HTMLIFrameElement>(`#${dashboardItem.elementId} iframe`);
    }
    return itemElement;
}

export function getImagesFromDom(dashboardItems: DashboardItem[]) {
    return dashboardItems
        .map(dashboardItem => {
            const newEl: DocxItem = {
                title: dashboardItem.reportTitle,
                domEl: null,
                iframeEl: null,
                base64: "",
                width: 0,
                height: 0,
                isVirtualized: dashboardItem.visualization?.type === "PIVOT_TABLE",
            };
            const element = getVisualizationElement(dashboardItem);
            newEl.iframeEl = element?.tagName === "IFRAME" ? (element as HTMLIFrameElement) : null;
            const root = element?.tagName === "IFRAME" ? (element as HTMLIFrameElement).contentDocument : element;
            if (!root) {
                console.warn("No root element found for ", dashboardItem.elementId);
                return newEl;
            }
            if (dashboardItem.type === "MAP") {
                const canvasEl = root.querySelector("canvas") as HTMLCanvasElement | null;
                if (canvasEl) {
                    newEl.base64 = canvasEl.toDataURL();
                    newEl.width = canvasEl.width;
                    newEl.height = canvasEl.height;
                }
            } else if (
                dashboardItem.type === "REPORT" ||
                dashboardItem.type === "EVENT_REPORT" ||
                isLineListing(dashboardItem) ||
                dashboardItem.visualization?.type === "PIVOT_TABLE"
            ) {
                newEl.domEl = root.querySelector("table") as HTMLTableElement | null;
                const tableRects = newEl.domEl?.getClientRects();
                if (tableRects && tableRects[0]) {
                    newEl.width = tableRects[0].width;
                    newEl.height = tableRects[0].height;
                }
                if (isLineListing(dashboardItem)) {
                    newEl.excludeElements = [newEl.domEl?.querySelector("tfoot") as HTMLElement].filter(
                        Boolean
                    ) as HTMLElement[];
                }
            } else if (["CHART", "EVENT_CHART", "VISUALIZATION"].includes(dashboardItem.type)) {
                const errorDiv = root.querySelector('[data-test="start-screen-error-container"]');
                newEl.domEl = errorDiv ?? (root.querySelector("svg") as SVGElement);
            }
            return newEl;
        })
        .map(docxItem => {
            if (docxItem.domEl) {
                if (docxItem.domEl.tagName === "svg") {
                    return convertSvgToPng(docxItem.domEl as HTMLElement).then(canvas =>
                        getCanvasInformation(docxItem, canvas)
                    );
                } else {
                    return withVirtualizationSupport(docxItem, async () => {
                        return htmlToCanvas(docxItem).then(canvas => getCanvasInformation(docxItem, canvas));
                    });
                }
            } else {
                return docxItem;
            }
        });
}

/**
 * workaround for virtualized items
 * make containers large enough to trigger rendering of all contents,
 * call the capture image function, and then restore the styles
 */
function withVirtualizationSupport(
    docxItem: DocxItem,
    captureCallback: (htmlElement: HTMLElement) => Promise<DocxItem>
): Promise<DocxItem> {
    if (!docxItem.isVirtualized || !docxItem.iframeEl) {
        return captureCallback(docxItem.domEl as HTMLElement);
    }
    const prevStyles: { width: string | null; height: string | null } = {
        height: null,
        width: null,
    };
    function getContainers(iframe: HTMLIFrameElement) {
        const appShellApp = iframe.contentDocument?.querySelector<HTMLDivElement>(".app-shell-app");
        const appShellChild = appShellApp?.firstChild as HTMLElement | null;
        const visualizationContainer = appShellChild?.querySelector(
            '[data-test="visualization-container"]'
        ) as HTMLElement | null;
        return {
            appShellChild,
            visualizationContainer,
        };
    }
    function getFullSize(visualizationContainer: HTMLElement) {
        const visualizationBounding = (
            visualizationContainer.firstChild as HTMLElement | null
        )?.getBoundingClientRect();
        return {
            width: visualizationBounding?.width ? `${visualizationBounding?.width}px` : "10000px",
            height: visualizationBounding?.height ? `${visualizationBounding?.height}px` : "10000px",
        };
    }
    // changing the iframe styles directly makes html2canvas fail, change elements inside the document instead
    const setStyles = (iframe: HTMLIFrameElement) => {
        const { appShellChild, visualizationContainer } = getContainers(iframe);
        if (!appShellChild || !visualizationContainer) {
            console.warn("All containers couldn't be found for", docxItem.title);
            return;
        }
        prevStyles.width = visualizationContainer.style.width;
        prevStyles.height = appShellChild.style.height;
        const { height: newHeight, width: newWidth } = getFullSize(visualizationContainer);
        appShellChild.style.setProperty("height", newHeight);
        visualizationContainer.style.setProperty("width", newWidth);
    };
    function restoreStyles(iframe: HTMLIFrameElement) {
        const { appShellChild, visualizationContainer } = getContainers(iframe);
        if (!appShellChild || !visualizationContainer) {
            console.warn("All containers couldn't be found for", docxItem.title);
            return;
        }
        appShellChild.style.setProperty("height", prevStyles.height);
        visualizationContainer.style.setProperty("width", prevStyles.width);
    }

    if (!docxItem.iframeEl) {
        console.warn("No iframe element found for", docxItem.title);
        return Promise.resolve(docxItem);
    }
    setStyles(docxItem.iframeEl);
    // wait for the styles to be applied and contents rendered - This will depend on the browser
    // TODO: to improve reliability use an alternative approach such as MutationObserver
    return wait(500)
        .then(() => {
            return captureCallback(docxItem.domEl as HTMLElement);
        })
        .finally(() => {
            if (!docxItem.iframeEl) {
                console.warn("No iframe element found for", docxItem.title);
                return docxItem;
            }
            restoreStyles(docxItem.iframeEl);
            return docxItem;
        });
}

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function htmlToCanvas(docxItem: DocxItem): Promise<HTMLCanvasElement> {
    if (docxItem.excludeElements) {
        docxItem.excludeElements.forEach(el => {
            el.style.setProperty("display", "none");
        });
    }
    const canvas = await html2canvas(docxItem.domEl as HTMLElement);
    if (docxItem.excludeElements) {
        docxItem.excludeElements.forEach(el => {
            el.style.removeProperty("display");
        });
    }
    return canvas;
}
