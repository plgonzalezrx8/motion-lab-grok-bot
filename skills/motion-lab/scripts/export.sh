#!/usr/bin/env bash
# export.sh: frames (+ optional audio) -> X-ready MP4 and GIF.
#   bash export.sh out/frames 24 out/anim [score.wav]
# Writes <name>.mp4 (H.264 High, yuv420p, CRF 18, faststart; AAC 192k at -14 LUFS / -1 dBTP when a WAV is given)
# and <name>.gif (one palette for the whole clip, 1200 px wide max, loops forever, frame rate capped at 24 fps).
# Env: GIF_WIDTH (default min(1200, source width)), GIF_FPS (default min(fps,24)), CRF (18).
set -euo pipefail
frames="${1:?frames dir}"; fps="${2:?fps}"; name="${3:?output name without extension}"; wav="${4:-}"
mkdir -p "$(dirname "$name")"
srcw=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 "$frames/0000.png")
gw="${GIF_WIDTH:-$(( srcw < 1200 ? srcw : 1200 ))}"
gfps="${GIF_FPS:-$(( fps < 24 ? fps : 24 ))}"
crf="${CRF:-18}"
vid=(-framerate "$fps" -i "$frames/%04d.png")
if [[ -n "$wav" ]]; then
  # Two-pass loudnorm (linear) so short loops actually land on -14 LUFS. TP -1.5 leaves room for AAC overshoot (target <= -1 dBTP decoded).
  m=$(ffmpeg -hide_banner -nostats -i "$wav" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
  val() { echo "$m" | sed -n "s/.*\"$1\" : \"\([^\"]*\)\".*/\1/p"; }
  ln="loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(val input_i):measured_TP=$(val input_tp):measured_LRA=$(val input_lra):measured_thresh=$(val input_thresh):offset=$(val target_offset):linear=true"
  ffmpeg -y -hide_banner -loglevel error "${vid[@]}" -i "$wav" \
    -filter_complex "[1:a]$ln,aresample=48000[a]" -map 0:v -map "[a]" \
    -c:v libx264 -profile:v high -pix_fmt yuv420p -crf "$crf" -c:a aac -b:a 192k -shortest -movflags +faststart "$name.mp4"
else
  ffmpeg -y -hide_banner -loglevel error "${vid[@]}" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf "$crf" -movflags +faststart "$name.mp4"
fi
ffmpeg -y -hide_banner -loglevel error "${vid[@]}" \
  -vf "fps=$gfps,scale=$gw:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
  -loop 0 "$name.gif"
if [[ -n "$wav" ]]; then
  li=$(ffmpeg -hide_banner -nostats -i "$name.mp4" -af ebur128=peak=true -f null - 2>&1 | awk '/Summary:/{s=1} s && /I:/{print $2; exit}')
  echo "audio: integrated ${li} LUFS (target -14)"
  awk -v l="$li" 'BEGIN{ if (l < -15) print "note: the true-peak ceiling held loudness down. The mix is too peaky: raise the bed/pad or lower the loudest hits, then re-render." }'
fi
for f in "$name.mp4" "$name.gif"; do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f"); sz=$(du -h "$f" | cut -f1)
  echo "$f  ${d}s  $sz"
done
nf=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$name.gif")
(( nf > 350 )) && echo "warning: GIF has $nf frames; X allows at most 350." || true
gsz=$(stat -c %s "$name.gif" 2>/dev/null || stat -f %z "$name.gif"); (( gsz > 15000000 )) && echo "warning: GIF is over X's 15 MB limit." || true
