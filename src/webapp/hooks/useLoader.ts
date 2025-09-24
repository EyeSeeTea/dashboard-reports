import { useSnackbar } from "@eyeseetea/d2-ui-components";
import React from "react";
import { useAppContext } from "../contexts/app-context";
import { FutureData } from "../../domain/entities/Future";
import { Maybe } from "../../types/utils";
import { CompositionRoot } from "../../CompositionRoot";

export type LoaderState<Value> =
    | { type: "loading" }
    | { type: "loaded"; value: Value }
    | { type: "error"; message: string };

export type LoaderGetter<Value> = (compositionRoot: CompositionRoot) => FutureData<Value>;

export function useLoader<Value>(
    getter: (compositionRoot: CompositionRoot) => Maybe<FutureData<Value>>,
    options: { refreshKey?: object } = {}
): LoaderState<Value> {
    const { compositionRoot } = useAppContext();
    const snackbar = useSnackbar();
    const [state, setState] = React.useState<LoaderState<Value>>({ type: "loading" });

    React.useEffect(() => {
        const res = getter(compositionRoot);
        if (!res) return;

        return res.run(
            value => setState({ type: "loaded", value }),
            err => {
                snackbar.error(err);
                setState({ type: "error", message: err });
            }
        );
    }, [setState, snackbar, getter, compositionRoot, options.refreshKey]);

    return state;
}
