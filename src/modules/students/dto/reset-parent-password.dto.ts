import { IsString } from 'class-validator';

export class ResetParentPasswordDto {
  @IsString()
  parentUserId!: string;
}