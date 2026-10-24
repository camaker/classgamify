import type { CompilerOptions } from '@inlang/paraglide-js';
import { resolve } from 'node:path';

export function getParaglideCompilerOptions(): CompilerOptions {
  return {
    project: resolve('project.inlang'),
    outdir: resolve('src/locale/paraglide'),
    strategy: ['url', 'cookie', 'baseLocale'],
    routeStrategies: [
      { match: '/api/:path(.*)?', exclude: true },
      { match: '/robots.txt', exclude: true },
      { match: '/sitemap.xml', exclude: true },
      { match: '/manifest.json', exclude: true },
    ],
    emitTsDeclarations: true,
    outputStructure: 'message-modules',
  };
}
