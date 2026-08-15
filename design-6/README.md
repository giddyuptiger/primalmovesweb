# Design 5 — Primal Moves Venice

Built against the **Creative & Strategy Working Brief** (Notion, edited Aug 3).

Live: `https://giddyuptiger.github.io/primalmovesweb/design-6/`

## What this is

The first design in this repo built from the strategy rather than from the existing
site. Designs 1–4 were structural explorations of the current primalmoves.com system.
This one implements the brief's positioning, conversion model, sitemap, homepage
structure and visual territory.

## Visual direction — *editorial athleticism*

| | |
|---|---|
| **Display / UI** | Archivo (contemporary grotesque, 700 for oversized type) |
| **Editorial** | Instrument Serif, roman + italic — used for emphasis inside display lines, numbers, times, prices, and pull quotes |
| **Annotation** | Caveat — the handwritten asides |
| **Palette** | Warm off-white `#F4F1EA` · black `#100F0C` · earthy neutrals (clay `#B4643C`, moss, sand) |
| **Accent** | Chartreuse `#D8FF37`, used selectively — the primary trial CTA, "Start here" tags, one full-bleed statement per page at most |
| **Cherish** | Its own scoped palette: cream `#EFE6D5`, oxblood `#6B2028`, mustard `#C8922A` |

Devices used throughout: oversized type over photography, cropped bodies, editorial
numbering, arrows, handwritten annotation, marquee statements, collage grids.

## Conversion model

The brief's two conversions are structural, not decorative — they appear as a paired
`.ways` block in the nav, on the homepage, and at the foot of **every** page.

1. **Primary** — Start Your 2-Week Trial (local and ready)
2. **Secondary** — Try Primal Online Free (not local, or not ready)

## Pages

| Path | Notes |
|---|---|
| `/design-6/` | All 12 homepage sections from the brief, in order |
| `about/` | Philosophy, method, four series, team |
| `classes/` | Full class list with beginner guidance and "what actually happens" |
| `schedule/` | Live Mindbody embed (site `5745965`) |
| `memberships/` | Three tiers, testimonial themes, FAQs |
| `cherish/` | Own identity, own palette, 7-section structure from the Cherish brand foundation |
| `events/` | Native calendar with working Tea / Workshops / Community / Music / Free filter |
| `partners/` | Roster + inquiry path |
| `shop/` | Merch-as-campaign layout, ready for ecommerce later |
| `visit/` | Address, hours, access, what to bring, FAQs |

## Configuration

Everything third-party lives in **`config.js`**. Blank values degrade gracefully —
buttons hide or disable, embeds render a visitor-facing card rather than a broken iframe.

Already wired: Mindbody site ID `5745965`, Digital Studio trial, Luma host profile.
Still blank: `veniceTrialUrl`, `toastOrderUrl`, `shopUrl`, `linktreeUrl`.

## Open items surfaced on the pages

Anywhere the brief lists information as still needed, the page shows a small
`Needed` / `To confirm` / `Placeholder` tag rather than inventing content:

- Student testimonials (homepage, memberships) — the brief's primary positioning evidence
- Venice membership tiers, prices, benefits, freeze/cancellation policy
- Final two-week trial terms; whether the online trial is 7 or 14 days
  (primalmoves.com currently advertises 14)
- Cherish menu and pricing
- Real event listings; class durations and level guidance
- Teacher names, bios, portraits; partner list and affiliate terms
- Full weekly hours; shop scope

## Note on platform

The brief recommends Squarespace for self-editing. This is a static HTML prototype —
it's here to settle the design direction, structure and copy, not to be the production
build. Everything here translates to Squarespace sections cleanly.
