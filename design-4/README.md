# Design 4 — Primal Moves Venice

Live: `https://giddyuptiger.github.io/primalmovesweb/design-4/`

## Pages

| Path | What it is |
|---|---|
| `/design-4/` | Main page — Book Now + Schedule up top, the **$69 two-week unlimited** offer as a full-bleed feature, **This Week's Events** (live Luma), Method (links out to primalmoves.com), space gallery, cafe + digital studio |
| `/design-4/schedule/` | Live **Mindbody** class timetable, embedded and bookable, plus class-format reference |
| `/design-4/events/` | Live **Luma** events calendar + what we host + private hire |
| `/design-4/teachers/` | Teacher photo/bio grid + studio space photos and specs |
| `/design-4/teacher-training/` | Primal Method Teacher Training — both modules, hours, pricing, how to apply |
| `/design-4/cafe/` | **Toast** online ordering + catering |
| Digital Studio | Not a page — nav and footer link straight out to `primalmoves.com/digital-studio/` |

## Wiring up the embeds

Everything third-party is configured in **one file: `config.js`**. Fill in a value, commit, done.
Anything left blank shows a tidy "not connected yet" placeholder instead of a broken embed,
and any button pointing at a blank URL is either hidden or greyed out.

| Key | What to paste |
|---|---|
| `lumaPageUrl` | Your public Luma calendar, e.g. `https://lu.ma/primalmovesvenice` |
| `lumaEmbedUrl` | Luma → Manage Calendar → Embed → copy the `src="..."`. Looks like `https://lu.ma/embed/calendar/cal-XXXX/events` |
| `toastOrderUrl` | Toast online ordering page, e.g. `https://www.toasttab.com/your-slug` |
| `toastCateringUrl` | Toast catering page (blank hides the catering buttons) |
| `toastGiftCardUrl` | Toast gift cards (blank hides the button) |
| `offerUrl` | Where the $69 buttons go. Blank = Mindbody pricing options page |
| `mindbodySiteId` | Already set to `5745965` (Primal Moves Venice Beach, verified) |
| `mindbodyEmbedOverride` | Only needed if you generate a branded Healcode widget and want to use that instead |

## Adding photos

Drop image files into `/assets/images/` and reference them as `../../assets/images/filename.jpg`.

- **Teacher portraits** — `teachers/index.html`. Replace `<div class="portrait empty">…</div>`
  with `<div class="portrait"><img src="..." alt="Name"></div>`. Shoot vertical, 4:5 (≈1000×1250).
- **Studio photos** — `teachers/index.html`, second gallery. Replace each `<div class="slot">…</div>`
  with an `<img>`. Landscape, ≈3:2 (1800×1200). Worth capturing: sauna, ice bath, rigging,
  cafe counter, entrance, a full class in session.

## Notes

- Built on the design-1 system — same Jost typeface, monochrome palette, sharp corners, pill buttons.
- One shared `style.css` and one shared `config.js` across all pages.
- Responsive down to 390px with a hamburger menu below 1080px.
- Mindbody and Toast embeds can be blocked by some privacy extensions, so every embed
  has a visible "open in a new tab" fallback button next to it.
