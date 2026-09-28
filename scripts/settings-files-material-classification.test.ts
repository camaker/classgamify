import assert from 'node:assert/strict';
import test from 'node:test';
import { buildUserFileMaterialClassificationView } from '@/storage/file-material-classification';
import { classifyUserFileMaterial } from '@/storage/file-materials';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

overwriteGetLocale(() => 'en');
const SECRET_BYTES = 'SECRET_FILE_BYTES';
const SECRET_FILENAME = 'private-answer-key.pdf';
const SECRET_PERMISSION = 'signed-url-policy-secret';
const SECRET_STORAGE_KEY = 'userfiles/teacher/private-answer-key.pdf';

test('settings files classifier keeps content type and extension fallback explicit', () => {
  assert.deepEqual(
    classifyUserFileMaterial({
      contentType: 'Audio/MPEG; charset=binary',
      originalName: 'Listening.MP3',
    }),
    {
      basis: 'content-type',
      contentType: 'audio/mpeg',
      extension: 'mp3',
      kind: 'audio',
    }
  );

  assert.deepEqual(
    classifyUserFileMaterial({
      contentType: 'application/octet-stream',
      originalName: `C:/teacher/private/${SECRET_FILENAME}`,
    }),
    {
      basis: 'extension',
      contentType: 'application/octet-stream',
      extension: 'pdf',
      kind: 'worksheet-document',
    }
  );

  assert.deepEqual(
    classifyUserFileMaterial({
      contentType: '',
      originalName: 'mystery.material',
    }),
    {
      basis: 'fallback',
      contentType: undefined,
      extension: 'material',
      kind: 'file',
    }
  );

  const classificationView = buildUserFileMaterialClassificationView({
    contentType: 'application/octet-stream',
    originalName: SECRET_FILENAME,
  });

  assert.equal(classificationView.label, 'Worksheet document');
  assert.equal(classificationView.basisLabel, 'Filename extension');
  assert.equal(classificationView.secondaryDetail, 'application/octet-stream');
  assert.equal(classificationView.secondaryLabel, 'Content type');
  assert.equal(classificationView.isWorksheetMaterial, true);
  assert.equal(classificationView.isAudioMaterial, false);
  assertNoPrivateMaterialText(JSON.stringify(classificationView));
});

function assertNoPrivateMaterialText(serializedView: string) {
  for (const privateValue of [
    SECRET_BYTES,
    SECRET_FILENAME,
    SECRET_PERMISSION,
    SECRET_STORAGE_KEY,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Material classification handoff leaked private text: ${privateValue}`
    );
  }
}
