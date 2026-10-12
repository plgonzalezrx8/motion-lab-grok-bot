// sound.js for title-loop: everything synthesized with Web Audio, no samples. 4 s loop, 120 BPM, 24 fps picture.
// Each hit lands 1 frame after its visual event. Render: node ../../scripts/audio-render.mjs sound.js --seconds 4 --fps 24 --out out/score.wav
export default async function score(ctx, { fps = 24 }) {
  // No DynamicsCompressor: it adds ~6 ms of latency and makes every hit peak late. Loudness is set in export.sh.
  const out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination);
  const at = (frame) => (frame + 1) / fps;               // hit = visual frame + 1
  const noise = (() => { const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0); let s = 1;
    for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; } return b; })();

  function tone(t, freq, dur, gain, type = 'sine', attack = 0.0005) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.01);
  }
  function hiss(t, dur, gain, freq = 6000, q = 0.7) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f).connect(g).connect(out); s.start(t); s.stop(t + dur + 0.01);
  }
  // bed: soft kick every beat (12 frames at 120 BPM / 24 fps), pad on A minor -> F
  for (let b = 0; b < 8; b++) { const t = at(b * 12); tone(t, 110, 0.12, 0.35); tone(t, 190, 0.03, 0.12); }
  for (let b = 0; b < 8; b++) hiss(at(b * 12 + 6), 0.05, 0.09, 7000, 2);
  const pad = (t0, t1, freqs) => freqs.forEach((fq) => { const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = 'sawtooth'; o.frequency.value = fq; lp.type = 'lowpass'; lp.frequency.value = 1400; g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.07, t0 + 0.2);
    g.gain.setValueAtTime(0.07, t1 - 0.2); g.gain.linearRampToValueAtTime(0, t1); o.connect(lp).connect(g).connect(out); o.start(t0); o.stop(t1); });
  pad(0, 2, [220, 261.63, 329.63]); pad(2, 4, [174.61, 220, 261.63]);
  // hits: letters land (frames 8.4 + 2 per letter, ~frame 14 each spring peak), underline swish 26, glint shimmer 48, exit thumps 66
  [0, 1, 2, 3, 4, 5].forEach((i) => tone(at(14 + i * 2), 660 * Math.pow(2, [0, 2, 4, 7, 9, 12][i] / 12), 0.18, 0.18));
  hiss(at(26), 0.35, 0.12, 3000, 0.8);
  [0, 3, 7].forEach((k) => tone(at(48) + k * 0.03, 1760 * Math.pow(2, k / 12), 0.4, 0.05));
  tone(at(66), 90, 0.25, 0.4); hiss(at(66), 0.08, 0.08, 1200, 1);
}
