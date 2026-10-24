import { useEffect, useState } from 'react';
import { shouldLoadAnalyticsInBrowser } from '@/lib/analytics-host';
import { ClarityAnalytics } from './clarity-analytics';
import { GoogleAnalytics } from './google-analytics';
import { PlausibleAnalytics } from './plausible-analytics';
import { UmamiAnalytics } from './umami-analytics';

/**
 * Renders all script-based analytics, but only in production builds served
 * from the production hostname (see src/lib/analytics-host.ts). SSR renders
 * nothing; the hostname check runs on the client after hydration, so local
 * builds, E2E runs, and *.workers.dev previews never send analytics.
 */
export function Analytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(shouldLoadAnalyticsInBrowser());
  }, []);

  if (!enabled) return null;

  return (
    <>
      <GoogleAnalytics />
      <UmamiAnalytics />
      <PlausibleAnalytics />
      <ClarityAnalytics />
    </>
  );
}
