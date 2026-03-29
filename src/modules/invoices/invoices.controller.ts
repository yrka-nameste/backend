import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InvoicesService } from './invoices.service';
import { GenerateInvoicesDto } from './dto/generate-invoices.dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Post('generate')
  generate(@Body() dto: GenerateInvoicesDto, @Req() req: any) {
    return this.invoices.generateForBranch(dto, req.user);
  }

  @Get('student/:studentId')
  listStudent(@Param('studentId') studentId: string, @Req() req: any) {
    return this.invoices.listStudent(studentId, req.user);
  }

  @Get('debtors')
  debtors(@Query('mode') mode: string | undefined, @Req() req: any) {
    const onlyNegative = mode !== 'zero';
    return this.invoices.debtors(req.user, onlyNegative);
  }
}