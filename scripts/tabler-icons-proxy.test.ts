import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import test from 'node:test';
import * as ts from 'typescript';

const SOURCE_ROOTS = ['src'];
const PROXY_FILE = 'src/lib/tabler-icons.ts';
const EXCLUDED_DIRS = new Set(['src/locale/paraglide']);
const TABLER_IMPORT = '@tabler/icons-react';
const TYPE_EXPORTS = new Set(['Icon', 'IconNode', 'IconProps', 'TablerIcon']);
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);

async function* sourceFiles(dir: string): AsyncGenerator<string> {
  if (EXCLUDED_DIRS.has(dir.replaceAll('\\', '/'))) {
    return;
  }

  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      yield* sourceFiles(path);
      continue;
    }

    if (entry.isFile() && SOURCE_EXTENSIONS.has(extname(entry.name))) {
      yield path;
    }
  }
}

function collectTablerImports(source: string) {
  const names = new Set<string>();
  const sourceFile = ts.createSourceFile(
    'source.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  for (const node of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(node) ||
      !ts.isStringLiteral(node.moduleSpecifier) ||
      node.moduleSpecifier.text !== TABLER_IMPORT
    ) {
      continue;
    }

    const namedBindings = node.importClause?.namedBindings;

    if (!namedBindings || !ts.isNamedImports(namedBindings)) {
      continue;
    }

    for (const element of namedBindings.elements) {
      if (node.importClause?.isTypeOnly || element.isTypeOnly) {
        continue;
      }

      const name = (element.propertyName ?? element.name).text;

      if (!TYPE_EXPORTS.has(name)) {
        names.add(name);
      }
    }
  }

  return names;
}

function collectProxyExports(source: string) {
  const names = new Set<string>();
  const sourceFile = ts.createSourceFile(
    PROXY_FILE,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  );

  for (const node of sourceFile.statements) {
    const exportClause = ts.isExportDeclaration(node)
      ? node.exportClause
      : undefined;

    if (
      !ts.isExportDeclaration(node) ||
      !ts.isStringLiteral(node.moduleSpecifier) ||
      !node.moduleSpecifier.text.startsWith(
        '@tabler/icons-react/dist/esm/icons/'
      ) ||
      !exportClause ||
      !ts.isNamedExports(exportClause)
    ) {
      continue;
    }

    for (const element of exportClause.elements) {
      names.add(element.name.text);
    }
  }

  return names;
}

test('Tabler icon proxy exactly matches used icons', async () => {
  await stat(PROXY_FILE);
  const proxySource = await readFile(PROXY_FILE, 'utf8');
  const proxyIcons = collectProxyExports(proxySource);
  const usedIcons = new Set<string>();

  for (const root of SOURCE_ROOTS) {
    for await (const file of sourceFiles(root)) {
      if (file.replaceAll('\\', '/') === PROXY_FILE) {
        continue;
      }

      const source = await readFile(file, 'utf8');

      for (const icon of collectTablerImports(source)) {
        usedIcons.add(icon);
      }
    }
  }

  assert.deepEqual(
    [...proxyIcons].sort(),
    [...usedIcons].sort(),
    'src/lib/tabler-icons.ts must only export currently used Tabler icons'
  );
});
