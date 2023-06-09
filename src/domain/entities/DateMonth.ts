import _ from "lodash";

export type DateMonth = {
    year: number;
    month: number;
    lastFourMonths: boolean;
};

export type PeriodItem = {
    id: string;
};

export type ReportPeriod = { type: "dateMonth"; value: DateMonth } | { type: "lastMonths"; value: DateMonth };

function getRangeValue(reportPeriod: ReportPeriod) {
    if (reportPeriod.type === "lastMonths") {
        return 4;
    } else if (reportPeriod.type === "dateMonth" && reportPeriod.value.month && reportPeriod.value.year) {
        return 1;
    } else {
        return 0;
    }
}

export function generatePeriods(reportPeriod: ReportPeriod): PeriodItem[] {
    const rangeValue = getRangeValue(reportPeriod);
    const dates = _(0)
        .range(rangeValue)
        .map(index => {
            const lastFourMonths = reportPeriod.type === "lastMonths";
            const { month, year } = reportPeriod.value;
            const currentDate =
                month && year ? new Date(reportPeriod.value.year, reportPeriod.value.month - 1) : new Date();
            currentDate.setDate(1);
            currentDate.setMonth(
                lastFourMonths ? currentDate.getMonth() - (rangeValue - 1 - index) : currentDate.getMonth() - index
            );
            return currentDate;
        })
        .map(currentDate => {
            const prevMonthNumber = currentDate.getMonth() + 1;
            const twoDigitsPrevMonth = ("0" + prevMonthNumber).slice(-2);
            const periodItem: PeriodItem = {
                id: `${currentDate.getFullYear()}${twoDigitsPrevMonth}`,
            };
            return periodItem;
        });

    return dates.value();
}
