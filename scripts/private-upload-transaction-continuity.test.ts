import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path: string) => readFileSync(path, 'utf8');

test('R2 put recovery uses one write and exact same-key evidence', () => {
  const provider = read('src/storage/provider/r2.ts');
  const recovery = read('src/storage/upload-put-recovery.ts');
  assert.equal((provider.match(/bucket\.put\(/g) ?? []).length, 1);
  assert.match(provider, /R2_UPLOAD_FILE_ID_METADATA_KEY/);
  assert.match(
    provider,
    /probeObject: \(\) => bucket\.head\(uploadPlan\.r2Key\)/
  );
  assert.match(provider, /if \(recovery !== 'committed'\) throw error/);
  assert.match(recovery, /object\.size === size/);
  assert.match(recovery, /normalizeEvidenceContentType/);
});

test('D1 commit uncertainty precedes bounded object compensation', () => {
  const api = read('src/api/user-files.ts');
  const handler = api.slice(api.indexOf('export const uploadUserFile'));
  const insert = handler.indexOf('db.insert(userFiles).values');
  const recovery = handler.indexOf('recoverUserFileUploadAfterMetadataFailure');
  const response = handler.indexOf('file: buildUserFileClientItem');
  assert.ok(insert >= 0 && recovery > insert && response > recovery);
  assert.match(handler, /persistedRow\?\.r2Key === metadata\.r2Key/);
  assert.match(handler, /deleteObject: \(\) => deleteFile\(metadata\.r2Key\)/);
  const persistence = read('src/storage/upload-persistence.ts');
  assert.match(
    persistence,
    /if \(await probeMetadata\(\)\) return 'persisted'/
  );
  assert.match(persistence, /catch \{[\s\S]*return 'unconfirmed'/);
  assert.equal((persistence.match(/await deleteObject\(\)/g) ?? []).length, 2);
});

test('private success returns safe fields and resolves keys on the server', () => {
  const response = read('src/storage/user-file-response.ts');
  const route = read('src/routes/api/storage/file.ts');
  assert.match(response, /buildUserFileClientSelect/);
  assert.match(response, /buildUserFileClientItem/);
  assert.doesNotMatch(
    response.slice(
      response.indexOf('export type UserFileClientItem'),
      response.indexOf('type UserFileClientItemInput')
    ),
    /r2Key|userId|description/
  );
  assert.match(route, /where\(eq\(userFiles\.id, fileId\)\)/);
  assert.match(
    route,
    /const key = fileId \? resolvedRecord\?\.r2Key : requestedKey/
  );
});

test('transaction continuity preserves downstream source references', () => {
  const api = read('src/api/user-files.ts');
  const integrity = read('src/activities/source-material-integrity.ts');
  assert.match(api, /listUserFileMaterials/);
  assert.match(integrity, /SOURCE_MATERIAL_INTEGRITY_STAGES/);
  assert.match(
    read('src/assignments/public.ts'),
    /buildPublicAssignmentPayload/
  );
});

test('product and catalog register private upload transaction continuity', () => {
  assert.match(
    read('docs/product.md'),
    /private upload transaction continuity chain[\s\S]*30[\s\S]*R2[\s\S]*D1[\s\S]*privacy/i
  );
  assert.match(
    read('tests/e2e/TEST-CATALOG.md'),
    /private-upload-transaction-continuity\.test\.ts[\s\S]*30-stage source-level contract/i
  );
});
