import React from "react";
import _ from "lodash";
import { OrgUnitsSelector } from "@eyeseetea/d2-ui-components";
import { D2Api } from "../../../types/d2-api";
import { Id } from "../../../domain/entities/Ref";
import { getOrgUnitParentPath, OrgUnitPath } from "../../../domain/entities/OrgUnit";

export interface OrgUnitPickerProps {
    api: D2Api;
    rootIds: Id[] | undefined;
    selected: OrgUnitPath[];
    setSelected(newPaths: OrgUnitPath[]): void;
}

export const OrgUnitPicker: React.FC<OrgUnitPickerProps> = React.memo(props => {
    const { api, rootIds, selected, setSelected } = props;
    const initiallyExpanded = React.useMemo(() => _.compact(selected.map(getOrgUnitParentPath)), [selected]);

    return (
        <OrgUnitsSelector
            api={api}
            selected={selected}
            onChange={setSelected}
            fullWidth={false}
            rootIds={rootIds}
            withElevation={false}
            initiallyExpanded={initiallyExpanded.length ? initiallyExpanded : undefined}
            controls={{
                filterByLevel: false,
                filterByGroup: false,
                filterByProgram: false,
                selectAll: false,
            }}
            onChildrenLoaded={{}}
        />
    );
});
