// sound-starter.js: score skeleton for scripts/audio-render.mjs (OfflineAudioContext, no samples, no downloads).
// Rules: each hit lands 1 frame after its visual event; no DynamicsCompressor (it delays peaks ~6 ms);
// start tones at a cosine crest with a 0.5 ms attack so the first peak sits on the frame; loudness is set by export.sh.
export default async function score(ctx, { fps = 24, bpm = 120, seconds = 6 }) {
  const out = ctx.createGain(); out.gain.value = 0.8; out.connect(ctx.destination);
  const at = (frame) => (frame + 1) / fps;
  const beat = (n) => n * 60 / bpm;                       // compute every beat from time, never add rounded frames
  const tone = (t, freq, dur, gain, type = 'sine') => {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain, t + 0.0005); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(out); o.start(t); o.stop(t + dur + 0.01);
  };
  for (let n = 0; beat(n) < seconds; n++) tone(beat(n), 110, 0.12, 0.3);   // bed: kick on every beat
  tone(at(24), 880, 0.25, 0.2);                                            // a hit 1 frame after visual frame 24
}
