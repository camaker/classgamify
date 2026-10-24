import {
  test as base,
  expect,
  type Page,
  type Response,
} from '@playwright/test';

/**
 * Wait until React has hydrated the page (<html data-hydrated="true">, set by
 * src/components/shared/hydration-marker.tsx). Until then, server-rendered
 * buttons ignore clicks and client-only state (localStorage, toasts) is not
 * rendered yet. Production builds hydrate in well under a second; `vite dev`
 * can take several seconds while it serves unbundled modules.
 */
export async function waitForHydration(page: Page) {
  await page.waitForFunction(
    () => document.documentElement.dataset.hydrated === 'true',
    null,
    { timeout: 30_000 }
  );
}

async function afterNavigation(page: Page, response: Response | null) {
  const contentType = response?.headers()['content-type'] ?? '';
  // Only app documents hydrate; skip text/JSON endpoints. 404 and error
  // pages are app documents too, so the status code does not matter.
  if (contentType.includes('text/html')) {
    await waitForHydration(page);
  }
}

/**
 * Drop-in replacement for `@playwright/test`: `page.goto` and `page.reload`
 * resolve only after the app is interactive.
 */
export const test = base.extend({
  page: async (
    { page }: { page: Page },
    use: (page: Page) => Promise<void>
  ) => {
    const goto = page.goto.bind(page);
    const reload = page.reload.bind(page);

    page.goto = async (url: string, options?: Parameters<Page['goto']>[1]) => {
      const response = await goto(url, options);
      await afterNavigation(page, response);
      return response;
    };
    page.reload = async (options?: Parameters<Page['reload']>[0]) => {
      const response = await reload(options);
      await afterNavigation(page, response);
      return response;
    };

    await use(page);
  },
});

export { expect };
