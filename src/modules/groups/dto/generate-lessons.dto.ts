import { IsOptional, IsString } from 'class-validator';

export class GenerateLessonsDto {
  // Можно не передавать — возьмём из ScheduleRule
  @IsOptional()
  @IsString()
  from?: string; // yyyy-mm-dd

  @IsOptional()
  @IsString()
  to?: string; // yyyy-mm-dd
}
