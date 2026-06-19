export const TRIAL_WORKFLOW_CHARACTERS = ['人', '口', '日'] as const;

type TrialWorkflowLocale = 'en' | 'zh';

export function getTrialPracticeSearch() {
  return {
    character: TRIAL_WORKFLOW_CHARACTERS[0],
    characters: [...TRIAL_WORKFLOW_CHARACTERS],
  };
}

export function getTrialWorksheetSearch({
  locale,
  note,
}: {
  locale?: TrialWorkflowLocale;
  note?: string;
} = {}) {
  return {
    characters: [...TRIAL_WORKFLOW_CHARACTERS],
    details: true,
    feedback: true,
    note: note ?? getTrialWorksheetNote(locale ?? 'en'),
    trace: 'guided' as const,
  };
}

export function getTrialWorksheetNote(locale: TrialWorkflowLocale) {
  return locale === 'zh'
    ? '试用练习：先在线描写人、口、日，再打印同一组做纸面慢写。'
    : 'Trial practice: trace 人, 口, and 日 online first, then print the same set for slow handwriting.';
}
