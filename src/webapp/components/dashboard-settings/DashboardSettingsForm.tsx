import React from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import { Settings } from "../../../domain/entities/Settings";
import i18n from "../../../locales";
import styled from "styled-components";

export const DashboardSettingsForm: React.FC<DashboardSettingsFormProps> = React.memo(
    ({ onSubmitForm, settings, onCancel }) => {
        const onSubmit: React.FormEventHandler<HTMLFormElement> = e => {
            e.preventDefault();
            const formElements = e.target as typeof e.target & {
                fontSize: { value: string };
                showFeedback: { checked: boolean };
            };

            const settingsToSave: Settings = {
                id: settings.id,
                fontSize: formElements.fontSize.value,
                templates: settings.templates,
                showFeedback: formElements.showFeedback.checked,
            };
            onSubmitForm(settingsToSave);
        };
        return (
            <form id="settingsform" onSubmit={onSubmit}>
                <FormGroup>
                    <TextField
                        id="fontsize"
                        type="number"
                        name="fontSize"
                        label={i18n.t("Font Size")}
                        required
                        defaultValue={settings.fontSize}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox name="showFeedback" color="primary" defaultChecked={settings.showFeedback} />
                        }
                        label={i18n.t("Show/Hide Feedback")}
                    />
                </FormGroup>
                <ActionsContainer>
                    <Button onClick={onCancel} color="default">
                        {i18n.t("Cancel")}
                    </Button>
                    <SaveButton type="submit" form="settingsform" variant="contained" color="primary" autoFocus>
                        {i18n.t("Save")}
                    </SaveButton>
                </ActionsContainer>
            </form>
        );
    }
);
const ActionsContainer = styled.div`
    display: flex;
    gap: 10px;
    justify-content: flex-end;
`;

const SaveButton = styled(Button)`
    min-width: 100px;
`;

export interface DashboardSettingsFormProps {
    settings: Settings;
    onSubmitForm: (settings: Settings) => void;
    onCancel: () => void;
}

DashboardSettingsForm.displayName = "DashboardSettingsForm";
