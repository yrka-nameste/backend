import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateKiberonDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsInt()
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  comment?: string;
}