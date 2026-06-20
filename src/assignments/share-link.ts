import { getBaseUrl } from '@/lib/urls';

export function buildAssignmentSharePath(shareSlug: string) {
  return `/play/${encodeURIComponent(shareSlug)}`;
}

export function buildAssignmentShareUrl(shareSlug: string) {
  const baseUrl = getRuntimeBaseUrl();
  return `${baseUrl}${buildAssignmentSharePath(shareSlug)}`;
}

function getRuntimeBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '');
  }

  return getBaseUrl().replace(/\/$/, '');
}
