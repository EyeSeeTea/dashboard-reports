import _ from "lodash";
import { Stats } from "../domain/entities/Stats";
import { CancelableResponse, MetadataResponse } from "../types/d2-api";
import { apiToFuture } from "../utils/futures";
import { Future, FutureData } from "./../domain/entities/Future";

export function getErrorFromResponse(res: MetadataResponse): string {
    console.debug(JSON.stringify(res, null, 4));

    return _(res.typeReports || [])
        .flatMap(typeReport => typeReport.objectReports || [])
        .flatMap(objectReport => objectReport.errorReports || [])
        .flatMap(errorReport => errorReport.message)
        .compact()
        .uniq()
        .join("\n");
}

export function runMetadata(d2Response: CancelableResponse<MetadataResponse>): FutureData<void> {
    return apiToFuture(d2Response).flatMap(res =>
        res.status !== "OK" ? Future.error(getErrorFromResponse(res)) : Future.success(undefined)
    );
}

export function runMetadataWithStats(d2Response: CancelableResponse<MetadataResponse>): FutureData<Stats> {
    return apiToFuture(d2Response).flatMap(res =>
        res.status !== "OK" ? Future.error(getErrorFromResponse(res)) : Future.success(res.stats)
    );
}
