# title-loop: runnable reference build

A 4 s, 1080x1080 Canvas 2D title loop written for this plugin (not from the article) to show the whole pipeline working end to end: the render contract, tokens from `kit/motion.js` inlined, springs with 2-frame stagger, an ease-out-expo underline, a glint clipped to the glyphs, a 40%-shorter ease-in exit, an ambient square that turns exactly 90 degrees per loop, and a Web Audio score with hits 1 frame after their picture.

```sh
S=<path to skills/motion-lab>
cd <your project> && npm i -D playwright-core          # once per project
node $S/scripts/render.mjs $S/examples/title-loop/index.html --seconds 4 --fps 24 --width 540 --height 540 --out out
bash $S/scripts/contact-sheet.sh out/frames out/contact.png 8
node $S/scripts/audio-render.mjs $S/examples/title-loop/sound.js --seconds 4 --fps 24 --out out/score.wav
node $S/scripts/audio-hits.mjs out/score.wav --fps 24 --frames 14,16,48,66
bash $S/scripts/export.sh out/frames 24 out/title-loop out/score.wav
bash $S/scripts/loop-check.sh out/frames out/title-loop.mp4
```

Expected: 96 frames, `out/title-loop.mp4` (H.264 High, yuv420p, AAC, about -14 LUFS) and `out/title-loop.gif`, both 4.00 s; the seam check reports a normal step; hits peak 1 to 4 ms after their frame.
The page renders at 1080x1080 internally; the viewport size you pass sets the output resolution.
