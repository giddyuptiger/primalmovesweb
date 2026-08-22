#!/usr/bin/env python3
"""Rewrite design-9/photos.json from whatever is in assets/photos/.

The design studio's picker reads photos.json, because a static site can't
list a directory. Drop any number of new photographs into assets/photos/,
run this, commit — and they all show up in the picker.

    python3 tools/index_photos.py

It also reports slots in config.js pointing at files that aren't there.
"""
import json, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[1]
PHOTOS = ROOT / "assets" / "photos"
OUT = ROOT / "design-9" / "photos.json"
CONFIG = ROOT / "design-9" / "config.js"
EXT = {".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif"}


def main() -> int:
    if not PHOTOS.is_dir():
        print(f"no {PHOTOS}", file=sys.stderr)
        return 1

    files = sorted(p.name for p in PHOTOS.iterdir()
                   if p.is_file() and p.suffix.lower() in EXT)
    before = []
    if OUT.exists():
        before = json.loads(OUT.read_text()).get("photos", [])

    OUT.write_text(json.dumps({"photos": files}, indent=1) + "\n")

    added = [f for f in files if f not in before]
    gone = [f for f in before if f not in files]
    print(f"{len(files)} photographs indexed  (+{len(added)} / -{len(gone)})")
    for f in added:
        print(f"  + {f}")
    for f in gone:
        print(f"  - {f}")

    # a slot pointing at a missing file keeps the old picture and logs to the
    # console — quiet enough that it's worth naming here
    if CONFIG.exists():
        used = re.findall(r'"[\w.\-]+"\s*:\s*"([\w.\-]+\.(?:jpg|jpeg|png|webp|avif|gif))"',
                          CONFIG.read_text())
        missing = sorted({u for u in used if u not in files})
        if missing:
            print("\nconfig.js points at files that aren't in assets/photos/:")
            for m in missing:
                print(f"  ! {m}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
