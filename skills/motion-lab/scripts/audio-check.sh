#!/usr/bin/env bash
# audio-check.sh: loudness report for a WAV or the audio of an MP4 (integrated LUFS, true peak, LRA).
#   bash audio-check.sh out/final.mp4        target: about -14 LUFS, true peak <= -1 dBTP
set -euo pipefail
f="${1:?usage: audio-check.sh <file.wav|file.mp4>}"
ffmpeg -hide_banner -nostats -i "$f" -af "ebur128=peak=true" -f null - 2>&1 \
  | awk '/Summary:/{s=1} s' | grep -E "I:|LRA:|Peak:" | sed 's/^ */  /'
