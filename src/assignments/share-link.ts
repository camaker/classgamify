export const assignmentShareLinkActionCopy = {
  copyLabel: 'Copy link',
  failureMessage: 'Student link could not be copied.',
  successMessage: 'Student link copied.',
} as const;

export function buildAssignmentSharePath(shareSlug: string) {
  return `/play/${encodeURIComponent(shareSlug)}`;
}

export function buildAssignmentShareUrl(shareSlug: string, baseUrl?: string) {
  const origin = normalizeShareBaseUrl(baseUrl ?? getRuntimeBaseUrl());
  return `${origin}${buildAssignmentSharePath(shareSlug)}`;
}

export function normalizeShareBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

function getRuntimeBaseUrl() {
  if (typeof window !== 'undefined') {
    return normalizeShareBaseUrl(window.location.origin);
  }

  return normalizeShareBaseUrl(
    import.meta.env?.VITE_BASE_URL ?? 'http://localhost:3000'
  );
}
