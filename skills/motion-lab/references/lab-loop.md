# The lab loop on Grok Bot: render, look, fix

The first render is a draft. The loop that finishes it: render stills, look at them, write notes with frame numbers, fix, and re-render only what changed. Two to four rounds is normal. On Grok Bot you run every step yourself on the box: Shell runs the scripts, Read shows you the PNGs inline, and the result goes to the user as an attached MP4/GIF.

## One round
1. **Stills first** (cheap): `node $S/scripts/render.mjs anim.html --times 0,1,2.5,4 --width 540 --height 540 --out out` then Read `out/stills/t-*.png`.
2. **Describe before you change anything.** One sentence per still, as a viewer would. Compare with the SHOTS list.
3. **Contact sheet** for the whole clip: render frames, then `bash $S/scripts/contact-sheet.sh out/frames out/contact.png 12` and Read it like a storyboard (each tile is labelled with its frame number).
4. **Write notes with frame numbers and exact values**, e.g. "the punch at frame 84 peaks late: move it 2 frames earlier", "the glint is a flood light: keep it in reflections only, 2.4 wide".
5. **Fix one or two things per round**, re-render only the affected range (`--frames 70-100`) and compare the same frame before/after with `frame-diff.sh`.
6. **Final**: full render (60 fps and `--subframes 4` for motion blur if the piece needs it), sound, `export.sh`, `loop-check.sh`, then attach the MP4/GIF for the user.

Ask for a frame counter overlay and a debug switch (`?debug=1`) while iterating; remove them for the final.

## Measuring instead of guessing
- Count pixels when a light or glint seems too strong: render with it on and off and compare (`frame-diff.sh` prints SSIM/PSNR and writes an amplified difference image).
- Onion skin: stack frames at 25% opacity (ffmpeg `tmix` or a small canvas script). Even spacing = robotic; spacing that tightens near the keys = easing works.
- Speed graph: log the hero's x and scale per frame from `renderAt` and plot a PNG. Straight lines = linear motion; sharp corners = dead starts and stops.
- When a fix doesn't hold: render the frames on either side (`--frames 83-85`), run `frame-diff.sh`, find the one line that causes the change, fix only that line, re-render both frames.

## Follow-ups that work (pick one or two per round)
```
Render stills at frames 0, 24, 48, 72 and 96. Describe each in one sentence as a viewer would. Does that match the shot list? Fix what does not.
Make a contact sheet of every 12th frame. Mark every frame where two things move at once, then fix the hierarchy.
Onion-skin frames 24 to 47 at 25% opacity. Spacing should tighten near the keys. Adjust the easing until it does.
Plot the hero's x position and scale per frame as a PNG chart. Show where the motion is linear or stops dead, then fix it with our tokens.
Review this like a senior motion designer: 10 notes ordered by impact, each with a frame number and the exact code change. Apply the top 5.
It is too busy. Remove 30% of the motion and keep only the moves that guide the eye.
The ending is abrupt. Add a 36-frame hold with a 2% push, then let it settle on a spring at damping ratio 0.8.
```
Pasting all seven at once turns a fix into a rewrite.

## Translate feelings before acting on them
- "Make it pop": scale 1.0 -> 1.08 -> 1.0 over 6 frames, peak on the beat.
- "Make it feel premium": ease-out-quint on entrances, springs at damping 0.8, no overshoot on text.
- "It drags": shorten each hold by 12 frames (one beat at 120 BPM, 24 fps) so cuts stay on the grid.
- "It feels busy": one hero move at a time; everything else starts 150 ms later at 60% of its travel.
- "It looks like AI": list the defaults it used by name, ban each one, render again.

## Keep receipts
Count creative follow-ups (notes that change how it looks or moves) separately from technical fixes (capture hooks, font loading). Post the prompt and every follow-up with the work if the user wants to share it. The original lab's numbers: 10, 15 and 4 creative follow-ups for its three pieces.
When a fix works, add it to the render contract: the contract is the lab's memory.
