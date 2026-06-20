import { spawnSync } from 'node:child_process';
import { parseWranglerConfig } from './parse-wrangler';

const mode = process.argv[2];

if (mode !== 'local' && mode !== 'remote') {
  console.error('Usage: tsx scripts/migrate-d1.ts <local|remote>');
  process.exit(1);
}

const config = parseWranglerConfig();
const dbName = config.d1_databases?.[0]?.database_name;

if (!dbName) {
  console.error('Database name not found in wrangler.jsonc');
  process.exit(1);
}

const result = spawnSync(
  'wrangler',
  ['d1', 'migrations', 'apply', dbName, `--${mode}`],
  {
    shell: true,
    stdio: 'inherit',
  }
);

process.exit(result.status ?? 1);
