import { BadGatewayException, Injectable } from '@nestjs/common';
import { GeminiService } from '../gemini/gemini.service';
import { GenerateScriptDto } from './dto/generate-script.dto';
import { buildScriptPrompt, SCRIPT_RESPONSE_SCHEMA, SCRIPT_SYSTEM_PROMPT } from './prompts/script.prompts';

export interface GeneratedScene {
  sceneId: string;
  order: number;
  type: 'hook' | 'introduction' | 'content' | 'transition' | 'conclusion' | 'cta';
  text: string;
  estimatedDuration: number;
  visualSuggestion: string;
}

export interface GeneratedScript {
  title: string;
  description: string;
  language: string;
  platform: string;
  tone: string;
  contentType: string;
  estimatedDuration: number;
  totalWordCount: number;
  scenes: GeneratedScene[];
  fullScript: string;
}

@Injectable()
export class ScriptsService {
  constructor(private readonly gemini: GeminiService) {}

  async generate(dto: GenerateScriptDto) {
    const startedAt = Date.now();
    const prompt = buildScriptPrompt(dto);
    const { data, usage } = await this.gemini.generateJson<GeneratedScript>({
      systemInstruction: SCRIPT_SYSTEM_PROMPT,
      prompt,
      responseJsonSchema: SCRIPT_RESPONSE_SCHEMA,
    });

    this.validateAndNormalize(data, dto);
    const latencyMs = Date.now() - startedAt;
    console.log('[SCRIPT_GENERATION_USAGE]', JSON.stringify({
      provider: 'gemini', model: this.gemini.model, latencyMs, ...usage,
    }));

    return {
      script: data,
      meta: {
        provider: 'gemini',
        model: this.gemini.model,
        latencyMs,
        usage,
        saved: false,
        note: 'Standalone test project: script is returned only and is not persisted to a database.',
      },
    };
  }

  private validateAndNormalize(data: GeneratedScript, dto: GenerateScriptDto): void {
    if (!data || !Array.isArray(data.scenes) || data.scenes.length < 2 || data.scenes.length > 12) {
      throw new BadGatewayException('Generated script has an invalid scenes array. Please retry.');
    }
    data.scenes = data.scenes
      .sort((a, b) => a.order - b.order)
      .map((scene, index) => ({ ...scene, order: index + 1, sceneId: scene.sceneId || `scene_${String(index + 1).padStart(3, '0')}` }));
    data.fullScript = data.scenes.map((scene) => scene.text.trim()).filter(Boolean).join('\n\n');
    data.totalWordCount = data.fullScript.split(/\s+/).filter(Boolean).length;
    data.estimatedDuration = dto.duration;
    data.language = dto.language;
    data.platform = dto.platform;
    data.tone = dto.tone;
    data.contentType = dto.contentType;
    if (!data.title?.trim() || !data.fullScript.trim()) {
      throw new BadGatewayException('Gemini generated an incomplete script. Please retry.');
    }
  }
}
