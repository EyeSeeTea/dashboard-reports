import React, { useContext } from "react";
import { CompositionRoot } from "../../CompositionRoot";
import { Settings } from "../../domain/entities/Settings";
import { User } from "../../domain/entities/User";
import { D2Api } from "../../types/d2-api";
import i18n from "../../locales";

export interface AppContextState {
    api: D2Api;
    currentUser: User;
    compositionRoot: CompositionRoot;
    isDev: boolean;
    settings: Settings;
    setAppContext: React.Dispatch<React.SetStateAction<AppContextState | null>>;
}

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    i18n.setDefaultNamespace("dashboard-reports");
    if (context) {
        return context;
    } else {
        throw new Error("App context uninitialized");
    }
}
