import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { compile } from '@inlang/paraglide-js';
import ts from 'typescript';
import { getParaglideCompilerOptions } from './paraglide-compiler-options';

// Exercise the actual compiler with an isolated project, not checked-in output.
test('locale compiler emits declarations and preserves excluded service routes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'classgamify-typecheck-'));
  const project = join(root, 'project.inlang');
  const outdir = join(root, 'generated');
  await mkdir(project);
  await writeFile(
    join(project, 'settings.json'),
    JSON.stringify({
      baseLocale: 'en',
      locales: ['en', 'zh'],
      modules: [],
    })
  );
  try {
    const options = getParaglideCompilerOptions();
    assert.equal(options.emitTsDeclarations, true);
    assert.deepEqual(options.strategy, ['url', 'cookie', 'baseLocale']);
    await compile({ ...options, project, outdir });
    assert.match(
      await readFile(join(outdir, 'runtime.d.ts'), 'utf8'),
      /Locale/
    );
    assert.ok(await readFile(join(outdir, 'messages.d.ts'), 'utf8'));
    const runtime = await readFile(join(outdir, 'runtime.js'), 'utf8');
    for (const path of [
      '/api/:path(.*)?',
      '/robots.txt',
      '/sitemap.xml',
      '/manifest.json',
    ]) {
      assert.ok(runtime.includes(path), path);
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('strict typecheck includes domain scripts and browser tests after code generation', async () => {
  const configPath = resolve('tsconfig.json');
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  assert.equal(config.error, undefined);
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    process.cwd()
  );
  assert.deepEqual(parsed.errors, []);
  assert.equal(parsed.options.strict, true);
  assert.equal(parsed.options.noUnusedLocals, true);
  for (const path of [
    'scripts/test-domain.ts',
    'tests/e2e/specs/protected-pages.spec.ts',
    'src/server.ts',
    'vite.config.ts',
  ]) {
    assert.ok(parsed.fileNames.includes(resolve(path)), path);
  }
  const pkg = JSON.parse(await readFile('package.json', 'utf8')) as {
    scripts: Record<string, string>;
  };
  assert.equal(
    pkg.scripts.typecheck,
    'pnpm locale:compile && pnpm content:compile && tsc --noEmit --pretty false'
  );
  assert.ok(
    pkg.scripts.predeploy.indexOf('pnpm typecheck') <
      pkg.scripts.predeploy.indexOf('pnpm build')
  );
});
