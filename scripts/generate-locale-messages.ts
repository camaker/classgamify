import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = 'project.inlang';
const draftsRoot = path.join(root, 'drafts');
const messagesRoot = path.join(root, 'messages');
const base = JSON.parse(
  await readFile(path.join(messagesRoot, 'en.json'), 'utf8')
) as Record<string, string>;
const locales = ['fr', 'de', 'ja', 'ko', 'it', 'es', 'pt-BR', 'ar'];

for (const locale of locales) {
  const merged = { ...base };
  for (const file of await readdir(path.join(draftsRoot, locale))) {
    if (!file.endsWith('.json')) continue;
    const draft = JSON.parse(
      await readFile(path.join(draftsRoot, locale, file), 'utf8')
    ) as Record<string, string>;
    for (const [key, value] of Object.entries(draft)) {
      if (!(key in base))
        throw new Error(`${locale}/${file}: unknown key ${key}`);
      merged[key] = value;
    }
  }
  await writeFile(
    path.join(messagesRoot, `${locale}.json`),
    `${JSON.stringify(merged, null, 2)}\n`,
    'utf8'
  );
}
