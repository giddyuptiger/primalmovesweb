#!/bin/bash
# Double-click this in Finder. It unpacks whatever Claude last sent, commits
# it, and pushes — Cloudflare Pages picks it up and the site is live in about
# a minute. Nothing to type.
cd "$(dirname "$0")" || exit 1

echo "── Primal Moves · deploy ──────────────────────────────"
echo

# newest pm-*.tar.gz sitting in this folder, if any
TAR=$(ls -t pm-*.tar.gz 2>/dev/null | head -1)
if [ -n "$TAR" ]; then
  echo "unpacking $TAR"
  tar xzf "$TAR" || { echo "✗ could not unpack $TAR"; read -r -p "press return"; exit 1; }
  rm -f pm-*.tar.gz
else
  echo "no new package — committing whatever has changed"
fi

if [ -z "$(git status --porcelain)" ]; then
  echo "✓ nothing to deploy, the repo already matches"
  read -r -p "press return to close"; exit 0
fi

echo
git status --short
echo

MSG="site update $(date '+%d %b %H:%M')"
git add -A && git commit -q -m "$MSG" && echo "committed: $MSG"

if git push -q; then
  echo
  echo "✓ pushed. Cloudflare is building now."
  echo "  https://primalmovesweb.pages.dev  (about a minute)"
else
  echo
  echo "✗ push failed — probably a GitHub sign-in. Open Terminal and run:"
  echo "    cd ~/code/primalmovesweb && git push"
fi

echo
read -r -p "press return to close"
