#!/usr/bin/env node
// audio-render.mjs: render a code-synthesized score offline (Web Audio, headless Chrome) to a WAV file.
//   node audio-render.mjs sound.js --seconds 6 --rate 48000 --out out/score.wav [--fps 60 --bpm 120]
// sound.js is an ES module:  export default async function score(ctx, { seconds, fps, bpm, rate }) { ...schedule nodes on ctx... }
// ctx is an OfflineAudioContext (2 channels). Use ctx.destination; start times are in seconds (frame f -> f / fps).
// No samples, no downloads: synthesize everything with oscillators, noise buffers, gains and filters.
// Output: 32-bit float stereo WAV, DC removed per channel. Loudness is set later by export.sh (loudnorm -14 LUFS, -1 dBTP).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { loadChromium, chromePath, parseArgs } from './_lib.mjs';

const a = parseArgs(process.argv.slice(2), { seconds: '6', rate: '48000', fps: '60', bpm: '120', out: 'out/score.wav' });
const file = a._[0];
if (!file) { console.error('usage: node audio-render.mjs <sound.js> --seconds 6 --out out/score.wav'); process.exit(1); }
const src = readFileSync(file, 'utf8');
const chromium = await loadChromium();
const browser = await chromium.launch({ executablePath: chromePath(a.chrome), args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><title>audio</title>');
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const res = await page.evaluate(async ({ src, opts }) => {
  const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
  const mod = await import(url);
  const len = Math.round(opts.seconds * opts.rate);
  const ctx = new OfflineAudioContext(2, len, opts.rate);
  await mod.default(ctx, opts);
  const buf = await ctx.startRendering();
  const chans = [];
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(Math.min(c, buf.numberOfChannels - 1));
    let mean = 0; for (let i = 0; i < d.length; i++) mean += d[i]; mean /= d.length;
    const out = new Float32Array(d.length); for (let i = 0; i < d.length; i++) out[i] = d[i] - mean;
    const u8 = new Uint8Array(out.buffer); let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
    chans.push(btoa(s));
  }
  return { chans, rate: buf.sampleRate, length: buf.length };
}, { src, opts: { seconds: Number(a.seconds), rate: Number(a.rate), fps: Number(a.fps), bpm: Number(a.bpm) } }).catch((e) => { console.error(String(e)); return null; });
await browser.close();
if (!res) { if (errors.length) console.error(errors.join('\n')); process.exit(1); }
const L = new Float32Array(Buffer.from(res.chans[0], 'base64').buffer.slice(0));
const R = new Float32Array(Buffer.from(res.chans[1], 'base64').buffer.slice(0));
const n = res.length, bytes = n * 2 * 4;
const b = Buffer.alloc(44 + bytes);
b.write('RIFF', 0); b.writeUInt32LE(36 + bytes, 4); b.write('WAVE', 8); b.write('fmt ', 12);
b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(2, 22); b.writeUInt32LE(res.rate, 24);
b.writeUInt32LE(res.rate * 8, 28); b.writeUInt16LE(8, 32); b.writeUInt16LE(32, 34); b.write('data', 36); b.writeUInt32LE(bytes, 40);
let peak = 0;
for (let i = 0; i < n; i++) { b.writeFloatLE(L[i], 44 + i * 8); b.writeFloatLE(R[i], 48 + i * 8); peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i])); }
mkdirSync(path.dirname(a.out), { recursive: true });
writeFileSync(a.out, b);
console.log(`${a.out}: ${(n / res.rate).toFixed(3)} s, ${res.rate} Hz stereo float, sample peak ${(20 * Math.log10(peak || 1e-9)).toFixed(1)} dBFS`);
