import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import { Settings } from "../../../domain/entities/Settings";
import i18n from "../../../locales";

export const DashboardSettings: React.FC<DashboardSettingsProps> = React.memo(
    ({ dialogState, onSubmitForm, onDialogClose, settings }) => {
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
            <Dialog onClose={onDialogClose} aria-labelledby="settings-dialog" open={dialogState}>
                <DialogTitle id="settings-dialog">{i18n.t("App Settings")}</DialogTitle>

                <DialogContent>
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
                                    <Checkbox
                                        name="showFeedback"
                                        color="primary"
                                        defaultChecked={settings.showFeedback}
                                    />
                                }
                                label={i18n.t("Show/Hide Feedback")}
                            />
                        </FormGroup>
                    </form>
                </DialogContent>

                <DialogActions>
                    <Button type="submit" form="settingsform" color="primary" autoFocus>
                        {i18n.t("Save")}
                    </Button>

                    <Button onClick={onDialogClose} color="secondary">
                        {i18n.t("Close")}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
);

export interface DashboardSettingsProps {
    settings: Settings;
    dialogState: boolean;
    onDialogClose: () => void;
    onSubmitForm: (settings: Settings) => void;
}

DashboardSettings.displayName = "DashboardSettings";
