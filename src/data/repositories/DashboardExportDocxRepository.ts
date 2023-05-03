import { TemplateHandler } from "easy-template-x";
import { DashboardImage } from "../../domain/DashboardImage";
import { Settings, TemplateReport } from "../../domain/entities/Settings";
import { DashboardExportRepository } from "../../domain/repositories/DashboardExportRepository";

function calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxHeight = 400) {
    if (!srcWidth || !srcHeight) return { imageWidth: 0, imageHeight: 0 };
    const ratio = Math.min(400 / srcWidth, maxHeight / srcHeight);

    return { imageWidth: srcWidth * ratio, imageHeight: srcHeight * ratio };
}

function base64ToArrayBuffer(base64String: string): ArrayBufferLike {
    const binaryString = atob(base64String);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export class DashboardExportDocxRepository implements DashboardExportRepository {
    saveReport(
        docsItems: DashboardImage[],
        title: string,
        settings: Settings,
        template: TemplateReport
    ): Promise<Blob> {
        return this.generateDataForTemplate(template.template, docsItems, settings, title);
    }

    private generateDataForTemplate(
        templateBase64: string,
        docsItems: DashboardImage[],
        settings: Settings,
        title: string
    ): Promise<Blob> {
        const templateFile = new Blob([base64ToArrayBuffer(templateBase64)]);
        const visualizations = docsItems.map(item => {
            const { imageHeight, imageWidth } = calculateAspectRatioFit(item.width, item.height);
            return {
                title: this.createTextInXml(item.title, settings.fontSize),
                image: {
                    _type: "image",
                    source: base64ToArrayBuffer(item.base64.replace(/^data:image\/png;base64,/, "")),
                    format: "image/png",
                    height: imageHeight,
                    width: imageWidth,
                },
            };
        });

        const templateData = {
            dashboardTitle: this.createTextInXml(title, settings.fontSize),
            visualizations,
        };

        return new TemplateHandler().process(templateFile, templateData);
    }

    private createTextInXml(text: string, fontSize: string) {
        const fontSizeInPt = Number(fontSize) * 2;
        return {
            _type: "rawXml",
            xml: `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr><w:sz w:val='${fontSizeInPt}' /></w:rPr><w:t>${text.trim()}</w:t></w:r></w:p>`.trim(),
            replaceParagraph: true,
        };
    }
}
