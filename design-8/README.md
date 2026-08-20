# Design 8 — the $40 day

**design-7's warm register, restructured around the day pass.**

Live: `https://giddyuptiger.github.io/primalmovesweb/design-8/`

## The shift

design-5/6/7 all lead with **start your 2-week trial** — which asks a stranger
*are you ready to change your life?* design-8 leads with **book a day, $40** —
which asks *what are you doing Saturday?* One of those is easy to say yes to.

The positioning is **the third place**: not home, not work, the other one. That
claim only works because cowork is included, so the building can hold a whole
day. It also absorbs the brief's hardest problem — "what is Primal?" is slippery
because it means different things to different people, and "your third place"
turns that from a bug into the point.

## The structural unlock

**"A Day at Primal" stopped being a story and became the product.**

It was already the strongest section on the site. With the day pass as the hero
offer, the best content and the thing being sold are the same object — so the
timeline moves up to section two, gains a price, and becomes the spine of the
page. The homepage no longer describes a practice; it describes a day you could
have, with a number on it.

## Homepage, in order

1. **Hero** — *come enjoy a class, a sauna, and a hang.* An invitation, not a
   command. "Hang" is the keyword: two efforts and a non-effort.
2. **What forty dollars gets you** — the day timeline as a menu, 7am to 7pm,
   closing on *"that's all one price — our own members pay $25–30 for the class
   alone."*
3. **You don't have to do all of it** — the anti-intimidation section. An
   eight-item day thrills some people and exhausts others; this one converts the
   ones the list scares off.
4. **What is Primal, then?** — reassurance, not a curriculum. The four-series
   method stays on the Practice page.
5. **Where everybody knows your name** — community and events, with the live
   Luma calendar.
6. **Cherish** — more space than before, because coffee and somewhere to sit are
   now part of the offer rather than a nice extra.
7. **Coming back** — membership as consequence, never as the ask. The $69 trial
   appears here for the first time.
8. **So — what are you doing Saturday?**

## What changed elsewhere

- **Nav CTA** is *book a day · $40*; the trial is gone from the nav entirely.
- **Memberships** opens with a no-commitment row — day pass (hero), two-week
  trial, Digital Studio — before the recurring tiers.
- **The handstand wall moved to the Practice page.** It's the most arresting
  photograph in the library and the *least welcoming* one: it says everyone here
  can do something you can't. Wrong first impression for a page whose whole job
  is "you'd be comfortable here." The hero is now people laughing mid-class.

## Config

`dayPassUrl` is new and should point at the **day-pass pricing option** in
Mindbody, not the general pricing page — otherwise the main CTA costs a click.
`veniceTrialUrl` still exists but is only used on the membership page.

## Blocking issue

**The $40 day pass does not currently include coffee, cowork or tea ceremony.**
Per Mindbody it's *one class plus sauna, cold plunge and gym access* — tea
ceremony is a paid extra or a membership perk. The homepage list is flagged
on-page with a `To confirm` note. This is a product change before it's a
marketing change: publish the list and the front desk has to honour it.

Also undecided: does "coffee included" mean drip coffee, or anything at Cherish?
Those are different businesses.
