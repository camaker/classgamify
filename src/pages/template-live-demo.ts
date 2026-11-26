import { getActivityTemplateScaffold } from '@/activities/scaffolds';
import { getRuntimeItems } from '@/activities/runtime';
import type { ActivityContent, ActivityTemplateType } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';
import {
  buildActivityContent,
  createActivityInputSchema,
} from '@/activities/validation';

/** Pure builder behind the playable examples on the template guide pages. */
export type TemplateDemoField = 'groupsText' | 'pairsText' | 'questionsText';

export const TEMPLATE_DEMO_MAX_ROWS = 12;

const TEMPLATE_DEMO_FIELDS: Record<ActivityTemplateType, TemplateDemoField> = {
  'fill-blank': 'questionsText',
  'group-sort': 'groupsText',
  'line-match': 'pairsText',
  listening: 'questionsText',
  'match-up': 'pairsText',
  'matching-pairs': 'pairsText',
  'open-box': 'questionsText',
  quiz: 'questionsText',
};

type TemplateScaffold = ReturnType<typeof getActivityTemplateScaffold>;

export function getTemplateDemoInput(
  templateType: ActivityTemplateType,
  scaffold: TemplateScaffold
) {
  const field = TEMPLATE_DEMO_FIELDS[templateType];
  return { field, text: scaffold[field] ?? '' };
}

export type TemplateDemo =
  | { content: ActivityContent; status: 'ready' }
  | { message: string; status: 'invalid' };

export function buildTemplateDemo({
  templateType,
  text,
}: {
  templateType: ActivityTemplateType;
  text: string;
}): TemplateDemo {
  const scaffold = getActivityTemplateScaffold(templateType);
  const { field } = getTemplateDemoInput(templateType, scaffold);
  const rows = text
    .split('\n')
    .filter((row) => row.trim())
    .slice(0, TEMPLATE_DEMO_MAX_ROWS)
    .join('\n');

  try {
    const content = buildActivityContent(
      createActivityInputSchema.parse({
        // Scaffolds carry no grade band; the editor supplies the same default.
        gradeBand: m.activity_editor_default_grade_band(),
        ...scaffold,
        [field]: rows,
        templateType,
      })
    );
    if (getRuntimeItems(templateType, content).length === 0) {
      return { status: 'invalid', message: 'Add at least one complete row.' };
    }
    return { status: 'ready', content };
  } catch (error) {
    return {
      status: 'invalid',
      message:
        error instanceof Error
          ? error.message
          : 'Check the rows and try again.',
    };
  }
}
