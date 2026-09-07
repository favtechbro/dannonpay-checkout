import { copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// The inline SDK is published from its own package but served from this origin,
// so merchants load it with a single script tag from the checkout domain.
const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, '../../dannonpay_inline/dist/dannon.umd.cjs');
const target = resolve(here, '../public/dannon.js');

if (!existsSync(source)) {
  console.log('[checkout] inline SDK build not found, skipping copy');
  process.exit(0);
}

await mkdir(dirname(target), { recursive: true });
await copyFile(source, target);
console.log('[checkout] copied the inline SDK to public/dannon.js');
