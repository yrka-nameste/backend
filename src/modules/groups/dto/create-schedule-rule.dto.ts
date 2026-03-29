import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateScheduleRuleDto {
  // yyyy-mm-dd
  @IsString()
  startDate: string;

  // yyyy-mm-dd
  @IsString()
  endDate: string;

  // [1..7] where 1=Mon, 7=Sun
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  weekdays: number[];

  // "HH:mm"
  @IsString()
  timeStart: string;

  @IsOptional()
  @IsInt()
  durationMin?: number;

  @IsOptional()
  @IsInt()
  repeatEveryWeeks?: number;

  @IsOptional()
  @IsString()
  timezone?: string;
}
