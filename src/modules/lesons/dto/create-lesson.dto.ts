import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty()
  @IsString()
  groupId!: string;

  @ApiProperty()
  @IsDateString()
  startsAt!: string;

  @ApiProperty()
  @IsDateString()
  endsAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  teacherUserId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isChargeable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lessonNote?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homework?: string;
}
