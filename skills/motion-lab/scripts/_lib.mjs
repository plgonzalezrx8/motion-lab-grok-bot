// Shared helpers: resolve playwright-core from the user's project first, then from the skill folder.
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function loadChromium() {
  const tries = [path.join(process.cwd(), 'package.json'), import.meta.url];
  for (const base of tries) {
    try {
      const req = createRequire(base);
      const p = req.resolve('playwright-core');
      const m = await import(pathToFileURL(p).href); return m.chromium || m.default?.chromium;
    } catch {}
  }
  console.error('playwright-core not found. In your project folder run:  npm i -D playwright-core');
  process.exit(2);
}

export function chromePath(explicit) {
  const c = [explicit, process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    'C:/Program Files/Google/Chrome/Application/chrome.exe'].filter(Boolean);
  const hit = c.find((p) => existsSync(p));
  if (!hit) { console.error('Chrome not found. Pass --chrome <path> or set CHROME_PATH.'); process.exit(2); }
  return hit;
}

// Software WebGL works without a GPU (slow but correct). Add --gpu to drop these flags on a GPU machine.
export const launchArgs = (gpu) => gpu ? ['--ignore-gpu-blocklist', '--enable-gpu-rasterization']
  : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'];

export function parseArgs(argv, defaults) {
  const out = { ...defaults, _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const n = argv[i + 1];
      if (n === undefined || n.startsWith('--')) out[k] = true; else { out[k] = n; i++; }
    } else out._.push(a);
  }
  return out;
}
