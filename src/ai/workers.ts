import { serverEnv } from '@/env/server';

export function hasWorkersAiCredentials() {
  return Boolean(
    serverEnv.CLOUDFLARE_ACCOUNT_ID && serverEnv.CLOUDFLARE_API_TOKEN
  );
}

/**
 * Invoke the Cloudflare Workers AI REST endpoint for a given model.
 * Returns the parsed `result` object on success, throws on any error.
 */
export async function runWorkersAi<TResult>(
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
      body: JSON.stringify(body),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    }
  );

  if (!response.ok) {
    const errBody = await response.text().catch(() => '');
    throw new Error(
      `Workers AI request failed (${response.status}): ${errBody.slice(0, 200)}`
    );
  }

  const payload = (await response.json()) as {
    errors?: Array<{ message?: string }>;
    result?: TResult;
    success?: boolean;
  };

  if (!payload.success || !payload.result) {
    const message =
      payload.errors?.[0]?.message ?? 'Empty response from Workers AI.';
    throw new Error(`Workers AI error: ${message}`);
  }

  return payload.result;
}
