import { m } from '@/locale/paraglide/messages';
import type { Locale } from '@/locale/paraglide/runtime';

export const ACTIVITY_AI_DRAFT_FOCUSES = [
  'balanced',
  'worksheet-practice',
  'listening-script',
  'remix-ready',
] as const;

export type ActivityAiDraftFocus = (typeof ACTIVITY_AI_DRAFT_FOCUSES)[number];

export const ACTIVITY_AI_DRAFT_DEFAULT_FOCUS =
  'balanced' satisfies ActivityAiDraftFocus;

export type ActivityAiDraftFocusOption = {
  description: string;
  label: string;
  value: ActivityAiDraftFocus;
};

export function buildActivityAiDraftFocusOptions(): ActivityAiDraftFocusOption[] {
  return ACTIVITY_AI_DRAFT_FOCUSES.map((value) => ({
    description: formatActivityAiDraftFocusDescription(value),
    label: formatActivityAiDraftFocusLabel(value),
    value,
  }));
}

export function formatActivityAiDraftFocusLabel(
  draftFocus: ActivityAiDraftFocus,
  locale?: Locale
) {
  switch (draftFocus) {
    case 'balanced':
      return m.activity_ai_focus_balanced_label({}, locale ? { locale } : {});
    case 'listening-script':
      return m.activity_ai_focus_listening_script_label(
        {},
        locale ? { locale } : {}
      );
    case 'remix-ready':
      return m.activity_ai_focus_remix_ready_label(
        {},
        locale ? { locale } : {}
      );
    case 'worksheet-practice':
      return m.activity_ai_focus_worksheet_practice_label(
        {},
        locale ? { locale } : {}
      );
  }
}

export function formatActivityAiDraftFocusDescription(
  draftFocus: ActivityAiDraftFocus
) {
  switch (draftFocus) {
    case 'balanced':
      return m.activity_ai_focus_balanced_description();
    case 'listening-script':
      return m.activity_ai_focus_listening_script_description();
    case 'remix-ready':
      return m.activity_ai_focus_remix_ready_description();
    case 'worksheet-practice':
      return m.activity_ai_focus_worksheet_practice_description();
  }
}

export function buildActivityAiDraftFocusPromptLine(
  draftFocus: ActivityAiDraftFocus
) {
  return m.activity_ai_prompt_draft_focus({
    focus: formatActivityAiDraftFocusLabel(draftFocus),
    guidance: getActivityAiDraftFocusGuidance(draftFocus),
  });
}

function getActivityAiDraftFocusGuidance(draftFocus: ActivityAiDraftFocus) {
  switch (draftFocus) {
    case 'balanced':
      return m.activity_ai_focus_balanced_prompt();
    case 'listening-script':
      return m.activity_ai_focus_listening_script_prompt();
    case 'remix-ready':
      return m.activity_ai_focus_remix_ready_prompt();
    case 'worksheet-practice':
      return m.activity_ai_focus_worksheet_practice_prompt();
  }
}
