import { m } from '@/locale/paraglide/messages';
import type { ContactClassroomInquiryFieldId } from '@/contact/inquiry';

export const CONTACT_CLASSROOM_INQUIRY_SCOPE_ITEM_IDS = [
  'learners',
  'activity-material',
  'assignment-routine',
  'template-worksheet',
  'result-review',
] as const;

export type ContactClassroomInquiryScopeItemId =
  (typeof CONTACT_CLASSROOM_INQUIRY_SCOPE_ITEM_IDS)[number];

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
