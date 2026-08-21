# Design 9 — Primal Moves Venice

**The agreed build.** design-8's warmth, carrying every decision from the
working session.

Live: `https://giddyuptiger.github.io/primalmovesweb/design-9/`

## What this is

The meeting produced three decisions that didn't live in the same design:
condensed v6 structure, the $40 day pass as the hero CTA, and Helvetica Neue
caps to match the parent brand. design-9 is the merge.

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

`/` · `/practice/` (The Method) · `/classes/` · `/studio/` · `/memberships/` ·
`/cherish/` · `/events/` · `/partners/` · `/shop/`

## Still open

See the root `strategy/design-gaps-vs-meeting-notes.md`. The short list:
brand hex codes, hero video, teacher headshots, class descriptions, the Moss
signup URL, the Healcode schedule widget ID, the Toast URL, and real
testimonials.
