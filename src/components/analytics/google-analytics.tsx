import { useRouterState } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { ClientScript } from '@/components/shared/client-script';
import { clientEnv } from '@/env/client';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics (GA4)
 * https://analytics.google.com
 */
export function GoogleAnalytics() {
  if (!import.meta.env.PROD) return null;
  const id = clientEnv.VITE_GOOGLE_ANALYTICS_ID;
  if (!id) return null;

  const inlineHtml = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${id}', { send_page_view: false });
  `;
  return (
    <>
      <ClientScript
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        async
      />
      <ClientScript id="google-analytics" inlineHtml={inlineHtml} />
      <GoogleAnalyticsPageViews measurementId={id} />
    </>
  );
}

function GoogleAnalyticsPageViews({
  measurementId,
}: {
  measurementId: string;
}) {
  const href =
    useRouterState({
      select: (state) =>
        `${state.location.pathname}${state.location.searchStr}`,
    }) ?? '';
  const lastTrackedHref = useRef<string | null>(null);

  useEffect(() => {
    if (!href || lastTrackedHref.current === href) return;
    lastTrackedHref.current = href;

    const gtag =
      window.gtag ??
      ((...args: unknown[]) => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(args);
      });

    gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: href,
      page_title: document.title,
      send_to: measurementId,
    });
  }, [href, measurementId]);

  return null;
}
