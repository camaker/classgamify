import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildActivityTemplateScaffoldInput,
  buildActivityTemplateScaffoldReadinessSummary,
} from '@/activities/scaffolds';
import { getActivityEditorDefaultInput } from '@/activities/editor';
import { getRuntimeItems } from '@/activities/runtime';
import {
  ACTIVITY_TEMPLATE_TYPES,
  type ActivityTemplateType,
} from '@/activities/types';
import { buildActivityContent } from '@/activities/validation';
import { overwriteGetLocale } from '@/locale/paraglide/runtime';

const SECRET_ANSWER = 'SECRET_SCAFFOLD_ANSWER_SHOULD_NOT_LEAK';
const SECRET_CURRENT_FIELD = 'SECRET_CURRENT_FIELD_SHOULD_NOT_LEAK';
const SECRET_FILE_ID = 'SECRET_SCAFFOLD_FILE_ID_SHOULD_NOT_LEAK';
const SECRET_STORAGE_KEY = 'classroom/private/scaffold-source.pdf';

const EXPECTED_RUNTIME_ITEM_COUNTS = {
  'fill-blank': 4,
  'group-sort': 8,
  'line-match': 8,
  listening: 4,
  'match-up': 8,
  'matching-pairs': 8,
  'open-box': 4,
  quiz: 4,
} as const satisfies Record<ActivityTemplateType, number>;

overwriteGetLocale(() => 'en');

test('activity template scaffolds all parse into reusable classroom content', () => {
  for (const templateType of ACTIVITY_TEMPLATE_TYPES) {
    const scaffoldInput = buildActivityTemplateScaffoldInput({
      current: buildPrivateCurrentInput(),
      templateType,
    });
    const content = buildActivityContent(scaffoldInput);
    const summary = buildActivityTemplateScaffoldReadinessSummary({
      current: buildPrivateCurrentInput(),
      templateType,
    });

    assert.equal(content.questions.length, 4, `${templateType} questions`);
    assert.equal(content.pairs.length, 8, `${templateType} pairs`);
    assert.equal(content.groups.length, 3, `${templateType} groups`);
    assert.equal(content.vocabulary.length, 8, `${templateType} vocabulary`);
    assert.equal(content.teacherNotes.length, 2, `${templateType} notes`);
    assert.equal(
      content.sourceMaterials.length,
      1,
      `${templateType} materials`
    );
    assert.equal(summary.readyTemplateCount, 8, `${templateType} ready modes`);
    assert.equal(
      summary.isReusableAcrossTemplates,
      true,
      `${templateType} reusable`
    );
    assert.equal(
      getRuntimeItems(templateType, content).length,
      EXPECTED_RUNTIME_ITEM_COUNTS[templateType],
      `${templateType} runtime items`
    );
    assert.equal(
      summary.coverageMetrics.every((metric) => metric.meetsTarget),
      true,
      `${templateType} coverage target`
    );
  }
});

function buildPrivateCurrentInput() {
  return {
    ...getActivityEditorDefaultInput(),
    questionsText: `${SECRET_CURRENT_FIELD} | ${SECRET_ANSWER}`,
    sourceMaterials: [
      {
        fileId: SECRET_FILE_ID,
        kind: 'worksheet-document',
        originalName: `${SECRET_STORAGE_KEY}?token=private`,
      },
    ],
    teacherNotesText: SECRET_CURRENT_FIELD,
  };
}
