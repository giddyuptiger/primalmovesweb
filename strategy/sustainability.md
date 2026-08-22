# What's solid, what's held together with tape

An honest inventory, written the night before lock-in. Ordered by how much
it would hurt.

## Fixed tonight

**The generator wasn't in the repo.** Every page under `design-9/` is written
by `build_d9.py`, and until now that file existed only in Claude's sandbox —
which is wiped when the session ends. You'd have had working HTML and no way
to regenerate it: every future change would mean hand-editing nine pages of
markup that were designed to be generated. It is now `tools/build_d9.py`, with
its paths made relative so it runs in any clone. **This was the real risk.**

**The timetable and events were frozen snapshots.** `schedule.json` held eight
days of classes fetched once; on the ninth day the Classes page would simply
have emptied. `events.json` the same. A GitHub Action now re-pulls both every
four hours and commits them if they moved. If a fetch fails it keeps the last
good copy rather than publishing an empty page.

## Still tape, in order

**1 · The Mindbody endpoint is undocumented.**
`prod-mkt-gateway.mindbody.io/v1/search/class_times` is the API behind
Mindbody's own consumer search. It is public, needs no key, and returns the
real timetable — but nobody promised it would keep existing. If it changes
shape, the Classes page falls back to a "book through Mindbody" card rather
than breaking, and the fix is one script.
*Cost of the supported alternative: the Branded Web widget is a paid add-on
and renders in Mindbody's markup inside an iframe, so it cannot be styled.*

**2 · Two sources of truth for photographs.**
Swaps live in Cloudflare KV; the repo has its own `config.js`. They agree only
when someone runs `tools/pull_live.py`. Leave it a month and the repo no
longer describes the site. Put it in the calendar monthly, or run it before
any big change.

**3 · The write door is open.**
`OPEN_WRITES = "true"` means anyone with the link can change the photographs,
and `studioOpenToAll: true` means anyone can open the EDIT panel. Both are
right for this week and wrong the day the domain goes live.

**4 · Every Join button goes to the same place.**
`dayPassUrl`, `veniceTrialUrl` and the per-plan links are blank, so they all
fall back to Mindbody's general pricing page. It works, but a visitor who
wants the Weekend Warrior lands on a list and has to find it again. Six URLs
from Gus fixes it.

**5 · The events page has six invented sample rows.**
`events()` in the generator still carries "Tea ceremony & sit", "Handstand
intensive" and so on as placeholder markup. The real list comes from Luma and
renders above them, but the samples are still in the file and would show if
the calendar ever failed to load in a different way.

**6 · design-1 through design-8 are still in the repo.**
Harmless — Cloudflare only serves `design-9` — but the next person to open
this repo will wonder which one is the site.

**7 · No analytics, no privacy policy, no terms.**
Cloudflare Web Analytics is one toggle and needs no cookie banner. The legal
pages take an hour and CPRA expects them.

## What is genuinely solid

- The site is static HTML on a CDN. Nothing to patch, nothing to go down.
- Photographs publish through a Worker with one step of undo, and the site
  falls back to the repo's own pictures if the Worker is unreachable.
- Colour, wording and layout are plain data in `config.js` — no database.
- Every page is generated from one script, so the chrome cannot drift.
- Contrast has been measured, not eyeballed; so has the wall texture.
