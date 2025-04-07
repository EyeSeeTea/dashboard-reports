import React from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import i18n from "../../../utils/i18n";
import { MarkdownViewer } from "../../components/markdown/MarkdownViewer";
import { PageHeader } from "../../components/page-header/PageHeader";

export const AboutPage: React.FC = React.memo(() => {
    const history = useHistory();

    const contents = [
        `#### ${i18n.t("Distributed under GNU GLPv3")}`,
        i18n.t("Dashboard reports is a DHIS2 web application to generate word reports from a DHIS2 dashboard"),
        i18n.t(
            "This application has been funded by the Medecins Sans Frontières (MSF). The application has been developed by [EyeSeeTea SL](http://eyeseetea.com). Source code, documentation and release notes can be found at the [EyeSeetea GitHub Project Page](https://github.com/EyeSeeTea/dashboard-reports/)",
            { nsSeparator: false }
        ),
        i18n.t(
            "If you wish to contribute to the development of Dashboard reports with new features, please contact [EyeSeeTea](mailto:hello@eyeseetea.com).",
            { nsSeparator: false }
        ),
    ].join("\n\n");

    const goBack = React.useCallback(() => {
        history.goBack();
    }, [history]);

    return (
        <StyledLanding>
            <PageHeaderContainer>
                <PageHeader title={i18n.t("About Dashboard reports")} onBackClick={goBack} />
            </PageHeaderContainer>
            <div className="about-content">
                <MarkdownViewer source={contents} center={true} />
                <LogoWrapper>
                    <div>
                        <Logo size="small" alt={i18n.t("Médicos Sin Fronteras")} src="img/logo-msf.svg" />
                    </div>
                    <div>
                        <Logo alt={i18n.t("EyeSeeTea")} src="img/logo-eyeseetea.png" />
                    </div>
                </LogoWrapper>
            </div>
        </StyledLanding>
    );
});

const PageHeaderContainer = styled.div`
    padding-top: 10px;
`;

const StyledLanding = styled.div`
    & > div.about-content {
        background-color: rgb(39, 102, 150);
        padding: 0px;
        border-radius: 18px;
        margin: 1em 16px 20px 16px;
        box-shadow: rgba(0, 0, 0, 0.14) 0px 8px 10px 1px, rgba(0, 0, 0, 0.12) 0px 3px 14px 2px,
            rgba(0, 0, 0, 0.2) 0px 5px 5px -3px;
    }
    ${MarkdownViewer} {
        padding: 1rem 2.25rem 0 2.25rem;
        text-align-last: unset;
    }
`;

const LogoWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    row-gap: 2em;
    margin: 0 1em;
    padding: 3em 0;
    justify-content: center;
    div {
        display: flex;
        align-items: center;
    }
`;

interface LogoProps {
    size?: "small" | "default" | "large";
}

const Logo = styled.img<LogoProps>`
    width: ${({ size }) => (size === "large" ? "250px" : size === "small" ? "150px" : "200px")};
    margin: 0 50px;
`;
