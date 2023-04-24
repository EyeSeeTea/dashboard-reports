import * as docx from "docx";
import { DashboardImage } from "../../domain/DashboardImage";
import { Settings } from "../../domain/entities/Settings";
import { DashboardExportRepository } from "../../domain/repositories/DashboardExportRepository";

const FONT_NAME = "Arial";
export class DashboardExportDocxRepository implements DashboardExportRepository {
    saveRawReport(docsItems: DashboardImage[], title: string, settings: Settings): Promise<Blob> {
        const maxWidth = 600;
        const images = docsItems.map(docItem => {
            const imageWidth = docItem.width;
            const imageHeight = docItem.height;
            return this.createParagraph({
                children: [
                    this.createText({
                        size: `${Number(settings.fontSize)}pt`,
                        break: 4,
                        text: docItem.title,
                    }),
                    this.createImage({
                        base64: docItem.base64,
                        height: imageHeight,
                        maxHeight: maxWidth,
                        maxWidth: imageHeight,
                        width: imageWidth,
                    }),
                ],
            });
        });

        const doc = new docx.Document({
            sections: [
                {
                    children: [
                        this.createParagraph({
                            alignment: docx.AlignmentType.CENTER,
                            children: [
                                this.createText({
                                    size: `${Number(settings.fontSize)}pt`,
                                    text: title,
                                }),
                                ...images,
                            ],
                        }),
                    ],
                },
            ],
        });

        return docx.Packer.toBlob(doc);
    }

    saveComplexReport(docsItems: DashboardImage[], settings: Settings): Promise<Blob> {
        const maxWidth = 200;
        const maxHeight = 200;

        const tableRowHeader = new docx.TableRow({
            tableHeader: true,
            children: [
                this.createTableCell({
                    fontSize: settings.fontSize,
                    fontName: FONT_NAME,
                    text: "MO",
                }),
                this.createTableCell({
                    fontSize: settings.fontSize,
                    fontName: FONT_NAME,
                    text: "IND",
                }),
                this.createTableCell({
                    fontSize: settings.fontSize,
                    fontName: FONT_NAME,
                    text: "In Line?",
                }),
                this.createTableCell({
                    fontSize: settings.fontSize,
                    fontName: FONT_NAME,
                    text: "Comments",
                }),
            ],
        });

        const tableRows = docsItems.map(canvas => {
            const tableRowVisualization = new docx.TableRow({
                children: [
                    this.createTableCell({
                        textDirection: docx.TextDirection.TOP_TO_BOTTOM_RIGHT_TO_LEFT,
                        fontSize: settings.fontSize,
                        fontName: FONT_NAME,
                        text: canvas.title,
                    }),
                    new docx.TableCell({
                        children: [
                            new docx.Paragraph({
                                children: [
                                    this.createImage({
                                        base64: canvas.base64,
                                        height: canvas.height,
                                        maxHeight: maxHeight,
                                        maxWidth: maxWidth,
                                        width: canvas.width,
                                    }),
                                ],
                            }),
                        ],
                    }),
                    this.createEmptyTableCell({ fontSize: settings.fontSize }),
                    this.createEmptyTableCell({ fontSize: settings.fontSize }),
                ],
            });
            return tableRowVisualization;
        });

        const table = new docx.Table({
            rows: [tableRowHeader, ...tableRows],
        });

        const doc = new docx.Document({
            sections: [
                {
                    children: [table],
                },
            ],
        });

        return docx.Packer.toBlob(doc);
    }

    private createText(options: docx.IRunOptions) {
        return new docx.TextRun(options);
    }

    private createParagraph(options: docx.IParagraphOptions) {
        return new docx.Paragraph(options);
    }

    private createTableCell({ fontSize, fontName, text, textDirection }: TableCell) {
        return new docx.TableCell({
            textDirection,
            children: [
                this.createParagraph({
                    children: [
                        this.createText({
                            size: `${Number(fontSize)}pt`,
                            font: fontName,
                            text,
                        }),
                    ],
                }),
            ],
        });
    }

    private createEmptyTableCell({ fontSize }: Pick<TableCell, "fontSize">) {
        return this.createTableCell({
            fontSize: fontSize,
            fontName: FONT_NAME,
            text: " ",
        });
    }

    private createImage(options: ImageOptions) {
        return new docx.ImageRun({
            data: options.base64,
            transformation: {
                width: options.width > options.maxWidth ? options.maxWidth : options.width,
                height: options.height > options.maxHeight ? options.maxHeight : options.height,
            },
        });
    }
}

type ImageOptions = {
    base64: string;
    width: number;
    height: number;
    maxWidth: number;
    maxHeight: number;
};

type TableCell = {
    fontSize: string;
    fontName: string;
    text: string;
    textDirection?: docx.TextDirection;
};
