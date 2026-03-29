import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Matches, Min } from 'class-validator';

export class GenerateInvoicesDto {
  @ApiProperty({ example: '2026-02' })
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  period!: string;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2026-02-10', description: 'YYYY-MM-DD' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dueDate!: string;
}