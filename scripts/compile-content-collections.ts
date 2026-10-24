import { createBuilder } from '@content-collections/core';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function compileContentCollections(
  configurationPath = resolve('content-collections.ts')
): Promise<void> {
  const builder = await createBuilder(configurationPath);
  const errors: Error[] = [];
  // Collection validation reports errors through events instead of rejecting
  // build(). The release gate must fail before consumers see partial output.
  builder.on('_error', ({ error }) => errors.push(error));
  await builder.build();
  if (errors.length > 0) {
    throw new AggregateError(errors, 'Content collection compilation failed');
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  await compileContentCollections();
}
