#!/usr/bin/env bash
# Regenerate Windows Squirrel installer splash GIF from the Gitea SVG logo.
# Requires ImageMagick (`brew install imagemagick`). Output is committed to the repo.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SVG="$ROOT/app/static/common/gitea-logo.svg"
OUT="$ROOT/app/static/logos/gitea-installer-splash.gif"

if ! command -v magick >/dev/null 2>&1; then
  echo "ImageMagick (magick) is required to regenerate the installer splash GIF." >&2
  exit 1
fi

magick -size 400x400 xc:'#f6f8fa' \( "$SVG" -resize 340x -background none \) \
  -gravity center -compose over -composite "$OUT"
echo "Wrote $OUT"
