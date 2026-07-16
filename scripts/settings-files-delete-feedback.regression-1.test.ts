import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Regression: ISSUE-001 - referenced file deletion failed without UI feedback
// Found by /qa on 2026-07-16
// Report: .gstack/qa-reports/qa-report-classgamify-com-2026-07-16.md

const FILES_PAGE_CONTENT_SOURCE = readFileSync(
  'src/components/settings/files/files-page-content.tsx',
  'utf8'
);

test('settings files awaits delete failures before choosing user feedback', () => {
  assert.match(
    FILES_PAGE_CONTENT_SOURCE,
    /const handleDelete = async \(id: string\) => \{[\s\S]*try \{[\s\S]*await deleteMutation\.mutateAsync\(id\);[\s\S]*deleteFeedback\.onSuccess\(\);[\s\S]*\} catch \{[\s\S]*deleteFeedback\.onError\(\);[\s\S]*\}/
  );
  assert.doesNotMatch(
    FILES_PAGE_CONTENT_SOURCE,
    /deleteMutation\.mutate\(id, \{/
  );
  assert.match(
    FILES_PAGE_CONTENT_SOURCE,
    /deleteMutation\.isError[\s\S]*role="alert"[\s\S]*data-file-delete-feedback="error"[\s\S]*settings_files_delete_error/
  );
});
