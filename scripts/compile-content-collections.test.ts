import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';
import { compileContentCollections } from './compile-content-collections';

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'classgamify-content-compile-'));
  await symlink(resolve('node_modules'), join(root, 'node_modules'), 'dir');
  await mkdir(join(root, 'content'));
  await writeFile(join(root, 'package.json'), '{"type":"module"}');
  return root;
}

async function writeConfig(root: string, name: string) {
  const file = join(root, 'content-collections.ts');
  await writeFile(
    file,
    `import { defineCollection, defineConfig } from '@content-collections/core';
import { z } from 'zod';
export default defineConfig({ collections: [defineCollection({
  name: '${name}', directory: 'content', include: '**/*.md',
  schema: z.object({ title: z.string(), date: z.string(), content: z.string() }),
  transform: (doc) => ({ title: doc.title, date: doc.date, slug: doc._meta.path }),
})] });
`
  );
  return file;
}

test('content compiler creates fresh exports and replaces a stale collection index', async () => {
  const root = await fixture();
  try {
    await writeFile(
      join(root, 'content/post.md'),
      '---\ntitle: ClassGamify guide\ndate: 2026-10-09\n---\nArticle body.\n'
    );
    await compileContentCollections(await writeConfig(root, 'blog'));
    const index = join(root, '.content-collections/generated/index.js');
    assert.doesNotMatch(await readFile(index, 'utf8'), /allBlogLinks/u);

    await compileContentCollections(await writeConfig(root, 'blogLink'));
    const generated = await import(pathToFileURL(index).href);
    assert.deepEqual(generated.allBlogLinks, [
      { title: 'ClassGamify guide', date: '2026-10-09', slug: 'post' },
    ]);
    assert.equal(generated.allBlogs, undefined);
    assert.equal('content' in generated.allBlogLinks[0], false);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('content compiler rejects collection validation errors instead of accepting partial output', async () => {
  const root = await fixture();
  try {
    await writeFile(
      join(root, 'content/post.md'),
      '---\ndate: 2026-10-09\n---\n'
    );
    await assert.rejects(
      compileContentCollections(await writeConfig(root, 'blogLink')),
      AggregateError
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
