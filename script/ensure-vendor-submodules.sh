#!/usr/bin/env bash
# Ensures gemoji / gitignore / choosealicense are present for script/build.ts.
# 1) Tries git submodule init (when submodules are committed).
# 2) Shallow-clones GitHub repos when dirs are still empty (forks missing gitlinks).
#
# gemoji: must match github/desktop’s submodule pin. Current gemoji default branch
# dropped images/emoji; this commit still has the tree build/copyEmoji expects.
set -euo pipefail
GEMOJI_SHA="${GEMOJI_SHA:-50865e8895c54037bf06c4c1691aa925d030a59d}"
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

  # We only need the static assets; keeping .git makes later `cpSync` steps
  # copy protected `.git/config` files and can fail on some runners.
  rm -rf "$dest/.git"
}

# Shallow clone of default branch no longer includes images/emoji; fetch exact tree.
ensure_gemoji() {
  local marker="gemoji/images/emoji"
  local dest="gemoji"
  local url="https://github.com/github/gemoji.git"

  if [[ -e "$marker" ]]; then
    return 0
  fi

  echo "Fetching gemoji at $GEMOJI_SHA (pinned for images/emoji; upstream main layout changed)…"
  rm -rf "$dest"
  mkdir -p "$(dirname "$dest")"
  mkdir "$dest"
  git -C "$dest" init -q
  git -C "$dest" remote add origin "$url"
  git -C "$dest" fetch --depth 1 origin "$GEMOJI_SHA"
  git -C "$dest" checkout -q FETCH_HEAD

  # Same reasoning as clone_if_missing(): remove git metadata after checkout.
  rm -rf "$dest/.git"
}

ensure_gemoji
clone_if_missing "app/static/common/gitignore/README.md" "app/static/common/gitignore" "https://github.com/github/gitignore.git"
clone_if_missing "app/static/common/choosealicense.com/README.md" "app/static/common/choosealicense.com" "https://github.com/github/choosealicense.com.git"

if [[ ! -d gemoji/images/emoji ]]; then
  echo "::error::gemoji/images/emoji is still missing after submodule init + clone."
  ls -la gemoji 2>/dev/null || echo "(no gemoji dir)"
  exit 1
fi

# If submodules were present already, they might still carry git metadata.
rm -rf "gemoji/.git" "app/static/common/gitignore/.git" "app/static/common/choosealicense.com/.git" 2>/dev/null || true

echo "Vendor paths OK."
