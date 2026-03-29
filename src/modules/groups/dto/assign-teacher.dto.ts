import { IsIn, IsString } from 'class-validator';

export class AssignTeacherDto {
  @IsString()
  teacherUserId: string;

  // TEACHER | ASSISTANT
  @IsIn(['TEACHER', 'ASSISTANT'])
  roleInGroup: string;
}
