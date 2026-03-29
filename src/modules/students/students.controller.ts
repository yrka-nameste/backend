import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AddParentDto } from './dto/add-parent.dto';
import { ResetParentPasswordDto } from './dto/reset-parent-password.dto';
@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get()
list(@Req() req: any, @Query('branchId') branchId?: string) {
  const user = req.user; // { userId, role, branchId }
  const effectiveBranchId = branchId ?? user?.branchId ?? undefined;

  
  if (user?.role === 'PARENT') {
    return this.students.listForParent(user.userId);
  }

  
  return this.students.list(effectiveBranchId);
}


  @Get(':id')
  getCard(@Param('id') id: string) {
    return this.students.getCard(id);
  }

  @Post()
  create(@Body() dto: CreateStudentDto, @Req() req: any) {
    return this.students.createWithParents(dto, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto, @Req() req: any) {
    return this.students.update(id, dto, req.user);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string) {
    return this.students.archive(id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.students.restore(id);
  }

  @Post(':id/parents')
  addParent(@Param('id') id: string, @Body() dto: AddParentDto, @Req() req: any) {
    return this.students.addParent(id, dto, req.user);
  }
   @Post(':id/reset-parent-password')
  resetParentPassword(
    @Param('id') id: string,
    @Body() dto: ResetParentPasswordDto,
    @Req() req: any,
  ) {
    return this.students.resetParentPassword(id, dto, req.user);
  }

}
