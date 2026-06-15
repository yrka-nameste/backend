export declare class CreateScheduleRuleDto {
    startDate: string;
    endDate: string;
    weekdays: number[];
    timeStart: string;
    durationMin?: number;
    repeatEveryWeeks?: number;
    timezone?: string;
}
