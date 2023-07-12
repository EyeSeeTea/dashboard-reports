import { Instance } from "./data/entities/Instance";
import { InstanceDefaultRepository } from "./data/repositories/InstanceDefaultRepository";
import { UserD2Repository } from "./data/repositories/UserD2Repository";
import { DashboardD2Repository } from "./data/repositories/DashboardD2Repository";
import { GetCurrentUserUseCase } from "./domain/usecases/GetCurrentUserUseCase";
import { GetInstanceVersionUseCase } from "./domain/usecases/GetInstanceVersionUseCase";
import { D2Api } from "./types/d2-api";
import { GetDashboardsUseCase } from "./domain/usecases/GetDashboardsUseCase";
import { GetReportsUseCase } from "./domain/usecases/GetReportsUseCase";
import { SaveSettingsUseCase } from "./domain/usecases/SaveSettingsUseCase";
import { GetSettingsUseCase } from "./domain/usecases/GetSettingsUseCase";
import { SettingsD2ConstantRepository } from "./data/repositories/SettingsD2ConstantRepository";
import { SaveRawReportUseCase } from "./domain/usecases/SaveRawReportUseCase";
import { DashboardExportDocxRepository } from "./data/repositories/DashboardExportDocxRepository";
import { StorageName } from "./domain/entities/Settings";
import { DataStoreD2Repository } from "./data/repositories/DataStoreD2Repository";

export function getCompositionRoot(api: D2Api, instance: Instance, storageName: StorageName) {
    const instanceRepository = new InstanceDefaultRepository(instance);
    const usersRepository = new UserD2Repository(api);
    const dashboardRepository = new DashboardD2Repository(api);
    const settingsRepository =
        storageName === "datastore" ? new DataStoreD2Repository(api) : new SettingsD2ConstantRepository(api);
    const exportDocxRepository = new DashboardExportDocxRepository();

    return {
        instance: {
            getVersion: new GetInstanceVersionUseCase(instanceRepository),
        },
        users: {
            getCurrent: new GetCurrentUserUseCase(usersRepository),
        },
        dashboards: {
            get: new GetDashboardsUseCase(dashboardRepository),
            getReports: new GetReportsUseCase(dashboardRepository),
        },
        settings: {
            get: new GetSettingsUseCase(settingsRepository),
            save: new SaveSettingsUseCase(settingsRepository),
        },
        export: {
            save: new SaveRawReportUseCase(exportDocxRepository),
        },
    };
}

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;
