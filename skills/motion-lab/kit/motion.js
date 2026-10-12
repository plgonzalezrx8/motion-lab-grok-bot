// motion.js: one tokens file for every piece. No inline numbers in scene code.
// Pure functions of time only, so any frame renders on its own (see templates/render-contract.txt).
// Easing values: easings.net (Andrey Sitnik). Spring and token approach adapted from
// Florence (@flxrnc), "Motion Lab" article: https://x.com/flxrnc/status/2105311836190978392

export const EASE = {
  enter: [0.16, 1, 0.3, 1],     // ease-out-expo: text and logo reveals
  premium: [0.22, 1, 0.36, 1],  // ease-out-quint: premium entrances
  move: [0.76, 0, 0.24, 1],     // ease-in-out-quart: moves and camera pushes
  exit: [0.7, 0, 0.84, 0],      // ease-in-expo: fast exits
  pop: [0.34, 1.56, 0.64, 1],   // ease-out-back: playful overshoot
};
export const css = (b) => `cubic-bezier(${b.join(', ')})`;

export const MS = { feedback: 150, move: 400, hero: 750, exit: 240 };
export const STAGGER = { letter: 30, word: 90, item: 60 };

// cubic-bezier(x1,y1,x2,y2) as a function of progress u in [0,1].
export function bezier([x1, y1, x2, y2]) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (u) => {
    if (u <= 0) return 0;
    if (u >= 1) return 1;
    let t = u;
    for (let i = 0; i < 8; i++) {           // Newton
      const e = sx(t) - u, d = dx(t);
      if (Math.abs(e) < 1e-6) return sy(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1; t = u;               // bisection fallback
    for (let i = 0; i < 30; i++) { const x = sx(t); if (Math.abs(x - u) < 1e-6) break; x < u ? (lo = t) : (hi = t); t = (lo + hi) / 2; }
    return sy(t);
  };
}
export const ease = Object.fromEntries(Object.entries(EASE).map(([k, v]) => [k, bezier(v)]));

// Damping ratio from any library's spring numbers. 1 = no bounce, 0.7-0.85 premium, 0.4-0.6 playful, <0.3 cartoon.
// Remotion default (m1, d10, k100) -> 0.5. react-spring default (tension 170, friction 26) -> ~1.0.
export const dampingRatio = (k, d, m = 1) => d / (2 * Math.sqrt(k * m));

// A spring as a closed-form function of time (seconds since start), 0 -> 1. zeta: damping ratio. f: speed in Hz.
export function spring(t, zeta = 0.7, f = 2) {
  if (t <= 0) return 0;
  const w = 2 * Math.PI * f;
  if (zeta >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
  const wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + (zeta * w / wd) * Math.sin(wd * t));
}

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
// Progress of t through [start, start+dur], clamped, optionally eased.
export const prog = (t, start, dur, fn = (u) => u) => fn(clamp((t - start) / dur));

// Seeded PRNG (mulberry32). Never use unseeded Math.random in a render.
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Loops: phase in [0,1) with whole cycles; frames 0..N-1 only.
export const phase = (t, loopSeconds) => ((t % loopSeconds) + loopSeconds) % loopSeconds / loopSeconds;
// Beat grid: compute each beat from time and round per beat (never add a rounded frame count).
export const beatFrame = (n, bpm, fps) => Math.round((n * 60 / bpm) * fps);
export const framesPerBeat = (bpm, fps) => fps * 60 / bpm;
// Text hold: 0.3 s per word + 0.5 s.
export const holdSeconds = (words) => 0.3 * words + 0.5;
