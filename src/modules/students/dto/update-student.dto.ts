import { IsBoolean, IsEmail, IsIn, IsInt, IsOptional, IsString, Max, Min, IsDateString } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  city?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsIn(['ACTIVE', 'PAUSED', 'LEFT'])
  status?: 'ACTIVE' | 'PAUSED' | 'LEFT';

  @IsOptional()
  @IsIn(['FIXED_DAY', 'WINDOW_1_8'])
  paymentMode?: 'FIXED_DAY' | 'WINDOW_1_8' | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  paymentDueDay?: number | null;

  @IsOptional()
  @IsString()
  contractNumber?: string | null;

  @IsOptional()
  @IsString()
  leadSource?: string | null;

  @IsOptional()
  @IsString()
  managerComment?: string | null;

  @IsOptional()
  @IsBoolean()
  needsContact?: boolean;

  @IsOptional()
  @IsBoolean()
  documentsIncomplete?: boolean;

  @IsOptional()
  @IsString()
  portfolio?: string | null;

  @IsOptional()
  @IsDateString()
  birthDate?: string | null;

  @IsOptional()
  @IsDateString()
  startStudyDate?: string | null;

  @IsOptional()
  @IsDateString()
  paymentDate?: string | null;
}