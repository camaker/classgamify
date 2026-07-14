import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  buildUserFileClientItem,
  buildUserFileClientSelect,
  buildUserFileIdAccessPath,
  isValidUserFileAccessId,
  USER_FILE_RESPONSE_BOUNDARY_STAGES,
} from '@/storage/user-file-response';

const API_SOURCE = readFileSync('src/api/user-files.ts', 'utf8');
const ROUTE_SOURCE = readFileSync('src/routes/api/storage/file.ts', 'utf8');
const TABLE_SOURCE = readFileSync(
  'src/components/settings/files/files-table.tsx',
  'utf8'
);
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const STORAGE_DOC_SOURCE = readFileSync('docs/storage.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('user-file response boundary exposes 30 stable stages', () => {
  assert.equal(USER_FILE_RESPONSE_BOUNDARY_STAGES.length, 30);
  assert.equal(
    new Set(USER_FILE_RESPONSE_BOUNDARY_STAGES.map((stage) => stage.id)).size,
    30
  );
  assert.deepEqual(countByLayer(), {
    domain: 5,
    privacy: 5,
    response: 10,
    server: 10,
  });
});

test('client select contains only stable display and action fields', () => {
  assert.deepEqual(Object.keys(buildUserFileClientSelect()).sort(), [
    'contentType',
    'createdAt',
    'filename',
    'id',
    'isPublic',
    'originalName',
    'size',
  ]);
});

test('client item reconstruction drops storage and ownership extras', () => {
  const createdAt = new Date('2026-07-14T00:00:00.000Z');
  const item = buildUserFileClientItem({
    contentType: 'application/pdf',
    createdAt,
    filename: 'stored.pdf',
    id: 'file-1',
    isPublic: false,
    originalName: 'Worksheet.pdf',
    size: 512,
    r2Key: 'userfiles/teacher-1/private.pdf',
    userId: 'teacher-1',
    description: 'private note',
  } as Parameters<typeof buildUserFileClientItem>[0] & {
    description: string;
    r2Key: string;
    userId: string;
  });

  assert.deepEqual(item, {
    contentType: 'application/pdf',
    createdAt,
    filename: 'stored.pdf',
    id: 'file-1',
    isPublic: false,
    originalName: 'Worksheet.pdf',
    size: 512,
  });
  assert.equal('r2Key' in item, false);
  assert.equal('userId' in item, false);
  assert.equal('description' in item, false);
});

test('file-id access paths encode stable ids without storage keys', () => {
  assert.equal(
    buildUserFileIdAccessPath('file_1-safe'),
    '/api/storage/file?id=file_1-safe'
  );
  assert.equal(
    buildUserFileIdAccessPath('file with space'),
    '/api/storage/file?id=file%20with%20space'
  );
});

test('file access ids reject whitespace, separators, controls, and excess length', () => {
  assert.equal(isValidUserFileAccessId('file_1-safe'), true);
  assert.equal(isValidUserFileAccessId('9d15a03e-uuid-like'), true);
  for (const invalid of [
    null,
    '',
    ' file-1',
    'file/1',
    'file?1',
    'file\n1',
    'avatars/logo.png',
    'userfiles/teacher-1/private.pdf',
    'x'.repeat(129),
  ]) {
    assert.equal(isValidUserFileAccessId(invalid), false);
  }
});

test('full list query uses the explicit safe select', () => {
  const source = sourceSlice(
    API_SOURCE,
    'export const listUserFiles',
    'export const listUserFileMaterials'
  );
  assert.match(source, /select\(buildUserFileClientSelect\(\)\)/);
  assert.doesNotMatch(
    source,
    /\.select\(\)|r2Key:|userId:|description:|updatedAt:/
  );
});

test('private and public upload responses are separately sanitized', () => {
  const source = API_SOURCE.slice(
    API_SOURCE.indexOf('export const uploadUserFile')
  );
  assert.match(
    source,
    /if \(!publicFolder\)[\s\S]*return \{[\s\S]*file: buildUserFileClientItem\(\{[\s\S]*contentType: metadata\.contentType[\s\S]*id: metadata\.id[\s\S]*size: metadata\.size[\s\S]*return \{ url: result\.url \}/
  );
  const publicResponse = source.match(/return \{ url: result\.url \};/)?.[0];
  assert.equal(publicResponse, 'return { url: result.url };');
});

test('ID route resolves private keys only on the server', () => {
  assert.match(
    ROUTE_SOURCE,
    /const fileId = url\.searchParams\.get\('id'\)[\s\S]*isValidUserFileAccessId\(fileId\)[\s\S]*r2Key: userFiles\.r2Key[\s\S]*where\(eq\(userFiles\.id, fileId\)\)/
  );
  assert.match(
    ROUTE_SOURCE,
    /const key = fileId \? resolvedRecord\?\.r2Key : requestedKey/
  );
  assert.doesNotMatch(
    ROUTE_SOURCE,
    /resolvedRecord\?\.r2Key \?\? requestedKey/
  );
});

test('settings table uses safe client items and ID access links', () => {
  assert.match(
    TABLE_SOURCE,
    /type UserFileClientItem[\s\S]*data: UserFileClientItem\[\][\s\S]*ColumnDef<UserFileClientItem>/
  );
  assert.match(
    TABLE_SOURCE,
    /function toDate\([\s\S]*value: Date \| number \| string \| undefined \| null[\s\S]*\): Date \| null/
  );
  assert.match(TABLE_SOURCE, /buildUserFileIdAccessPath\(row\.original\.id\)/);
  assert.doesNotMatch(TABLE_SOURCE, /UserFiles|\.r2Key|getFileAccessUrl/);
});

test('product and storage docs define the server-only private-key boundary', () => {
  assert.match(
    PRODUCT_SOURCE,
    /Teacher-facing file responses[\s\S]*private R2 keys server-only[\s\S]*\/api\/storage\/file\?id=[\s\S]*Public shared-folder uploads/
  );
  assert.match(
    STORAGE_DOC_SOURCE,
    /Teacher-managed file[\s\S]*\/api\/storage\/file\?id=[\s\S]*resolves private R2 keys on the server/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /user-file-response-boundary-contract\.test\.ts/
  );
  assert.doesNotMatch(
    JSON.stringify(USER_FILE_RESPONSE_BOUNDARY_STAGES),
    /teacher-1|private\.pdf|studentName/
  );
});

function sourceSlice(source: string, start: string, end: string) {
  return source.slice(source.indexOf(start), source.indexOf(end));
}

function countByLayer() {
  return Object.fromEntries(
    Array.from(
      USER_FILE_RESPONSE_BOUNDARY_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
