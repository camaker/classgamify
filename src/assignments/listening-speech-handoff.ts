import { normalizeRuntimeDisplayCount } from '@/assignments/runtime-display';
import type { SequentialStudentRunnerView } from '@/assignments/student-runner-view';
import type { ListeningPromptView } from '@/activities/listening-speech';
import { m } from '@/locale/paraglide/messages';

export const LISTENING_SPEECH_HANDOFF_ITEM_IDS = [
  'template-type',
  'runner-surface',
  'speech-language-source',
  'normalized-speech-language',
  'speech-support',
  'speech-playback-action',
  'speech-text-boundary',
  'transcript-visibility',
  'transcript-review-policy',
  'active-track-state',
  'active-track-label',
  'track-count',
  'visible-track-count',
  'answered-track-count',
  'unanswered-track-count',
  'progress-summary',
  'sequential-navigation',
  'previous-action',
  'next-action',
  'answer-input-state',
  'choice-answer-mode',
  'review-feedback-state',
  'review-item-count',
  'accepted-answer-boundary',
  'explanation-boundary',
  'public-payload-boundary',
  'runtime-id-guard',
  'prompt-text-guard',
  'student-identity-guard',
  'privacy-guard',
] as const;

export type ListeningSpeechHandoffItemId =
  (typeof LISTENING_SPEECH_HANDOFF_ITEM_IDS)[number];

export type ListeningSpeechHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ListeningSpeechHandoffItemId;
  label: string;
  value: string;
};

export type ListeningSpeechHandoffPrivacyContract = {
  exposesAnswerText: false;
  exposesPromptText: false;
  exposesRuntimeItemIds: false;
  exposesSourceMaterialMetadata: false;
  exposesSpeechText: false;
  exposesStudentIdentity: false;
  itemIds: ListeningSpeechHandoffItemId[];
  runnerSurface: 'listening';
  scope: 'listening-speech-transcript';
  templateType: 'listening';
  usesSharedSubmissionContract: true;
};

export type ListeningSpeechHandoffView = {
  description: string;
  itemViews: ListeningSpeechHandoffItemView[];
  privacy: ListeningSpeechHandoffPrivacyContract;
  title: string;
};

type ListeningSpeechHandoffContext = {
  answeredTrackCount: number;
  choiceAnswerMode: 'choice' | 'typed';
  disabled: boolean;
  hasActiveTrack: boolean;
  hasPromptView: boolean;
  hasReviewItem: boolean;
  languageProvided: boolean;
  normalizedSpeechLanguage: string | undefined;
  revealAnswer: boolean;
  reviewItemCount: number;
  sequenceLabel: string;
  speechSupported: boolean;
  trackCount: number;
  transcriptVisible: boolean;
  unansweredTrackCount: number;
  visibleTrackCount: number;
};

export function buildListeningSpeechHandoffView({
  disabled = false,
  language,
  promptView,
  revealAnswer = false,
  runnerView,
  speechSupported = false,
}: {
  disabled?: boolean;
  language?: string | null;
  promptView?: ListeningPromptView;
  revealAnswer?: boolean;
  runnerView: SequentialStudentRunnerView;
  speechSupported?: boolean;
}): ListeningSpeechHandoffView {
  const context = buildListeningSpeechHandoffContext({
    disabled,
    language,
    promptView,
    revealAnswer,
    runnerView,
    speechSupported,
  });
  const itemViews = LISTENING_SPEECH_HANDOFF_ITEM_IDS.map((id) =>
    buildListeningSpeechHandoffItemView({
      description: getListeningSpeechHandoffDescription(id),
      id,
      label: getListeningSpeechHandoffLabel(id),
      value: getListeningSpeechHandoffValue(id, context),
    })
  );

  return {
    description: m.listening_speech_handoff_description(),
    itemViews,
    privacy: buildListeningSpeechHandoffPrivacyContract(itemViews),
    title: m.listening_speech_handoff_title(),
  };
}

function buildListeningSpeechHandoffContext({
  disabled,
  language,
  promptView,
  revealAnswer,
  runnerView,
  speechSupported,
}: {
  disabled: boolean;
  language?: string | null;
  promptView?: ListeningPromptView;
  revealAnswer: boolean;
  runnerView: SequentialStudentRunnerView;
  speechSupported: boolean;
}): ListeningSpeechHandoffContext {
  const trackCount = normalizeRuntimeDisplayCount(
    runnerView.sequenceView.itemViews.length
  );
  const answeredTrackCount = normalizeRuntimeDisplayCount(
    runnerView.completionSummary.answeredItemCount,
    { max: trackCount }
  );
  const unansweredTrackCount = normalizeRuntimeDisplayCount(
    runnerView.completionSummary.unansweredItemCount,
    { max: trackCount }
  );
  const hasActiveTrack = Boolean(runnerView.activeItemView);
  const languageProvided = Boolean(
    language?.normalize('NFKC').replace(/\s+/g, ' ').trim()
  );

  return {
    answeredTrackCount,
    choiceAnswerMode: runnerView.activeChoiceViews.length ? 'choice' : 'typed',
    disabled,
    hasActiveTrack,
    hasPromptView: Boolean(promptView),
    hasReviewItem: Boolean(runnerView.activeReviewItem),
    languageProvided,
    normalizedSpeechLanguage: promptView?.speechLanguage,
    revealAnswer,
    reviewItemCount: normalizeRuntimeDisplayCount(
      runnerView.itemViews.filter((itemView) => itemView.reviewItem).length,
      { max: trackCount }
    ),
    sequenceLabel:
      runnerView.sequenceView.activeLabel ??
      m.listening_speech_handoff_no_active_track_value(),
    speechSupported,
    trackCount,
    transcriptVisible: Boolean(promptView?.transcriptText),
    unansweredTrackCount,
    visibleTrackCount: hasActiveTrack ? 1 : 0,
  };
}

function getListeningSpeechHandoffValue(
  id: ListeningSpeechHandoffItemId,
  context: ListeningSpeechHandoffContext
) {
  switch (id) {
    case 'template-type':
    case 'runner-surface':
      return 'listening';
    case 'speech-language-source':
      return context.languageProvided
        ? m.listening_speech_handoff_activity_language_value()
        : m.activity_runner_listening_language_unknown();
    case 'normalized-speech-language':
      return (
        context.normalizedSpeechLanguage ??
        m.activity_runner_listening_language_unknown()
      );
    case 'speech-support':
      return context.speechSupported
        ? m.activity_runner_listening_speech_available_value()
        : m.activity_runner_listening_speech_unavailable_value();
    case 'speech-playback-action':
      return context.speechSupported && context.hasPromptView
        ? m.listening_speech_handoff_ready_to_play_value()
        : m.listening_speech_handoff_unavailable_value();
    case 'speech-text-boundary':
      return m.listening_speech_handoff_speech_text_hidden_value();
    case 'transcript-visibility':
      return context.transcriptVisible
        ? m.activity_runner_listening_transcript_visible_value()
        : m.activity_runner_listening_transcript_hidden_value();
    case 'transcript-review-policy':
      return context.revealAnswer
        ? m.listening_speech_handoff_review_transcript_value()
        : m.listening_speech_handoff_pre_submit_transcript_value();
    case 'active-track-state':
      return context.hasActiveTrack
        ? m.listening_speech_handoff_selected_value()
        : m.listening_speech_handoff_no_active_track_value();
    case 'active-track-label':
      return context.sequenceLabel;
    case 'track-count':
      return formatListeningSpeechTrackCount(context.trackCount);
    case 'visible-track-count':
      return formatListeningSpeechVisibleTrackCount(context.visibleTrackCount);
    case 'answered-track-count':
      return String(context.answeredTrackCount);
    case 'unanswered-track-count':
      return String(context.unansweredTrackCount);
    case 'progress-summary':
      return m.listening_speech_handoff_progress_value({
        answeredCount: context.answeredTrackCount,
        trackCount: context.trackCount,
      });
    case 'sequential-navigation':
      return context.trackCount > 1
        ? m.listening_speech_handoff_available_value()
        : m.listening_speech_handoff_single_track_value();
    case 'previous-action':
    case 'next-action':
      return context.trackCount > 1
        ? m.listening_speech_handoff_available_value()
        : m.listening_speech_handoff_unavailable_value();
    case 'answer-input-state':
      if (!context.hasActiveTrack)
        return m.listening_speech_handoff_unavailable_value();
      return context.disabled
        ? m.listening_speech_handoff_locked_value()
        : m.listening_speech_handoff_ready_value();
    case 'choice-answer-mode':
      return context.choiceAnswerMode === 'choice'
        ? m.listening_speech_handoff_choice_answer_value()
        : m.listening_speech_handoff_typed_answer_value();
    case 'review-feedback-state':
      if (!context.revealAnswer)
        return m.listening_speech_handoff_hidden_value();
      return context.hasReviewItem
        ? m.listening_speech_handoff_visible_value()
        : m.listening_speech_handoff_waiting_for_result_value();
    case 'review-item-count':
      return String(context.reviewItemCount);
    case 'accepted-answer-boundary':
    case 'explanation-boundary':
      return m.listening_speech_handoff_post_submit_value();
    case 'public-payload-boundary':
      return m.listening_speech_handoff_sanitized_runtime_value();
    case 'runtime-id-guard':
      return m.listening_speech_handoff_item_ids_hidden_value();
    case 'prompt-text-guard':
      return m.listening_speech_handoff_prompts_hidden_value();
    case 'student-identity-guard':
      return m.listening_speech_handoff_student_identity_hidden_value();
    case 'privacy-guard':
      return m.listening_speech_handoff_private_data_omitted_value();
  }
}

function getListeningSpeechHandoffLabel(id: ListeningSpeechHandoffItemId) {
  switch (id) {
    case 'template-type':
      return m.listening_speech_handoff_template_label();
    case 'runner-surface':
      return m.listening_speech_handoff_surface_label();
    case 'speech-language-source':
      return m.listening_speech_handoff_language_source_label();
    case 'normalized-speech-language':
      return m.activity_runner_listening_language_label();
    case 'speech-support':
      return m.activity_runner_listening_speech_status_label();
    case 'speech-playback-action':
      return m.listening_speech_handoff_playback_label();
    case 'speech-text-boundary':
      return m.listening_speech_handoff_speech_text_label();
    case 'transcript-visibility':
      return m.activity_runner_listening_transcript_status_label();
    case 'transcript-review-policy':
      return m.listening_speech_handoff_transcript_policy_label();
    case 'active-track-state':
      return m.listening_speech_handoff_active_track_label();
    case 'active-track-label':
      return m.listening_speech_handoff_track_label();
    case 'track-count':
      return m.listening_speech_handoff_track_count_label();
    case 'visible-track-count':
      return m.listening_speech_handoff_visible_track_label();
    case 'answered-track-count':
      return m.listening_speech_handoff_answered_track_label();
    case 'unanswered-track-count':
      return m.listening_speech_handoff_unanswered_track_label();
    case 'progress-summary':
      return m.listening_speech_handoff_progress_label();
    case 'sequential-navigation':
      return m.listening_speech_handoff_navigation_label();
    case 'previous-action':
      return m.listening_speech_handoff_previous_label();
    case 'next-action':
      return m.listening_speech_handoff_next_label();
    case 'answer-input-state':
      return m.listening_speech_handoff_answer_input_label();
    case 'choice-answer-mode':
      return m.listening_speech_handoff_answer_mode_label();
    case 'review-feedback-state':
      return m.listening_speech_handoff_review_label();
    case 'review-item-count':
      return m.listening_speech_handoff_review_count_label();
    case 'accepted-answer-boundary':
      return m.listening_speech_handoff_accepted_answer_label();
    case 'explanation-boundary':
      return m.listening_speech_handoff_explanation_label();
    case 'public-payload-boundary':
      return m.listening_speech_handoff_public_payload_label();
    case 'runtime-id-guard':
      return m.listening_speech_handoff_item_id_guard_label();
    case 'prompt-text-guard':
      return m.listening_speech_handoff_prompt_guard_label();
    case 'student-identity-guard':
      return m.listening_speech_handoff_student_identity_label();
    case 'privacy-guard':
      return m.listening_speech_handoff_privacy_label();
  }
}

function getListeningSpeechHandoffDescription(
  id: ListeningSpeechHandoffItemId
) {
  switch (id) {
    case 'template-type':
      return m.listening_speech_handoff_template_description();
    case 'runner-surface':
      return m.listening_speech_handoff_surface_description();
    case 'speech-language-source':
      return m.listening_speech_handoff_language_source_description();
    case 'normalized-speech-language':
      return m.activity_runner_listening_language_description();
    case 'speech-support':
      return m.listening_speech_handoff_speech_support_description();
    case 'speech-playback-action':
      return m.listening_speech_handoff_playback_description();
    case 'speech-text-boundary':
      return m.listening_speech_handoff_speech_text_description();
    case 'transcript-visibility':
      return m.listening_speech_handoff_transcript_visibility_description();
    case 'transcript-review-policy':
      return m.listening_speech_handoff_transcript_policy_description();
    case 'active-track-state':
      return m.listening_speech_handoff_active_track_description();
    case 'active-track-label':
      return m.listening_speech_handoff_track_description();
    case 'track-count':
      return m.listening_speech_handoff_track_count_description();
    case 'visible-track-count':
      return m.listening_speech_handoff_visible_track_description();
    case 'answered-track-count':
      return m.listening_speech_handoff_answered_track_description();
    case 'unanswered-track-count':
      return m.listening_speech_handoff_unanswered_track_description();
    case 'progress-summary':
      return m.listening_speech_handoff_progress_description();
    case 'sequential-navigation':
      return m.listening_speech_handoff_navigation_description();
    case 'previous-action':
      return m.listening_speech_handoff_previous_description();
    case 'next-action':
      return m.listening_speech_handoff_next_description();
    case 'answer-input-state':
      return m.listening_speech_handoff_answer_input_description();
    case 'choice-answer-mode':
      return m.listening_speech_handoff_answer_mode_description();
    case 'review-feedback-state':
      return m.listening_speech_handoff_review_description();
    case 'review-item-count':
      return m.listening_speech_handoff_review_count_description();
    case 'accepted-answer-boundary':
      return m.listening_speech_handoff_accepted_answer_description();
    case 'explanation-boundary':
      return m.listening_speech_handoff_explanation_description();
    case 'public-payload-boundary':
      return m.listening_speech_handoff_public_payload_description();
    case 'runtime-id-guard':
      return m.listening_speech_handoff_item_id_guard_description();
    case 'prompt-text-guard':
      return m.listening_speech_handoff_prompt_guard_description();
    case 'student-identity-guard':
      return m.listening_speech_handoff_student_identity_description();
    case 'privacy-guard':
      return m.listening_speech_handoff_privacy_description();
  }
}

function buildListeningSpeechHandoffItemView({
  description,
  id,
  label,
  value,
}: Omit<ListeningSpeechHandoffItemView, 'ariaLabel'>) {
  return {
    ariaLabel: m.listening_speech_handoff_item_aria({
      description,
      label,
      value,
    }),
    description,
    id,
    label,
    value,
  };
}

function buildListeningSpeechHandoffPrivacyContract(
  itemViews: ListeningSpeechHandoffItemView[]
): ListeningSpeechHandoffPrivacyContract {
  return {
    exposesAnswerText: false,
    exposesPromptText: false,
    exposesRuntimeItemIds: false,
    exposesSourceMaterialMetadata: false,
    exposesSpeechText: false,
    exposesStudentIdentity: false,
    itemIds: itemViews.map((itemView) => itemView.id),
    runnerSurface: 'listening',
    scope: 'listening-speech-transcript',
    templateType: 'listening',
    usesSharedSubmissionContract: true,
  };
}

function formatListeningSpeechTrackCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.listening_speech_handoff_track_count_one({
      count: normalizedCount,
    });
  }

  return m.listening_speech_handoff_track_count_many({
    count: normalizedCount,
  });
}

function formatListeningSpeechVisibleTrackCount(count: number) {
  const normalizedCount = normalizeRuntimeDisplayCount(count);

  if (normalizedCount === 1) {
    return m.listening_speech_handoff_visible_track_count_one({
      count: normalizedCount,
    });
  }

  return m.listening_speech_handoff_visible_track_count_many({
    count: normalizedCount,
  });
}
