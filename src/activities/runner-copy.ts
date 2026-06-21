import {
  getActivityTemplateRunnerKind,
  type ActivityTemplateRunnerKind,
} from '@/activities/runtime';
import type { ActivityTemplateType } from '@/activities/types';

type ActivityRunnerCopy = {
  correctAnswerLabel: string;
  helpText?: string;
  inputPlaceholder: string;
  progressVerb: string;
  title: string;
  usedChoiceLabel: string;
};

const ACTIVITY_RUNNER_KIND_COPY = {
  'choice-list': {
    correctAnswerLabel: 'Correct answer',
    inputPlaceholder: 'Type your answer',
    progressVerb: 'answered',
    title: 'Choice activity',
    usedChoiceLabel: 'Selected',
  },
  'fill-blank': {
    correctAnswerLabel: 'Correct answer',
    inputPlaceholder: 'Type the missing word',
    progressVerb: 'completed',
    title: 'Fill blanks',
    usedChoiceLabel: 'Used',
  },
  'group-sort': {
    correctAnswerLabel: 'Correct group',
    inputPlaceholder: 'Choose a group',
    progressVerb: 'sorted',
    title: 'Group sort',
    usedChoiceLabel: 'Placed',
  },
  'line-match': {
    correctAnswerLabel: 'Correct match',
    helpText:
      'Select a prompt on the left, then select its match on the right.',
    inputPlaceholder: 'Choose a match',
    progressVerb: 'connected',
    title: 'Line match',
    usedChoiceLabel: 'Connected',
  },
  listening: {
    correctAnswerLabel: 'Correct answer',
    helpText: 'Use the play button, then answer what you heard.',
    inputPlaceholder: 'Type what you heard',
    progressVerb: 'answered',
    title: 'Listening',
    usedChoiceLabel: 'Selected',
  },
  'matching-pairs': {
    correctAnswerLabel: 'Correct pair',
    inputPlaceholder: 'Choose a pair',
    progressVerb: 'matched',
    title: 'Matching pairs',
    usedChoiceLabel: 'Used',
  },
  'open-box': {
    correctAnswerLabel: 'Model answer',
    inputPlaceholder: 'Type your answer',
    progressVerb: 'answered',
    title: 'Open the box',
    usedChoiceLabel: 'Answered',
  },
} satisfies Record<ActivityTemplateRunnerKind, ActivityRunnerCopy>;

export function getActivityRunnerKindCopy(
  runnerKind: ActivityTemplateRunnerKind
): ActivityRunnerCopy {
  return ACTIVITY_RUNNER_KIND_COPY[runnerKind];
}

export function getActivityTemplateRunnerCopy(
  templateType: ActivityTemplateType
): ActivityRunnerCopy {
  if (templateType === 'quiz') {
    return {
      ...getActivityRunnerKindCopy('choice-list'),
      title: 'Quiz',
    };
  }

  if (templateType === 'match-up') {
    return {
      ...getActivityRunnerKindCopy('choice-list'),
      correctAnswerLabel: 'Correct match',
      title: 'Match-up',
      usedChoiceLabel: 'Matched',
    };
  }

  return getActivityRunnerKindCopy(getActivityTemplateRunnerKind(templateType));
}
