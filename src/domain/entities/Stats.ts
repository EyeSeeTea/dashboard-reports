export interface Stats {
    created: number;
    updated: number;
    deleted: number;
    ignored: number;
}

export const emptyStats: Stats = {
    created: 0,
    updated: 0,
    deleted: 0,
    ignored: 0,
};

export function mergeStats(stats1: Stats, stats2: Stats): Stats {
    return {
        created: stats1.created + stats2.created,
        updated: stats1.updated + stats2.updated,
        deleted: stats1.deleted + stats2.deleted,
        ignored: stats1.ignored + stats2.ignored,
    };
}
