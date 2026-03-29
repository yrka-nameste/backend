import { Body, Controller, Get, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('lessons')
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Get(':lessonId/attendance')
  getLessonAttendance(@Param('lessonId') lessonId: string, @Req() req: any) {
    return this.attendance.getLessonAttendance(lessonId, req.user);
  }

  @Put(':lessonId/attendance')
  setAttendance(@Param('lessonId') lessonId: string, @Body() dto: MarkAttendanceDto, @Req() req: any) {
    return this.attendance.setAttendance(lessonId, dto, req.user);
  }
}
