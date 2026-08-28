#!/bin/bash
# Double-click this in Finder. It unpacks whatever Claude last sent, commits
# it, and pushes — Cloudflare Pages picks it up and the site is live in about
# a minute. Nothing to type.
cd "$(dirname "$0")" || exit 1

echo "── Primal Moves · deploy ──────────────────────────────"
echo

# The timetable and events are regenerated on GitHub every four hours by the
# refresh Action — that copy is always the authoritative one. If a package
# happened to carry older ones, drop them before committing, or the rebase
# tries to merge two different JSON files and stops dead.
restore_generated() {
  for f in design-9/schedule.json design-9/events.json; do
    git checkout -- "$f" 2>/dev/null
  done
}

# newest pm-*.tar.gz sitting in this folder, if any
TAR=$(ls -t pm-*.tar.gz 2>/dev/null | head -1)
if [ -n "$TAR" ]; then
  echo "unpacking $TAR"
  tar xzf "$TAR" || { echo "✗ could not unpack $TAR"; read -r -p "press return"; exit 1; }
  rm -f pm-*.tar.gz
else
  echo "no new package — committing whatever has changed"
fi

restore_generated

# A tarball can add and replace files but never remove one. When a package
# retires a page, it carries pm-remove.txt - one path per line, each inside
# design-9/ - and those get deleted here before the commit. Anything outside
# design-9/, or containing "..", is ignored.
if [ -f pm-remove.txt ]; then
  while IFS= read -r p; do
    case "$p" in
      ""|"#"*) continue ;;
      design-9/*) ;;
      *) echo "skipping $p (outside design-9/)"; continue ;;
    esac
    case "$p" in *..*) echo "skipping $p"; continue ;; esac
    if [ -e "$p" ]; then echo "removing $p"; rm -rf "$p"; fi
  done < pm-remove.txt
  rm -f pm-remove.txt
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

# The refresh Action commits the timetable straight to main, so the remote
# is often ahead. Rebase on top of it rather than failing the push.
echo "checking for anything pushed since you last pulled…"
if ! git pull --rebase --autostash -q; then
  # the only files that ever conflict are the two the Action rewrites; take
  # GitHub's copy of those and continue rather than dumping you into a rebase
  CONFLICTS=$(git diff --name-only --diff-filter=U)
  GENERATED_ONLY=true
  for f in $CONFLICTS; do
    case "$f" in
      design-9/schedule.json|design-9/events.json) ;;
      *) GENERATED_ONLY=false ;;
    esac
  done

  if [ -n "$CONFLICTS" ] && [ "$GENERATED_ONLY" = true ]; then
    echo "timetable/events differed — keeping the copy from GitHub"
    for f in $CONFLICTS; do git checkout --ours "$f" && git add "$f"; done
    GIT_EDITOR=true git rebase --continue -q || {
      echo "✗ rebase still stuck. Open Terminal and run:"
      echo "    cd \"$(pwd)\" && git status"
      read -r -p "press return to close"; exit 1
    }
  else
    echo "✗ couldn't rebase automatically. Conflicts in:"
    echo "$CONFLICTS" | sed 's/^/    /'
    echo "  Open Terminal and run:"
    echo "    cd \"$(pwd)\" && git status"
    read -r -p "press return to close"; exit 1
  fi
fi

if git push -q; then
  echo
  echo "✓ pushed. Cloudflare is building now."
  echo "  https://primalmovesweb.pages.dev  (about a minute)"
else
  echo
  echo "✗ push failed. Open Terminal and run:"
  echo "    cd \"$(pwd)\" && git push"
fi

echo
read -r -p "press return to close"
