#!/usr/bin/env bash
# loop-check.sh: does the loop seam show?
#   bash loop-check.sh out/frames out/anim.mp4
# 1) Compares the seam pair (last frame -> frame 0) with the typical neighbouring-frame change (SSIM).
#    A seam much worse than the median step = a visible hiccup (often: frame N rendered, or a non-periodic value).
# 2) Writes <mp4>_x3.mp4 that plays the clip three times back to back so you can scrub across the seam.
set -euo pipefail
frames="${1:?frames dir}"; mp4="${2:-}"
mapfile -t list < <(ls "$frames"/*.png | sort)
n=${#list[@]}; (( n >= 3 )) || { echo "need at least 3 frames"; exit 1; }
ssim() { ffmpeg -hide_banner -nostats -i "$1" -i "$2" -lavfi ssim -f null - 2>&1 | sed -n 's/.*All:\([0-9.]*\).*/\1/p'; }
seam=$(ssim "${list[$((n-1))]}" "${list[0]}")
steps=(); stride=$(( n / 8 > 1 ? n / 8 : 1 ))
for ((i=0; i<n-1; i+=stride)); do steps+=("$(ssim "${list[$i]}" "${list[$((i+1))]}")"); done
median=$(printf '%s\n' "${steps[@]}" | sort -n | awk '{a[NR]=$1} END{print a[int((NR+1)/2)]}')
echo "seam SSIM (frame $((n-1)) -> 0): $seam   median neighbour SSIM: $median"
awk -v s="$seam" -v m="$median" 'BEGIN{ if ((1-s) > 2.5*(1-m) + 0.005) print "LOOP: seam is a visible jump. Check frames 0..N-1 only and that every motion is periodic."; else print "LOOP: seam looks like a normal step." }'
if [[ -n "$mp4" ]]; then
  out="${mp4%.mp4}_x3.mp4"; ffmpeg -y -hide_banner -loglevel error -stream_loop 2 -i "$mp4" -c copy "$out"; echo "$out"
fi
