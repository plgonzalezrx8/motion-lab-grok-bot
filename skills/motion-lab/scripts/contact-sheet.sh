#!/usr/bin/env bash
# contact-sheet.sh: tile every Kth frame into one image you can read like a storyboard.
#   bash contact-sheet.sh out/frames out/contact.png [every=12] [cols=4] [rows=3] [tile_width=400]
# Each tile is labelled with its frame number so notes can name exact frames.
set -euo pipefail
frames="${1:?frames dir}"; out="${2:-out/contact.png}"; k="${3:-12}"; cols="${4:-4}"; rows="${5:-3}"; tw="${6:-400}"
mkdir -p "$(dirname "$out")"
font=$(fc-match -f '%{file}' 'DejaVu Sans Mono' 2>/dev/null || true)
label="drawtext=text='%{eif\:n*$k\:d}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=4"
[[ -n "$font" ]] && label="drawtext=fontfile=$font:text='%{eif\:n*$k\:d}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=4"
ffmpeg -y -hide_banner -loglevel error -framerate 24 -i "$frames/%04d.png" \
  -vf "select='not(mod(n\,$k))',setpts=N/TB,scale=$tw:-1,$label,tile=${cols}x${rows}:padding=4:color=white" -frames:v 1 "$out"
echo "$out"
