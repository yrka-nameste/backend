import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({ example: 'Р“СЂСѓРїРїР° A (СЃР± 16:00)' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: '14-16' })
  @IsOptional()
  @IsString()
  ageCategory?: string;

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number;
}
