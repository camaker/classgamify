import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import contentCollections from '@content-collections/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';

/**
 * Vite configuration
 * https://vite.dev/config/
 */
const config = defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isE2e = mode === 'e2e';

  return {
    server: {
      allowedHosts: ['.trycloudflare.com'],
    },
    resolve: {
      tsconfigPaths: true,
      alias: [
        {
          find: /^@tabler\/icons-react$/,
          replacement: fileURLToPath(
            new URL('./src/lib/tabler-icons.ts', import.meta.url)
          ),
        },
        {
          find: '@',
          replacement: fileURLToPath(new URL('./src', import.meta.url)),
        },
      ],
    },
    plugins: [
      !isProduction &&
        !isE2e &&
        devtools({
          eventBusConfig: {
            port: 0,
          },
        }),
      tailwindcss(),
      contentCollections(),
      !isE2e &&
        paraglideVitePlugin({
          project: './project.inlang',
          outdir: './src/locale/paraglide',
          strategy: ['url', 'cookie', 'baseLocale'],
          routeStrategies: [
            { match: '/api/:path(.*)?', exclude: true },
            { match: '/robots.txt', exclude: true },
            { match: '/sitemap.xml', exclude: true },
            { match: '/manifest.json', exclude: true },
          ],
          emitTsDeclarations: true,
          isServer: 'import.meta.env?.SSR === true',
          outputStructure: 'locale-modules',
        }),
      // https://developers.cloudflare.com/workers/vite-plugin/
      cloudflare({
        viteEnvironment: {
          name: 'ssr',
        },
      }),
      // https://tanstack.dev/start/latest/docs/framework/react/build-from-scratch
      tanstackStart({
        srcDirectory: 'src',
        start: { entry: './start.tsx' },
        server: { entry: './server.ts' },
      }),
      // react's vite plugin must come after start's vite plugin
      viteReact(),
    ],
  };
});

export default config;
