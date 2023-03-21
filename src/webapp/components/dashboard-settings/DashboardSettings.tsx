import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

export const DashboardSettings: React.FC<DashboardSettingsProps> = React.memo(
    ({ dialogState, onSubmitForm, onDialogClose }) => {
        return (
            <Dialog onClose={onDialogClose} aria-labelledby="settings-dialog" open={dialogState}>
                <DialogTitle id="settings-dialog">App Settings</DialogTitle>
                <DialogContent>
                    <form id="settingsform" onSubmit={onSubmitForm}>
                        <TextField id="font-size" name="font-size" label="Font Size" required />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button type="submit" form="settingsform" color="primary" autoFocus>
                        Save
                    </Button>
                    <Button onClick={onDialogClose} color="secondary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
);

export interface DashboardSettingsProps {
    dialogState: boolean;
    onDialogClose: () => void;
    onSubmitForm: React.FormEventHandler<HTMLFormElement>;
}

DashboardSettings.displayName = "DashboardSettings";
