import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { EducationProgramsService } from './education-programs.service';
import { CreateEducationProgramDto } from './dto/create-education-program.dto';
import { UpdateEducationProgramDto } from './dto/update-education-program.dto';

@ApiTags('Education Programs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('education-programs')
export class EducationProgramsController {
  constructor(private readonly programs: EducationProgramsService) {}

  @Get()
  list(@Req() req: any) {
    return this.programs.list(req.user);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Req() req: any) {
    return this.programs.getOne(id, req.user);
  }

  @Post()
  create(@Body() dto: CreateEducationProgramDto, @Req() req: any) {
    return this.programs.create(dto, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEducationProgramDto, @Req() req: any) {
    return this.programs.update(id, dto, req.user);
  }
}
