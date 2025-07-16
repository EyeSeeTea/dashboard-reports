import { FeedbackOptions } from "@eyeseetea/feedback-component";

export const appConfig: AppConfig = {
    appKey: "dashboard-reports",
    appearance: {
        showShareButton: true,
    },
    feedback: {
        repositories: {
            clickUp: {
                listId: "901208289349",
                title: "[User feedback] {title}",
                body: "## dhis2\n\nUsername: {username}\n\n{body}",
            },
        },
        layoutOptions: {
            buttonPosition: "bottom-end",
            descriptionTemplate: "## Summary\n\n## Steps to reproduce\n\n## Actual results\n\n## Expected results\n\n",
        },
    },
    header: false,
    footer: false,
};

export interface HeaderOptions {
    title: string;
    background?: string;
    color?: string;
}
export interface FooterOptions {
    text: string;
    background?: string;
    color?: string;
}

export type AppConfig = {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    feedback?: FeedbackOptions;
    header: HeaderOptions | false;
    footer: FooterOptions | false;
}

