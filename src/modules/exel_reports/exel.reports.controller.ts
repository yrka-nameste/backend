import {
  Controller,
  Get,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ExelReportsService } from './exel.reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ExelReportsController {
  constructor(private readonly reports: ExelReportsService) {}

  @Get('attendance-excel')
  async attendanceExcel(
    @Query('groupId') groupId: string | undefined,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const file = await this.reports.buildAttendanceExcel(
      { groupId, from, to },
      req.user,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=attendance-report.xlsx',
    );
    res.send(file);
  }

  @Get('lessons-excel')
  async lessonsExcel(
    @Query('groupId') groupId: string | undefined,
    @Query('teacherUserId') teacherUserId: string | undefined,
    @Query('from') from: string | undefined,
    @Query('to') to: string | undefined,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const file = await this.reports.buildLessonsExcel(
      { groupId, teacherUserId, from, to },
      req.user,
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=lessons-report.xlsx',
    );
    res.send(file);
  }
}
