import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MobileService } from './mobile.service';

@ApiTags('Mobile')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('mobile')
export class MobileController {
  constructor(private readonly mobile: MobileService) {}

  @Get('parent/home')
  parentHome(@Query('studentId') studentId: string, @Req() req: any) {
    return this.mobile.parentHome(studentId, req.user);
  }

  @Get('parent/kiberons')
  parentKiberons(@Query('studentId') studentId: string, @Req() req: any) {
    return this.mobile.parentKiberons(studentId, req.user);
  }

  @Get('parent/shop')
  parentShop(@Query('studentId') studentId: string, @Req() req: any) {
    return this.mobile.parentShop(studentId, req.user);
  }

  @Get('parent/payments')
  parentPayments(@Query('studentId') studentId: string, @Req() req: any) {
    return this.mobile.parentPayments(studentId, req.user);
  }

  @Get('teacher/home')
  teacherHome(@Req() req: any) {
    return this.mobile.teacherHome(req.user);
  }

  @Get('teacher/lessons/today')
  teacherLessonsToday(@Req() req: any) {
    return this.mobile.teacherLessonsToday(req.user);
  }

  @Get('teacher/groups')
  teacherGroups(@Req() req: any) {
    return this.mobile.teacherGroups(req.user);
  }

  @Get('teacher/group/:groupId')
  teacherGroup(@Param('groupId') groupId: string, @Req() req: any) {
    return this.mobile.teacherGroup(groupId, req.user);
  }

  @Get('crm/birthdays')
  birthdays(@Req() req: any) {
    return this.mobile.birthdays(req.user);
  }

  @Get('crm/absent-this-week')
  absentThisWeek(@Req() req: any) {
    return this.mobile.absentThisWeek(req.user);
  }
}
