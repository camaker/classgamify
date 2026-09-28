import { defineConfig } from 'vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';
import tailwindcss from '@tailwindcss/vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import contentCollections from '@content-collections/vite';
import { compile, paraglideVitePlugin } from '@inlang/paraglide-js';

const PARAGLIDE_OPTIONS = {
  project: './project.inlang',
  outdir: './src/locale/paraglide',
  strategy: ['url', 'cookie', 'baseLocale'],
  routeStrategies: [
    { match: '/api/:path(.*)?', exclude: true },
    { match: '/robots.txt', exclude: true },
    { match: '/sitemap.xml', exclude: true },
    { match: '/manifest.json', exclude: true },
  ],
  emitTsDeclarations: false,
} satisfies Parameters<typeof paraglideVitePlugin>[0];

/**
 * Vite configuration
 * https://vite.dev/config/
 */
const config = defineConfig(async ({ command, mode }) => {
  const isE2e = mode === 'e2e';

  // Message modules emit one file per message (~7,800). Under `vite dev` the
  // file watcher holds one descriptor per file, and once the process passes
  // 10,240 descriptors Node on macOS fails to spawn workerd with EBADF (the
  // Cloudflare plugin starts it after the watcher is up). Paraglide
  // recommends locale modules for dev (opral/inlang-paraglide-js#486);
  // builds keep message modules. e2e mode runs without the Paraglide plugin,
  // so compile once up front.
  if (isE2e && command === 'serve') {
    await compile({ ...PARAGLIDE_OPTIONS, outputStructure: 'locale-modules' });
  }

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
      tailwindcss(),
      contentCollections(),
      !isE2e &&
        paraglideVitePlugin({
          ...PARAGLIDE_OPTIONS,
          outputStructure:
            command === 'build' ? 'message-modules' : 'locale-modules',
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
