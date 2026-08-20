# Design prompt — Primal Moves Venice, calmer on mobile

*Paste this into a fresh Claude conversation. It is self-contained — Claude does
not need the repo. Ask for a single-file HTML artifact so you can look at it
immediately, then iterate by replying with what you want changed.*

---

## The ask

You're designing the mobile experience for **Primal Moves Venice**, a community
wellness club in Venice, California built around a daily movement practice.

An existing desktop design works well. Its problem is that on a phone it feels
**busy** — too many competing elements per screen, too many type sizes at once,
too much ornament, too many things asking to be read. I want the same brand,
noticeably calmer.

**Build a single self-contained HTML file** (inline all CSS and JS, no external
assets except Google Fonts, no localStorage) that renders the homepage and is
designed mobile-first at **390px wide**. Desktop can be a graceful widening of
the same layout — don't design desktop-first and shrink it.

Show me your work at phone width. I'll iterate from there.

---

## Brand and strategy

**Positioning:** a community wellness club built around a daily movement
practice — where physical practice opens into accountability, belonging, events,
restoration and nourishment. Not a gym. The site must answer three questions
fast: *What is Primal? Is it for me? What do I do next?*

**Audience:** people who want to improve their lives through physical practice
and are ready to level up through community, accountability and shared
experience.

**The two conversions, in priority order:**

1. **Primary — Start Your 2-Week Trial, $69.** Local and ready to move.
2. **Secondary — Try Primal Online Free.** Not local, or not ready yet.

Membership is a *later* conversion. Don't lead with prices.

**What the studio actually is:** 11,000 ft² open floor with overhead rigging, a
sauna, a cold plunge, a lounge with a disco ball, a tea and meditation room, and
**Cherish** — an on-site cafe and tea lounge that has its own identity. Coaches
come from circus, stunt work, dance and bodywork. There are events most weeks.

---

## Visual system — keep this

The territory is **editorial athleticism**: physical, fashionable, culturally
aware, playful, slightly raw. Think fashion editorial that happens to be about
movement, not a fitness brand.

**Type**

| Role | Face | Notes |
|---|---|---|
| Display / UI | **Archivo** 700 | Oversized, uppercase, tight tracking (`-0.03em`) |
| Editorial | **Instrument Serif**, roman + italic | Used *inside* display lines for emphasis, and for numbers, times and prices |
| Annotation | **Caveat** | Handwritten asides |

The signature move is serif italic cutting into a bold uppercase sans line —
e.g. "MOVE LIKE YOU *mean* IT", "FROM *first light* TO LAST CALL". Use it, but
sparingly.

**Colour**

```
--ink:    #100F0C   /* near-black */
--paper:  #F4F1EA   /* warm off-white — the default background */
--paper2: #EAE5DA   /* alternate section background */
--mid:    #5D584C   /* body copy */
--line:   #D6CFC0   /* hairlines */
--acid:   #D8FF37   /* chartreuse — accent ONLY, never a large field */
--clay:   #B4643C   /* earthy accent, used for the handwriting */
```

Chartreuse appears on **one primary button per screen at most**, plus the price
figure. It should never be a background panel.

**Cherish sub-palette** (its own page gets these, overriding the above):
cream `#EFE6D5`, oxblood `#6B2028`, mustard `#C8922A`.

**Photography direction:** candid, flash-lit, grainy, documentary. Collective
practice (many bodies moving together), effort close-up (hands, grip, sweat,
faces), skill and possibility (handstands, rings), joy and release, rest as
practice (sauna, cold plunge), and the space as a character (brick, steel, rugs,
disco ball). Cropped bodies and movement details, never conventional fitness
poses. Use placeholder blocks labelled with what each image should be.

---

## What "calmer on mobile" means

This is the actual design problem. Interpret it — these are goals, not a spec.

- **One idea per screen.** A phone screen should hold a single thought, not
  three competing ones.
- **Fewer simultaneous type sizes.** Currently a screen can show a display
  heading, a kicker, a lede, body copy, a caption, a fine-print line and a
  button label. Cut that down.
- **Less ornament.** The desktop design uses hairline rules, editorial numbers,
  handwritten annotations, `+` disclosure markers and a small palm-tree mark.
  Decide which of those survive at 390px — probably not all.
- **Progressive disclosure over density.** If something is reference material
  (class lists, membership terms, room-by-room detail), let people open it
  rather than scroll past it.
- **Fewer CTAs per screen.** One primary action visible at a time.
- **Whitespace instead of borders.** Prefer space to separate things over rules
  and boxes.
- **Shorter.** The current homepage is around 7,700px tall on desktop and longer
  on mobile. Aim meaningfully shorter without deleting the story.

Constraints worth respecting: every tappable thing should clear ~44px; no
horizontal scrolling at 320px; inline links inside sentences stay inline.

---

## Homepage content to work with

Use this real content — don't write lorem ipsum, and don't invent facts beyond it.

**1. Hero.** Full-bleed photograph (a wall of people holding handstands against a
blue wall). Dateline: *Venice, California · 11,000 ft²*. Headline: **MOVE LIKE
YOU *mean* IT.** Sub: *A daily movement practice, a sauna, a cold plunge, a cafe
and a room full of people who show up. Start with two weeks.* CTAs: Start Your
2-Week Trial (primary) / Try Primal Online Free (secondary).

**2. What is Primal?** *Not a gym. A practice.* — Primal is a movement practice
built on how the body actually works: crawling, hanging, pushing, pulling,
balancing, getting upside down. It trains strength and mobility together, in
patterns you'd recognise from being a kid. But the practice is only half of it.
What people stay for is the room — the accountability of a class that expects
you, the people you end up eating with afterwards, the events that fill the
floor on weekends.

**3. A Day at Primal** — a timeline that helps someone picture inhabiting the
space. (This is the strongest section in the current design. Keep it strong.)

```
7:00 AM   Restore       Start softly with a class that brings you into your body.
8:45 AM   Compound      Functional strength training. Push, pull, carry, load.
10:00 AM  Primal        Our signature movement practice. Where everyone starts.
11:00 AM  Nourish       Tea, coffee or breakfast at Cherish. Sit down. Stay.
5:30 PM   Progressions  Get upside down and change your perspective.
7:00 PM   Gather        Stay for a workshop, dinner, music or a special event.
```

**4. Choose your way in** — the two trials, presented as a genuine either/or.
$69 for two weeks unlimited (classes, sauna, cold plunge; long enough to
actually find out whether this is for you — not a single drop-in) versus free
online (live-streamed classes and the full recorded library; learn the method
from anywhere, then come find us on the floor).

**5. What you can experience** — Movement · Sauna & recovery · Cherish ·
Community · Events.

**6. Upcoming events** — the floor changes shape most weeks: workshops, tea
ceremonies, music, community nights, some free. Link to a full calendar.

**7. Meet Cherish** — *Slow down with us.* Nourishment is not only what we
consume, but how we experience it. Presence, ritual, nourishment. This should
feel like a door into a different room — warmer, slower, its own palette.

**8. Final conversion** — repeat the two trials. Mention that membership is the
natural next step *after* the trial, not before.

**Footer** — 1038 Princeton Dr, Ste B, Marina del Rey, CA 90292 · (310) 800-7061
· @primalmovesvenice · practice / studio / Cherish / events links.

---

## Reference content for deeper pages (optional)

Only if you go beyond the homepage.

**Classes:** Primal (the signature class, start here) · Compound (loaded
strength) · Moves (progressive strength and mobility) · Progressions
(dynamic-to-static skill work) · Handstand (inversions, advanced) · Restore
(mobility, breath, recovery) · Primal Vinyasa · Group Meditation · Primal Kids ·
Team Practice.

**Memberships** (monthly autopay, three-month minimum unless noted):

- Weekend Warrior — $120/mo — 4 day passes a month, each one class plus sauna, plunge and gym
- The Explorer — $200/mo — 8 classes a month; sauna, plunge and gym on the days you train
- **The Primal — $315/mo — unlimited classes, unlimited sauna and plunge, gym, morning tea ceremony included** *(the hero tier)*
- The Nomad — $375/mo — everything in The Primal, one month, no contract
- Day Pass — $40 · Kids' Primal — $125/mo · Digital Studio — €12.99/mo

**The space, room by room:** main floor (rigging, rings, bars, stall bars,
racks) · the lounge (sofas, rugs, disco ball, decks) · sauna · cold plunge (two
tubs, outdoors) · tea and meditation room upstairs · Cherish · changing rooms ·
step-free entrance and parking.

---

## Deliver

A single HTML file. Mobile-first, 390px. Include a short note at the end of your
reply explaining **what you cut or collapsed to make it calmer, and why** — that
matters more to me than the code.

Don't ask clarifying questions first; make your best judgement, show me
something, and I'll react.
