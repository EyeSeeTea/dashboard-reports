import React from "react";
import { IconButton, InputAdornment, TextField } from "@material-ui/core";
import { Clear as ClearIcon } from "@material-ui/icons";
import { OrgUnitPath } from "../../../domain/entities/OrgUnit";
import { useAppContext } from "../../contexts/app-context";
import { OrgUnitPicker } from "./OrgUnitPicker";
import { useOrgUnitRoots } from "../../hooks/useOrgUnitRoots";
import { useOrgUnitLoader } from "../../hooks/useOrgUnitLoader";
import i18n from "../../../locales";
import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";

export interface OrgUnitFilterProps {
    selected: OrgUnitPath[];
    onChange(value: OrgUnitPath[]): void;
}

export const OrgUnitFilter: React.FC<OrgUnitFilterProps> = React.memo(props => {
    const { selected, onChange } = props;
    const { api } = useAppContext();
    const { orgUnitRootIds } = useOrgUnitRoots();
    const [open, setOpen] = React.useState(false);
    const [selectedChanges, setSelectedChanges] = React.useState<OrgUnitPath[]>(selected);

    const orgUnitLoader = useOrgUnitLoader({ paths: selected });
    const orgUnitsText =
        orgUnitLoader.type === "loading"
            ? i18n.t("Loading...")
            : orgUnitLoader.type === "loaded"
            ? orgUnitLoader.value.map(ou => ou.name).join(", ")
            : i18n.t("Error");
    return (
        <>
            <ConfirmationDialog
                title={i18n.t("Select Organization Units")}
                open={open}
                maxWidth={"lg"}
                fullWidth={false}
                onCancel={() => {
                    setSelectedChanges(selected);
                    setOpen(false);
                }}
                cancelText={i18n.t("Cancel")}
                saveText={i18n.t("Select")}
                onSave={() => {
                    onChange(selectedChanges);
                    setOpen(false);
                }}
            >
                <OrgUnitPicker
                    api={api}
                    rootIds={orgUnitRootIds}
                    selected={selectedChanges}
                    setSelected={setSelectedChanges}
                />
            </ConfirmationDialog>
            <TextField
                label={i18n.t("Select Organization Units")}
                value={orgUnitsText}
                disabled={orgUnitLoader.type === "loading"}
                onClick={() => setOpen(true)}
                InputProps={{
                    readOnly: true,
                    endAdornment: selected.length > 0 && (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label={i18n.t("Clear")}
                                onClick={e => {
                                    e.stopPropagation();
                                    setSelectedChanges([]);
                                    onChange([]);
                                }}
                            >
                                <ClearIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </>
    );
});
