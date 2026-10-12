# Sound: score in code, measure instead of listening

The feed plays muted until someone taps, so the picture must work silent first. When you add sound, synthesize it in code (Web Audio, no samples, no downloads), land every hit 1 frame after its picture (light beats sound), and mix to about -14 LUFS with true peaks at or under -1 dBTP. You can't listen, so verify by measuring the decoded audio.

## Pipeline on the box
```sh
node $S/scripts/audio-render.mjs sound.js --seconds 6 --fps 60 --bpm 120 --out out/score.wav   # OfflineAudioContext in headless Chrome -> 48 kHz float WAV
node $S/scripts/audio-hits.mjs out/score.wav --fps 60 --frames 60,90,94,270                   # each hit's peak vs (frame+1)/fps, in ms
bash $S/scripts/export.sh out/frames 60 out/final out/score.wav                                # two-pass loudnorm to -14 LUFS, AAC 192k, muxed
bash $S/scripts/audio-check.sh out/final.mp4                                                   # integrated LUFS, LRA, true peak of the decoded MP4
```
`sound.js` exports `default async function score(ctx, { seconds, fps, bpm, rate })` and schedules nodes on the OfflineAudioContext. Start from `templates/sound-starter.js` or `examples/title-loop/sound.js`.

## Rules that save rounds
- Each hit lands at `(F + 1) / fps`. Build tonal hits with a 0.5 ms attack starting on a cosine crest, so the first waveform peak sits on the frame.
- No DynamicsCompressor in the score: it adds about 6 ms of latency, so every hit peaks late. Loudness is set in export.sh.
- Gain nodes start at full volume unless you ramp them from 0 (a click at t = 0).
- Hits sit 3 to 6 dB over the bed (K-weighted, first 60 ms). Nothing above 8 kHz for phone speakers; mono-safe.
- Energy under 60 Hz plays on nothing in a phone: move bass up an octave and give kicks a 150 to 200 Hz knock.
- Remove DC (audio-render does it per channel). For a seamless loop, make the bed periodic and let tails wrap.
- If export.sh lands under -15 LUFS, the true-peak ceiling is holding it down: the mix is too peaky. Raise the bed/pad or lower the loudest hits and re-render (don't just add a limiter; limiters move peaks).
- AAC can lift true peak by about 1 dB, which is why export.sh targets -1.5 dBTP before encoding. Check the decoded MP4, not the WAV.
- Codec padding: an MP4's audio can run past the video and click at the seam. Keep the seamless WAV as the master; for a single-loop MP4 add a 2 ms raised-cosine fade at both ends.

## Mixing music + effects (from separate WAVs)
```sh
ffmpeg -i out/anim.mp4 -i music.wav -i sfx.wav -filter_complex "[1:a][2:a]amix=inputs=2:duration=first,loudnorm=I=-14:TP=-1:LRA=11[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/final.mp4
```

The three examples' `sound.txt` files show complete score prompts and every measured follow-up (timing in ms, levels in dB, phone-band loudness).
