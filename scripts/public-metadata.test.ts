import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Routes } from '@/lib/routes';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';
import {
  buildWebAppManifest,
  buildWebAppManifestInstallBoundary,
  WEB_MANIFEST_HEADERS,
} from '@/seo/web-manifest';

overwriteGetLocale(() => 'en');
const SECRET_ANSWER_KEY = 'SECRET_TEACHER_ANSWER_KEY';
const SECRET_ATTEMPT_RECORD = 'SECRET_STUDENT_ATTEMPT_RECORD';
const SECRET_FILE_BYTES = 'raw-private-worksheet-bytes';
const SECRET_STUDENT_TOKEN = 'raw-anonymous-student-token';
const SECRET_STORAGE_KEY = 'source-material/private/storage-key.pdf';
const SECRET_TEACHER_CONTENT = 'SECRET_TEACHER_ACTIVITY_CONTENT';

test('web app manifest stays on the public ClassGamify install boundary', () => {
  const manifest = buildWebAppManifest();
  const installBoundary = buildWebAppManifestInstallBoundary(manifest);
  const manifestRouteSource = readFileSync(
    'src/routes/manifest[.]json.ts',
    'utf8'
  );

  assert.deepEqual(installBoundary, {
    hasConfiguredDescription: true,
    hasConfiguredName: true,
    hasMaskableIcons: true,
    keepsProtectedSurfacesOut: true,
    keepsRetiredLegacyOut: true,
    maskableIconCount: 2,
    scope: 'public-web-app-install-metadata',
    usesPublicRootScope: true,
    usesPublicRootStartUrl: true,
  });
  assert.equal(manifest.start_url, Routes.Root);
  assert.equal(manifest.scope, Routes.Root);
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.name, manifest.short_name);
  assert.deepEqual(WEB_MANIFEST_HEADERS, {
    'Cache-Control': 'public, max-age=3600',
    'Content-Type': 'application/manifest+json; charset=utf-8',
  });
  assert.match(
    manifestRouteSource,
    /GET: async \(\) => \{[\s\S]*JSON\.stringify\(buildWebAppManifest\(\)\)[\s\S]*headers: WEB_MANIFEST_HEADERS/
  );
  assert.match(
    manifestRouteSource,
    /HEAD: async \(\) => \{[\s\S]*new Response\(null,[\s\S]*headers: WEB_MANIFEST_HEADERS/
  );
  assert.doesNotMatch(
    manifestRouteSource,
    /websiteConfig|metadata\?\.name|start_url|scope|theme_color/,
    'Manifest route should delegate install metadata instead of rebuilding it.'
  );
  assert.doesNotMatch(
    JSON.stringify(manifest),
    /\/auth|\/admin|\/settings|\/dashboard|\/play|\/print|\/learn|\/hsk|\/hanzi|\/waitlist/i,
    'Manifest install metadata should not directly target private or retired paths.'
  );
  assertNoPrivateMetadataText(JSON.stringify(manifest));
});

function assertNoPrivateMetadataText(serializedView: string) {
  for (const privateValue of [
    SECRET_ANSWER_KEY,
    SECRET_ATTEMPT_RECORD,
    SECRET_FILE_BYTES,
    SECRET_STUDENT_TOKEN,
    SECRET_STORAGE_KEY,
    SECRET_TEACHER_CONTENT,
  ]) {
    assert.equal(
      serializedView.includes(privateValue),
      false,
      `Public metadata handoff leaked private text: ${privateValue}`
    );
  }
}
