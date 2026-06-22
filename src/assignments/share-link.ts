import { normalizeAssignmentShareSlug } from '@/assignments/share-slug';
import { m } from '@/locale/paraglide/messages';

export const assignmentShareLinkActionCopy = {
  get copyLabel() {
    return m.assignment_share_link_copy_label();
  },
  get failureMessage() {
    return m.assignment_share_link_copy_failure();
  },
  get successMessage() {
    return m.assignment_share_link_copy_success();
  },
} as const;

export function buildAssignmentSharePath(shareSlug: string) {
  return `/play/${encodeURIComponent(normalizeAssignmentShareSlug(shareSlug))}`;
}

export function buildAssignmentShareUrl(shareSlug: string, baseUrl?: string) {
  const origin = normalizeShareBaseUrl(baseUrl ?? getRuntimeBaseUrl());
  return `${origin}${buildAssignmentSharePath(shareSlug)}`;
}

export function normalizeShareBaseUrl(baseUrl: string) {
  return baseUrl.trim().replace(/\/+$/, '');
}

function getRuntimeBaseUrl() {
  if (typeof window !== 'undefined') {
    return normalizeShareBaseUrl(window.location.origin);
  }

  return normalizeShareBaseUrl(
    import.meta.env?.VITE_BASE_URL ?? 'http://localhost:3000'
  );
}
