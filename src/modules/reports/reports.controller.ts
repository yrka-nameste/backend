import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

 
  @Get('debtors')
  debtors(@Req() req: any, @Query('mode') mode?: string) {
    const onlyNegative = mode !== 'zero';
    return this.reports.debtors(req.user, onlyNegative);
  }

  //  сводка
  @Get('overview')
  overview(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.overview(req.user, from, to);
  }

  // доход по дням (график)
  @Get('revenue/daily')
  revenueDaily(@Req() req: any, @Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.revenueDaily(req.user, from, to);
  }

  //  топ групп
  @Get('groups/top')
  topGroups(
    @Req() req: any,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reports.topGroups(req.user, from, to, limit ? parseInt(limit, 10) : 10);
  }
}