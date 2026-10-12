# Liquid chrome title (3D, raymarched)

A 6 s, 60 fps, 1080x1080 loop: a chrome blob squashes, stretches and pinches into 6 drops, each drop pours into its letter of "STUDIO", a glint sweeps the word, then the letters melt back into one wobbling blob that runs through frame 0. One raymarched SDF in a full-screen shader plus three.js r160 TextGeometry.

- `prompt.txt`: the picture prompt (send as is, then change the words).
- `followups.txt`: the 10 creative follow-ups from the original build, in order. Use them as a model of notes that point at frames and numbers. Follow-up 8's sweep azimuths were measured for the original word; recalibrate for yours.
- `sound.txt`: the score prompt and 5 sound follow-ups, all from measurements.

Original receipts: 416-word prompt, 10 follow-ups, about 2 h plus 45 min for sound.

Box note: this is the heaviest example. Without a GPU, preview stills first (`render.mjs --times`), render drafts at 540x540 and 24 fps, and only render 60 fps with `--subframes` for the final.

Adapted from Florence (@flxrnc), "Motion Lab" article: https://x.com/flxrnc/status/2105311836190978392. Rebranded for this plugin (neutral palette, new title/character); every technique and number is hers unless noted.
