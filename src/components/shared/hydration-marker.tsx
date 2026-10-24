import { useEffect } from 'react';

/**
 * Marks <html data-hydrated="true"> once React has hydrated the document.
 * React hydrates the whole tree in one commit, so every server-rendered
 * control is interactive by the time this effect runs. E2E navigation waits
 * for it (tests/e2e/fixtures/test.ts), which matters under `vite dev`, where
 * loading unbundled modules delays hydration by several seconds.
 */
export function HydrationMarker() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = 'true';
  }, []);

  return null;
}
