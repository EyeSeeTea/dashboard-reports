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
    // header: {
    //     title: "Dashboard Reports - Custom Header Title",
    //     background: "rgba(19,52,59,1)",
    //     color: "white",
    // },
    // footer: {
    //     text: `Dashboard Reports - Custom Footer.
    //     Multi-line text is allowed.
    //     TBD: More customization options.
    //     `,
    //     background: "linear-gradient(90deg, rgba(31,41,30,1) 0%, rgba(20,50,28,1) 50%, rgba(31,41,30,1) 100%)",
    //     color: "white",
    // },
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
