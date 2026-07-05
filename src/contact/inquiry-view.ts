import { m } from '@/locale/paraglide/messages';
import {
  CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS,
  type ContactClassroomInquiryFieldId,
} from '@/contact/inquiry';

export const CONTACT_CLASSROOM_INQUIRY_SCOPE_ITEM_IDS = [
  'learners',
  'activity-material',
  'assignment-routine',
  'template-worksheet',
  'result-review',
] as const;

export const CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS = [
  'classroom-intent',
  'contact-route',
  'inquiry-panel',
  'scope-panel',
  'scope-field-mapping',
  'subject-routing',
  'message-template',
  'form-rendering',
  'learners-field',
  'grade-field',
  'material-field',
  'routine-field',
  'need-field',
  'message-body',
  'name-field',
  'email-field',
  'field-normalization',
  'field-limits',
  'structured-payload',
  'client-submit-boundary',
  'api-intent-normalization',
  'server-rebuild-boundary',
  'mail-context',
  'email-template-boundary',
  'locale-forwarding',
  'safe-context-boundary',
  'private-data-guard',
  'no-activity-mutation',
  'no-student-notification',
  'legacy-copy-guard',
] as const;

export type ContactClassroomInquiryScopeItemId =
  (typeof CONTACT_CLASSROOM_INQUIRY_SCOPE_ITEM_IDS)[number];

export type ContactClassroomIntakeHandoffItemId =
  (typeof CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS)[number];

export type ContactClassroomInquiryPrivacyBoundaryId = 'safe-classroom-context';

export type ContactClassroomInquiryScopeItemView = {
  description: string;
  fieldIds: ContactClassroomInquiryFieldId[];
  id: ContactClassroomInquiryScopeItemId;
  title: string;
};

export type ContactClassroomInquiryPrivacyBoundaryView = {
  description: string;
  id: ContactClassroomInquiryPrivacyBoundaryId;
  title: string;
};

export type ContactClassroomIntakeHandoffItemView = {
  ariaLabel: string;
  description: string;
  id: ContactClassroomIntakeHandoffItemId;
  label: string;
  value: string;
};

export type ContactClassroomIntakeHandoffPrivacyContract = {
  createsActivities: false;
  createsAssignmentLinks: false;
  createsStudentRecords: false;
  exposesContactMessageTextInHandoff: false;
  exposesPrivateFileUrls: false;
  exposesRawProviderErrors: false;
  exposesRawStudentIdentifiers: false;
  exposesRecipientEmailInView: false;
  exposesSourceMaterialStorageKeys: false;
  forwardsLocaleToMail: true;
  itemIds: ContactClassroomIntakeHandoffItemId[];
  mutatesTeacherWorkspace: false;
  notifiesLearners: false;
  persistsActivityContent: false;
  readsFileBytes: false;
  rendersStructuredFieldsInMail: true;
  scope: 'public-classroom-inquiry-intake';
  usesClassroomRouteIntent: true;
  usesStructuredFields: true;
};

export type ContactClassroomIntakeHandoffView = {
  description: string;
  itemViews: ContactClassroomIntakeHandoffItemView[];
  privacy: ContactClassroomIntakeHandoffPrivacyContract;
  title: string;
};

export type ContactClassroomInquiryScopeView = {
  description: string;
  items: ContactClassroomInquiryScopeItemView[];
  privacyBoundary: ContactClassroomInquiryPrivacyBoundaryView;
  title: string;
};

export function buildContactClassroomInquiryScopeView(): ContactClassroomInquiryScopeView {
  return {
    description: m.contact_classroom_scope_description(),
    items: [
      {
        description: m.contact_classroom_scope_learners_description(),
        fieldIds: ['learners', 'grade'],
        id: 'learners',
        title: m.contact_classroom_scope_learners_title(),
      },
      {
        description: m.contact_classroom_scope_activity_material_description(),
        fieldIds: ['material'],
        id: 'activity-material',
        title: m.contact_classroom_scope_activity_material_title(),
      },
      {
        description: m.contact_classroom_scope_assignment_routine_description(),
        fieldIds: ['routine'],
        id: 'assignment-routine',
        title: m.contact_classroom_scope_assignment_routine_title(),
      },
      {
        description: m.contact_classroom_scope_template_worksheet_description(),
        fieldIds: ['material', 'need'],
        id: 'template-worksheet',
        title: m.contact_classroom_scope_template_worksheet_title(),
      },
      {
        description: m.contact_classroom_scope_result_review_description(),
        fieldIds: ['need'],
        id: 'result-review',
        title: m.contact_classroom_scope_result_review_title(),
      },
    ],
    privacyBoundary: {
      description: m.contact_classroom_scope_privacy_description(),
      id: 'safe-classroom-context',
      title: m.contact_classroom_scope_privacy_title(),
    },
    title: m.contact_classroom_scope_title(),
  };
}

export function buildContactClassroomIntakeHandoffView({
  scopeView = buildContactClassroomInquiryScopeView(),
}: {
  scopeView?: ContactClassroomInquiryScopeView;
} = {}): ContactClassroomIntakeHandoffView {
  const itemViews = CONTACT_CLASSROOM_INTAKE_HANDOFF_ITEM_IDS.map((id) =>
    buildContactClassroomIntakeHandoffItemView({ id, scopeView })
  );

  return {
    description: m.contact_classroom_intake_handoff_description(),
    itemViews,
    privacy: buildContactClassroomIntakeHandoffPrivacyContract(itemViews),
    title: m.contact_classroom_intake_handoff_title(),
  };
}

function buildContactClassroomIntakeHandoffItemView({
  id,
  scopeView,
}: {
  id: ContactClassroomIntakeHandoffItemId;
  scopeView: ContactClassroomInquiryScopeView;
}): ContactClassroomIntakeHandoffItemView {
  const item = buildContactClassroomIntakeHandoffItem({ id, scopeView });

  return {
    ...item,
    ariaLabel: m.contact_classroom_intake_handoff_item_aria_label({
      description: item.description,
      label: item.label,
      value: item.value,
    }),
  };
}

function buildContactClassroomIntakeHandoffItem({
  id,
  scopeView,
}: {
  id: ContactClassroomIntakeHandoffItemId;
  scopeView: ContactClassroomInquiryScopeView;
}): Omit<ContactClassroomIntakeHandoffItemView, 'ariaLabel'> {
  if (id === 'classroom-intent') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_classroom_intent_description(),
      id,
      label: m.contact_classroom_intake_handoff_classroom_intent_label(),
      value: m.contact_classroom_intake_handoff_classroom_intent_value(),
    });
  }

  if (id === 'contact-route') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_contact_route_description(),
      id,
      label: m.contact_classroom_intake_handoff_contact_route_label(),
      value: m.contact_classroom_intake_handoff_contact_route_value(),
    });
  }

  if (id === 'inquiry-panel') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_inquiry_panel_description(),
      id,
      label: m.contact_classroom_intake_handoff_inquiry_panel_label(),
      value: m.contact_classroom_intake_handoff_inquiry_panel_value(),
    });
  }

  if (id === 'scope-panel') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description: m.contact_classroom_intake_handoff_scope_panel_description({
        scopeItemCount: scopeView.items.length,
      }),
      id,
      label: m.contact_classroom_intake_handoff_scope_panel_label(),
      value: m.contact_classroom_intake_handoff_scope_panel_value({
        scopeItemCount: scopeView.items.length,
      }),
    });
  }

  if (id === 'scope-field-mapping') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_scope_field_mapping_description({
          fieldIds:
            getContactClassroomInquiryScopeFieldIds(scopeView).join(', '),
        }),
      id,
      label: m.contact_classroom_intake_handoff_scope_field_mapping_label(),
      value: m.contact_classroom_intake_handoff_scope_field_mapping_value(),
    });
  }

  if (id === 'subject-routing') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_subject_routing_description(),
      id,
      label: m.contact_classroom_intake_handoff_subject_routing_label(),
      value: m.contact_subject_classroom(),
    });
  }

  if (id === 'message-template') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_message_template_description(),
      id,
      label: m.contact_classroom_intake_handoff_message_template_label(),
      value: m.contact_classroom_intake_handoff_message_template_value(),
    });
  }

  if (id === 'form-rendering') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_form_rendering_description(),
      id,
      label: m.contact_classroom_intake_handoff_form_rendering_label(),
      value: m.contact_classroom_intake_handoff_form_rendering_value(),
    });
  }

  if (id === 'learners-field') {
    return buildContactClassroomIntakeHandoffScopeItem({
      fieldIds: ['learners'],
      id,
      itemView: getContactClassroomInquiryScopeItem(scopeView, 'learners'),
      value: m.contact_classroom_learners_label(),
    });
  }

  if (id === 'grade-field') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description: m.contact_classroom_intake_handoff_grade_field_description(),
      id,
      label: m.contact_classroom_intake_handoff_grade_field_label(),
      value: m.contact_classroom_grade_label(),
    });
  }

  if (id === 'material-field') {
    return buildContactClassroomIntakeHandoffScopeItem({
      fieldIds: ['material'],
      id,
      itemView: getContactClassroomInquiryScopeItem(
        scopeView,
        'activity-material'
      ),
      value: m.contact_classroom_material_label(),
    });
  }

  if (id === 'routine-field') {
    return buildContactClassroomIntakeHandoffScopeItem({
      fieldIds: ['routine'],
      id,
      itemView: getContactClassroomInquiryScopeItem(
        scopeView,
        'assignment-routine'
      ),
      value: m.contact_classroom_routine_label(),
    });
  }

  if (id === 'need-field') {
    return buildContactClassroomIntakeHandoffScopeItem({
      fieldIds: ['need'],
      id,
      itemView: getContactClassroomInquiryScopeItem(
        scopeView,
        'template-worksheet'
      ),
      value: m.contact_classroom_need_label(),
    });
  }

  if (id === 'message-body') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_message_body_description(),
      id,
      label: m.contact_classroom_intake_handoff_message_body_label(),
      value: m.contact_message(),
    });
  }

  if (id === 'name-field') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description: m.contact_classroom_intake_handoff_name_field_description(),
      id,
      label: m.contact_classroom_intake_handoff_name_field_label(),
      value: m.contact_name(),
    });
  }

  if (id === 'email-field') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description: m.contact_classroom_intake_handoff_email_field_description(),
      id,
      label: m.contact_classroom_intake_handoff_email_field_label(),
      value: m.contact_email(),
    });
  }

  if (id === 'field-normalization') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_field_normalization_description(),
      id,
      label: m.contact_classroom_intake_handoff_field_normalization_label(),
      value: m.contact_classroom_intake_handoff_field_normalization_value(),
    });
  }

  if (id === 'field-limits') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description: m.contact_classroom_intake_handoff_field_limits_description({
        gradeLimit: CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS.grade,
        learnersLimit: CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS.learners,
        materialLimit: CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS.material,
        needLimit: CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS.need,
        routineLimit: CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS.routine,
      }),
      id,
      label: m.contact_classroom_intake_handoff_field_limits_label(),
      value: m.contact_classroom_intake_handoff_field_limits_value(),
    });
  }

  if (id === 'structured-payload') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_structured_payload_description(),
      id,
      label: m.contact_classroom_intake_handoff_structured_payload_label(),
      value: m.contact_classroom_intake_handoff_structured_payload_value(),
    });
  }

  if (id === 'client-submit-boundary') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_client_submit_boundary_description(),
      id,
      label: m.contact_classroom_intake_handoff_client_submit_boundary_label(),
      value: m.contact_classroom_intake_handoff_client_submit_boundary_value(),
    });
  }

  if (id === 'api-intent-normalization') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_api_intent_normalization_description(),
      id,
      label:
        m.contact_classroom_intake_handoff_api_intent_normalization_label(),
      value:
        m.contact_classroom_intake_handoff_api_intent_normalization_value(),
    });
  }

  if (id === 'server-rebuild-boundary') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_server_rebuild_boundary_description(),
      id,
      label: m.contact_classroom_intake_handoff_server_rebuild_boundary_label(),
      value: m.contact_classroom_intake_handoff_server_rebuild_boundary_value(),
    });
  }

  if (id === 'mail-context') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_mail_context_description(),
      id,
      label: m.contact_classroom_intake_handoff_mail_context_label(),
      value: m.contact_classroom_intake_handoff_mail_context_value(),
    });
  }

  if (id === 'email-template-boundary') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_email_template_boundary_description(),
      id,
      label: m.contact_classroom_intake_handoff_email_template_boundary_label(),
      value: m.contact_classroom_intake_handoff_email_template_boundary_value(),
    });
  }

  if (id === 'locale-forwarding') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_locale_forwarding_description(),
      id,
      label: m.contact_classroom_intake_handoff_locale_forwarding_label(),
      value: m.contact_classroom_intake_handoff_locale_forwarding_value(),
    });
  }

  if (id === 'safe-context-boundary') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description: scopeView.privacyBoundary.description,
      id,
      label: scopeView.privacyBoundary.title,
      value: m.contact_classroom_intake_handoff_safe_context_boundary_value(),
    });
  }

  if (id === 'private-data-guard') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_private_data_guard_description(),
      id,
      label: m.contact_classroom_intake_handoff_private_data_guard_label(),
      value: m.contact_classroom_intake_handoff_private_data_guard_value(),
    });
  }

  if (id === 'no-activity-mutation') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_no_activity_mutation_description(),
      id,
      label: m.contact_classroom_intake_handoff_no_activity_mutation_label(),
      value: m.contact_classroom_intake_handoff_no_activity_mutation_value(),
    });
  }

  if (id === 'no-student-notification') {
    return buildContactClassroomIntakeHandoffStaticItem({
      description:
        m.contact_classroom_intake_handoff_no_student_notification_description(),
      id,
      label: m.contact_classroom_intake_handoff_no_student_notification_label(),
      value: m.contact_classroom_intake_handoff_no_student_notification_value(),
    });
  }

  return buildContactClassroomIntakeHandoffStaticItem({
    description:
      m.contact_classroom_intake_handoff_legacy_copy_guard_description(),
    id,
    label: m.contact_classroom_intake_handoff_legacy_copy_guard_label(),
    value: m.contact_classroom_intake_handoff_legacy_copy_guard_value(),
  });
}

function buildContactClassroomIntakeHandoffStaticItem({
  description,
  id,
  label,
  value,
}: Omit<ContactClassroomIntakeHandoffItemView, 'ariaLabel'>) {
  return {
    description,
    id,
    label,
    value,
  };
}

function buildContactClassroomIntakeHandoffScopeItem({
  fieldIds,
  id,
  itemView,
  value,
}: {
  fieldIds: ContactClassroomInquiryFieldId[];
  id: ContactClassroomIntakeHandoffItemId;
  itemView: ContactClassroomInquiryScopeItemView;
  value: string;
}) {
  return buildContactClassroomIntakeHandoffStaticItem({
    description: m.contact_classroom_intake_handoff_scope_field_description({
      description: itemView.description,
      fieldIds: fieldIds.join(', '),
    }),
    id,
    label: itemView.title,
    value,
  });
}

function buildContactClassroomIntakeHandoffPrivacyContract(
  itemViews: ContactClassroomIntakeHandoffItemView[]
): ContactClassroomIntakeHandoffPrivacyContract {
  return {
    createsActivities: false,
    createsAssignmentLinks: false,
    createsStudentRecords: false,
    exposesContactMessageTextInHandoff: false,
    exposesPrivateFileUrls: false,
    exposesRawProviderErrors: false,
    exposesRawStudentIdentifiers: false,
    exposesRecipientEmailInView: false,
    exposesSourceMaterialStorageKeys: false,
    forwardsLocaleToMail: true,
    itemIds: itemViews.map((item) => item.id),
    mutatesTeacherWorkspace: false,
    notifiesLearners: false,
    persistsActivityContent: false,
    readsFileBytes: false,
    rendersStructuredFieldsInMail: true,
    scope: 'public-classroom-inquiry-intake',
    usesClassroomRouteIntent: true,
    usesStructuredFields: true,
  };
}

function getContactClassroomInquiryScopeFieldIds(
  scopeView: ContactClassroomInquiryScopeView
) {
  return [...new Set(scopeView.items.flatMap((item) => item.fieldIds))];
}

function getContactClassroomInquiryScopeItem(
  scopeView: ContactClassroomInquiryScopeView,
  id: ContactClassroomInquiryScopeItemId
) {
  const itemView = scopeView.items.find((item) => item.id === id);
  if (!itemView) {
    throw new Error(`Missing contact classroom inquiry scope item: ${id}`);
  }

  return itemView;
}
