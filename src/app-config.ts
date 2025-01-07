import { FeedbackOptions } from "@eyeseetea/feedback-component";

export const appConfig: AppConfig = {
    appKey: "dashboard-reports",
    appearance: {
        showShareButton: true,
    },
    feedback: {
        repositories: {
            clickUp: {
                listId: "176458462",
                title: "[User feedback] {title}",
                body: "## dhis2\n\nUsername: {username}\n\n{body}",
            },
        },
        layoutOptions: {
            buttonPosition: "bottom-end",
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

export interface AppConfig {
    appKey: string;
    appearance: {
        showShareButton: boolean;
    };
    feedback?: FeedbackOptions;
    header: HeaderOptions | false;
    footer: FooterOptions | false;
}
