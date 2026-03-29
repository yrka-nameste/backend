import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

type AuthUser = {
  userId?: string;
  id?: string;
  email?: string | null;
  role?: string;
  branchId?: string | null;
};

@Injectable()
export class AiService {
  private readonly apiKey = (process.env.OPENAI_API_KEY ?? '').trim();
  private readonly model = (process.env.OPENAI_MODEL ?? 'gpt-4.1-mini').trim();

  async chatWithTutor(
    dto: {
      message: string;
      history?: Array<{ role: 'user' | 'assistant'; text: string }>;
    },
    user?: AuthUser,
  ) {
    if (!this.apiKey) {
      throw new InternalServerErrorException('OPENAI_API_KEY is not configured');
    }

    const message = dto?.message?.trim();
    if (!message) {
      throw new BadRequestException('message is required');
    }

    const safeHistory = (dto.history ?? [])
      .filter((x) => x?.text?.trim())
      .slice(-12)
      .map((x) => ({
        role: x.role === 'assistant' ? 'assistant' : 'user',
        text: x.text.trim(),
      }));

    const transcript = [
      ...safeHistory.map(
        (m) =>
          `${m.role === 'assistant' ? 'Ассистент' : 'Пользователь'}: ${m.text}`,
      ),
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
      throw new InternalServerErrorException(`OpenAI request failed: ${text}`);
    }

    const data = (await response.json()) as any;

    let answer = '';

    for (const item of data?.output ?? []) {
      for (const part of item?.content ?? []) {
        if (part?.type === 'output_text' && part?.text) {
          answer += String(part.text);
        }
      }
    }

    if (!answer.trim()) {
      throw new InternalServerErrorException('Empty AI response');
    }

    return {
      reply: answer.trim(),
      model: data?.model ?? this.model,
    };
  }
}
