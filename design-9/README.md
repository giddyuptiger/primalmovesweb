# Design 9 — Primal Moves Venice

**The agreed build.** design-8's warmth, carrying every decision from the
working session.

Live: `https://giddyuptiger.github.io/primalmovesweb/design-9/`

## What this is

The meeting produced three decisions that didn't live in the same design:
condensed v6 structure, the $40 day pass as the hero CTA, and Helvetica Neue
caps to match the parent brand. design-9 is the merge.

## Colour — the brand palette, green accent

Sampled from Miki's board (`brand/palette.md`). Cream `#EDE8D2` ground, taupe
`#DCCFB9` alternates, **forest `#303F16` as the accent** — buttons, rules, the
calendar's event dots. Navy `#132238` carries body copy; burnt red `#AE411C` is
the secondary accent, used sparingly. Every text colour clears WCAG AA on every
ground it sits on.

## Design studio — `/admin/`

A panel for trying colours and photographs on the live pages without touching
code. Passphrase `primal` (it's in the page — a courtesy gate, not a lock).
The **EDIT** tab on the right edge opens and closes it; the page and the nav
both narrow so nothing sits underneath it.

**Colour** assigns any brand colour to any role and warns when a choice drops
below 4.5:1.

**Photos** — while the panel is open every image carries **Swap** and
**Focus**. Swap picks from the 36-shot library or previews a local upload;
empty slots show **+ Add photo** and become real images when filled. Focus is
the one that fixes badly-cropped heroes: click the part of the picture that
should stay in frame and it sets `object-position` for that slot, so the crop
holds its subject as the frame changes shape.

**Copy config** hands you the exact CSS, `photos` and `photoFocus` blocks.

It saves nothing to the site — a static page has no server to write to. Every
change lives in that person's browser until the copied config is pasted into
the repo and pushed. Which means anyone can experiment freely without the risk
of breaking the live site. The upgrade path, when it's worth it, is a git-based
CMS that commits for them — see `strategy/launch-stack.md`.

## Photos — how to swap one

Two ways, both easy: drop a file into `assets/photos/` with the **same filename**
and nothing else changes, or use a new filename and update one line in the
`photos: { … }` block of `config.js`. A slot pointing at a missing file keeps
the picture it already had rather than breaking. Full slot list in
`assets/photos/PHOTOS.md`.

## Type hierarchy

The scale was rebuilt in August after a fair criticism: an 11px label nobody
could read, a 58px/300-weight tagline carrying no information, and the actual
content at 17px underneath — so the eye landed on the least useful text and
the biggest thing on the page was also the thinnest.

Now: section headings come **down** in size and **up** in weight (400, not
300); kickers come **up** to 12.5px/600 in the accent colour, because they are
the section's name; ledes come up and darken. On utility pages the heading
says what the page *is* and the poetic line is demoted into the lede. The hero
still shouts — that's the front door, not a reference page.

## Type — hybrid case

The notes said all caps. design-8 is lowercase, and that's most of where its
warmth comes from. So: **hero headline, nav, buttons, kickers and tier labels
are uppercase; section headings stay lowercase.** To go fully uppercase, change
`lowercase` to `uppercase` on `.display-sm`, `h2` and `h3` in `style.css` —
three values, no other edits.

## The events calendar is ours now

`tools/fetch_events.py` pulls Luma's **public ICS feed** — no API key, no Luma
Plus subscription — normalises it, and writes `events.json`. The page renders
its own month grid from that file, in our type and colour, with every event
deep-linked to its own Luma page.

```
python3 tools/fetch_events.py     # run at build time, or on a schedule
```

The feed sends no CORS headers, so the browser can't fetch it directly — that
fetch has to happen server-side. On Cloudflare Pages this becomes a scheduled
build or a small Worker; today it's a script you run before committing.

Everything is resolved in `America/Los_Angeles`, so a visitor in London still
sees the LA date and time.

## Contrast

`--mid`, `--soft` and `--clay` were darkened so body copy, captions, kickers
and meta clear WCAG AA (4.5:1) on every ground in the palette. `--sage` is
unchanged as an accent; button fills use `--sage-btn` and sage-as-text uses
`--sage-txt`. An automated pass over all nine pages went from 238 failures to
one placeholder label at 4.37:1.

## Pages

`/` · `/practice/` (Our Method) · `/classes/` · `/studio/` · `/memberships/` ·
`/cherish/` · `/events/` · `/partners/` · `/shop/`

## Still open

See the root `strategy/design-gaps-vs-meeting-notes.md`. The short list:
brand hex codes, hero video, teacher headshots, class descriptions, the Moss
signup URL, the Healcode schedule widget ID, the Toast URL, and real
testimonials.
