const LEGACY_PUBLIC_REDIRECTS = new Map([
  ['/create/create', '/create'],
  ['/(pages)/teachers', '/teachers'],
  ['/(pages)/contact', '/contact'],
  ['/(pages)/roadmap', '/roadmap'],
  ['/(legals)/terms', '/terms'],
  ['/(legals)/cookie', '/cookie'],
  ['/(legals)/terms/terms', '/terms'],
]);

export function redirectLegacyPublicRoute(request: Request) {
  const url = new URL(request.url);
  const destination = LEGACY_PUBLIC_REDIRECTS.get(url.pathname);
  if (!destination) return null;

  url.pathname = destination;
  return Response.redirect(url, 308);
}
