import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { AssignTeacherDto } from './dto/assign-teacher.dto';
import { AddStudentDto } from './dto/add-student.dto';
import { CreateScheduleRuleDto } from './dto/create-schedule-rule.dto';
import { GenerateLessonsDto } from './dto/generate-lessons.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  findAll(@Req() req: any) {
    return this.groupsService.findAll(req.user);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.getOne(id, req.user);
  }

  @Post()
  create(@Body() dto: CreateGroupDto, @Req() req: any) {
    return this.groupsService.create(dto, req.user);
  }

  @Post(':id/update')
  update(@Param('id') id: string, @Body() dto: UpdateGroupDto, @Req() req: any) {
    return this.groupsService.update(id, dto, req.user);
  }

  @Post(':id/archive')
  archive(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.archive(id, req.user);
  }

  @Post(':id/restore')
  restore(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.restore(id, req.user);
  }

  @Post(':id/teacher')
  assignTeacher(@Param('id') id: string, @Body() dto: AssignTeacherDto, @Req() req: any) {
    return this.groupsService.assignTeacher(id, dto, req.user);
  }

  @Get(':id/students')
  getStudents(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.getStudents(id, req.user);
  }

  @Post(':id/students')
  addStudent(@Param('id') id: string, @Body() dto: AddStudentDto, @Req() req: any) {
    return this.groupsService.addStudent(id, dto, req.user);
  }

  @Delete(':id/students/:studentId')
  removeStudent(@Param('id') id: string, @Param('studentId') studentId: string, @Req() req: any) {
    return this.groupsService.removeStudent(id, studentId, req.user);
  }

  @Post(':id/schedule-rule')
  setScheduleRule(@Param('id') id: string, @Body() dto: CreateScheduleRuleDto, @Req() req: any) {
    return this.groupsService.setScheduleRule(id, dto, req.user);
  }

  @Get(':id/lessons')
  getLessons(
    @Param('id') id: string,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
  ) {
    return this.groupsService.getLessons(id, from, to, req.user);
  }

  @Post(':id/generate-lessons')
  generateLessons(@Param('id') id: string, @Body() dto: GenerateLessonsDto, @Req() req: any) {
    return this.groupsService.generateLessons(id, dto, req.user);
  }
}
