# Design 7 — Primal Moves Venice

**design-6, reimagined in the style of [mossvenice.com](https://www.mossvenice.com/private-events).**

Live: `https://giddyuptiger.github.io/primalmovesweb/design-7/`

Same content, same structure, same eight pages as design-6. Entirely different
temperature.

## The idea — *quiet wellness*

design-6 is **editorial athleticism**: bold uppercase Archivo, chartreuse, tight
hairline rules, editorial numbering, handwritten asides. It shouts, on purpose.

design-7 is its deliberate inverse, taken from Moss Venice's wabi-sabi register:
**lowercase light type on warm cream, sage and clay, air instead of rules.** It
speaks quietly and assumes you're not in a hurry.

| | design-6 | design-7 |
|---|---|---|
| Display type | Archivo **700**, UPPERCASE, tight | Hanken Grotesk **300**, lowercase, open |
| Editorial face | Instrument Serif | Newsreader (lighter, cooler) |
| Annotation | Caveat handwriting | Newsreader italic — no handwriting |
| Ground | `#F4F1EA` off-white | `#F5F1EA` warm cream |
| Dark sections | `#100F0C` near-black | `#2E332B` deep forest |
| Accent | `#D8FF37` chartreuse | `#7C8471` sage + `#A87355` clay |
| Buttons | hard-edged, offset-shadow hover | soft pills, one sage fill, rest are outlines |
| Separation | hairline rules everywhere | whitespace; rules only in lists |
| Section padding | `9vh` | `13vh` |
| Corners | sharp | 3px, and rounded images |
| Content width | 1320px | 1140px — more margin |

## What changed beyond colour and type

- **Everything is lowercase** — nav, headings, buttons, kickers. This is the
  single biggest tonal move and the easiest to revert: it's `text-transform`
  on `.display`, `.display-sm`, `h2`, `h3`, `.btn` and `.nav-links a`.
- **The hero headline changed.** "MOVE LIKE YOU *mean* IT" is an
  editorial-athleticism line — it doesn't survive being whispered. Replaced with
  "a daily *movement* practice".
- **Handwritten asides are gone**, replaced with serif italic. Caveat belongs to
  design-6's register, not this one.
- **Numbering removed** from the two-ways cards and the experience grid — those
  editorial `01 / 02` markers are a busy-ness device.
- **The experience grid went from five dense tiles to a two-up with photography
  and air**, closer to how Moss presents its rooms.
- **The collage grid is simpler and softer** — six columns instead of twelve,
  rounded corners, bigger gaps.
- **The statement band is set in the serif on cream**, not white-on-black shouting.
- **The palm mark stays** but quieter — 5% opacity in the footer.

## Cherish

Still gets its own scoped palette, pushed warmer to sit inside this system:
cream `#F3E9D9`, oxblood `#7A3A34`, mustard `#C08A2E`. It reads as the warmest
room in a warm building rather than a hard switch.

## Notes

- Verified at 320 / 390 / 430 / 768 / 1440. No horizontal scroll; tap targets
  clear ~44px; nav CTA fits at 320px.
- Hero gradients are stronger than design-6's and light display type carries a
  soft shadow — the Cherish tea-room frame is bright enough to swallow cream
  type otherwise.
- Config (`config.js`) is identical to design-6: same Mindbody site ID, same
  live Luma calendar, same Healcode hooks, same blank Toast/shop keys.
- Open content items are the same as design-6 — see the root `HANDOFF.md`.
