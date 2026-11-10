import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class GeminiService {
  private client?: GoogleGenAI;

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is missing. Add it to your .env file.',
      );
    }
    if (!this.client) this.client = new GoogleGenAI({ apiKey });
    return this.client;
  }

  get model(): string {
    return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  async generateJson<T>(args: {
    systemInstruction: string;
    prompt: string;
    responseJsonSchema: Record<string, unknown>;
  }): Promise<{ data: T; usage: Record<string, number | undefined> }> {
    const temperature = Number(process.env.GEMINI_TEMPERATURE ?? 0.7);
    const maxOutputTokens = Number(process.env.GEMINI_MAX_OUTPUT_TOKENS ?? 4096);

    try {
      const response = await this.getClient().models.generateContent({
        model: this.model,
        contents: args.prompt,
        config: {
          systemInstruction: args.systemInstruction,
          temperature,
          maxOutputTokens,
          responseMimeType: 'application/json',
          responseSchema: args.responseJsonSchema as any,
        },
      });

      const text = response.text?.trim();
      if (!text) {
        throw new BadGatewayException('Gemini returned an empty response. Please retry.');
      }

      let data: T;
      try {
        data = JSON.parse(text) as T;
      } catch {
        throw new BadGatewayException('Gemini returned invalid JSON. Please retry.');
      }

      const metadata = response.usageMetadata;
      return {
        data,
        usage: {
          promptTokenCount: metadata?.promptTokenCount,
          candidatesTokenCount: metadata?.candidatesTokenCount,
          totalTokenCount: metadata?.totalTokenCount,
        },
      };
    } catch (error) {
      if (error instanceof BadGatewayException || error instanceof InternalServerErrorException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown Gemini error';
      if (/429|quota|resource.exhausted|rate.limit/i.test(message)) {
        throw new ServiceUnavailableException(
          'Gemini quota or rate limit reached. Check your Google AI Studio quota and retry later.',
        );
      }
      console.error(`[GEMINI_ERROR] ${message}`);
      throw new BadGatewayException('Gemini request failed. Check API key, model and network configuration.');
    }
  }
}
