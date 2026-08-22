# design-9 — a designer's pass over the whole site

Written 22 Aug against the live build. Ordered by how much each change would
move the needle, not by how hard it is. Measurements are from the built pages,
not impressions.

---

## The one-sentence verdict

The system is good — the type scale, the palette and the calendar all hold up.
What's missing is **contrast between sections**: nearly every band is the same
height, the same alignment, the same two-column shape, on the same cream. The
site reads as one long even-toned scroll rather than a sequence with a shape.

---

## 1 · Every section is the same size and shape

Homepage section heights: **837, 580, 698, 826, 301, 463, 787px.** Five of the
eight sit between 580 and 840. Six of the nine pages use the identical
`text left / thing right` split. Padding is 80 or 130px and almost nothing else.

Nothing is bigger because it matters more. The eye has no idea where to stop.

**What I'd do**

- Pick **two sections per page that are allowed to be large** and cut the rest
  by a third. On the homepage that's *not a gym, a practice* and *the third
  place*; everything else becomes a band.
- Introduce a **short band** — 240–320px, one line of type, no image, no CTA —
  and use it as punctuation between the big moments. The *if you like it here*
  section is already close to this at 301px; make that a deliberate type.
- Break the two-column habit at least once per page. A **full-bleed image with
  type over it**, or a **centred single column at 60ch**, would do more for the
  rhythm than any amount of colour work.

## 2 · There are almost no photographs

The homepage has **two images** in 5,714px of scroll. Most pages have one. For
a business whose product is *a room full of people moving*, that's the biggest
gap on the site — and it isn't a design problem, it's a supply problem.

**What I'd do**

- Get to **six or seven images on the homepage.** One full-bleed break, one in
  the practice section, one for family (that slot is empty right now), a
  three-up strip of the space, and one behind the closing statement.
- The **statement band** ("ready or not…") is 463px of cream with type on it.
  That's the most obvious place for a full-bleed photograph with the line
  reversed out of it. It would become the strongest moment on the page.
- **Cherish is 2,004px and almost entirely a placeholder.** Right now it makes
  the site look unfinished. Either get one real cafe photograph or fold the
  page into Studio until the permits land.

## 3 · Too many asks, so none of them lands

CTA counts per page: **home 13, memberships 20, classes 7, events 7.**

Every section ends with buttons, plus the two-way trial pair repeats at the
bottom of all nine pages. After the hero, no ask is louder than any other.

**What I'd do**

- **One primary CTA per screen.** Where a section needs a second action, make
  it a text link with an arrow, not a pill. Visually that's the whole fix.
- Memberships' twenty buttons are mostly the word **Join** repeated. In the
  cards view, only the featured tier needs a filled button; the rest can be
  underlined text links. The table already does this better.
- The closing trial pair is right, but it should be the **only** conversion
  moment in the bottom third. Currently *if you like it here* fires two CTAs
  about 800px above it.

## 4 · Type is close, but still too many sizes

Distinct rendered sizes per page: **home 9+, memberships 9+, studio 9+.**
A tight system runs 5–6. The August reform fixed the hierarchy — this is the
next cut.

**What I'd do**

- Collapse to six roles and delete the rest: hero 86 / section 40 / sub 27 /
  body 19 / small 15 / label 12.5. The 54, 34, 32, 30, 22 and 20 sizes are all
  doing near-identical jobs.
- **Set body copy once, globally.** There are inline `font-size:clamp(...)`
  overrides scattered through the markup; every one is a place the system
  leaks.

## 5 · Colour is doing less work than it could

Across nine pages the dark forest band appears **six times total**, and four
pages have no tonal break at all. Cream/taupe carries almost everything, so the
green reads as an accent on buttons rather than as part of the identity. The
clay red appears at scale exactly once (the statement band) and looks like it
wandered in from another palette.

**What I'd do**

- **One dark band per page, minimum**, placed at roughly the two-thirds mark.
  It's the cheapest possible fix for pacing and it costs nothing.
- Retire clay as a *display* colour. Keep it for rules, dots and small marks
  where it's doing good work. Statement bands should be forest or navy.
- Use **taupe more deliberately** — right now alt bands alternate mechanically.
  Let two cream sections sit next to each other so a taupe band means something.

## 6 · Page lengths are inverted

**Studio 8,657px. Practice 7,275px. Home 5,714px.**

The two longest pages on the site are secondary. Studio in particular runs
2,488px before it reaches the room list, then 1,625px of teacher grid that is
currently eight empty portrait frames.

**What I'd do**

- **Studio needs a split**, and it's already been flagged: the private-hire
  audience and the prospective-member audience want different pages. Do that
  and both halves get shorter and clearer.
- The teacher grid should **collapse to the four people you have photographs
  of** and grow back later. Eight empty frames read as neglect, not as
  anticipation.
- **The Method's four series are 2,887px** — beautiful, and about 800px more
  than the content needs. Tighten the image heights from `34vw` to `26vw`.

## 7 · Smaller things worth fixing

- **The hero eyebrow is nearly invisible** over the photograph. It's the first
  line of copy on the site. Give it a shadow or a scrim.
- **Cherish is the only page with no dark band and no CTA** other than "find
  us". It's a dead end.
- **Shop is 3,526px to say "buy in studio."** It should be a section on
  another page until there's something to sell.
- Every page hero is `440px` — identical. Vary them: the Method and Studio can
  carry a taller image; Partners and Shop don't need one at all.
- **The nav has seven items plus two buttons.** That's at the edge. If anything
  else is added, something has to go.

---

## If you only do three things before Monday

1. **Photographs on the homepage.** Fill the family slot, and put a full-bleed
   image behind the closing statement. Biggest visible change, no code risk.
2. **Cut the homepage CTAs from thirteen to about six** by demoting secondary
   actions to text links.
3. **Shorten Studio and The Method** — collapse the teacher grid to the real
   photographs and tighten the series images.

None of those need a decision from anyone else, and together they'd close most
of the gap between "looks good" and "looks finished".
