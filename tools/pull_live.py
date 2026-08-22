#!/usr/bin/env python3
"""Bring what's published live back into the repo.

Photographs swapped in the EDIT panel live in Cloudflare (KV for the
assignments, R2 for the files). That's what makes a swap instant for
everyone. This pulls that state down so the repo stays the real record:

    python3 tools/pull_live.py https://pm-studio.<account>.workers.dev

  · downloads every published photograph into assets/photos/
  · rewrites the photos / photoFocus blocks in design-9/config.js
  · reindexes design-9/photos.json

Run it whenever you like — before a deploy, or once a week. After it runs,
commit. The live store and the repo then agree, and the site would look the
same even if the Worker vanished.
"""
import json, pathlib, re, subprocess, sys, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
CONFIG = ROOT / "design-9" / "config.js"
PHOTOS = ROOT / "assets" / "photos"


def get(url):
    with urllib.request.urlopen(url, timeout=30) as r:
        return r.read()


def block(src, key):
    """Find `key: { ... }` in config.js and return (start, end) of the braces."""
    m = re.search(r"\n  " + key + r":\s*\{", src)
    if not m:
        return None
    i = src.index("{", m.start())
    depth, j = 0, i
    while j < len(src):
        if src[j] == "{":
            depth += 1
        elif src[j] == "}":
            depth -= 1
            if depth == 0:
                return i, j + 1
        j += 1
    return None


def render(mapping, indent="    "):
    if not mapping:
        return "{}"
    width = max(len(k) for k in mapping) + 3
    lines = [f'{indent}"{k}":'.ljust(len(indent) + width + 1) + f' "{v}",'
             for k, v in sorted(mapping.items())]
    return "{\n" + "\n".join(lines) + "\n  }"


def main(api):
    api = api.rstrip("/")
    live = json.loads(get(api + "/live"))
    photos = live.get("photos") or {}
    focus = live.get("photoFocus") or {}
    if not photos and not focus:
        print("nothing published — the repo is already the whole story")
        return 0

    src = CONFIG.read_text()
    cur = {}
    b = block(src, "photos")
    if b:
        cur = dict(re.findall(r'"([\w.\-]+)"\s*:\s*"([^"]*)"', src[b[0]:b[1]]))

    pulled = 0
    for slot, val in photos.items():
        if not val.startswith("http"):
            cur[slot] = val                      # already a repo filename
            continue
        name = val.rsplit("/", 1)[-1]
        # strip the content hash the Worker prepends
        clean = re.sub(r"^[0-9a-f]{8,32}-", "", name)
        dest = PHOTOS / clean
        if not dest.exists():
            dest.write_bytes(get(val))
            pulled += 1
            print(f"  ↓ {clean}")
        cur[slot] = clean

    src = src[:b[0]] + render(cur) + src[b[1]:] if b else src
    fb = block(src, "photoFocus")
    if fb and focus:
        src = src[:fb[0]] + render(focus) + src[fb[1]:]
    CONFIG.write_text(src)

    print(f"{len(photos)} published slot(s) written into config.js, {pulled} file(s) downloaded")
    subprocess.run([sys.executable, str(ROOT / "tools" / "index_photos.py")], check=False)
    print("\nnow: git add -A && git commit -m 'pull the live photographs into the repo'")
    return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1]))
