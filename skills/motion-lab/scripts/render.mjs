#!/usr/bin/env node
// render.mjs: freeze an HTML animation at exact times and save PNG frames.
//   node render.mjs anim.html --seconds 6 --fps 24 --width 1080 --height 1080 --out out
//   node render.mjs anim.html --times 0,1.25,2.9 --out out          (stills only -> out/stills/t-<t>.png)
// Options: --frames a-b (subset), --subframes k (motion blur, averages k samples over half a frame),
//          --scale 2 (deviceScaleFactor), --chrome <path>, --gpu, --timeout ms (wait for window.__ready)
// Contract: the page exposes window.renderAt(t) (seconds) and sets window.__ready = true when assets are loaded.
// The page is opened with ?t=0 so it must not start its own requestAnimationFrame loop. CSS/WAAPI animations are
// paused and seeked to t as well. Frames are 0..N-1 (N = seconds*fps), never N.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadChromium, chromePath, launchArgs, parseArgs } from './_lib.mjs';

const a = parseArgs(process.argv.slice(2), { seconds: '6', fps: '24', width: '1080', height: '1080', out: 'out', subframes: '1', scale: '1', timeout: '60000' });
const file = a._[0];
if (!file) { console.error('usage: node render.mjs <anim.html> [--seconds 6 --fps 24 --width 1080 --height 1080 --out out]'); process.exit(1); }
const FPS = Number(a.fps), SECS = Number(a.seconds), N = Math.round(SECS * FPS);
const W = Number(a.width), H = Number(a.height), SUB = Math.max(1, Number(a.subframes));

const chromium = await loadChromium();
const browser = await chromium.launch({ executablePath: chromePath(a.chrome), args: launchArgs(a.gpu) });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: Number(a.scale) });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const url = /^https?:/.test(file) ? file : pathToFileURL(path.resolve(file)).href;
await page.goto(url + (url.includes('?') ? '&' : '?') + 't=0', { waitUntil: 'load' });
await page.evaluate(async () => { if (document.fonts) await document.fonts.ready; });
const ready = await page.waitForFunction(() => window.__ready === true, null, { timeout: Number(a.timeout) }).then(() => true).catch(() => false);
if (!ready) console.warn('warning: window.__ready was never set; rendering anyway (fonts/textures may be missing).');
const hasRenderAt = await page.evaluate(() => typeof window.renderAt === 'function');
if (!hasRenderAt) console.warn('warning: window.renderAt(t) not found; only CSS/WAAPI animations will be seeked.');

async function seek(t) {
  await page.evaluate(async (t) => {
    document.getAnimations().forEach((an) => { an.pause(); an.currentTime = t * 1000; });
    if (window.renderAt) await window.renderAt(t);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, t);
}

async function shot(t, outPath) {
  if (SUB === 1) { await seek(t); await page.screenshot({ path: outPath }); return; }
  // Motion blur: average SUB samples across half a frame (180-degree shutter), blended in the page.
  const bufs = [];
  for (let s = 0; s < SUB; s++) { await seek(t + (s / SUB - 0.5 + 0.5 / SUB) * (0.5 / FPS)); bufs.push((await page.screenshot()).toString('base64')); }
  const png = await page.evaluate(async (list) => {
    const imgs = await Promise.all(list.map((b) => new Promise((r) => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + b; })));
    const c = new OffscreenCanvas(imgs[0].width, imgs[0].height), g = c.getContext('2d');
    const acc = new Float32Array(c.width * c.height * 4);
    for (const im of imgs) { g.clearRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data;
      for (let i = 0; i < d.length; i++) acc[i] += i % 4 === 3 ? d[i] : Math.pow(d[i] / 255, 2.2); }
    const o = g.createImageData(c.width, c.height);
    for (let i = 0; i < acc.length; i++) o.data[i] = i % 4 === 3 ? acc[i] / imgs.length : Math.round(255 * Math.pow(acc[i] / imgs.length, 1 / 2.2));
    g.putImageData(o, 0, 0);
    const blob = await c.convertToBlob({ type: 'image/png' });
    const ab = new Uint8Array(await blob.arrayBuffer()); let s = ''; for (let i = 0; i < ab.length; i++) s += String.fromCharCode(ab[i]); return btoa(s);
  }, bufs);
  writeFileSync(outPath, Buffer.from(png, 'base64'));
}

const t0 = Date.now();
if (a.times) {
  mkdirSync(path.join(a.out, 'stills'), { recursive: true });
  for (const ts of String(a.times).split(',').map(Number)) {
    const p = path.join(a.out, 'stills', `t-${ts.toFixed(3)}.png`);
    await shot(ts, p); console.log(p);
  }
} else {
  mkdirSync(path.join(a.out, 'frames'), { recursive: true });
  let [from, to] = [0, N - 1];
  if (a.frames) { const [x, y] = String(a.frames).split('-').map(Number); from = x; to = Number.isFinite(y) ? y : x; }
  for (let i = from; i <= to; i++) {
    await shot(i / FPS, path.join(a.out, 'frames', `${String(i).padStart(4, '0')}.png`));
    if (i % 24 === 0 || i === to) process.stdout.write(`\rframe ${i}/${N - 1}`);
  }
  process.stdout.write('\n');
  console.log(`${to - from + 1} frames -> ${path.join(a.out, 'frames')} (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
}
if (errors.length) { console.warn('page errors:\n  ' + [...new Set(errors)].slice(0, 10).join('\n  ')); }
await browser.close();
