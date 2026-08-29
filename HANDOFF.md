# Primal Moves Venice — project handoff

Repo: `https://github.com/giddyuptiger/primalmovesweb`
Live: GitHub Pages from `main` → `giddyuptiger.github.io/primalmovesweb/design-N/`
Local clone: `~/code/primalmovesweb`

## What's in here

| Path | What it is |
|---|---|
| `design-1` … `design-3` | Earlier structural explorations of the current primalmoves.com system. Monochrome, Jost. |
| `design-4` | Schedule-first Venice site. Book Now + $69 intro offer, Luma events, teachers & space, teacher training, Toast cafe. Same visual system as design-1. |
| `design-5` | **The current direction.** Built from the Creative & Strategy Working Brief (Notion, ed. Aug 3). New visual system, 10 pages. |
| `assets/photos/` | 36 photos from the shoot, web-optimised (2200px, ~350KB each) and named by content. |
| `assets/images/palm.svg` | Custom Venice palm mark, used as a CSS mask so it inherits `currentColor`. |

## design-5 at a glance

**Visual territory — *editorial athleticism*.** Archivo 700 for oversized display,
Instrument Serif (roman + italic) cutting into it for emphasis, Caveat for
handwritten asides. Warm off-white `#F4F1EA`, black `#100F0C`, earthy neutrals,
chartreuse `#D8FF37` used selectively. Cherish has its own scoped palette
(cream / oxblood / mustard) that overrides the whole page.

**Conversion model** — the brief's two trials are structural, not decorative.
They appear in the nav, on the homepage, and at the foot of every page:

1. Primary — Start Your 2-Week Trial ($69)
2. Secondary — Try Primal Online Free

**Pages** — home (all 12 brief sections), about, classes, schedule, memberships,
cherish, events (working category filter), partners, shop, visit.

**Build** — pages are generated, not hand-edited. Regenerate with the build
script if one exists in your session; otherwise edit the HTML directly, but note
nav/footer are duplicated across all 10 pages, so change them everywhere.

## Configuration — `design-5/config.js` (and `design-4/config.js`)

One file per design. Blank values degrade gracefully: buttons hide or disable,
embeds render a real card instead of a broken frame.

Wired: Mindbody site ID `5745965` (verified — Primal Moves Venice Beach),
Digital Studio trial, Luma host profile.

**Still blank / needed:**

- `healcodeWidgetId` — see the Mindbody note below
- `veniceTrialUrl` — currently defaults to the Mindbody pricing-options page
- `toastOrderUrl`, `toastCateringUrl` — Cherish online ordering
- `shopUrl`, `linktreeUrl`

## Three things that are NOT bugs — don't "fix" them by re-embedding

1. **Mindbody cannot be iframed.** `clients.mindbodyonline.com` sends
   `X-Frame-Options: SAMEORIGIN`. An iframe renders as a blank white box in
   every browser. The only supported inline option is a **Healcode / Branded
   Web widget**, generated in the Mindbody account
   (Home → Branded Web → Widgets → New Schedule). Paste its `data-widget-id`
   into `healcodeWidgetId` and the real schedule renders via `data-pm-schedule`.
   Until then visitors get a "Book through Mindbody" card with a working button.

2. **Luma has no embed for host profiles.** `luma.com/user/PrimalMoves` is a
   *host profile*, not a Calendar — Luma only offers embed codes for Calendars.
   To get a live embedded calendar, create a Luma Calendar and host events under
   it, then paste the `cal-XXXX` embed URL into `lumaEmbedUrl`.

3. **Empty photo slots are deliberate**, not missing images — Shop (no merch
   photography exists yet) and the Cherish collage (see below).

## Open items

**Content the brief itself lists as outstanding** — these are tagged on-page with
`Needed` / `To confirm` / `Placeholder` rather than invented:

- **Student testimonials** — the brief's primary positioning evidence. Currently
  three empty tiles on the homepage and three on memberships. This is the
  biggest gap; consider cutting the section until real quotes exist, since an
  empty section is more conspicuous than an absent one.
- **Cherish cafe photography** — the `tea-room*.jpg` images are the upstairs
  meditation/tea room, NOT the cafe. Cafe photos are to come from the Cherish
  Instagram. The Cherish collage holds labelled placeholders meanwhile.
- Venice membership tiers, prices, benefits, freeze/cancellation policy
- Final 2-week trial terms
- **Online trial length is contradictory** — the brief says one week free;
  primalmoves.com advertises 14 days. Settle before launch.
- Cherish menu and prices
- Real event listings; class durations and level guidance
- Teacher names, bios, portraits
- Partner list, logos, affiliate terms
- Full weekly hours; Shop scope

**Known design critiques (mine, unaddressed):**

- The homepage is long (~9,800px desktop). The Classes section duplicates the
  Classes page and Membership is thin — folding both would cut ~2,000px.
- Chartreuse may be over-used: two large acid panels on the homepage plus a
  statement block. Brief says "selectively."
- Nine nav items is a lot for a site with one primary conversion. Partners and
  Shop could live in the footer until they have content.
- "A Day at Primal" is the strongest section and sits at #5 — worth moving up.

## Accuracy notes

- Postal address is **1038 Princeton Dr, Ste B, Marina del Rey, CA 90292**.
  Marketing copy says **Venice**; the footer address stays Marina del Rey so
  mail and Maps work.
- The studio is *not* "two blocks from the boardwalk" — that claim was removed.
  Don't reintroduce distance claims without checking.

## Platform

The brief recommends Squarespace for self-editing. Everything here is a static
HTML prototype for settling direction, structure and copy — it translates to
Squarespace sections cleanly. It is not the production build.

---

## Known issue: the house layout's heading system is inferred, not declared

**Found:** 29 Aug 2026, while adding the SMS terms to /terms/.
**Symptom when it bites:** every `h1` and `h2` on a page collapses to 17px grey
body text, indistinguishable from the paragraphs around it. It did exactly that
to /terms/ and /disclaimer/, live, for as long as the house layout has been the
default.

**Why.** `style.css` has a section-head transform for the house layout:

```css
body.house section:not(.hero):not(.phero)
  *:has(> .kicker):has(> :is(h1,h2,h3,.display,.display-sm))
  > :is(h1,h2,h3,.display,.display-sm) { font-size:17px !important; color:var(--mid); ... }
```

It matches `*` — any element at all that happens to contain a `.kicker` and a
heading as direct children. On a marketing section that is the intended effect:
the eyebrow becomes the headline and the old headline drops to a quiet line
beneath it. On a legal page, where one `.wrap` holds the eyebrow **and a dozen
`h2`s**, it demoted the whole document.

Measured across the site: **35 containers match this rule; 34 of them match by
structure alone.** Only one carries the `.section-head` class that describes what
is happening. The styling is being inferred from markup shape rather than
declared, so any future block that puts a kicker next to a heading inherits a
transform nobody asked for, silently, with `!important` on top.

**The fix** (not done — needs its own pass, it touches every page):

1. Scope the rule to `.section-head`, so it applies where it is asked for:
   `body.house .section-head > :is(h1,h2,h3,...)`.
2. Add `class="section-head"` to the ~34 blocks that currently rely on the
   structural match. They are already a consistent shape, so this is mechanical.
3. Drop the `!important`s — with an explicit class they stop being needed.
4. Then remove the `.legal-eyebrow` workaround in `_legal()` (build_d9.py) and
   the `.wrap.legal` block in style.css, and put `.kicker` back on those pages.

Until then: **a page that is a document rather than a marketing section must not
put a `.kicker` and a heading in the same container.** That is what
`.legal-eyebrow` exists to avoid, and it is a workaround, not a design.
