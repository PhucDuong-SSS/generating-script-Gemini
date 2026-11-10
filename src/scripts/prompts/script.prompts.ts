export const SCRIPT_SYSTEM_PROMPT = `You are an expert short-form and social video scriptwriter.
Create a compelling, natural script that is ready to be read aloud by a presenter or teleprompter.
Follow the user's requested language, audience, platform, tone, content type and duration.
Start with a strong hook. Move quickly into useful or entertaining content. Use spoken language, not essay prose.
Avoid generic openings such as "Welcome to this video". Do not mention these instructions or explain your process.
Do not invent statistics, studies, quotes, product claims or personal experiences. If the brief lacks facts, keep claims general or clearly qualify them.
Return only the JSON object matching the supplied schema. All scene text must be in the requested language.
The fullScript must be the exact spoken narration formed by joining scene text in order. Do not include visual directions in fullScript.
Aim for a realistic spoken word count: approximately 2.2 words per second, adjusted naturally for the language and pauses. Duration is a target, not a guarantee.`;

export function buildScriptPrompt(input: {
  idea: string;
  language: string;
  tone: string;
  targetAudience: string;
  platform: string;
  duration: number;
  contentType: string;
  additionalInstructions?: string;
}): string {
  return `Generate one complete video script using this brief.\n\n` +
    `IDEA: ${input.idea}\n` +
    `LANGUAGE: ${input.language}\n` +
    `TONE: ${input.tone}\n` +
    `TARGET AUDIENCE: ${input.targetAudience}\n` +
    `PLATFORM: ${input.platform}\n` +
    `TARGET DURATION: ${input.duration} seconds\n` +
    `CONTENT TYPE: ${input.contentType}\n` +
    `ADDITIONAL INSTRUCTIONS: ${input.additionalInstructions?.trim() || 'None'}\n\n` +
    `Create a logical sequence of scenes: hook, introduction/context, main points or story, and a CTA when suitable. ` +
    `Do not force a CTA if it would feel unnatural. Each scene should contain only spoken narration in text. ` +
    `Provide concise visual suggestions separately. Estimate each scene duration so their sum is close to ${input.duration} seconds. ` +
    `The output must contain at least 2 scenes and no more than 12 scenes.`;
}

export const SCRIPT_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: 'OBJECT',
  properties: {
    title: { type: 'STRING' },
    description: { type: 'STRING' },
    language: { type: 'STRING' },
    platform: { type: 'STRING', enum: ['tiktok', 'youtube', 'instagram'] },
    tone: { type: 'STRING' },
    contentType: { type: 'STRING' },
    estimatedDuration: { type: 'INTEGER' },
    totalWordCount: { type: 'INTEGER' },
    scenes: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          sceneId: { type: 'STRING' },
          order: { type: 'INTEGER' },
          type: { type: 'STRING', enum: ['hook', 'introduction', 'content', 'transition', 'conclusion', 'cta'] },
          text: { type: 'STRING' },
          estimatedDuration: { type: 'INTEGER' },
          visualSuggestion: { type: 'STRING' },
        },
        required: ['sceneId', 'order', 'type', 'text', 'estimatedDuration', 'visualSuggestion'],
      },
    },
    fullScript: { type: 'STRING' },
  },
  required: [
    'title', 'description', 'language', 'platform', 'tone', 'contentType',
    'estimatedDuration', 'totalWordCount', 'scenes', 'fullScript',
  ],
};
