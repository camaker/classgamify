import type { DashboardBreadcrumbItem } from '@/components/layout/dashboard-header';
import { websiteConfig } from '@/config/website';
import { m } from '@/locale/paraglide/messages';

export type SettingsNotificationWorkspaceSummaryItemId =
  | 'assignment-review'
  | 'teacher-control'
  | 'template-updates'
  | 'worksheet-workflows';

export type SettingsNotificationWorkspaceSummaryItemView = {
  ariaLabel: string;
  description: string;
  id: SettingsNotificationWorkspaceSummaryItemId;
  label: string;
};

export const SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS = [
  'update-scope',
  'template-updates',
  'worksheet-workflows',
  'assignment-review',
  'teacher-control',
  'newsletter-card',
  'subscription-form',
  'subscription-switch',
  'email-requirement',
  'status-loading',
  'subscribe-action',
  'unsubscribe-action',
  'error-feedback',
  'scope-note',
  'provider-visibility',
  'email-channel',
  'subscription-status-source',
  'update-frequency',
  'activity-library-boundary',
  'activity-content-boundary',
  'assignment-snapshot-boundary',
  'attempt-record-boundary',
  'result-export-boundary',
  'source-material-read-boundary',
  'mutation-payload-guard',
  'student-reminder-boundary',
  'public-link-boundary',
  'learner-notification-boundary',
  'private-data-guard',
  'legacy-copy-guard',
] as const;

export type SettingsNotificationUpdateHandoffItemId =
  (typeof SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS)[number];

export type SettingsNotificationUpdateHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: SettingsNotificationUpdateHandoffItemId;
  label: string;
  value: string;
};

export type SettingsNotificationUpdateHandoffPrivacyContract = {
  changesActivityContent: false;
  changesActivityLibrary: false;
  changesAssignmentDeliveryRules: false;
  changesAssignmentSnapshots: false;
  changesAttemptRecords: false;
  changesPublicAssignmentLinks: false;
  changesResultExports: false;
  exposesRawMutationPayload: false;
  exposesRawProviderErrors: false;
  exposesRecipientEmail: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentIdentifiers: false;
  itemIds: SettingsNotificationUpdateHandoffItemId[];
  notifiesLearners: false;
  readsSourceMaterialFiles: false;
  scope: 'teacher-classroom-update-settings';
  sendsStudentAssignmentReminders: false;
  teacherCanPauseUpdates: true;
  updatesTeacherProductEmailOnly: true;
};

export type SettingsNotificationUpdateHandoffView = {
  description: string;
  itemViews: SettingsNotificationUpdateHandoffItemView[];
  privacy: SettingsNotificationUpdateHandoffPrivacyContract;
  title: string;
};

export type SettingsNotificationWorkspaceSummaryView = {
  ariaLabel: string;
  description: string;
  handoffView: SettingsNotificationUpdateHandoffView;
  itemViews: SettingsNotificationWorkspaceSummaryItemView[];
  title: string;
};

export type SettingsNotificationNewsletterCardView = {
  ariaLabel: string;
  description: string;
  emailRequiredMessage: string;
  errorMessage: string;
  formAriaLabel: string;
  hint: string;
  hintAriaLabel: string;
  label: string;
  scopeAriaLabel: string;
  scopeDescription: string;
  scopeLabel: string;
  subscribeSuccessMessage: string;
  switchAriaLabel: string;
  switchDescription: string;
  switchGroupAriaLabel: string;
  title: string;
  unsubscribeSuccessMessage: string;
};

type SettingsNotificationWorkspaceSummaryBaseView = Omit<
  SettingsNotificationWorkspaceSummaryView,
  'handoffView'
>;

export type SettingsNotificationPageViewModel = {
  breadcrumbs: DashboardBreadcrumbItem[];
  contentAriaLabel: string;
  description: string;
  newsletterCardView: SettingsNotificationNewsletterCardView;
  newsletterSectionAriaLabel: string;
  title: string;
  workspaceSummaryView: SettingsNotificationWorkspaceSummaryView;
};

export function isSettingsNotificationsEnabled() {
  return websiteConfig.newsletter?.enable === true;
}

export function buildSettingsNotificationPageViewModel(): SettingsNotificationPageViewModel {
  const title = m.settings_notification_title();
  const description = m.settings_notification_description();

  return {
    breadcrumbs: [
      { id: 'settings', label: m.common_settings(), isCurrentPage: false },
      {
        id: 'notifications',
        label: title,
        isCurrentPage: true,
      },
    ],
    contentAriaLabel: m.settings_notification_content_aria_label({
      description,
      title,
    }),
    description,
    newsletterCardView: buildSettingsNotificationNewsletterCardView(),
    newsletterSectionAriaLabel:
      m.settings_notification_newsletter_section_aria_label(),
    title,
    workspaceSummaryView: buildSettingsNotificationWorkspaceSummaryView(),
  };
}

export function buildSettingsNotificationNewsletterCardView(): SettingsNotificationNewsletterCardView {
  const description = m.settings_notification_newsletter_description();
  const hint = m.settings_notification_newsletter_hint();
  const label = m.settings_notification_newsletter_label();
  const scopeDescription =
    m.settings_notification_newsletter_scope_description();
  const scopeLabel = m.settings_notification_newsletter_scope_label();
  const switchDescription =
    m.settings_notification_newsletter_switch_description();
  const title = m.settings_notification_newsletter_title();

  return {
    ariaLabel: m.settings_notification_newsletter_card_aria_label({
      description,
      title,
    }),
    description,
    emailRequiredMessage: m.settings_notification_newsletter_email_required(),
    errorMessage: m.settings_notification_newsletter_error(),
    formAriaLabel: m.settings_notification_newsletter_form_aria_label({
      title,
    }),
    hint,
    hintAriaLabel: m.settings_notification_newsletter_hint_aria_label({
      hint,
    }),
    label,
    scopeAriaLabel: m.settings_notification_newsletter_scope_aria_label({
      description: scopeDescription,
      label: scopeLabel,
    }),
    scopeDescription,
    scopeLabel,
    subscribeSuccessMessage:
      m.settings_notification_newsletter_subscribe_success(),
    switchAriaLabel: m.settings_notification_newsletter_switch_aria_label(),
    switchDescription,
    switchGroupAriaLabel:
      m.settings_notification_newsletter_switch_group_aria_label({
        description: switchDescription,
        label,
      }),
    title,
    unsubscribeSuccessMessage:
      m.settings_notification_newsletter_unsubscribe_success(),
  };
}

export function buildSettingsNotificationWorkspaceSummaryView(): SettingsNotificationWorkspaceSummaryView {
  const summaryView = buildSettingsNotificationWorkspaceSummaryBaseView();

  return {
    ...summaryView,
    handoffView: buildSettingsNotificationUpdateHandoffView({
      newsletterCardView: buildSettingsNotificationNewsletterCardView(),
      workspaceSummaryView: summaryView,
    }),
  };
}

export function buildSettingsNotificationUpdateHandoffView({
  newsletterCardView = buildSettingsNotificationNewsletterCardView(),
  workspaceSummaryView = buildSettingsNotificationWorkspaceSummaryBaseView(),
}: {
  newsletterCardView?: SettingsNotificationNewsletterCardView;
  workspaceSummaryView?: SettingsNotificationWorkspaceSummaryBaseView;
} = {}): SettingsNotificationUpdateHandoffView {
  const itemViews = SETTINGS_NOTIFICATION_UPDATE_HANDOFF_ITEM_IDS.map((id) =>
    buildSettingsNotificationUpdateHandoffItemView({
      id,
      newsletterCardView,
      workspaceSummaryView,
    })
  );

  return {
    description: m.settings_notification_handoff_description(),
    itemViews,
    privacy: buildSettingsNotificationUpdateHandoffPrivacyContract(itemViews),
    title: m.settings_notification_handoff_title(),
  };
}

function buildSettingsNotificationWorkspaceSummaryBaseView(): SettingsNotificationWorkspaceSummaryBaseView {
  const title = m.settings_notification_workspace_summary_title();
  const description = m.settings_notification_workspace_summary_description();

  return {
    ariaLabel: m.settings_notification_workspace_summary_aria_label({
      description,
      title,
    }),
    description,
    itemViews: [
      buildSettingsNotificationWorkspaceSummaryItemView({
        description:
          m.settings_notification_workspace_summary_templates_description(),
        id: 'template-updates',
        label: m.settings_notification_workspace_summary_templates_label(),
      }),
      buildSettingsNotificationWorkspaceSummaryItemView({
        description:
          m.settings_notification_workspace_summary_worksheets_description(),
        id: 'worksheet-workflows',
        label: m.settings_notification_workspace_summary_worksheets_label(),
      }),
      buildSettingsNotificationWorkspaceSummaryItemView({
        description:
          m.settings_notification_workspace_summary_review_description(),
        id: 'assignment-review',
        label: m.settings_notification_workspace_summary_review_label(),
      }),
      buildSettingsNotificationWorkspaceSummaryItemView({
        description:
          m.settings_notification_workspace_summary_control_description(),
        id: 'teacher-control',
        label: m.settings_notification_workspace_summary_control_label(),
      }),
    ],
    title,
  };
}

function buildSettingsNotificationUpdateHandoffItemView({
  id,
  newsletterCardView,
  workspaceSummaryView,
}: {
  id: SettingsNotificationUpdateHandoffItemId;
  newsletterCardView: SettingsNotificationNewsletterCardView;
  workspaceSummaryView: SettingsNotificationWorkspaceSummaryBaseView;
}): SettingsNotificationUpdateHandoffItemView {
  const item = buildSettingsNotificationUpdateHandoffItem({
    id,
    newsletterCardView,
    workspaceSummaryView,
  });

  return {
    ...item,
    ariaLabel: m.settings_notification_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildSettingsNotificationUpdateHandoffItem({
  id,
  newsletterCardView,
  workspaceSummaryView,
}: {
  id: SettingsNotificationUpdateHandoffItemId;
  newsletterCardView: SettingsNotificationNewsletterCardView;
  workspaceSummaryView: SettingsNotificationWorkspaceSummaryBaseView;
}): Omit<SettingsNotificationUpdateHandoffItemView, 'ariaLabel'> {
  if (id === 'update-scope') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description: newsletterCardView.scopeDescription,
      id,
      label: newsletterCardView.scopeLabel,
      value: m.settings_notification_handoff_update_scope_value(),
    });
  }

  if (id === 'template-updates') {
    return buildSettingsNotificationUpdateHandoffSummaryItem({
      id,
      itemView: getSettingsNotificationWorkspaceSummaryItem(
        workspaceSummaryView,
        'template-updates'
      ),
    });
  }

  if (id === 'worksheet-workflows') {
    return buildSettingsNotificationUpdateHandoffSummaryItem({
      id,
      itemView: getSettingsNotificationWorkspaceSummaryItem(
        workspaceSummaryView,
        'worksheet-workflows'
      ),
    });
  }

  if (id === 'assignment-review') {
    return buildSettingsNotificationUpdateHandoffSummaryItem({
      id,
      itemView: getSettingsNotificationWorkspaceSummaryItem(
        workspaceSummaryView,
        'assignment-review'
      ),
    });
  }

  if (id === 'teacher-control') {
    return buildSettingsNotificationUpdateHandoffSummaryItem({
      id,
      itemView: getSettingsNotificationWorkspaceSummaryItem(
        workspaceSummaryView,
        'teacher-control'
      ),
    });
  }

  if (id === 'newsletter-card') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description: newsletterCardView.description,
      id,
      label: m.settings_notification_handoff_newsletter_card_label(),
      value: newsletterCardView.title,
    });
  }

  if (id === 'subscription-form') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_subscription_form_description(),
      id,
      label: m.settings_notification_handoff_subscription_form_label(),
      value: newsletterCardView.formAriaLabel,
    });
  }

  if (id === 'subscription-switch') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description: newsletterCardView.switchDescription,
      id,
      label: m.settings_notification_handoff_subscription_switch_label(),
      value: newsletterCardView.label,
    });
  }

  if (id === 'email-requirement') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_email_requirement_description(),
      id,
      label: m.settings_notification_handoff_email_requirement_label(),
      value: newsletterCardView.emailRequiredMessage,
    });
  }

  if (id === 'status-loading') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description: m.settings_notification_handoff_status_loading_description(),
      id,
      label: m.settings_notification_handoff_status_loading_label(),
      value: m.settings_notification_handoff_status_loading_value(),
    });
  }

  if (id === 'subscribe-action') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_subscribe_action_description(),
      id,
      label: m.settings_notification_handoff_subscribe_action_label(),
      value: newsletterCardView.subscribeSuccessMessage,
    });
  }

  if (id === 'unsubscribe-action') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_unsubscribe_action_description(),
      id,
      label: m.settings_notification_handoff_unsubscribe_action_label(),
      value: newsletterCardView.unsubscribeSuccessMessage,
    });
  }

  if (id === 'error-feedback') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description: m.settings_notification_handoff_error_feedback_description(),
      id,
      label: m.settings_notification_handoff_error_feedback_label(),
      value: newsletterCardView.errorMessage,
    });
  }

  if (id === 'scope-note') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description: newsletterCardView.scopeDescription,
      id,
      label: m.settings_notification_handoff_scope_note_label(),
      value: newsletterCardView.scopeLabel,
    });
  }

  if (id === 'provider-visibility') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_provider_visibility_description(),
      id,
      label: m.settings_notification_handoff_provider_visibility_label(),
      value: m.settings_notification_handoff_provider_visibility_value(),
    });
  }

  if (id === 'email-channel') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description: m.settings_notification_handoff_email_channel_description(),
      id,
      label: m.settings_notification_handoff_email_channel_label(),
      value: m.settings_notification_handoff_email_channel_value(),
    });
  }

  if (id === 'subscription-status-source') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_subscription_status_source_description(),
      id,
      label: m.settings_notification_handoff_subscription_status_source_label(),
      value: m.settings_notification_handoff_subscription_status_source_value(),
    });
  }

  if (id === 'update-frequency') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_update_frequency_description(),
      id,
      label: m.settings_notification_handoff_update_frequency_label(),
      value: m.settings_notification_handoff_update_frequency_value(),
    });
  }

  if (id === 'activity-library-boundary') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_activity_library_boundary_description(),
      id,
      label: m.settings_notification_handoff_activity_library_boundary_label(),
      value: m.settings_notification_handoff_activity_library_boundary_value(),
    });
  }

  if (id === 'activity-content-boundary') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_activity_content_boundary_description(),
      id,
      label: m.settings_notification_handoff_activity_content_boundary_label(),
      value: m.settings_notification_handoff_activity_content_boundary_value(),
    });
  }

  if (id === 'assignment-snapshot-boundary') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_assignment_snapshot_boundary_description(),
      id,
      label:
        m.settings_notification_handoff_assignment_snapshot_boundary_label(),
      value:
        m.settings_notification_handoff_assignment_snapshot_boundary_value(),
    });
  }

  if (id === 'attempt-record-boundary') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_attempt_record_boundary_description(),
      id,
      label: m.settings_notification_handoff_attempt_record_boundary_label(),
      value: m.settings_notification_handoff_attempt_record_boundary_value(),
    });
  }

  if (id === 'result-export-boundary') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_result_export_boundary_description(),
      id,
      label: m.settings_notification_handoff_result_export_boundary_label(),
      value: m.settings_notification_handoff_result_export_boundary_value(),
    });
  }

  if (id === 'source-material-read-boundary') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_source_material_read_boundary_description(),
      id,
      label:
        m.settings_notification_handoff_source_material_read_boundary_label(),
      value:
        m.settings_notification_handoff_source_material_read_boundary_value(),
    });
  }

  if (id === 'mutation-payload-guard') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_mutation_payload_guard_description(),
      id,
      label: m.settings_notification_handoff_mutation_payload_guard_label(),
      value: m.settings_notification_handoff_mutation_payload_guard_value(),
    });
  }

  if (id === 'student-reminder-boundary') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_student_reminder_boundary_description(),
      id,
      label: m.settings_notification_handoff_student_reminder_boundary_label(),
      value: m.settings_notification_handoff_student_reminder_boundary_value(),
    });
  }

  if (id === 'public-link-boundary') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_public_link_boundary_description(),
      id,
      label: m.settings_notification_handoff_public_link_boundary_label(),
      value: m.settings_notification_handoff_public_link_boundary_value(),
    });
  }

  if (id === 'learner-notification-boundary') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_learner_notification_boundary_description(),
      id,
      label:
        m.settings_notification_handoff_learner_notification_boundary_label(),
      value:
        m.settings_notification_handoff_learner_notification_boundary_value(),
    });
  }

  if (id === 'private-data-guard') {
    return buildSettingsNotificationUpdateHandoffStaticItem({
      description:
        m.settings_notification_handoff_private_data_guard_description(),
      id,
      label: m.settings_notification_handoff_private_data_guard_label(),
      value: m.settings_notification_handoff_private_data_guard_value(),
    });
  }

  return buildSettingsNotificationUpdateHandoffStaticItem({
    description:
      m.settings_notification_handoff_legacy_copy_guard_description(),
    id,
    label: m.settings_notification_handoff_legacy_copy_guard_label(),
    value: m.settings_notification_handoff_legacy_copy_guard_value(),
  });
}

function buildSettingsNotificationUpdateHandoffStaticItem({
  description,
  id,
  label,
  value,
}: Omit<SettingsNotificationUpdateHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildSettingsNotificationUpdateHandoffSummaryItem({
  id,
  itemView,
}: {
  id: SettingsNotificationUpdateHandoffItemId;
  itemView: SettingsNotificationWorkspaceSummaryItemView;
}) {
  return {
    description: itemView.description,
    id,
    label: itemView.label,
    value: itemView.label,
  };
}

function buildSettingsNotificationUpdateHandoffPrivacyContract(
  itemViews: SettingsNotificationUpdateHandoffItemView[]
): SettingsNotificationUpdateHandoffPrivacyContract {
  return {
    changesActivityContent: false,
    changesActivityLibrary: false,
    changesAssignmentDeliveryRules: false,
    changesAssignmentSnapshots: false,
    changesAttemptRecords: false,
    changesPublicAssignmentLinks: false,
    changesResultExports: false,
    exposesRawMutationPayload: false,
    exposesRawProviderErrors: false,
    exposesRecipientEmail: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentIdentifiers: false,
    itemIds: itemViews.map((item) => item.id),
    notifiesLearners: false,
    readsSourceMaterialFiles: false,
    scope: 'teacher-classroom-update-settings',
    sendsStudentAssignmentReminders: false,
    teacherCanPauseUpdates: true,
    updatesTeacherProductEmailOnly: true,
  };
}

function getSettingsNotificationWorkspaceSummaryItem(
  workspaceSummaryView: SettingsNotificationWorkspaceSummaryBaseView,
  id: SettingsNotificationWorkspaceSummaryItemId
) {
  const itemView = workspaceSummaryView.itemViews.find(
    (item) => item.id === id
  );
  if (!itemView) {
    throw new Error(`Missing notification workspace summary item: ${id}`);
  }

  return itemView;
}

function buildSettingsNotificationWorkspaceSummaryItemView({
  description,
  id,
  label,
}: {
  description: string;
  id: SettingsNotificationWorkspaceSummaryItemId;
  label: string;
}): SettingsNotificationWorkspaceSummaryItemView {
  return {
    ariaLabel: m.settings_notification_workspace_summary_item_aria_label({
      description,
      label,
    }),
    description,
    id,
    label,
  };
}
