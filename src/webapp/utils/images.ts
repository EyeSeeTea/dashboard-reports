import html2canvas from "html2canvas";
import { DashboardItem } from "../../domain/entities/Dashboard";
import { Maybe } from "../../types/utils";

export interface DocxItem {
    title: string;
    domEl: Element | null;
    base64: string;
    width: number;
    height: number;
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

function getVisualizationElement(dashboardItem: DashboardItem) {
    const itemElement = document.getElementById(dashboardItem.elementId);
    if (!itemElement) {
        return null;
    }
    if (itemElement.classList.contains("iframe-visualization")) {
        return (itemElement.querySelector(`#${dashboardItem.elementId} iframe`) as Maybe<HTMLIFrameElement>)
            ?.contentDocument;
    }
    return itemElement;
}

export function getImagesFromDom(dashboardItems: DashboardItem[]) {
    return dashboardItems
        .map(dashboardItem => {
            const newEl: DocxItem = {
                title: dashboardItem.reportTitle,
                domEl: null,
                base64: "",
                width: 0,
                height: 0,
            };
            const root = getVisualizationElement(dashboardItem);
            if (!root) {
                console.warn("No root element found for ", dashboardItem.elementId);
                return newEl;
            }
            if (dashboardItem.type === "MAP") {
                const canvasEl = root.querySelector("canvas") as HTMLCanvasElement;
                if (canvasEl) {
                    newEl.base64 = canvasEl.toDataURL();
                    newEl.width = canvasEl.width;
                    newEl.height = canvasEl.height;
                }
            } else if (["CHART", "EVENT_CHART", "VISUALIZATION"].includes(dashboardItem.type)) {
                const errorDiv = root.querySelector('[data-test="start-screen-error-container"]');
                newEl.domEl = errorDiv ?? (root.querySelector("svg") as SVGElement);
            } else if (
                dashboardItem.type === "REPORT" ||
                dashboardItem.type === "EVENT_REPORT" ||
                dashboardItem.visualization.type === "PIVOT_TABLE"
            ) {
                newEl.domEl = root.querySelector("table") as HTMLTableElement;
                const tableRects = newEl.domEl?.getClientRects();
                if (tableRects[0]) {
                    newEl.width = tableRects[0].width;
                    newEl.height = tableRects[0].height;
                }
            }
            return newEl;
        })
        .map(dashboardItem => {
            if (dashboardItem.domEl) {
                if (dashboardItem.domEl.tagName === "svg") {
                    return convertSvgToPng(dashboardItem.domEl as HTMLElement).then(canvas =>
                        getCanvasInformation(dashboardItem, canvas)
                    );
                } else {
                    return html2canvas(dashboardItem.domEl as HTMLElement).then(canvas =>
                        getCanvasInformation(dashboardItem, canvas)
                    );
                }
            } else {
                return dashboardItem;
            }
        });
}
