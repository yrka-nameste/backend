import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class MarkNotificationsReadDto {
  @ApiPropertyOptional({
    description: 'ID уведомлений. Если не передать ids, будут прочитаны все непрочитанные уведомления филиала.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];
}