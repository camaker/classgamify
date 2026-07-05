import { m } from '@/locale/paraglide/messages';
import {
  getMailLocaleMessageOptions,
  type MailLocaleInput,
  type MailLocaleMessageOptions,
} from '@/mail/locale';

export type MailWorkspaceBoundaryItemId =
  | 'activities'
  | 'assignments'
  | 'results'
  | 'ai-sources';

export type MailWorkspaceBoundaryItemView = {
  description: string;
  id: MailWorkspaceBoundaryItemId;
  label: string;
  line: string;
};

export type MailWorkspaceBoundaryView = {
  description: string;
  items: MailWorkspaceBoundaryItemView[];
  title: string;
};

export const MAIL_TRANSACTIONAL_TEMPLATE_IDS = [
  'verifyEmail',
  'forgotPassword',
  'subscribeNewsletter',
  'contactMessage',
] as const;

export const MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS = [
  'template-set',
  'verify-email-template',
  'forgot-password-template',
  'newsletter-template',
  'contact-template',
  'localized-subjects',
  'html-language',
  'locale-fallback',
  'plain-text-render',
  'render-before-send',
  'shared-layout',
  'provider-registry-boundary',
  'boundary-panel',
  'activities-scope',
  'assignments-scope',
  'attempt-results-scope',
  'ai-draft-scope',
  'source-material-safety',
  'no-file-byte-read',
  'worksheet-workflow-scope',
  'contact-classroom-fields',
  'action-link-placement',
  'no-activity-mutation',
  'no-assignment-mutation',
  'no-attempt-mutation',
  'no-result-export',
  'no-learner-notification',
  'provider-secret-guard',
  'legacy-copy-guard',
  'private-data-guard',
] as const;

export type MailTransactionalTemplateId =
  (typeof MAIL_TRANSACTIONAL_TEMPLATE_IDS)[number];

export type MailTransactionalWorkspaceHandoffItemId =
  (typeof MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS)[number];

export type MailTransactionalWorkspaceHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: MailTransactionalWorkspaceHandoffItemId;
  label: string;
  value: string;
};

export type MailTransactionalWorkspaceHandoffPrivacyContract = {
  exportsResultRecords: false;
  exposesActionUrls: false;
  exposesContactMessageText: false;
  exposesProviderApiTokens: false;
  exposesRawErrors: false;
  exposesRecipientEmail: false;
  exposesRecipientName: false;
  exposesSourceMaterialStorageKeys: false;
  exposesStudentIdentifiers: false;
  itemIds: MailTransactionalWorkspaceHandoffItemId[];
  mutatesActivities: false;
  mutatesAssignmentLinks: false;
  mutatesAttemptRecords: false;
  normalizesUnsupportedLocales: true;
  readsSourceMaterialFileBytes: false;
  rendersBeforeProviderSend: true;
  rendersSharedBoundaryPanel: true;
  scope: 'transactional-email-workspace-boundary';
  sendsLearnerNotifications: false;
  templateIds: MailTransactionalTemplateId[];
  usesLocalizedSubjects: true;
  usesProviderRegistryBoundary: true;
};

export type MailTransactionalWorkspaceHandoffView = {
  description: string;
  itemViews: MailTransactionalWorkspaceHandoffItemView[];
  privacy: MailTransactionalWorkspaceHandoffPrivacyContract;
  title: string;
};

export function buildMailWorkspaceBoundaryView(
  input?: MailLocaleInput
): MailWorkspaceBoundaryView {
  const localeOptions = getMailLocaleMessageOptions(input);
  const items = [
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_activities_description(
        undefined,
        localeOptions
      ),
      id: 'activities',
      label: m.mail_workspace_boundary_item_activities_label(
        undefined,
        localeOptions
      ),
      localeOptions,
    }),
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_assignments_description(
        undefined,
        localeOptions
      ),
      id: 'assignments',
      label: m.mail_workspace_boundary_item_assignments_label(
        undefined,
        localeOptions
      ),
      localeOptions,
    }),
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_results_description(
        undefined,
        localeOptions
      ),
      id: 'results',
      label: m.mail_workspace_boundary_item_results_label(
        undefined,
        localeOptions
      ),
      localeOptions,
    }),
    buildMailWorkspaceBoundaryItemView({
      description: m.mail_workspace_boundary_item_ai_sources_description(
        undefined,
        localeOptions
      ),
      id: 'ai-sources',
      label: m.mail_workspace_boundary_item_ai_sources_label(
        undefined,
        localeOptions
      ),
      localeOptions,
    }),
  ];

  return {
    description: m.mail_workspace_boundary_description(
      undefined,
      localeOptions
    ),
    items,
    title: m.mail_workspace_boundary_title(undefined, localeOptions),
  };
}

export function buildMailTransactionalWorkspaceHandoffView(
  input?: MailLocaleInput
): MailTransactionalWorkspaceHandoffView {
  const localeOptions = getMailLocaleMessageOptions(input);
  const boundaryView = buildMailWorkspaceBoundaryView(input);
  const itemViews = MAIL_TRANSACTIONAL_WORKSPACE_HANDOFF_ITEM_IDS.map((id) =>
    buildMailTransactionalWorkspaceHandoffItemView({
      boundaryView,
      id,
      localeOptions,
    })
  );

  return {
    description: m.mail_transactional_handoff_description(
      undefined,
      localeOptions
    ),
    itemViews,
    privacy: buildMailTransactionalWorkspaceHandoffPrivacyContract(itemViews),
    title: m.mail_transactional_handoff_title(undefined, localeOptions),
  };
}

function buildMailWorkspaceBoundaryItemView({
  description,
  id,
  label,
  localeOptions,
}: Omit<MailWorkspaceBoundaryItemView, 'line'> & {
  localeOptions: MailLocaleMessageOptions;
}): MailWorkspaceBoundaryItemView {
  return {
    description,
    id,
    label,
    line: m.mail_workspace_boundary_item_line(
      {
        description,
        label,
      },
      localeOptions
    ),
  };
}

function buildMailTransactionalWorkspaceHandoffItemView({
  boundaryView,
  id,
  localeOptions,
}: {
  boundaryView: MailWorkspaceBoundaryView;
  id: MailTransactionalWorkspaceHandoffItemId;
  localeOptions: MailLocaleMessageOptions;
}): MailTransactionalWorkspaceHandoffItemView {
  const item = buildMailTransactionalWorkspaceHandoffItem({
    boundaryView,
    id,
    localeOptions,
  });

  return {
    ...item,
    ariaLabel: m.mail_transactional_handoff_item_aria_label(
      {
        description: item.description,
        label: item.label,
        value: item.value,
      },
      localeOptions
    ),
  };
}

function buildMailTransactionalWorkspaceHandoffItem({
  boundaryView,
  id,
  localeOptions,
}: {
  boundaryView: MailWorkspaceBoundaryView;
  id: MailTransactionalWorkspaceHandoffItemId;
  localeOptions: MailLocaleMessageOptions;
}): Omit<MailTransactionalWorkspaceHandoffItemView, 'ariaLabel'> {
  if (id === 'template-set') {
    return {
      description: m.mail_transactional_handoff_template_set_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_template_set_label(
        undefined,
        localeOptions
      ),
      value: m.mail_transactional_handoff_template_set_value(
        { count: MAIL_TRANSACTIONAL_TEMPLATE_IDS.length },
        localeOptions
      ),
    };
  }

  if (id === 'verify-email-template') {
    return buildMailTransactionalWorkspaceSubjectItem({
      description:
        m.mail_transactional_handoff_verify_email_template_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_verify_email_template_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_verify_email_subject(undefined, localeOptions),
    });
  }

  if (id === 'forgot-password-template') {
    return buildMailTransactionalWorkspaceSubjectItem({
      description:
        m.mail_transactional_handoff_forgot_password_template_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_forgot_password_template_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_forgot_password_subject(undefined, localeOptions),
    });
  }

  if (id === 'newsletter-template') {
    return buildMailTransactionalWorkspaceSubjectItem({
      description: m.mail_transactional_handoff_newsletter_template_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_newsletter_template_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_subscribe_newsletter_subject(undefined, localeOptions),
    });
  }

  if (id === 'contact-template') {
    return buildMailTransactionalWorkspaceSubjectItem({
      description: m.mail_transactional_handoff_contact_template_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_contact_template_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_contact_message_subject(undefined, localeOptions),
    });
  }

  if (id === 'localized-subjects') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_localized_subjects_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_localized_subjects_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_localized_subjects_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'html-language') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_html_language_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_html_language_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: localeOptions.locale,
    });
  }

  if (id === 'plain-text-render') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_plain_text_render_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_plain_text_render_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_plain_text_render_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'locale-fallback') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_locale_fallback_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_locale_fallback_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_locale_fallback_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'render-before-send') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_render_before_send_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_render_before_send_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_render_before_send_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'shared-layout') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_shared_layout_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_shared_layout_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_shared_layout_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'provider-registry-boundary') {
    return buildMailTransactionalWorkspaceStaticItem({
      description:
        m.mail_transactional_handoff_provider_registry_boundary_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_provider_registry_boundary_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_provider_registry_boundary_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'boundary-panel') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_boundary_panel_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_boundary_panel_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: boundaryView.title,
    });
  }

  if (id === 'activities-scope') {
    return buildMailTransactionalWorkspaceBoundaryItem({
      boundaryItem: getMailWorkspaceBoundaryItem(boundaryView, 'activities'),
      id,
      localeOptions,
    });
  }

  if (id === 'assignments-scope') {
    return buildMailTransactionalWorkspaceBoundaryItem({
      boundaryItem: getMailWorkspaceBoundaryItem(boundaryView, 'assignments'),
      id,
      localeOptions,
    });
  }

  if (id === 'attempt-results-scope') {
    return buildMailTransactionalWorkspaceBoundaryItem({
      boundaryItem: getMailWorkspaceBoundaryItem(boundaryView, 'results'),
      id,
      localeOptions,
    });
  }

  if (id === 'ai-draft-scope') {
    return buildMailTransactionalWorkspaceBoundaryItem({
      boundaryItem: getMailWorkspaceBoundaryItem(boundaryView, 'ai-sources'),
      id,
      localeOptions,
    });
  }

  if (id === 'source-material-safety') {
    return buildMailTransactionalWorkspaceStaticItem({
      description:
        m.mail_transactional_handoff_source_material_safety_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_source_material_safety_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_source_material_safety_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'no-file-byte-read') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_no_file_byte_read_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_no_file_byte_read_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_no_file_byte_read_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'worksheet-workflow-scope') {
    return buildMailTransactionalWorkspaceStaticItem({
      description:
        m.mail_transactional_handoff_worksheet_workflow_scope_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_worksheet_workflow_scope_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_worksheet_workflow_scope_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'contact-classroom-fields') {
    return buildMailTransactionalWorkspaceStaticItem({
      description:
        m.mail_transactional_handoff_contact_classroom_fields_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_contact_classroom_fields_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_contact_classroom_fields_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'action-link-placement') {
    return buildMailTransactionalWorkspaceStaticItem({
      description:
        m.mail_transactional_handoff_action_link_placement_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_action_link_placement_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_action_link_placement_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'no-activity-mutation') {
    return buildMailTransactionalWorkspaceStaticItem({
      description:
        m.mail_transactional_handoff_no_activity_mutation_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_no_activity_mutation_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_no_activity_mutation_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'no-assignment-mutation') {
    return buildMailTransactionalWorkspaceStaticItem({
      description:
        m.mail_transactional_handoff_no_assignment_mutation_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_no_assignment_mutation_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_no_assignment_mutation_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'no-attempt-mutation') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_no_attempt_mutation_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_no_attempt_mutation_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_no_attempt_mutation_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'no-result-export') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_no_result_export_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_no_result_export_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_no_result_export_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'no-learner-notification') {
    return buildMailTransactionalWorkspaceStaticItem({
      description:
        m.mail_transactional_handoff_no_learner_notification_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_no_learner_notification_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_no_learner_notification_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'provider-secret-guard') {
    return buildMailTransactionalWorkspaceStaticItem({
      description:
        m.mail_transactional_handoff_provider_secret_guard_description(
          undefined,
          localeOptions
        ),
      id,
      label: m.mail_transactional_handoff_provider_secret_guard_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_provider_secret_guard_value(
        undefined,
        localeOptions
      ),
    });
  }

  if (id === 'legacy-copy-guard') {
    return buildMailTransactionalWorkspaceStaticItem({
      description: m.mail_transactional_handoff_legacy_copy_guard_description(
        undefined,
        localeOptions
      ),
      id,
      label: m.mail_transactional_handoff_legacy_copy_guard_label(
        undefined,
        localeOptions
      ),
      localeOptions,
      value: m.mail_transactional_handoff_legacy_copy_guard_value(
        undefined,
        localeOptions
      ),
    });
  }

  return buildMailTransactionalWorkspaceStaticItem({
    description: m.mail_transactional_handoff_private_data_guard_description(
      undefined,
      localeOptions
    ),
    id,
    label: m.mail_transactional_handoff_private_data_guard_label(
      undefined,
      localeOptions
    ),
    localeOptions,
    value: m.mail_transactional_handoff_private_data_guard_value(
      undefined,
      localeOptions
    ),
  });
}

function buildMailTransactionalWorkspaceSubjectItem({
  description,
  id,
  label,
  value,
}: Omit<MailTransactionalWorkspaceHandoffItemView, 'ariaLabel'> & {
  localeOptions: MailLocaleMessageOptions;
}): Omit<MailTransactionalWorkspaceHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildMailTransactionalWorkspaceStaticItem({
  description,
  id,
  label,
  value,
}: Omit<MailTransactionalWorkspaceHandoffItemView, 'ariaLabel'> & {
  localeOptions: MailLocaleMessageOptions;
}): Omit<MailTransactionalWorkspaceHandoffItemView, 'ariaLabel'> {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildMailTransactionalWorkspaceBoundaryItem({
  boundaryItem,
  id,
  localeOptions,
}: {
  boundaryItem: MailWorkspaceBoundaryItemView;
  id: MailTransactionalWorkspaceHandoffItemId;
  localeOptions: MailLocaleMessageOptions;
}): Omit<MailTransactionalWorkspaceHandoffItemView, 'ariaLabel'> {
  return {
    description: boundaryItem.description,
    id,
    label: m.mail_transactional_handoff_boundary_scope_label(
      { label: boundaryItem.label },
      localeOptions
    ),
    value: boundaryItem.label,
  };
}

function buildMailTransactionalWorkspaceHandoffPrivacyContract(
  itemViews: MailTransactionalWorkspaceHandoffItemView[]
): MailTransactionalWorkspaceHandoffPrivacyContract {
  return {
    exportsResultRecords: false,
    exposesActionUrls: false,
    exposesContactMessageText: false,
    exposesProviderApiTokens: false,
    exposesRawErrors: false,
    exposesRecipientEmail: false,
    exposesRecipientName: false,
    exposesSourceMaterialStorageKeys: false,
    exposesStudentIdentifiers: false,
    itemIds: itemViews.map((item) => item.id),
    mutatesActivities: false,
    mutatesAssignmentLinks: false,
    mutatesAttemptRecords: false,
    normalizesUnsupportedLocales: true,
    readsSourceMaterialFileBytes: false,
    rendersBeforeProviderSend: true,
    rendersSharedBoundaryPanel: true,
    scope: 'transactional-email-workspace-boundary',
    sendsLearnerNotifications: false,
    templateIds: [...MAIL_TRANSACTIONAL_TEMPLATE_IDS],
    usesLocalizedSubjects: true,
    usesProviderRegistryBoundary: true,
  };
}

function getMailWorkspaceBoundaryItem(
  boundaryView: MailWorkspaceBoundaryView,
  id: MailWorkspaceBoundaryItemId
) {
  const item = boundaryView.items.find(
    (boundaryItem) => boundaryItem.id === id
  );
  if (!item) {
    throw new Error(`Missing mail workspace boundary item: ${id}`);
  }

  return item;
}
