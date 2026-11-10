# NestJS Gemini Script Generator

Standalone test API for generating video scripts with NestJS + Gemini. The prompt-building approach is informed by the script-generation workflow in [MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo), but this project is an independent TypeScript implementation. It does not include video rendering, stock-footage search, TTS, subtitles or FFmpeg.

## Requirements

- Node.js 22 or later (recommended)
- npm
- Gemini API key from https://aistudio.google.com/apikey

## 1. Install

```bash
unzip nestjs-gemini-script-generator.zip
cd nestjs-gemini-script-generator
npm install
```

## 2. Configure Gemini

```bash
cp .env.example .env
nano .env
```

Set your key:

```env
GEMINI_API_KEY=YOUR_REAL_API_KEY
GEMINI_MODEL=gemini-2.5-flash
PORT=3000
GEMINI_MAX_OUTPUT_TOKENS=4096
GEMINI_TEMPERATURE=0.7
```

Use a model enabled for your Google AI Studio project. Keep `.env` private; never commit it or put the key in a mobile app.

## 3. Start the API

```bash
npm run start:dev
```

Expected startup message:

```text
Script Generator API listening on http://localhost:3000/api/v1
```

Health check:

```bash
curl http://localhost:3000/api/v1/health
```

## 4. Test script generation

```bash
curl -X POST http://localhost:3000/api/v1/scripts/generate \
  -H 'Content-Type: application/json' \
  -d '{
    "idea": "5 practical ways AI can save time at work",
    "language": "English",
    "tone": "friendly",
    "targetAudience": "Office workers who are new to AI",
    "platform": "tiktok",
    "duration": 60,
    "contentType": "educational",
    "additionalInstructions": "Use simple spoken English, give practical examples, avoid exaggerated claims, and end with a natural CTA."
  }'
```

Supported values:

- `tone`: `professional`, `friendly`, `funny`, `storytelling`
- `platform`: `tiktok`, `youtube`, `instagram`
- `duration`: `30`, `60`, `90`, `180` (seconds)
- `contentType`: `educational`, `review`, `marketing`, `story`
- `language`: free text, e.g. `English`, `Vietnamese`, `Japanese`

The API returns `title`, `description`, `scenes`, `fullScript`, word count, estimated duration, model, latency and token usage (when Gemini returns usage metadata).

## 5. Test using Postman

- Method: `POST`
- URL: `http://localhost:3000/api/v1/scripts/generate`
- Header: `Content-Type: application/json`
- Body: `raw` → `JSON`, use the JSON example above.

## 6. Test from another machine / NestJS backend

If this service runs on a VPS, call its private network address, for example:

```ts
const response = await fetch('http://YOUR_SERVER_PRIVATE_IP:3000/api/v1/scripts/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const result = await response.json();
```

For production, put it behind HTTPS/reverse proxy and add authentication, rate limiting and request logging before exposing it publicly.

## Notes / current scope

- This test project does not save scripts to MongoDB; it only returns generated output.
- It does not include user authentication or quota/billing logic.
- `estimatedDuration` is a target estimate. Actual speaking duration depends on language, delivery speed and pauses.
- Gemini structured output is requested, but the server still parses and validates the returned JSON.
- API errors are sanitized; check server logs for the underlying Gemini error. A 503 usually indicates quota/rate limiting. A 502 indicates an upstream Gemini or response problem.

## API contract

`POST /api/v1/scripts/generate`

```json
{
  "idea": "...",
  "language": "English",
  "tone": "friendly",
  "targetAudience": "...",
  "platform": "tiktok",
  "duration": 60,
  "contentType": "educational",
  "additionalInstructions": "..."
}
```
