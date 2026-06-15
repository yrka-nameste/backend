type AuthUser = {
    userId?: string;
    id?: string;
    email?: string | null;
    role?: string;
    branchId?: string | null;
};
export declare class AiService {
    private readonly apiKey;
    private readonly model;
    chatWithTutor(dto: {
        message: string;
        history?: Array<{
            role: 'user' | 'assistant';
            text: string;
        }>;
    }, user?: AuthUser): Promise<{
        reply: string;
        model: any;
    }>;
}
export {};
