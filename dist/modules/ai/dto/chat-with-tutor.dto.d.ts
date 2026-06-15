export declare class AiMessageDto {
    role: 'user' | 'assistant';
    text: string;
}
export declare class ChatWithTutorDto {
    message: string;
    history?: AiMessageDto[];
}
