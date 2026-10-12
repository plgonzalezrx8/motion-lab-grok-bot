#!/usr/bin/env node
// audio-hits.mjs: check that each sound hit peaks where it should (you can't listen, so measure).
//   node audio-hits.mjs out/score.wav --fps 60 --frames 60,90,94 [--lag 1] [--window 40]
// For each visual frame F, reports the largest peak in [F+lag, F+lag+window ms] and its offset from (F+lag)/fps in ms.
// Convention: each hit lands `lag` frames (default 1) after its visual event. Reads 16-bit PCM or 32-bit float WAV.
import { readFileSync } from 'node:fs';
import { parseArgs } from './_lib.mjs';
const a = parseArgs(process.argv.slice(2), { fps: '60', lag: '1', window: '40', frames: '' });
const buf = readFileSync(a._[0]);
let off = 12, fmt, ch, rate, bits, data;
while (off < buf.length) { const id = buf.toString('ascii', off, off + 4), sz = buf.readUInt32LE(off + 4);
  if (id === 'fmt ') { fmt = buf.readUInt16LE(off + 8); ch = buf.readUInt16LE(off + 10); rate = buf.readUInt32LE(off + 12); bits = buf.readUInt16LE(off + 22); }
  if (id === 'data') { data = buf.subarray(off + 8, off + 8 + sz); break; } off += 8 + sz + (sz % 2); }
const bps = bits / 8, n = data.length / (bps * ch);
const s = (i) => { let m = 0; for (let c = 0; c < ch; c++) { const p = (i * ch + c) * bps; const v = fmt === 3 ? data.readFloatLE(p) : data.readInt16LE(p) / 32768; m = Math.max(m, Math.abs(v)); } return m; };
const fps = Number(a.fps), lag = Number(a.lag), win = Number(a.window) / 1000;
console.log(`frame  target_ms  peak_ms  offset_ms  peak_dBFS`);
for (const f of String(a.frames).split(',').filter(Boolean).map(Number)) {
  const t = (f + lag) / fps, i0 = Math.round(t * rate), i1 = Math.min(n, Math.round((t + win) * rate));
  let bi = i0, bv = 0; for (let i = Math.max(0, i0 - Math.round(0.005 * rate)); i < i1; i++) { const v = s(i); if (v > bv) { bv = v; bi = i; } }
  console.log(`${String(f).padStart(5)}  ${(t * 1000).toFixed(1).padStart(9)}  ${(bi / rate * 1000).toFixed(1).padStart(7)}  ${((bi - i0) / rate * 1000).toFixed(1).padStart(9)}  ${(20 * Math.log10(bv || 1e-9)).toFixed(1).padStart(9)}`);
}
