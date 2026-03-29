import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@ApiTags('Lessons')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Get()
  list(
    @Query('groupId') groupId: string | undefined,
    @Query('teacherUserId') teacherUserId: string | undefined,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
  ) {
    return this.lessons.list({ groupId, teacherUserId, from, to }, req.user);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Req() req: any) {
    return this.lessons.getOne(id, req.user);
  }

  @Post()
  create(@Body() dto: CreateLessonDto, @Req() req: any) {
    return this.lessons.create(dto, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLessonDto, @Req() req: any) {
    return this.lessons.update(id, dto, req.user);
  }
}
