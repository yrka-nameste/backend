import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { FinReportsService } from './finreports.service';

@ApiTags('Finance Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('finance-reports')
export class FinReportsController {
  constructor(private readonly finReports: FinReportsService) {}

  @Get('summary')
  @ApiQuery({ name: 'period', required: false, example: '2026-06' })
  summary(@Query('period') period: string | undefined, @Req() req: any) {
    return this.finReports.getFinanceSummary(req.user, period);
  }

  @Get('payments')
  @ApiQuery({ name: 'period', required: false, example: '2026-06' })
  @ApiQuery({ name: 'method', required: false, example: 'transfer' })
  @ApiQuery({ name: 'source', required: false, example: 'MOBILE_APP' })
  @ApiQuery({ name: 'q', required: false, example: 'Иванов' })
  payments(
    @Query('period') period: string | undefined,
    @Query('method') method: string | undefined,
    @Query('source') source: string | undefined,
    @Query('q') q: string | undefined,
    @Req() req: any,
  ) {
    return this.finReports.getFinancePayments(req.user, {
      period,
      method,
      source,
      q,
    });
  }

  @Get('excel')
  @ApiQuery({ name: 'period', required: false, example: '2026-06' })
  async excel(
    @Query('period') period: string | undefined,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const result = await this.finReports.generateFinanceExcel(req.user, period);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.filename}"`,
    );

    res.send(result.buffer);
  }
}