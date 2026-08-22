# Before launch — the open items

Every "To confirm / Needed / Placeholder" note has been taken off the site.
They were useful while building and they look unfinished to a visitor. This is
where they live now. Nothing on the site says "coming soon" any more, so
**anything still unfinished has to be caught here rather than by the page
admitting it.**

---

## Content still needed

- **To confirm** — Extending the free window to two weeks so both paths read the same.
- **Source** — This page carries the method copy from primalmoves.com/about/ so Venice and the parent site say the same thing. If that page changes, this one should follow.
- **To confirm** — Doors open from 6:30am; full weekly hours to be published.
- **Needed** — Hire rates, minimum booking, capacity and availability.
- **To confirm** — Final trial terms.
- **Needed** — Booking, cancellation and no-show policies to be confirmed.
- **To confirm** — Durations and level guidance need a pass from the teaching team; the live Mindbody schedule is the source of truth for what's actually running.
- **To confirm** — Tea ceremony and cowork on the day pass need the Mindbody product to match. Guest passes, the freeze policy and the $100 early-cancel fee aren't rows yet — say the word.
- **To do** — Point each Join button at its own Mindbody purchase link rather than the general pricing page.
- **To confirm** — Moss and Summit links, and the joint-membership signup URL on Moss's side — purchase happens in their system, so this must deep-link straight there.
- **Needed** — Freeze and cancellation terms to be confirmed with the studio.
- **Placeholder** — Menu, photography and hours are all still to come. Once the Toast site is live this page becomes a link out to it, the same way Venice links out from primalmoves.com.
- **Needed** — Partner list, logos, affiliate terms and inquiry requirements.
- **Needed** — Shop scope and ecommerce timing are an open decision in the brief. This page holds the layout: merchandise now, room for full ecommerce later.

## The functional check to run before going live

Walk the site with this list open. Every one is a thing that looks finished but
isn't wired up.

- [ ] **Every button goes somewhere.** `config.js` has blank keys that make
      buttons inert: `dayPassUrl`, `veniceTrialUrl`, `toastOrderUrl`, `shopUrl`,
      `mossJoinUrl`, `summitUrl`. A blank key means the button either hides or
      links nowhere.
- [ ] **The class schedule is live.** `healcodeWidgetId` is empty, so
      `/classes/#schedule` still shows the fallback card. See
      `strategy/mindbody-schedule.md`.
- [ ] **Each membership Join goes to its own Mindbody purchase URL**, not the
      general pricing page.
- [ ] **Teacher portraits.** Eight frames are empty, Nick Brewer's included —
      his old photo was of someone else.
- [ ] **Testimonials.** The three quotes on Memberships are prompts, not real
      quotes. They must not go live as written.
- [ ] **The Cherish page** is a placeholder. Either a real cafe photograph and
      the Toast link, or fold it into Studio for now.
- [ ] **The homepage family photograph** slot is empty.
- [ ] **Hero video.** The slot holds a poster frame until Miki's cut lands.
- [ ] **Digital Studio price** shows $14/mo — confirm the USD conversion.
- [ ] **Day-pass contents.** The site says the $40 pass includes cowork and the
      tea ceremony. Mindbody has to sell it that way.
- [ ] **`studioOpenToAll: false`** in `config.js` — turns off the public EDIT tab.
- [ ] **Privacy policy and terms** pages. Klaviyo's review wants them, CPRA
      wants them.
- [ ] **Analytics** — GTM container, then GA4.

## Where the notes went

They're gone from the markup entirely, not hidden with CSS — so there's no
chance of one reappearing. If you want a flag back on a specific page while
you work, the `.note` and `.pending` styles are still in `style.css`.
