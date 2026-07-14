import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  R2_UPLOAD_FILE_ID_METADATA_KEY,
  R2_UPLOAD_PUT_RECOVERY_STAGES,
  recoverR2UploadPutAfterFailure,
} from '@/storage/upload-put-recovery';

const PROVIDER_SOURCE = readFileSync('src/storage/provider/r2.ts', 'utf8');
const TYPES_SOURCE = readFileSync('src/storage/types.ts', 'utf8');
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const STORAGE_DOC_SOURCE = readFileSync('docs/storage.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');

test('R2 ambiguous put recovery exposes 30 stable stages', () => {
  assert.equal(R2_UPLOAD_PUT_RECOVERY_STAGES.length, 30);
  assert.equal(
    new Set(R2_UPLOAD_PUT_RECOVERY_STAGES.map((stage) => stage.id)).size,
    30
  );
  assert.deepEqual(countByLayer(), {
    domain: 6,
    evidence: 10,
    privacy: 4,
    provider: 10,
  });
});

test('exact marker, size, and content type recover a committed put', async () => {
  const result = await recoverR2UploadPutAfterFailure({
    contentType: 'application/pdf',
    fileId: 'file-current',
    probeObject: async () => ({
      customMetadata: {
        [R2_UPLOAD_FILE_ID_METADATA_KEY]: 'file-current',
      },
      httpMetadata: { contentType: 'application/pdf' },
      size: 512,
    }),
    size: 512,
  });

  assert.equal(result, 'committed');
});

test('content type evidence is compared canonically', async () => {
  const result = await recoverR2UploadPutAfterFailure({
    contentType: ' Audio/MPEG; Charset=UTF-8 ',
    fileId: 'file-current',
    probeObject: async () => ({
      customMetadata: {
        [R2_UPLOAD_FILE_ID_METADATA_KEY]: 'file-current',
      },
      httpMetadata: { contentType: 'audio/mpeg; charset=utf-8' },
      size: 128,
    }),
    size: 128,
  });

  assert.equal(result, 'committed');
});

test('missing object preserves upload failure', async () => {
  assert.equal(
    await recoverR2UploadPutAfterFailure({
      contentType: 'application/pdf',
      fileId: 'file-current',
      probeObject: async () => null,
      size: 512,
    }),
    'missing'
  );
});

test('different upload marker rejects otherwise matching evidence', async () => {
  assert.equal(
    await recoverR2UploadPutAfterFailure({
      contentType: 'application/pdf',
      fileId: 'file-current',
      probeObject: async () => ({
        customMetadata: {
          [R2_UPLOAD_FILE_ID_METADATA_KEY]: 'file-other',
        },
        httpMetadata: { contentType: 'application/pdf' },
        size: 512,
      }),
      size: 512,
    }),
    'mismatched'
  );
});

test('different size rejects otherwise matching evidence', async () => {
  assert.equal(
    await recoverR2UploadPutAfterFailure({
      contentType: 'application/pdf',
      fileId: 'file-current',
      probeObject: async () => ({
        customMetadata: {
          [R2_UPLOAD_FILE_ID_METADATA_KEY]: 'file-current',
        },
        httpMetadata: { contentType: 'application/pdf' },
        size: 511,
      }),
      size: 512,
    }),
    'mismatched'
  );
});

test('different content type rejects otherwise matching evidence', async () => {
  assert.equal(
    await recoverR2UploadPutAfterFailure({
      contentType: 'application/pdf',
      fileId: 'file-current',
      probeObject: async () => ({
        customMetadata: {
          [R2_UPLOAD_FILE_ID_METADATA_KEY]: 'file-current',
        },
        httpMetadata: { contentType: 'text/plain' },
        size: 512,
      }),
      size: 512,
    }),
    'mismatched'
  );
});

test('failed head probe remains unconfirmed', async () => {
  assert.equal(
    await recoverR2UploadPutAfterFailure({
      contentType: 'application/pdf',
      fileId: 'file-current',
      probeObject: async () => {
        throw new Error('R2 head unavailable');
      },
      size: 512,
    }),
    'unconfirmed'
  );
});

test('provider writes evidence once and rethrows non-committed put errors', () => {
  assert.equal((PROVIDER_SOURCE.match(/bucket\.put\(/g) ?? []).length, 1);
  assert.match(
    PROVIDER_SOURCE,
    /bucket\.put\(uploadPlan\.r2Key, file, \{[\s\S]*customMetadata: \{ \[R2_UPLOAD_FILE_ID_METADATA_KEY\]: fileId \}[\s\S]*httpMetadata: \{ contentType \}/
  );
  assert.match(
    PROVIDER_SOURCE,
    /catch \(error\) \{[\s\S]*recoverR2UploadPutAfterFailure\(\{[\s\S]*probeObject: \(\) => bucket\.head\(uploadPlan\.r2Key\)[\s\S]*if \(recovery !== 'committed'\) throw error;[\s\S]*const result: UploadFileResult/
  );
  assert.match(
    TYPES_SOURCE,
    /head\(key: string\): Promise<\{[\s\S]*size\?: number;[\s\S]*httpMetadata\?: \{ contentType\?: string \};[\s\S]*customMetadata\?: Record<string, string>/
  );
});

test('product and storage docs keep recovery evidence private and bounded', () => {
  assert.match(
    PRODUCT_SOURCE,
    /R2 upload providers[\s\S]*ambiguous `put` response[\s\S]*file id[\s\S]*byte size[\s\S]*normalized content type[\s\S]*never issues a blind second `put`/
  );
  assert.match(
    STORAGE_DOC_SOURCE,
    /server-generated file id in R2 custom metadata[\s\S]*exact-key `head`[\s\S]*marker, byte size[\s\S]*never retries `put`/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /r2-upload-put-recovery-contract\.test\.ts/
  );
  assert.doesNotMatch(
    JSON.stringify(R2_UPLOAD_PUT_RECOVERY_STAGES),
    /file-current|teacher-1|worksheet\.pdf|studentName/
  );
});

function countByLayer() {
  return Object.fromEntries(
    Array.from(
      R2_UPLOAD_PUT_RECOVERY_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
