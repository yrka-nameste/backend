import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common'; //
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { KiberonsService } from './kiberons.service';

@ApiTags('Kiberons')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('kiberons')
export class KiberonsController {
  constructor(private readonly kiberonsService: KiberonsService) {}

  @Get('student/:studentId')
  getStudentTx(@Param('studentId') studentId: string, @Req() req: any) {
    return this.kiberonsService.getStudentKiberons(studentId, req.user);
  }

  @Get('student/:studentId/balance')
  getStudentBalance(@Param('studentId') studentId: string, @Req() req: any) {
    return this.kiberonsService.getStudentKiberonsBalance(studentId, req.user);
  }

  @Post()
  create(@Body() createKiberonDto: any, @Req() req: any) {
    return this.kiberonsService.create(createKiberonDto, req.user);
  }
}