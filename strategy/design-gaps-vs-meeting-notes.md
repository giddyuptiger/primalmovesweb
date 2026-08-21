# Designs 6 / 7 / 8 — audited against the working-session notes

Audit run 21 Aug 2026 against the current files on `main` (commit `86b96fd`).
✅ = already in the build. ❌ = not done. ⚠️ = done differently, or the note
conflicts with something decided earlier.

---

## 0. The thing that isn't a bug fix

The notes made two decisions that don't currently live in the same design:

- **"Use the condensed page structure (v6), not the expanded one."** → design-6.
- **"The hero CTA becomes the $40 day pass, not the 2-week trial."** → design-8.
- **"Match the parent brand: Helvetica Neue, all caps."** → design-6 (7 and 8 are
  deliberately lowercase).

So the agreed site is **design-6's structure and caps, carrying design-8's
day-pass hero and copy**. That's a merge, not a punch-list. Designs 7 and 8
become reference: 7 for the calmer spacing, 8 for the day-pass argument.

Everything below assumes that merge happens into a **design-9** (or straight
into design-6). Marking which design each gap currently affects so nothing
gets lost in the move.

---

## 1. Global

| # | Item | Status |
|---|---|---|
| 1.1 | Helvetica Neue everywhere, serif and cursive removed | ✅ all three (Caveat kept for the two handwritten pointers) |
| 1.2 | All caps to match parent brand | ⚠️ design-6 yes; **7 and 8 are lowercase by design** — the merge has to pick one |
| 1.3 | Brand hex codes | ❌ waiting on Mickey. All three palettes are mine, not the parent brand's |
| 1.4 | Primal Moves Venice logo, top left | ✅ (wordmark, not the real logo file — no logo asset yet) |
| 1.5 | Sticky nav | ✅ all three |
| 1.6 | Rename "The Practice" → **The Method** | ⚠️ currently reads **"Our Method"** everywhere (your earlier instruction). Notes say "The Method". Pick one and I'll sweep it |
| 1.7 | Rename "Cherish" in nav → **Cafe & Tea Lounge** | ❌ nav still says "Cherish" in all three |
| 1.8 | Nav list: Method, Classes, Studio, Memberships, Cafe & Tea Lounge, Events | ⚠️ close — currently Our Method / Classes / Studio / Membership / Cherish / Events. Needs 1.6 and 1.7 |
| 1.9 | Drop "Community Wellness Club" from nav/eyebrow | ❌ still the design-6 hero eyebrow |
| 1.10 | Every "Start your 2-week trial" button → **$40 Day Pass**, sub-line *includes a class, sauna, and cold plunge* | ❌ design-8 only, and without the sub-line. **Design-6 and 7 still lead with the 2-week trial** (11–12 mentions on the homepage each) |
| 1.11 | 2-week unlimited listed on the memberships page only | ❌ 6 and 7 |
| 1.12 | Nothing on the site unless it's in MindBody or Luma | ❌ the homepage events strip in 6 and 7 is hand-written placeholder content |

## 2. Homepage — above the fold

| # | Item | Status |
|---|---|---|
| 2.1 | Eyebrow: *Come for the workouts, stay for the people.* | ❌ none of the three |
| 2.2 | Headline: **PRACTICE MAKES PRIMAL** | ❌ none of the three (currently "Move like you mean it" / "a daily movement practice" / "come enjoy a class, a sauna, and a hang") |
| 2.3 | Sub-line: *A daily movement practice, a sauna, a cold plunge, a cafe, and a room full of people.* — cut "show up", cut the duplication | ❌ all three still end "...who show up" |
| 2.4 | CTA **$40 Day Pass**, secondary Primal Online | ⚠️ design-8 has the day pass but its secondary is "what's included"; 6 and 7 have the trial |
| 2.5 | Hero **video** (5 pillars, ~5s each) replacing the static image | ❌ all three are static photos. Waiting on Mickey's cut |
| 2.6 | Chest-to-wall in front of Tanya's mural, used elsewhere | ❌ no such photo in the library yet |

## 3. Homepage — body

| # | Item | Status |
|---|---|---|
| 3.1 | Move "What is Primal" directly after the hero | ✅ 6 and 7. ⚠️ 8 puts the offerings grid first |
| 3.2 | Cut its length — "nobody reads the second paragraph" | ❌ all three still run two paragraphs plus a pull quote |
| 3.3 | Keep "ask 10 members, get 10 answers" | ⚠️ design-8 only |
| 3.4 | Retitle it **The Primal Experience** | ⚠️ **name collision** — "The Primal Experience" is already the title of the offerings grid in all three. One of the two has to be renamed |
| 3.5 | Swap "community" for **stillness / mindfulness** in the pillar list | ❌ all three still say community — and note this pulls against your earlier "swap *room* for *community*" edit. Worth settling in one pass |
| 3.6 | *When was the last time you went to a gym where nobody was wearing headphones?* | ✅ all three |
| 3.7 | Offerings grid, two labeled groups, sub-line *One studio, all your needs* | ✅ all three (Fitness / Amenities) |
| 3.8 | Delete the day-in-the-life strip with the tiny photos | ✅ all three (last one removed from design-8 this week) |
| 3.9 | Delete the Cherish block from the homepage | ❌ all three still have it — and it's load-bearing in design-8, where the cafe is part of the day-pass pitch. Flagging rather than deleting |
| 3.10 | Upcoming events → **month calendar view**, not the Luma list | ❌ all three use Luma's list embed. Needs a spike (see note below) |
| 3.11 | Closing CTA moved to the bottom | ✅ all three |
| 3.12 | Family moment near the top — kids passes + Saturday morning family session | ❌ family is mentioned in passing; there's no distinct moment and the Saturday session isn't named anywhere |
| 3.13 | Closing CTA reframed around how they'll feel, replacing "2 doors, same practice" | ⚠️ partly — 6 and 7 now say "Ready?" then "Two ways in". The feel-first line isn't written yet |
| 3.14 | Primal Online framed as **two weeks** free, matching the trial | ❌ still "1 week free" in config. Blocked on Gus → Nick |

## 4. The Method page

| # | Item | Status |
|---|---|---|
| 4.1 | Pull the method copy from Nick's existing page, largely verbatim | ❌ current copy is mine, written to sound right. Not checked against primalmoves.com |
| 4.2 | Drop the "means different things to different people" framing here | ⚠️ needs 4.1 first |
| 4.3 | Teacher training → short blurb + apply link | ❌ still a fuller section in all three |

## 5. Classes

| # | Item | Status |
|---|---|---|
| 5.1 | Class list with descriptions, then the MindBody schedule | ⚠️ structure ✅ (10 classes listed), **descriptions are placeholder** — waiting on Gus |
| 5.2 | App download link | ✅ all three |
| 5.3 | Live MindBody schedule inline | ❌ still the fallback "Book through Mindbody" card. Needs the Healcode widget ID |

## 6. Studio

| # | Item | Status |
|---|---|---|
| 6.1 | Split private-hire intent from prospective-member intent | ❌ still interleaved in all three |
| 6.2 | "What you'll actually find here" offerings overview | ❌ |
| 6.3 | Proper teacher headshots | ❌ placeholders |
| 6.4 | **Nick Brewer photo shows the wrong person** | ❌ still pointing at `handstand-parallettes.jpg` |
| 6.5 | Keep square footage, space photos, private-hire inquiry | ✅ |

## 7. Memberships

| # | Item | Status |
|---|---|---|
| 7.1 | Primal highlighted as the featured tier | ✅ all three |
| 7.2 | 2-week unlimited listed as the intro trial, labeled | ✅ all three (top of page) |
| 7.3 | "No commitment required" tile → **Nomad**; add **Kids Primal** | ✅ all three |
| 7.4 | Digital Studio converted to **USD** | ❌ still €12.99 / €99 in all three |
| 7.5 | **Community Partners section — Moss and Summit, plus "Become a Primal Partner"** | ❌ **missing entirely from all three.** This is the one the Tuesday Moss announcement points at |
| 7.6 | Moss link goes straight to Moss's own signup | ❌ no link exists yet — waiting on Gus for the URL |
| 7.7 | Keep FAQ and testimonials | ⚠️ both present, **testimonials are invented placeholder quotes** — these must not go live as-is |

## 8. Cafe & Tea Lounge

| # | Item | Status |
|---|---|---|
| 8.1 | Reduce to a placeholder page for now | ❌ it's currently a full page with a menu I wrote |
| 8.2 | Link out to the Toast-hosted site once live | ⚠️ the hook exists (`toastOrderUrl`), the URL is blank so the button is disabled |
| 8.3 | Real cafe photography | ❌ the photos on that page are the upstairs tea room, correctly labelled but not the cafe |

## 9. Events

| # | Item | Status |
|---|---|---|
| 9.1 | Month calendar view rather than the Luma list embed | ❌ — see below |
| 9.2 | Keep the private-events pitch and CTA | ✅ |

**On the calendar view:** Luma's embed for `cal-CRQbJyS4jRRrfsN` renders as a
list; I haven't found a documented month-grid parameter. Two honest options —
(a) drop the embed and build our own month grid from Luma's API, which means
the events are ours to style and satisfies "calendar view", or (b) delete the
embed for now as the notes allow, and link out. (a) is maybe half a day.

---

## 10. Blocked on someone else

Nothing below is a code problem; listing so it's chaseable.

- **Domain + DNS from Patrick** — blocks go-live *and* Klaviyo SMS registration.
- **Brand hex codes** — Mickey.
- **Hero video** — Mickey.
- **Teacher headshots + the correct Nick Brewer photo** — Mickey.
- **Real cafe photography** — Mickey.
- **Class descriptions** — Gus.
- **Moss + Summit partner details and the Moss signup URL** — Gus.
- **Two weeks free on Primal Online** — Gus → Nick.
- **Healcode / Branded Web schedule widget ID** — MindBody account (Home →
  Branded Web → Widgets → New Schedule). Until then the schedule is a button.
- **Toast ordering URL** — blocked on permits.
- **Real testimonials** — anyone.
- **Does the $40 pass actually include coffee, cowork and tea in MindBody?**
  Flagged on-page as *To confirm* in design-8. The homepage claim is wrong
  until the product changes.
