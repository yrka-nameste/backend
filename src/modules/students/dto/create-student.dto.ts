import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ParentDto {
  @ApiProperty({ example: 'РРІР°РЅРѕРІР° РњР°СЂРёСЏ РЎРµСЂРіРµРµРІРЅР°' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '+37377798654' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'MOTHER' })
  @IsOptional()
  @IsString()
  relationType?: string;

  @ApiPropertyOptional({ example: 'mom@example.com' })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateStudentDto {
  @ApiProperty({ example: 'РРІР°РЅРѕРІ РРІР°РЅ' })
  @IsString()
  fullName!: string;

  // вњ… branchId РќР• РїРµСЂРµРґР°РµРј вЂ” Р±РµСЂС‘Рј РёР· req.user.branchId

  @ApiPropertyOptional({ example: '+37377798654' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'РўРёСЂР°СЃРїРѕР»СЊ' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'ex.example@ex.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'https://portfolio.link' })
  @IsOptional()
  @IsString()
  portfolio?: string;

  @ApiPropertyOptional({ example: '2018-12-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({ example: '2025-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  startStudyDate?: string;

  @ApiPropertyOptional({ example: '2025-09-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ example: '95015d10-3629-4e97-b23f-4110699c1810' })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({ example: 'FIXED_DAY', description: 'WINDOW_1_8 | FIXED_DAY' })
  @IsOptional()
  @IsString()
  paymentMode?: string;

  @ApiPropertyOptional({ example: 1, description: '1..31 РµСЃР»Рё FIXED_DAY' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  paymentDueDay?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  initialLessonBalance?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsInt()
  initialKiberons?: number;

  @ApiPropertyOptional({ type: [ParentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParentDto)
  parents?: ParentDto[];
}
