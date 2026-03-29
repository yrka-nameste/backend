import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(@Query('scope') scope: string | undefined, @Req() req: any) {
    return this.tasks.list(scope ?? 'all', req.user);
  }

  @Post()
  create(@Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasks.create(dto, req.user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: CreateTaskDto, @Req() req: any) {
    return this.tasks.update(id, dto, req.user);
  }
}