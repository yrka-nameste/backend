"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
let AiService = class AiService {
    apiKey = (process.env.OPENAI_API_KEY ?? '').trim();
    model = (process.env.OPENAI_MODEL ?? 'gpt-4.1-mini').trim();
    async chatWithTutor(dto, user) {
        if (!this.apiKey) {
            throw new common_1.InternalServerErrorException('OPENAI_API_KEY is not configured');
        }
        const message = dto?.message?.trim();
        if (!message) {
            throw new common_1.BadRequestException('message is required');
        }
        const safeHistory = (dto.history ?? [])
            .filter((x) => x?.text?.trim())
            .slice(-12)
            .map((x) => ({
            role: x.role === 'assistant' ? 'assistant' : 'user',
            text: x.text.trim(),
        }));
        const transcript = [
            ...safeHistory.map((m) => `${m.role === 'assistant' ? 'Ассистент' : 'Пользователь'}: ${m.text}`),
            `Пользователь: ${message}`,
        ].join('\n');
        const systemPrompt = [
            'Ты Мишка ВсеЗнайка — дружелюбный AI-помощник для родителей и детей из KIBERone.',
            'Объясняй темы очень просто, спокойно и по шагам.',
            'Если вопрос учебный, сначала дай короткое объяснение, потом пример.',
            'Если тема сложная, раздели её на маленькие понятные части.',
            'Пиши на русском языке.',
            'Не используй сложные термины без объяснения.',
            'Не пиши слишком длинно.',
        ].join(' ');
        const response = await fetch('https://api.openai.com/v1/responses', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.model,
                input: [
                    {
                        role: 'system',
                        content: [{ type: 'input_text', text: systemPrompt }],
                    },
                    {
                        role: 'user',
                        content: [{ type: 'input_text', text: transcript }],
                    },
                ],
                safety_identifier: user?.userId ?? user?.id ?? undefined,
            }),
        });
        if (!response.ok) {
            const text = await response.text();
            throw new common_1.InternalServerErrorException(`OpenAI request failed: ${text}`);
        }
        const data = (await response.json());
        let answer = '';
        for (const item of data?.output ?? []) {
            for (const part of item?.content ?? []) {
                if (part?.type === 'output_text' && part?.text) {
                    answer += String(part.text);
                }
            }
        }
        if (!answer.trim()) {
            throw new common_1.InternalServerErrorException('Empty AI response');
        }
        return {
            reply: answer.trim(),
            model: data?.model ?? this.model,
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map