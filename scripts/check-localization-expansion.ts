import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

type Policy = {
  targetLocales: string[];
  draftLocales: string[];
  englishOnlyKeyPatterns: string[];
  legalMarkdown: string[];
};

type InlangSettings = {
  baseLocale: string;
  locales: string[];
};

const policy = JSON.parse(
  await readFile('project.inlang/localization-policy.json', 'utf8')
) as Policy;
const settings = JSON.parse(
  await readFile('project.inlang/settings.json', 'utf8')
) as InlangSettings;
const english = JSON.parse(
  await readFile('project.inlang/messages/en.json', 'utf8')
) as Record<string, string>;

assert.deepEqual(policy.targetLocales, [
  'en',
  'zh',
  'fr',
  'de',
  'ja',
  'ko',
  'it',
  'es',
  'pt-BR',
  'ar',
]);
assert.deepEqual(policy.draftLocales, policy.targetLocales.slice(2));
assert.equal(settings.baseLocale, 'en');
assert.ok(
  settings.locales.every((locale) => policy.targetLocales.includes(locale)),
  'Enabled locales must be a subset of the ten-language target.'
);
assert.ok(!policy.targetLocales.includes('zh-TW'));
assert.ok(!policy.targetLocales.includes('zh-Hant'));

const legalFiles = (await readdir('content/pages'))
  .filter((file) => /^(cookie|privacy|terms)(\..+)?\.md$/.test(file))
  .sort();
assert.deepEqual(legalFiles, policy.legalMarkdown);

function placeholders(value: string) {
  return [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)]
    .map((match) => match[1])
    .sort();
}

const englishOnlyPatterns = policy.englishOnlyKeyPatterns.map(
  (pattern) => new RegExp(pattern, 'i')
);
const draftsRoot = 'project.inlang/drafts';

try {
  if ((await stat(draftsRoot)).isDirectory()) {
    for (const locale of await readdir(draftsRoot)) {
      assert.ok(
        policy.draftLocales.includes(locale),
        `Unexpected draft locale directory: ${locale}`
      );
      for (const file of await readdir(path.join(draftsRoot, locale))) {
        assert.match(file, /^[a-z0-9-]+\.json$/);
        const namespace = file.slice(0, -'.json'.length);
        const draft = JSON.parse(
          await readFile(path.join(draftsRoot, locale, file), 'utf8')
        ) as Record<string, string>;
        const expectedKeys = Object.keys(english)
          .filter((key) => key.startsWith(`${namespace}_`))
          .sort();
        assert.ok(expectedKeys.length, `Unknown draft namespace: ${namespace}`);
        assert.deepEqual(Object.keys(draft).sort(), expectedKeys);
        for (const key of expectedKeys) {
          assert.ok(draft[key].trim(), `${locale}/${file}:${key} is empty`);
          assert.deepEqual(
            placeholders(draft[key]),
            placeholders(english[key]),
            `${locale}/${file}:${key} placeholders differ`
          );
          if (englishOnlyPatterns.some((pattern) => pattern.test(key))) {
            assert.equal(
              draft[key],
              english[key],
              `${locale}/${file}:${key} must remain English`
            );
          }
        }
      }
    }
  }
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}

console.log(
  `Localization expansion contract OK (${policy.targetLocales.length} target locales, ${policy.draftLocales.length} draft locales, English-only legal Markdown, and ${policy.englishOnlyKeyPatterns.length} sensitive key patterns)`
);
