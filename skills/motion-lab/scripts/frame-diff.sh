#!/usr/bin/env bash
# frame-diff.sh: put two frames side by side with an amplified difference image, and print SSIM/PSNR.
#   bash frame-diff.sh out/frames/0083.png out/frames/0085.png out/diff-83-85.png
# Use it when a fix "didn't hold": look at the triptych, find the line that causes the change, fix only that.
set -euo pipefail
a="${1:?frame A}"; b="${2:?frame B}"; out="${3:-out/diff.png}"
mkdir -p "$(dirname "$out")"
ffmpeg -y -hide_banner -loglevel error -i "$a" -i "$b" -filter_complex \
  "[0:v]format=rgb24,split[a1][a2];[1:v]format=rgb24,split[b1][b2];[a2][b2]blend=all_mode=difference,curves=all='0/0 0.1/1 1/1'[d];[a1][b1][d]hstack=inputs=3" \
  -frames:v 1 "$out"
ffmpeg -hide_banner -nostats -i "$a" -i "$b" -lavfi "[0:v][1:v]ssim;[0:v][1:v]psnr" -f null - 2>&1 | grep -E "SSIM|PSNR" | sed 's/^.*\] /  /'
echo "$out"
