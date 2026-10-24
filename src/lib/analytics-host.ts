/**
 * Hostnames whose traffic counts as real learner traffic. Analytics (GA4,
 * Umami, Plausible, Microsoft Clarity) only load here, so local dev, E2E runs,
 * `vite preview`/`wrangler dev` builds on localhost, and *.workers.dev
 * previews never pollute production reports.
 */
const ANALYTICS_HOSTNAMES: readonly string[] = [
  'classgamify.com',
  'www.classgamify.com',
];

interface AnalyticsEnvironment {
  /** `window.location.hostname`; undefined during SSR. */
  hostname: string | undefined;
  /** `import.meta.env.PROD` */
  prod: boolean;
  /** `import.meta.env.MODE` */
  mode: string | undefined;
  /** `navigator.webdriver`: true under Playwright and other automation. */
  webdriver?: boolean;
}

/**
 * Decides whether analytics scripts may load. SSR never has a hostname, so it
 * always returns false there; the client re-checks after hydration.
 */
export function shouldLoadAnalytics({
  hostname,
  prod,
  mode,
  webdriver,
}: AnalyticsEnvironment): boolean {
  if (!prod) return false;
  if (mode === 'e2e' || mode === 'test') return false;
  if (webdriver) return false;
  if (!hostname) return false;
  const normalized = hostname.trim().toLowerCase().replace(/\.$/, '');
  return ANALYTICS_HOSTNAMES.includes(normalized);
}

/** Reads the current browser environment; false on the server. */
export function shouldLoadAnalyticsInBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  return shouldLoadAnalytics({
    hostname: window.location.hostname,
    prod: import.meta.env.PROD,
    mode: import.meta.env.MODE,
    webdriver:
      typeof navigator !== 'undefined' ? navigator.webdriver : undefined,
  });
}
