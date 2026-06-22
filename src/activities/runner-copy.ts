import {
  getActivityTemplateRunnerKind,
  type ActivityTemplateRunnerKind,
} from '@/activities/runtime';
import type { ActivityTemplateType } from '@/activities/types';
import { m } from '@/locale/paraglide/messages';

type ActivityRunnerCopy = {
  correctAnswerLabel: string;
  helpText?: string;
  inputPlaceholder: string;
  progressVerb: string;
  title: string;
  usedChoiceLabel: string;
};

export function getActivityRunnerKindCopy(
  runnerKind: ActivityTemplateRunnerKind
): ActivityRunnerCopy {
  if (runnerKind === 'choice-list') {
    return {
      correctAnswerLabel: m.activity_runner_correct_answer(),
      inputPlaceholder: m.activity_runner_type_answer_placeholder(),
      progressVerb: m.activity_runner_progress_answered(),
      title: m.activity_runner_choice_activity_title(),
      usedChoiceLabel: m.activity_runner_used_selected(),
    };
  }

  if (runnerKind === 'fill-blank') {
    return {
      correctAnswerLabel: m.activity_runner_correct_answer(),
      inputPlaceholder: m.activity_runner_missing_word_placeholder(),
      progressVerb: m.activity_runner_progress_completed(),
      title: m.activity_runner_fill_blanks_title(),
      usedChoiceLabel: m.activity_runner_used_used(),
    };
  }

  if (runnerKind === 'group-sort') {
    return {
      correctAnswerLabel: m.activity_runner_correct_group(),
      inputPlaceholder: m.activity_runner_choose_group_placeholder(),
      progressVerb: m.activity_runner_progress_sorted(),
      title: m.activity_runner_group_sort_title(),
      usedChoiceLabel: m.activity_runner_used_placed(),
    };
  }

  if (runnerKind === 'line-match') {
    return {
      correctAnswerLabel: m.activity_runner_correct_match(),
      helpText: m.activity_runner_line_match_help(),
      inputPlaceholder: m.activity_runner_choose_match_placeholder(),
      progressVerb: m.activity_runner_progress_connected(),
      title: m.activity_runner_line_match_title(),
      usedChoiceLabel: m.activity_runner_used_connected(),
    };
  }

  if (runnerKind === 'listening') {
    return {
      correctAnswerLabel: m.activity_runner_correct_answer(),
      helpText: m.activity_runner_listening_help(),
      inputPlaceholder: m.activity_runner_listening_placeholder(),
      progressVerb: m.activity_runner_progress_answered(),
      title: m.activity_runner_listening_title(),
      usedChoiceLabel: m.activity_runner_used_selected(),
    };
  }

  if (runnerKind === 'matching-pairs') {
    return {
      correctAnswerLabel: m.activity_runner_correct_pair(),
      inputPlaceholder: m.activity_runner_choose_pair_placeholder(),
      progressVerb: m.activity_runner_progress_matched(),
      title: m.activity_runner_matching_pairs_title(),
      usedChoiceLabel: m.activity_runner_used_used(),
    };
  }

  return {
    correctAnswerLabel: m.activity_runner_model_answer(),
    inputPlaceholder: m.activity_runner_type_answer_placeholder(),
    progressVerb: m.activity_runner_progress_answered(),
    title: m.activity_runner_open_box_title(),
    usedChoiceLabel: m.activity_runner_used_answered(),
  };
}

export function getActivityTemplateRunnerCopy(
  templateType: ActivityTemplateType
): ActivityRunnerCopy {
  if (templateType === 'quiz') {
    return {
      ...getActivityRunnerKindCopy('choice-list'),
      title: m.activity_runner_quiz_title(),
    };
  }

  if (templateType === 'match-up') {
    return {
      ...getActivityRunnerKindCopy('choice-list'),
      correctAnswerLabel: m.activity_runner_correct_match(),
      title: m.activity_runner_match_up_title(),
      usedChoiceLabel: m.activity_runner_used_matched(),
    };
  }

  return getActivityRunnerKindCopy(getActivityTemplateRunnerKind(templateType));
}
