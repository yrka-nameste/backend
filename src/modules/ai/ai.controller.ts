import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';
import { ChatWithTutorDto } from './dto/chat-with-tutor.dto';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('tutor/chat')
  chatWithTutor(@Body() dto: ChatWithTutorDto, @Req() req: any) {
    return this.ai.chatWithTutor(dto, req.user);
  }
}