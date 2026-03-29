import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AiMessageDto {
  @IsString()
  role!: 'user' | 'assistant';

  @IsString()
  text!: string;
}

export class ChatWithTutorDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AiMessageDto)
  history?: AiMessageDto[];
}