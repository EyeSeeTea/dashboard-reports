import React from "react";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import i18n from "../../../utils/i18n";
import { PageHeader } from "../../components/page-header/PageHeader";
import { useSettings } from "../../hooks/useSettings";
import { useAppContext } from "../../contexts/app-context";
import { Settings } from "../../../domain/entities/Settings";
import { DashboardSettingsForm } from "../../components/dashboard-settings/DashboardSettingsForm";

export const SettingsPage: React.FC = React.memo(() => {
    const history = useHistory();
    const appContext = useAppContext();

    const settings = appContext.settings;
    const goBack = React.useCallback(() => {
        history.goBack();
    }, [history]);

    const { saveSettings } = useSettings(settings?.templates[0]);

    const onSubmitSettings = (settings: Settings) => {
        saveSettings(settings);
        appContext.setAppContext(prev => {
            if (!prev) return null;
            return {
                ...prev,
                settings,
            };
        });
    };
    return (
        <div>
            <PageHeaderContainer>
                <PageHeader title={i18n.t("App Settings")} onBackClick={goBack} />
            </PageHeaderContainer>
            <FormContainer>
                <DashboardSettingsForm settings={settings} onSubmitForm={onSubmitSettings} onCancel={goBack} />
            </FormContainer>
        </div>
    );
});

const PageHeaderContainer = styled.div`
    padding-top: 10px;
`;

const FormContainer = styled.div`
    padding: 20px 30px;
    max-width: 500px;
`;
