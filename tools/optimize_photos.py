#!/usr/bin/env python3
"""Make the AVIF and WebP variants the pages actually serve.

assets/photos/ holds the masters - full size, one per photograph, the files
the EDIT panel lists and the ones to keep. Nothing on the site links to them
directly any more: build_d9.py wraps every <img> in a <picture> pointing at
assets/photos/opt/, and this is what fills that folder.

Run it after adding a photograph. It skips anything already made, so it is
cheap to run every time; pass --force to rebuild everything.

    python3 tools/optimize_photos.py [--force]

design-9/ is what Cloudflare publishes as the site root, so the variants and
the manifest are mirrored there as well - that copy is the one visitors get.
"""
import json, pathlib, sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "photos"
# Alongside the masters, because wrangler.toml's build step is
#   cp -r assets design-9/ && npx wrangler deploy
# and design-9 is what gets served. Anything not under assets/ never reaches
# the site.
OPT = SRC / "opt"
WIDTHS = [800, 1400, 2200]
# AVIF only. WebP was the second format for browsers without AVIF, but those
# browsers already have somewhere to land - the <img>'s own JPEG - so the
# WebP set was 9MB of repository buying a slightly smaller file for a few
# percent of visitors. 52 was picked by eye on the widest photographs, where
# banding shows first.
Q = {"avif": 52}
FORCE = "--force" in sys.argv


def variants(path):
    """(kind, width) -> file, for every size worth making from this master."""
    with Image.open(path) as im:
        w = im.width
        out = {}
        for kind in ("avif",):
            made = []
            for target in WIDTHS:
                # never upscale, and never make a size within 5% of one below
                if target > w * 1.05:
                    continue
                tw = min(target, w)
                dest = OPT / f"{path.stem}-{target}.{kind}"
                made.append(target)
                if dest.exists() and not FORCE:
                    continue
                r = im.convert("RGB").resize(
                    (tw, round(im.height * tw / im.width)), Image.LANCZOS)
                r.save(dest, quality=Q[kind])
                print("wrote", dest.name)
            if made:
                out[kind] = made
    return out


def main():
    OPT.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for f in sorted(SRC.iterdir()):
        if f.suffix.lower() not in (".jpg", ".jpeg", ".png"):
            continue
        v = variants(f)
        if v:
            manifest[f.stem] = v
    (OPT / "manifest.json").write_text(json.dumps(manifest))

    total = sum(p.stat().st_size for p in OPT.iterdir())
    print(f"{len(manifest)} photographs, {len(list(OPT.iterdir()))} files, "
          f"{total // 1024}KB in assets/photos/opt")


if __name__ == "__main__":
    main()
