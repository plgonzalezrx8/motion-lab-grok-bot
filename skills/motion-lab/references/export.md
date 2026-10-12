# Export for X: MP4 + GIF by default

`bash $S/scripts/export.sh out/frames <fps> out/name [score.wav]` writes both:
- `name.mp4`: H.264 High, yuv420p, CRF 18, `+faststart` (starts playing at once), AAC 192k at -14 LUFS when a WAV is given.
- `name.gif`: one palette for the whole clip (no color flicker), max 1200 px wide, at most 24 fps, loops forever.
Then attach both files for the user (SendToUser with the file path), or copy them to their computer.

## Equivalent ffmpeg lines
```sh
ffmpeg -framerate 24 -i out/frames/%04d.png -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -movflags +faststart out/anim.mp4
ffmpeg -framerate 24 -i out/frames/%04d.png -vf "scale=1200:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" -loop 0 out/anim.gif
ffmpeg -stream_loop 2 -i out/anim.mp4 -c copy out/loop_check.mp4     # play 3 times, watch the seam
```

## X limits (X media docs / Help Center)
| Spec | GIF | Video |
|---|---|---|
| Size | 15 MB | 140 s without Premium |
| Frame size | up to 1280 x 1080 | 1920 x 1080 for 16:9 |
| Frames / speed | at most 350 frames | up to 60 fps |
| Format | one palette, loop forever | H.264 High, yuv420p, AAC |
| Default here | 1200 px wide, 24 fps | CRF 18, faststart |

At 24 fps the 350-frame cap means a GIF tops out around 14.5 s; a 4 to 6 s loop is 96 to 144 frames. export.sh warns when a GIF breaks the frame or size limit.

GIF timing: delays are stored in hundredths of a second, so a 24 fps frame (41.7 ms) can't be exact. Rounding every frame to 40 ms runs the loop 4% fast. ffmpeg alternates 40/50 ms delays to keep the total right; check that the GIF duration printed by export.sh matches the MP4.

## Canvas
Pick it before the first frame: 1920x1080 (16:9), 1080x1080 (1:1), 1080x1350 (4:5), 1080x1920 (9:16). X accepts 1:3 to 3:1. Make frame 0 a finished composition: it's what shows while a GIF loads.

## Loops
Render frames 0 to N-1, never N (frame N is frame 0 again; showing it twice is the hiccup). Drive loops from `phase = frame / N` with whole-number cycles: a square that turns exactly 90 degrees per loop, a wave that completes exactly 2 cycles. For organic drift, sample noise along a circle so it returns to its start. `loop-check.sh` compares the seam step with a typical step.
