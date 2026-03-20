#!/usr/bin/env bash
# Clone submodule content when .gitmodules exists but git never recorded the
# submodule commits (empty gemoji/ etc.). Required for yarn build:prod.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

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

echo "Vendor paths OK."
