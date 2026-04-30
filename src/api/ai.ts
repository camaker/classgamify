import { generateImage } from '@tanstack/ai';
import { falImage } from '@tanstack/ai-fal';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { serverEnv } from '@/env/server';

/**
 * AI demo server functions.
 *
 * - Text summarization: Cloudflare Workers AI (`@cf/facebook/bart-large-cnn`)
 *   via the plain Workers AI REST API (no extra adapter needed).
 *   Endpoint: https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/{model}
 *
 * - Translation: Cloudflare Workers AI (`@cf/meta/m2m100-1.2b`).
 *
 * - Tagline generation (Chat): Cloudflare Workers AI
 *   (`@cf/meta/llama-3.1-8b-instruct`) — system + user messages.
 *
 * - Image generation: fal.ai (`fal-ai/flux/schnell`) via the
 *   `@tanstack/ai-fal` adapter.
 *
 * - Text-to-Speech: Cloudflare Workers AI (`@cf/deepgram/aura-1`) — returns
 *   the MP3 audio inline as a base64 data URL.
 *
 * Required env (Worker secrets):
 * - CLOUDFLARE_ACCOUNT_ID  (for Workers AI calls)
 * - CLOUDFLARE_API_TOKEN   Workers AI API token (for Workers AI calls)
 * - FAL_KEY                fal.ai API key (for image generation)
 */

const SUPPORTED_LANGUAGES = [
  'english',
  'chinese',
  'french',
  'german',
  'spanish',
  'japanese',
  'korean',
  'russian',
  'portuguese',
  'arabic',
] as const;
const languageEnum = z.enum(SUPPORTED_LANGUAGES);

const summarizationSchema = z.object({
  text: z
    .string()
    .min(50, 'Please provide at least 50 characters to summarize.')
    .max(500, 'Text is too long, please keep it under 500 characters.'),
});

const translationSchema = z
  .object({
    text: z
      .string()
      .min(1, 'Please provide some text to translate.')
      .max(1000, 'Text is too long, please keep it under 1000 characters.'),
    sourceLang: languageEnum,
    targetLang: languageEnum,
  })
  .refine((value) => value.sourceLang !== value.targetLang, {
    message: 'Source and target languages must be different.',
    path: ['targetLang'],
  });

const taglineSchema = z.object({
  product: z
    .string()
    .min(10, 'Please describe your product in at least 10 characters.')
    .max(400, 'Description is too long, please keep it under 400 characters.'),
});

const imageGenerationSchema = z.object({
  prompt: z
    .string()
    .min(10, 'Prompt is too short.')
    .max(500, 'Prompt is too long, please keep it under 500 characters.'),
});

const TTS_SPEAKERS = [
  'angus',
  'asteria',
  'arcas',
  'orion',
  'orpheus',
  'athena',
  'luna',
  'zeus',
  'perseus',
  'helios',
  'hera',
  'stella',
] as const;

const ttsSchema = z.object({
  text: z
    .string()
    .min(1, 'Please provide some text to synthesize.')
    .max(1000, 'Text is too long, please keep it under 1000 characters.'),
  speaker: z.enum(TTS_SPEAKERS),
});

/**
 * Helper: invoke the Cloudflare Workers AI REST endpoint for a given model.
 * Returns the parsed `result` object on success, throws on any error.
 */
async function runWorkersAi<TResult>(
  model: string,
  body: Record<string, unknown>
): Promise<TResult> {
  const accountId = serverEnv.CLOUDFLARE_ACCOUNT_ID;
  const apiKey = serverEnv.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiKey) {
    throw new Error(
      'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN env.'
    );
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `Workers AI request failed (${response.status}): ${errBody.slice(0, 200)}`
    );
  }

  const payload = (await response.json()) as {
    success?: boolean;
    result?: TResult;
    errors?: Array<{ message?: string }>;
  };

  if (!payload.success || !payload.result) {
    const message =
      payload.errors?.[0]?.message ?? 'Empty response from Workers AI.';
    throw new Error(`Workers AI error: ${message}`);
  }

  return payload.result;
}

/**
 * Summarize a long piece of text using Cloudflare Workers AI BART CNN
 * via the Workers AI REST API.
 */
export const summarizeText = createServerFn({ method: 'POST' })
  .inputValidator(summarizationSchema)
  .handler(async ({ data }) => {
    const result = await runWorkersAi<{ summary?: string }>(
      '@cf/facebook/bart-large-cnn',
      { input_text: data.text }
    );

    if (!result.summary) {
      throw new Error('Summarization returned an empty response.');
    }

    return { summary: result.summary };
  });

/**
 * Translate text between languages using Cloudflare Workers AI
 * `@cf/meta/m2m100-1.2b` (Many-to-Many multilingual translation).
 */
export const translateText = createServerFn({ method: 'POST' })
  .inputValidator(translationSchema)
  .handler(async ({ data }) => {
    const result = await runWorkersAi<{ translated_text?: string }>(
      '@cf/meta/m2m100-1.2b',
      {
        text: data.text,
        source_lang: data.sourceLang,
        target_lang: data.targetLang,
      }
    );

    if (!result.translated_text) {
      throw new Error('Translation returned an empty response.');
    }

    return { translatedText: result.translated_text };
  });

/**
 * Generate 5 SaaS taglines from a short product description using
 * Cloudflare Workers AI `@cf/meta/llama-3.1-8b-instruct` (chat model).
 *
 * Demonstrates a single-shot chat call with a system prompt that constrains
 * the output to a numbered list — no follow-up turns are kept.
 */
export const generateTaglines = createServerFn({ method: 'POST' })
  .inputValidator(taglineSchema)
  .handler(async ({ data }) => {
    const result = await runWorkersAi<{ response?: string }>(
      '@cf/meta/llama-3.1-8b-instruct',
      {
        messages: [
          {
            role: 'system',
            content:
              'You are a creative copywriter for SaaS products. Write exactly 5 short, punchy taglines (max 8 words each) for the product the user describes. Return them as a numbered list (1. ... 2. ...). Do not add any introduction, explanation, or trailing notes — only the 5 lines.',
          },
          {
            role: 'user',
            content: `Product description: ${data.product}`,
          },
        ],
        max_tokens: 300,
        temperature: 0.85,
      }
    );

    if (!result.response) {
      throw new Error('Tagline generation returned an empty response.');
    }

    const taglines = parseTaglines(result.response);
    if (taglines.length === 0) {
      throw new Error('Could not parse taglines from model response.');
    }

    return { taglines };
  });

/**
 * Extract numbered taglines from a model's free-form response.
 * Tolerates "1.", "1)", "- ", and "* " bullets, plus surrounding markdown.
 */
function parseTaglines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(\d+[.)]|[-*])\s*/, '').trim())
    .map((line) => line.replace(/^["“'']|["”'']$/g, '').trim())
    .filter((line) => line.length > 0 && line.length <= 120)
    .slice(0, 5);
}

/**
 * Generate an image from a text prompt using fal.ai (Flux Schnell).
 * Returns the hosted image URL produced by fal.
 */
export const generateAiImage = createServerFn({ method: 'POST' })
  .inputValidator(imageGenerationSchema)
  .handler(async ({ data }) => {
    const apiKey = serverEnv.FAL_KEY;
    if (!apiKey) {
      throw new Error(
        'Missing FAL_KEY env. Set it as a Worker secret to use fal.ai.'
      );
    }

    const adapter = falImage('fal-ai/flux/schnell', { apiKey });

    const result = await generateImage({ adapter, prompt: data.prompt });

    const image = result.images?.[0];
    const imageUrl = image?.url;
    if (!imageUrl) {
      throw new Error('Image generation failed: empty response.');
    }

    return { imageUrl };
  });

/**
 * Synthesize speech from text using Cloudflare Workers AI Deepgram Aura
 * (`@cf/deepgram/aura-1`). Unlike the JSON-based models above, this endpoint
 * returns raw MP3 bytes (`Content-Type: audio/mpeg`), so we base64-encode
 * them and return a data URL the browser can feed straight to `<audio>`.
 */
export const synthesizeSpeech = createServerFn({ method: 'POST' })
  .inputValidator(ttsSchema)
  .handler(async ({ data }) => {
    const accountId = serverEnv.CLOUDFLARE_ACCOUNT_ID;
    const apiKey = serverEnv.CLOUDFLARE_API_TOKEN;
    if (!accountId || !apiKey) {
      throw new Error(
        'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN env.'
      );
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/deepgram/aura-1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: data.text, speaker: data.speaker }),
      }
    );

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(
        `TTS request failed (${response.status}): ${errBody.slice(0, 200)}`
      );
    }

    const contentType = response.headers.get('content-type') ?? 'audio/mpeg';
    const buffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);

    return {
      audioUrl: `data:${contentType};base64,${base64}`,
      bytes: buffer.byteLength,
    };
  });

/**
 * Convert an ArrayBuffer to base64 in chunks. Avoids the ~64k argument
 * limit of `String.fromCharCode(...bytes)` on realistic audio payloads.
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
