import * as docx from "docx";
import { DocxItem } from "../../domain/DocxItem";
import { Settings } from "../../domain/entities/Settings";
import { DashboardExportRepository } from "../../domain/repositories/DashboardExportRepository";

export class DashboardExportDocxRepository implements DashboardExportRepository {
    saveRawReport(docsItems: DocxItem[], title: string, settings: Settings): Promise<Blob> {
        const maxWidth = 600;
        const images = docsItems.map(docItem => {
            const imageWidth = docItem.width;
            const imageHeight = docItem.height;
            return new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        size: `${Number(settings.fontSize)}pt`,
                        break: 4,
                        text: docItem.title,
                    }),
                    new docx.ImageRun({
                        data: docItem.base64,
                        transformation: {
                            width: imageWidth > maxWidth ? maxWidth : imageWidth,
                            height: imageHeight,
                        },
                    }),
                ],
            });
        });

        const doc = new docx.Document({
            sections: [
                {
                    children: [
                        new docx.Paragraph({
                            alignment: docx.AlignmentType.CENTER,
                            children: [
                                new docx.TextRun({
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

    saveComplexReport(docsItems: DocxItem[], settings: Settings): Promise<Blob> {
        const maxWidth = 200;
        const maxHeight = 200;
        const FONT_NAME = "Arial";

        const tableRowHeader = new docx.TableRow({
            tableHeader: true,
            children: [
                new docx.TableCell({
                    children: [
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    size: `${Number(settings.fontSize)}pt`,
                                    font: FONT_NAME,
                                    text: "MO",
                                }),
                            ],
                        }),
                    ],
                }),
                new docx.TableCell({
                    children: [
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    size: `${Number(settings.fontSize)}pt`,
                                    font: FONT_NAME,
                                    text: "IND",
                                }),
                            ],
                        }),
                    ],
                }),
                new docx.TableCell({
                    children: [
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    size: `${Number(settings.fontSize)}pt`,
                                    font: FONT_NAME,
                                    text: "In Line?",
                                }),
                            ],
                        }),
                    ],
                }),
                new docx.TableCell({
                    children: [
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    size: `${Number(settings.fontSize)}pt`,
                                    font: FONT_NAME,
                                    text: "Comments",
                                }),
                            ],
                        }),
                    ],
                }),
            ],
        });

        const tableRows = docsItems.map(canvas => {
            const tableRowVisualization = new docx.TableRow({
                children: [
                    new docx.TableCell({
                        textDirection: docx.TextDirection.TOP_TO_BOTTOM_RIGHT_TO_LEFT,
                        children: [
                            new docx.Paragraph({
                                alignment: docx.AlignmentType.CENTER,
                                children: [
                                    new docx.TextRun({
                                        size: `${Number(settings.fontSize)}pt`,
                                        font: FONT_NAME,
                                        text: canvas.title,
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new docx.TableCell({
                        children: [
                            new docx.Paragraph({
                                children: [
                                    new docx.ImageRun({
                                        data: canvas.base64,
                                        transformation: {
                                            width: canvas.width > maxWidth ? maxWidth : canvas.width,
                                            height: canvas.height > maxHeight ? maxHeight : canvas.height,
                                        },
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new docx.TableCell({
                        children: [
                            new docx.Paragraph({
                                children: [
                                    new docx.TextRun({
                                        size: `${Number(settings.fontSize)}pt`,
                                        text: " ",
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new docx.TableCell({
                        children: [
                            new docx.Paragraph({
                                children: [
                                    new docx.TextRun({
                                        size: `${Number(settings.fontSize)}pt`,
                                        text: " ",
                                    }),
                                ],
                            }),
                        ],
                    }),
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
}
