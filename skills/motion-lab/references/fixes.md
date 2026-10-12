# When an experiment breaks

| Symptom | Fix |
|---|---|
| Flicker or jitter between runs | Make every value a pure function of t. Replace Math.random with a seeded generator (`rng(seed)` in motion.js). Remove timers and CSS transitions. |
| Wrong or fallback font | Load fonts with `display=block`; wait for `document.fonts.ready` before setting `window.__ready`. |
| Hiccup at the loop seam | Render frames 0 to N-1 only. Drive the loop from phase = frame / N with whole cycles. Run `loop-check.sh`. |
| Audio drifts off the beat | Compute each beat as n x 60 / BPM and round per beat. Never add a rounded frame count. |
| Hits peak late | Remove compressors from the score; start tones on a cosine crest with a 0.5 ms attack. Check with `audio-hits.mjs`. |
| Jank or dropped frames in live preview | Animate only transform and opacity. No width, height, top or left. (Renders are frame-exact regardless.) |
| Banding in the GIF | Avoid large smooth gradients, or dither the palette (export.sh uses bayer dithering). |
| Blurry or shimmering text | Snap resting text to whole pixels. Render at `--scale 2` and scale down. |
| Text moves before you can read it | Hold every text state 0.3 s per word + 0.5 s before it moves. |
| Everything moves at once | One hero move at a time; others start 150 ms later at 60% of its travel. |
| Screenshot shows the wrong frame | The page kept its own animation loop running: with `?t=` it must never start requestAnimationFrame. |
| Blank or black WebGL frames | Set `preserveDrawingBuffer: true`; make sure `window.__ready` is set only after textures/bakes finish. |
| A glint or light floods the whole face | Keep it in reflections only (a second PMREM for the specular lookup) and narrow it; measure on vs off with `frame-diff.sh`. |
| Very slow 3D renders on the box | No GPU: draft at half size and 24 fps, preview with `--times`, use `--subframes` only for the final. |

If a fix doesn't hold, render the two frames on either side of the problem, diff them, find the one line that causes the change, fix only that line, then re-render both frames.
```
The fix at frame 84 did not hold. Render frames 83 and 85 as PNGs, put them side by side and list every difference you can see. Find the line of code that causes it, fix only that line, then render both frames again.
```
When a fix works, add it to the render contract.
