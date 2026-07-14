import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  cleanupUploadedObjectAfterMetadataFailure,
  recoverUserFileUploadAfterMetadataFailure,
  USER_FILE_UPLOAD_PERSISTENCE_STAGES,
} from '@/storage/upload-persistence';

const API_SOURCE = readFileSync('src/api/user-files.ts', 'utf8');
const PROVIDER_SOURCE = readFileSync('src/storage/provider/r2.ts', 'utf8');
const PRODUCT_SOURCE = readFileSync('docs/product.md', 'utf8');
const STORAGE_DOC_SOURCE = readFileSync('docs/storage.md', 'utf8');
const TEST_CATALOG_SOURCE = readFileSync('tests/e2e/TEST-CATALOG.md', 'utf8');
const EN_MESSAGES_SOURCE = readFileSync(
  'project.inlang/messages/en.json',
  'utf8'
);
const ZH_MESSAGES_SOURCE = readFileSync(
  'project.inlang/messages/zh.json',
  'utf8'
);

test('private upload persistence exposes 30 stable stages', () => {
  assert.equal(USER_FILE_UPLOAD_PERSISTENCE_STAGES.length, 30);
  assert.equal(
    new Set(USER_FILE_UPLOAD_PERSISTENCE_STAGES.map((stage) => stage.id)).size,
    30
  );
  assert.deepEqual(countByLayer(), {
    domain: 8,
    privacy: 4,
    server: 10,
    storage: 8,
  });
});

test('first cleanup delete succeeds without probing or retrying', async () => {
  let deletes = 0;
  let probes = 0;
  const result = await cleanupUploadedObjectAfterMetadataFailure({
    deleteObject: async () => {
      deletes += 1;
    },
    probeObject: async () => {
      probes += 1;
      return null;
    },
  });

  assert.equal(result, 'cleaned');
  assert.equal(deletes, 1);
  assert.equal(probes, 0);
});

test('failed delete with confirmed absence completes cleanup', async () => {
  let deletes = 0;
  let probes = 0;
  const result = await cleanupUploadedObjectAfterMetadataFailure({
    deleteObject: async () => {
      deletes += 1;
      throw new Error('delete response lost');
    },
    probeObject: async () => {
      probes += 1;
      return null;
    },
  });

  assert.equal(result, 'cleaned');
  assert.equal(deletes, 1);
  assert.equal(probes, 1);
});

test('confirmed retained object receives exactly one successful retry', async () => {
  let deletes = 0;
  const result = await cleanupUploadedObjectAfterMetadataFailure({
    deleteObject: async () => {
      deletes += 1;
      if (deletes === 1) throw new Error('temporary delete failure');
    },
    probeObject: async () => ({ size: 10 }),
  });

  assert.equal(result, 'cleaned');
  assert.equal(deletes, 2);
});

test('second delete failure reports a retained object without more retries', async () => {
  let deletes = 0;
  const result = await cleanupUploadedObjectAfterMetadataFailure({
    deleteObject: async () => {
      deletes += 1;
      throw new Error('R2 unavailable');
    },
    probeObject: async () => ({ size: 10 }),
  });

  assert.equal(result, 'retained');
  assert.equal(deletes, 2);
});

test('failed presence probe reports unconfirmed cleanup without retry', async () => {
  let deletes = 0;
  const result = await cleanupUploadedObjectAfterMetadataFailure({
    deleteObject: async () => {
      deletes += 1;
      throw new Error('R2 unavailable');
    },
    probeObject: async () => {
      throw new Error('R2 head unavailable');
    },
  });

  assert.equal(result, 'unconfirmed');
  assert.equal(deletes, 1);
});

test('committed metadata recovery preserves the uploaded object', async () => {
  let deletes = 0;
  let objectProbes = 0;
  const result = await recoverUserFileUploadAfterMetadataFailure({
    deleteObject: async () => {
      deletes += 1;
    },
    probeMetadata: async () => true,
    probeObject: async () => {
      objectProbes += 1;
      return null;
    },
  });

  assert.equal(result, 'persisted');
  assert.equal(deletes, 0);
  assert.equal(objectProbes, 0);
});

test('confirmed missing metadata starts object compensation', async () => {
  let deletes = 0;
  const result = await recoverUserFileUploadAfterMetadataFailure({
    deleteObject: async () => {
      deletes += 1;
    },
    probeMetadata: async () => false,
    probeObject: async () => null,
  });

  assert.equal(result, 'cleaned');
  assert.equal(deletes, 1);
});

test('unknown metadata commit state never deletes the uploaded object', async () => {
  let deletes = 0;
  const result = await recoverUserFileUploadAfterMetadataFailure({
    deleteObject: async () => {
      deletes += 1;
    },
    probeMetadata: async () => {
      throw new Error('D1 unavailable');
    },
    probeObject: async () => null,
  });

  assert.equal(result, 'unconfirmed');
  assert.equal(deletes, 0);
});

test('private API persists metadata before returning upload success', () => {
  const handler = uploadHandlerSource();
  const uploadIndex = handler.indexOf('result = await uploadFile');
  const privateBranchIndex = handler.indexOf('if (!publicFolder)');
  const metadataIndex = handler.indexOf('const metadata = result.metadata');
  const insertIndex = handler.indexOf('db.insert(userFiles).values');
  const returnIndex = handler.indexOf('file: buildUserFileClientItem');

  assert.ok(uploadIndex >= 0);
  assert.ok(privateBranchIndex > uploadIndex);
  assert.ok(metadataIndex > privateBranchIndex);
  assert.ok(insertIndex > metadataIndex);
  assert.ok(returnIndex > insertIndex);
  assert.match(
    handler,
    /if \(!userId \|\| !metadata\)[\s\S]*throwUserFileUploadPersistenceFailure\(result\.key\)/
  );
});

test('metadata insertion failure cleans the exact uploaded private object', () => {
  const handler = uploadHandlerSource();
  assert.match(
    handler,
    /db\.insert\(userFiles\)\.values\([\s\S]*catch \{[\s\S]*recoverUserFileUploadAfterMetadataFailure\([\s\S]*fileId: metadata\.id[\s\S]*userId,[\s\S]*persistedRow\?\.r2Key === metadata\.r2Key/
  );
  assert.match(
    handler,
    /cleanupUploadedObjectAfterMetadataFailure\(\{[\s\S]*deleteFile\(r2Key\)[\s\S]*getFileInfo\(r2Key\)/
  );
  assert.match(PROVIDER_SOURCE, /await bucket\.put\(uploadPlan\.r2Key/);
});

test('public folders bypass private metadata persistence and compensation', () => {
  const handler = uploadHandlerSource();
  assert.match(
    handler,
    /const publicFolder = isPublicFolder\(data\.folder\)[\s\S]*userId: publicFolder \? undefined : \(userId \?\? undefined\)/
  );
  assert.match(
    handler,
    /if \(!publicFolder\) \{[\s\S]*db\.insert\(userFiles\)[\s\S]*file: buildUserFileClientItem[\s\S]*return \{ url: result\.url \}/
  );
  assert.doesNotMatch(
    handler.slice(0, handler.indexOf('if (!publicFolder)')),
    /throwUserFileUploadPersistenceFailure/
  );
});

test('cleanup errors and documentation preserve the private boundary', () => {
  assert.match(
    EN_MESSAGES_SOURCE,
    /"user_files_api_error_upload_cleanup_failed": "The upload could not be saved, and storage cleanup could not be confirmed\./
  );
  assert.match(
    ZH_MESSAGES_SOURCE,
    /"user_files_api_error_upload_cleanup_failed": "上传记录未能保存，且无法确认存储清理结果。/
  );
  assert.match(
    PRODUCT_SOURCE,
    /Private source-material uploads[\s\S]*R2 and D1[\s\S]*committed insert may[\s\S]*one bounded delete retry[\s\S]*Public avatar/
  );
  assert.match(
    STORAGE_DOC_SOURCE,
    /Private upload success[\s\S]*metadata insertion reports failure[\s\S]*first probes D1[\s\S]*one presence probe[\s\S]*Public folders bypass/
  );
  assert.match(
    TEST_CATALOG_SOURCE,
    /user-file-upload-persistence-contract\.test\.ts/
  );
  assert.doesNotMatch(
    EN_MESSAGES_SOURCE.match(
      /"user_files_api_error_upload_cleanup_failed": "[^"]+"/
    )?.[0] ?? '',
    /r2|key|teacher|filename/i
  );
  assert.doesNotMatch(
    JSON.stringify(USER_FILE_UPLOAD_PERSISTENCE_STAGES),
    /teacher-1|private\.pdf|r2Key|studentName/
  );
});

function uploadHandlerSource() {
  const start = API_SOURCE.indexOf('export const uploadUserFile');
  assert.notEqual(start, -1);
  return API_SOURCE.slice(start);
}

function countByLayer() {
  return Object.fromEntries(
    Array.from(
      USER_FILE_UPLOAD_PERSISTENCE_STAGES.reduce((counts, stage) => {
        counts.set(stage.layer, (counts.get(stage.layer) ?? 0) + 1);
        return counts;
      }, new Map<string, number>())
    ).sort(([left], [right]) => left.localeCompare(right))
  );
}
