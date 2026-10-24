import assert from 'node:assert/strict';
import test from 'node:test';
import {
  activityContentToEditorInput,
  getActivityEditorDefaultInput,
} from '@/activities/editor';
import { buildActivityTemplateScaffoldInput } from '@/activities/scaffolds';
import { buildActivityContent } from '@/activities/validation';
import { ACTIVITY_CREATABLE_VISIBILITIES } from '@/activities/types';

const input = buildActivityTemplateScaffoldInput({
  current: getActivityEditorDefaultInput(),
  templateType: 'quiz',
});
const source = {
  content: buildActivityContent(input),
  templateType: 'quiz',
  title: 'Activity edit lifecycle',
} as const;

test('editor conversion preserves active visibility and requires explicit restore', () => {
  for (const visibility of ACTIVITY_CREATABLE_VISIBILITIES) {
    assert.equal(
      activityContentToEditorInput({ ...source, visibility }).visibility,
      visibility
    );
  }
  assert.throws(() =>
    activityContentToEditorInput({ ...source, visibility: 'archived' })
  );
});
