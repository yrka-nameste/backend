import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AddParentDto {
  @ApiProperty({ example: 'РРІР°РЅРѕРІР° РњР°СЂРёСЏ РЎРµСЂРіРµРµРІРЅР°' })
  @IsString()
  fullName!: string;

  @ApiProperty({ example: '+37377798654' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'mom@example.com', description: 'Р•СЃР»Рё РЅРµ РїРµСЂРµРґР°Р»Рё вЂ” Р»РѕРіРёРЅ Р±СѓРґРµС‚ p<digits>@parent.local' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: 'MOTHER' })
  @IsOptional()
  @IsString()
  relationType?: string;

  @ApiPropertyOptional({ example: 'P@ssw0rd123', description: 'Р•СЃР»Рё РЅРµ РїРµСЂРµРґР°Р»Рё вЂ” СЃРіРµРЅРµСЂРёСЂСѓРµРј Рё РІРµСЂРЅС‘Рј РѕРґРёРЅ СЂР°Р·' })
  @IsOptional()
  @IsString()
  password?: string;
}
