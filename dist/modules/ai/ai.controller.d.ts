import { AiService } from './ai.service';
import { ChatWithTutorDto } from './dto/chat-with-tutor.dto';
export declare class AiController {
    private readonly ai;
    constructor(ai: AiService);
    chatWithTutor(dto: ChatWithTutorDto, req: any): Promise<{
        reply: string;
        model: any;
    }>;
}
