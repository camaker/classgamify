import { readFile } from 'node:fs/promises';

const JSON_MESSAGE_KEYS = [
  'auth_error_codes',
  'pricing_plans_free_features',
  'pricing_plans_free_limits',
  'pricing_plans_lifetime_features',
  'pricing_plans_lifetime_limits',
  'pricing_plans_pro_features',
  'pricing_plans_pro_limits',
] as const;

type InlangSettings = {
  baseLocale: string;
  locales: string[];
};

async function readMessages(locale: string) {
  const raw = await readFile(`project.inlang/messages/${locale}.json`, 'utf8');
  return JSON.parse(raw) as Record<string, string>;
}

function placeholders(value: string) {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)]
    .map((match) => match[1])
    .sort();
}

const settings = JSON.parse(
  await readFile('project.inlang/settings.json', 'utf8')
) as InlangSettings;
const messagesByLocale = Object.fromEntries(
  await Promise.all(
    settings.locales.map(async (locale) => [locale, await readMessages(locale)])
  )
) as Record<string, Record<string, string>>;
const baseMessages = messagesByLocale[settings.baseLocale];

if (!baseMessages) {
  throw new Error(`Missing base locale messages: ${settings.baseLocale}`);
}

const baseKeys = Object.keys(baseMessages).sort();
const issues: Record<string, Record<string, unknown>> = {};

for (const locale of settings.locales) {
  const messages = messagesByLocale[locale];
  const keys = Object.keys(messages).sort();
  const missingKeys = baseKeys.filter((key) => !(key in messages));
  const extraKeys = keys.filter((key) => !(key in baseMessages));
  const emptyValues = keys.filter((key) => messages[key] === '');
  const placeholderMismatches = baseKeys.filter((key) => {
    if (!(key in messages)) return false;
    return (
      JSON.stringify(placeholders(messages[key])) !==
      JSON.stringify(placeholders(baseMessages[key]))
    );
  });

  if (
    missingKeys.length ||
    extraKeys.length ||
    emptyValues.length ||
    placeholderMismatches.length
  ) {
    issues[locale] = {
      missingKeys,
      extraKeys,
      emptyValues,
      placeholderMismatches,
    };
  }
}

for (const key of JSON_MESSAGE_KEYS) {
  for (const [locale, messages] of Object.entries(messagesByLocale)) {
    try {
      JSON.parse(messages[key] ?? '');
    } catch {
      throw new Error(`${locale}.${key} is not valid JSON`);
    }
  }
}

if (Object.keys(issues).length) {
  console.error(JSON.stringify(issues, null, 2));
  process.exit(1);
}

console.log(
  `Locale keys OK (${baseKeys.length} keys across ${settings.locales.length} locales)`
);

await import('./check-localization-expansion');
