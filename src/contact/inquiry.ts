export const CONTACT_MESSAGE_LIMITS = {
  email: {
    max: 254,
  },
  message: {
    max: 1500,
    min: 10,
  },
  name: {
    max: 30,
    min: 3,
  },
} as const;

export const CONTACT_CLASSROOM_INQUIRY_FIELD_IDS = [
  'learners',
  'grade',
  'material',
  'routine',
  'need',
] as const;

export type ContactClassroomInquiryFieldId =
  (typeof CONTACT_CLASSROOM_INQUIRY_FIELD_IDS)[number];

export const CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS = {
  grade: 80,
  learners: 80,
  material: 120,
  need: 120,
  routine: 120,
} satisfies Record<ContactClassroomInquiryFieldId, number>;

export const CONTACT_CLASSROOM_INQUIRY_MAX_FIELD_LENGTH = Math.max(
  ...Object.values(CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS)
);

export type ContactInquiryIntent = 'classroom' | 'general';

export type ContactClassroomInquiryInput = Partial<
  Record<ContactClassroomInquiryFieldId, string | null | undefined>
>;

export type ContactClassroomInquiryField = {
  id: ContactClassroomInquiryFieldId;
  value: string;
};

export type ContactClassroomInquiryPayload = {
  fields: ContactClassroomInquiryField[];
  intent: 'classroom';
};

export function normalizeContactInquiryIntent(
  value: unknown
): ContactInquiryIntent {
  return value === 'classroom' ? 'classroom' : 'general';
}

export function normalizeContactClassroomInquiryFields(
  input: ContactClassroomInquiryInput
): ContactClassroomInquiryField[] {
  return CONTACT_CLASSROOM_INQUIRY_FIELD_IDS.flatMap((id) => {
    const value = normalizeContactClassroomInquiryValue(
      input[id],
      CONTACT_CLASSROOM_INQUIRY_FIELD_LIMITS[id]
    );

    return value ? [{ id, value }] : [];
  });
}

export function buildContactClassroomInquiryPayload(
  input: ContactClassroomInquiryInput
): ContactClassroomInquiryPayload {
  return {
    fields: normalizeContactClassroomInquiryFields(input),
    intent: 'classroom',
  };
}

export function hasContactClassroomInquiryPayload(
  value: unknown
): value is ContactClassroomInquiryPayload {
  if (!isRecord(value) || value.intent !== 'classroom') return false;
  if (!Array.isArray(value.fields)) return false;

  return value.fields.every((field) => {
    if (!isRecord(field)) return false;
    if (typeof field.value !== 'string' || !field.value.trim()) return false;

    return CONTACT_CLASSROOM_INQUIRY_FIELD_IDS.includes(
      field.id as ContactClassroomInquiryFieldId
    );
  });
}

function normalizeContactClassroomInquiryValue(
  value: string | null | undefined,
  maxLength: number
) {
  return (value ?? '')
    .normalize('NFKC')
    .replace(/\s+/gu, ' ')
    .trim()
    .slice(0, maxLength);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}
