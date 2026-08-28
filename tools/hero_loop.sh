#!/usr/bin/env bash
# Cut the hero loop out of the full reel.
#
# The reel Miki delivered is 128 seconds and 14MB. A browser does not stream
# an autoplaying loop - measured, it pulls the whole file inside five seconds
# of arrival - so the length is the file size, and every phone paid for two
# minutes of footage to watch a few seconds of it.
#
# The 128s master lives in masters/, not in assets/: the Cloudflare build is
# `cp -r assets design-9/ && npx wrangler deploy`, so anything under assets/
# is public, and there is no reason to serve 14MB nobody asks for. Three files come out
# of one window: the film desktop plays, a phone-sized version of the same
# window, and the loop's own first frame as the poster.
#
#   ./tools/hero_loop.sh [START] [DUR]
#
# Windows that land on the reel's own cuts (it cuts about every two seconds):
#   0    12.6   the floor    - feet, the group, the lounge, the sauna
#   30.3 14.5   the room     - the wall painting, a full class on the mats
#   73.1 15.5   upside down  - cold plunge, the handstand wall, pull-ups   <- current
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=masters/hero-reel-full.mp4
OUT=assets/photos
START=${1:-73.1}
DUR=${2:-15.5}

[ -f "$SRC" ] || { echo "no master reel at $SRC - move the 128s original there first"; exit 1; }
mkdir -p "$OUT"

ffmpeg -y -v error -ss "$START" -t "$DUR" -i "$SRC" \
  -c:v libx264 -profile:v high -crf 26 -preset slow -g 60 -pix_fmt yuv420p \
  -an -movflags +faststart "$OUT/hero-loop.mp4"

ffmpeg -y -v error -ss "$START" -t "$DUR" -i "$SRC" -vf "scale=640:-2" \
  -c:v libx264 -profile:v main -crf 28 -preset slow -g 60 -pix_fmt yuv420p \
  -an -movflags +faststart "$OUT/hero-loop-sm.mp4"

# 800px and not 1280: this JPEG is only ever a fallback - optimize_photos.py
# makes the AVIF the page actually shows - so the fallback is kept cheap.
ffmpeg -y -v error -ss "$START" -i "$SRC" -frames:v 1 -vf "scale=800:-2" -q:v 5 \
  "$OUT/hero-loop-poster.jpg"

ls -l "$OUT"/hero-loop.mp4 "$OUT"/hero-loop-sm.mp4 "$OUT"/hero-loop-poster.jpg
echo "now run: python3 tools/optimize_photos.py   (for the poster's AVIF)"
