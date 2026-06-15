import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { MarkNotificationsReadDto } from './dto/mark-notifications-read.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('summary')
  summary(@Req() req: any) {
    return this.notifications.summary(req.user);
  }

  @Get()
  @ApiQuery({ name: 'status', required: false, example: 'UNREAD' })
  @ApiQuery({ name: 'take', required: false, example: 20 })
  list(
    @Query('status') status: string | undefined,
    @Query('take') take: string | undefined,
    @Req() req: any,
  ) {
    return this.notifications.list(req.user, status, take);
  }

  @Post('read')
  markRead(@Body() dto: MarkNotificationsReadDto, @Req() req: any) {
    return this.notifications.markRead(req.user, dto.ids);
  }

  @Post('read-all')
  markAllRead(@Req() req: any) {
    return this.notifications.markRead(req.user);
  }
}