import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

export class MarkAttendanceDto {
  @ApiProperty()
  @IsString()
  studentId!: string;

  @ApiProperty({ enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] })
  @IsIn(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'])
  status!: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

  @ApiPropertyOptional({ default: false, description: 'Р”РѕР±Р°РІРёС‚СЊ 5 Р±РѕРЅСѓСЃРЅС‹С… РєРёР±РµСЂРѕРЅРѕРІ (РµСЃР»Рё PRESENT)' })
  @IsOptional()
  @IsBoolean()
  addBonus5?: boolean;
}
