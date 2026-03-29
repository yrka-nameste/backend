import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  studentId!: string;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ example: 'cash/card/transfer' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ example: 'РљРѕРјРјРµРЅС‚Р°СЂРёР№' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({ description: 'РЎСЃС‹Р»РєР° РЅР° С„РѕС‚Рѕ С‡РµРєР° (РїРѕР·Р¶Рµ СЃРґРµР»Р°РµРј upload)' })
  @IsOptional()
  @IsString()
  receiptUrl?: string;

  @ApiPropertyOptional({ description: 'РЎРєРѕР»СЊРєРѕ СѓСЂРѕРєРѕРІ РґРѕР±Р°РІРёС‚СЊ Рє Р±Р°Р»Р°РЅСЃСѓ РїРѕСЃР»Рµ РѕРїР»Р°С‚С‹', example: 4 })
  @IsOptional()
  @IsInt()
  addLessons?: number;
}
