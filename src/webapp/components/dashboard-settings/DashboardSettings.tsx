import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { Settings } from "../../../domain/entities/Settings";
import i18n from "../../../locales";

export const DashboardSettings: React.FC<DashboardSettingsProps> = React.memo(
    ({ dialogState, onSubmitForm, onDialogClose, settings }) => {
        const [fontSize, setFontSize] = React.useState(() => {
            return settings.fontSize;
        });

        const onSubmit: React.FormEventHandler<HTMLFormElement> = e => {
            e.preventDefault();
            const settingsToSave: Settings = {
                id: settings.id,
                fontSize,
            };
            onSubmitForm(settingsToSave);
        };

        const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            setFontSize(event.target.value);
        };

        return (
            <Dialog onClose={onDialogClose} aria-labelledby="settings-dialog" open={dialogState}>
                <DialogTitle id="settings-dialog">{i18n.t("App Settings")}</DialogTitle>

                <DialogContent>
                    <form id="settingsform" onSubmit={onSubmit}>
                        <TextField
                            id="font-size"
                            name="font-size"
                            label={i18n.t("Font Size")}
                            required
                            value={fontSize}
                            onChange={onChange}
                        />
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
