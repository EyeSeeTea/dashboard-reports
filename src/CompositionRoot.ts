import { Instance } from "./data/entities/Instance";
import { InstanceDefaultRepository } from "./data/repositories/InstanceDefaultRepository";
import { UserD2Repository } from "./data/repositories/UserD2Repository";
import { DashboardD2Repository } from "./data/repositories/DashboardD2Repository";
import { GetCurrentUserUseCase } from "./domain/usecases/GetCurrentUserUseCase";
import { GetInstanceVersionUseCase } from "./domain/usecases/GetInstanceVersionUseCase";
import { D2Api } from "./types/d2-api";
import { GetDashboardsUseCase } from "./domain/usecases/GetDashboardsUseCase";
import { SaveSettingsUseCase } from "./domain/usecases/SaveSettingsUseCase";
import { GetSettingsUseCase } from "./domain/usecases/GetSettingsUseCase";
import { SettingsD2ConstantRepository } from "./data/repositories/SettingsD2ConstantRepository";
import { SaveRawReportUseCase } from "./domain/usecases/SaveRawReportUseCase";
import { DashboardExportDocxRepository } from "./data/repositories/DashboardExportDocxRepository";
import { StorageName } from "./domain/entities/Settings";
import { DataStoreD2Repository } from "./data/repositories/DataStoreD2Repository";
import { PluginVisualizationD2Repository } from "./data/repositories/PluginVisualizationD2Repository";
import { GetPluginVisualizationUseCase } from "./domain/usecases/GetPluginVisualizationUseCase";
import { GetRootOrgUnitsUseCase } from "./domain/usecases/GetRootOrgUnitsUseCase";
import { OrgUnitD2Repository } from "./data/repositories/OrgUnitD2Repository";
import { GetOrgUnitsByIdsUseCase } from "./domain/usecases/GetOrgUnitsByIdsUseCase";
import { InitDefaultSettingsUseCase } from "./domain/usecases/InitDefaultSettingsUseCase";
import { DefaultSettingsHTTPRepository } from "./data/repositories/DefaultSettingsHTTPRepository";

export function getCompositionRoot(api: D2Api, instance: Instance, storageName: StorageName) {
    const instanceRepository = new InstanceDefaultRepository(instance);
    const usersRepository = new UserD2Repository(api);
    const dashboardRepository = new DashboardD2Repository(api);
    const settingsRepository =
        storageName === "datastore" ? new DataStoreD2Repository(api) : new SettingsD2ConstantRepository(api);
    const exportDocxRepository = new DashboardExportDocxRepository();
    const pluginVisualizationsRepository = new PluginVisualizationD2Repository(api);
    const orgUnitsRepository = new OrgUnitD2Repository(api);
    const defaultSettingsRepository = new DefaultSettingsHTTPRepository();

    return {
        instance: {
            getVersion: new GetInstanceVersionUseCase(instanceRepository),
        },
        users: {
            getCurrent: new GetCurrentUserUseCase(usersRepository),
        },
        dashboards: {
            get: new GetDashboardsUseCase(dashboardRepository),
        },
        pluginVisualizations: {
            get: new GetPluginVisualizationUseCase(pluginVisualizationsRepository),
        },
        settings: {
            get: new GetSettingsUseCase(settingsRepository),
            save: new SaveSettingsUseCase(settingsRepository),
            initDefaults: new InitDefaultSettingsUseCase(settingsRepository, defaultSettingsRepository),
        },
        export: {
            save: new SaveRawReportUseCase(exportDocxRepository),
        },
        orgUnits: {
            getRoots: new GetRootOrgUnitsUseCase(orgUnitsRepository),
            getByIds: new GetOrgUnitsByIdsUseCase(orgUnitsRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
