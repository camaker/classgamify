import type { ActivityTemplateType } from '@/activities/types';

export type WorksheetModeDefinition = {
  action: string;
  description: string;
  template: WorksheetModeTemplate;
  title: string;
};

export type WorksheetModeTemplate = Extract<
  ActivityTemplateType,
  'fill-blank' | 'group-sort' | 'line-match' | 'listening'
>;

export const worksheetModeDefinitions = [
  {
    action: 'Create fill-blank',
    description:
      'Place short answers directly into sentence gaps for grammar, spelling, vocabulary, or reading checks.',
    template: 'fill-blank',
    title: 'Fill blanks',
  },
  {
    action: 'Start line match',
    description:
      'Turn terms and definitions into a two-column connection board that feels familiar to worksheet users.',
    template: 'line-match',
    title: 'Line matching',
  },
  {
    action: 'Create listening',
    description:
      'Use spoken tracks for dictation, comprehension, or pronunciation follow-up while hiding transcripts before review.',
    template: 'listening',
    title: 'Listening prompts',
  },
  {
    action: 'Create sort',
    description:
      'Ask learners to classify words, examples, or concepts into teacher-defined groups before seeing the answer pattern.',
    template: 'group-sort',
    title: 'Drag sorting',
  },
] as const satisfies WorksheetModeDefinition[];
