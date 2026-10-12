---
name: motion-lab
description: Direct, render and export studio-quality motion design from code (title animations, logo stings, 3D product shots, character loops, explainer motion) as frame-exact HTML/Canvas/Three.js or Remotion, with a code-synthesized soundtrack, and deliver X-ready MP4 and GIF files. Use this whenever someone wants an animation, a motion graphic, a looping video, a product animation, a kinetic title, an animated logo, a "make it move" request, or a GIF/MP4 for social, even if they never say "motion design". Turns adjectives into numbers (materials, lights, easing, springs, frames), renders stills and contact sheets to review frame by frame, and fixes with frame-numbered notes.
---

# Motion Lab

Motion here is a program that draws frames, not a video model. You write one self-contained HTML file whose every frame is a pure function of time `t`; a headless Chrome on the box freezes it at each frame; ffmpeg turns the frames into an MP4 and a GIF. Because frames are code, every frame is reproducible, every edit is one number, and you can look at your own frames and fix them.

The method, prompts and numbers are adapted from Florence (@flxrnc)'s "Motion Lab" article (https://x.com/flxrnc/status/2105311836190978392). The scripts and the title-loop build are this plugin's own.

**Paths in this file are relative to the folder this SKILL.md is in** (the skill root). Call it `$S` below. Keep your work outside it: create the piece in the user's project or `/workspace/<piece>/`, never edit files in the plugin folder.

## Setup (once per project folder)
- Needs Node 18+, ffmpeg/ffprobe, and Chrome or Chromium (found at `/usr/bin/google-chrome` on the Grok Bot box; else pass `--chrome` or set `CHROME_PATH`).
- In the project folder: `npm init -y && npm i -D playwright-core`. The scripts load playwright-core from the current folder. Install it nowhere else and never globally.

## Workflow
1. **Brief.** Fill `templates/prompt-template.txt` (GOAL, OUTPUT, TIME, LOOK, MOTION, SHOTS, BANNED, QA; MODEL and CAMERA for 3D) from what the user wants, and append `templates/render-contract.txt`. Replace every adjective with a number (`references/prompt-anatomy.md`, `references/numbers.md`). Ask only for what you can't decide: canvas size (default 1080x1080), length (default a 4 to 6 s loop), the words/product, and brand colors.
2. **Build** one HTML file that satisfies the render contract: `window.renderAt(t)`, `?t=` freezes and never starts requestAnimationFrame, `window.__ready = true` after fonts/textures, pinned libraries, seeded randomness, frames 0..N-1. Start from `templates/starter-2d.html`, `templates/starter-three.html` (three.js 0.160.0) or `examples/title-loop/index.html`; inline what you need from `kit/motion.js` (easing, springs, stagger, beat grid, seeded rng). For Remotion see `references/engines.md`.
3. **Look at stills first** (cheap, especially for 3D without a GPU):
   `node $S/scripts/render.mjs piece.html --times 0,1,2.5,4 --width 540 --height 540 --out out` then Read each `out/stills/t-*.png`. Describe each in one sentence as a viewer would, compare with SHOTS, fix.
4. **Render frames + contact sheet:**
   `node $S/scripts/render.mjs piece.html --seconds 6 --fps 24 --width 540 --height 540 --out out`
   `bash $S/scripts/contact-sheet.sh out/frames out/contact.png 12` and Read it. Write notes with frame numbers and exact values; apply one or two per round (`references/lab-loop.md`). Re-render ranges with `--frames 70-100`; compare with `bash $S/scripts/frame-diff.sh a.png b.png out/diff.png`.
5. **Sound** (if wanted): write `sound.js` (Web Audio, no samples; hits at frame + 1), then `node $S/scripts/audio-render.mjs sound.js --seconds 6 --fps 24 --out out/score.wav` and check timing with `node $S/scripts/audio-hits.mjs out/score.wav --fps 24 --frames ...` (`references/sound.md`).
6. **Final render** at full size (e.g. 1080x1080; 60 fps and `--subframes 4` for motion blur when it matters and time allows), then
   `bash $S/scripts/export.sh out/frames <fps> out/<name> [out/score.wav]` -> `<name>.mp4` + `<name>.gif` (X-ready, `references/export.md`),
   `bash $S/scripts/loop-check.sh out/frames out/<name>.mp4` for loops, and `bash $S/scripts/audio-check.sh out/<name>.mp4` (about -14 LUFS, true peak at or under -1 dBTP).
7. **Deliver**: attach the MP4 and GIF (and a contact sheet if useful) for the user, with the brief and the list of follow-ups you applied. Offer the next round of notes rather than claiming it's perfect.

## Scripts (`$S/scripts/`)
| Script | Does |
|---|---|
| `render.mjs <html> [--seconds --fps --width --height --out --frames a-b --times t1,t2 --subframes k --scale --gpu --chrome]` | Freezes the page at exact t and saves PNG frames (`out/frames/0000.png`...) or stills. Waits for `window.__ready`, seeks CSS/WAAPI animations, calls `renderAt(t)`, reports page errors. Software WebGL by default. |
| `contact-sheet.sh <frames> <out.png> [every cols rows tile_w]` | Tiles every Kth frame with frame-number labels. |
| `frame-diff.sh <a.png> <b.png> <out.png>` | A, B and an amplified difference side by side, plus SSIM/PSNR. |
| `loop-check.sh <frames> [mp4]` | Seam step vs typical step (SSIM) and a 3x looped MP4 to scrub. |
| `audio-render.mjs <sound.js> [--seconds --fps --bpm --rate --out]` | Offline Web Audio render in headless Chrome to a 48 kHz float WAV, DC removed. |
| `audio-hits.mjs <wav> --fps N --frames a,b,c` | Each hit's peak time vs its target frame + 1, in ms. |
| `export.sh <frames> <fps> <name> [wav]` | MP4 (H.264 High, yuv420p, CRF 18, faststart, AAC at -14 LUFS two-pass) + GIF (one palette, 1200 px max, 24 fps max). Warns on X limits and peaky mixes. |
| `audio-check.sh <file>` | Integrated LUFS, LRA and true peak. |

## Examples (`$S/examples/`)
- `title-loop/`: runnable 2D reference build with sound; the end-to-end smoke test (its README has the exact commands and expected results).
- `earbuds/`: the same 3D product shot from a 27-word vague prompt and a 448-word directed prompt, with 15 picture and 12 sound follow-ups. The clearest lesson in direction.
- `liquid-chrome/`: a raymarched chrome blob that pours into a title (heavy on CPU).
- `mascot/`: five animation principles on a voxel character, with labels pinned to frames.
These are prompts and follow-ups, not prebuilt pages: build them by sending the prompt to yourself as the brief.

## Rules
- Stills before full renders; drafts at half size and 24 fps; final at full size.
- One hero move per shot. Enter with ease-out, exit with ease-in and 40 to 50% shorter. Springs by damping ratio. Text holds 0.3 s per word + 0.5 s.
- Keep the ban list alive: after each first render, name the defaults the output used anyway and ban them.
- Measure, don't guess: pixel counts, SSIM, audio peak offsets and LUFS beat adjectives.
- Never render frame N of a loop. Never use the clock, timers or unseeded randomness.
- Don't add brand marks, logos or real people the user didn't ask for. Credit the method (Florence, @flxrnc) if the user publishes the prompts.

## Gotchas learned in use
- playwright-core is CommonJS; the scripts resolve it from the current folder first, so run them from the project folder where you installed it.
- The viewport you pass sets the output resolution; the page can draw at 1080 internally and be scaled by CSS.
- A glint drawn with `source-atop` over an already-painted background is a rectangle, not a glint. Fill the glyphs again with the gradient instead.
- A Web Audio DynamicsCompressor delays every hit by about 6 ms. Leave compression out of the score.
- Short, peaky scores can't reach -14 LUFS under a -1 dBTP ceiling; export.sh says so. Raise the bed, don't add a limiter.
- On the box, three.js renders through SwiftShader: about 20 frames/s at 480x480 for a simple scene, far slower for raymarching. Budget accordingly.
