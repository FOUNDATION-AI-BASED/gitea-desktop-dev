#!/usr/bin/env bash
# Ensures gemoji / gitignore / choosealicense are present for script/build.ts.
# 1) Tries git submodule init (when submodules are committed).
# 2) Shallow-clones GitHub repos when dirs are still empty (forks missing gitlinks).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# CI / Docker: avoid "dubious ownership" on some runners
git config --global --add safe.directory "$ROOT" 2>/dev/null || true

if [[ -f .gitmodules ]]; then
  echo "Syncing submodules from .gitmodules…"
  git submodule sync --recursive 2>/dev/null || true
  git submodule update --init --recursive --depth 1 2>/dev/null || true
fi

clone_if_missing() {
  local marker_path="$1"
  local dest="$2"
  local url="$3"

  if [[ -e "$marker_path" ]]; then
    return 0
  fi

  echo "Cloning missing vendor data: $url -> $dest"
  rm -rf "$dest"
  mkdir -p "$(dirname "$dest")"
  git clone --depth 1 "$url" "$dest"
}

clone_if_missing "gemoji/images/emoji" "gemoji" "https://github.com/github/gemoji.git"
clone_if_missing "app/static/common/gitignore/README.md" "app/static/common/gitignore" "https://github.com/github/gitignore.git"
clone_if_missing "app/static/common/choosealicense.com/README.md" "app/static/common/choosealicense.com" "https://github.com/github/choosealicense.com.git"

if [[ ! -d gemoji/images/emoji ]]; then
  echo "::error::gemoji/images/emoji is still missing after submodule init + clone."
  ls -la gemoji 2>/dev/null || echo "(no gemoji dir)"
  exit 1
fi

echo "Vendor paths OK."
