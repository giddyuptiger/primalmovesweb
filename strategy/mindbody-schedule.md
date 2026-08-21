# Getting the live Mindbody schedule onto the site

The hook is already built. `/classes/#schedule` shows a "Book through Mindbody"
card today; the moment you paste one ID into `design-9/config.js`, the real
timetable appears in its place with working booking.

---

## First, the thing everyone gets wrong

There are two different Mindbody URLs and they behave in opposite ways:

| | What it is | Can it be embedded? |
|---|---|---|
| `clients.mindbodyonline.com` | Your public schedule page | **No.** Sends `X-Frame-Options: SAMEORIGIN` — it renders as a blank white box in every browser, forever. Link to it, don't frame it. |
| `widgets.mindbodyonline.com` | The Branded Web (Healcode) widget | **Yes.** Purpose-built to be framed, auto-resizes to fit, booking works inside it. |

That's why the site links out today rather than showing an empty frame. It's
not a bug and it isn't fixable from our side.

---

## Option A — the Branded Web widget (free, ten minutes)

**Get the ID:**

1. Sign in to Mindbody as an owner or manager.
2. **Home → Branded Web** (older accounts still call this *Healcode*).
3. **Widgets → Add a widget → Schedules.**
4. Choose what it shows — usually all classes, all staff, one location, a
   7-day window.
5. Save. It hands you a snippet like:

   ```html
   <healcode-widget data-type="schedules" data-widget-partner="object"
                    data-widget-id="a1b2c3d4e5" data-widget-version="1">
   ```

6. Copy **just the `data-widget-id` value** — `a1b2c3d4e5` in that example.

**Use it:** open `design-9/config.js`, find:

```js
healcodeWidgetId: "",   // <-- paste the Healcode SCHEDULE widget ID here
```

Paste it between the quotes, commit, push. That's the whole job.

**What you get:** the real timetable, updating itself, with Book buttons that
work. Classes appear the instant they're scheduled in Mindbody.

**The honest catch:** it arrives as a cross-origin iframe, so **we cannot
restyle its insides** — no amount of CSS on our end reaches in. What it looks
like is set inside Mindbody, under **Branded Web → Settings**. Push these
values in there and it will sit convincingly inside the page:

| Mindbody setting | Value |
|---|---|
| Background | `#EDE8D2` |
| Body text | `#132238` |
| Links / accents | `#303F16` |
| Button fill | `#303F16` |
| Button text | `#F7F3E7` |
| Font | Helvetica Neue, or the closest they offer |

I've already given the slot a frame on our side — cream panel, hairline
border, our corner radius — so even an imperfectly themed widget reads as
part of the page rather than pasted on top of it.

## Option B — build our own from the Public API (later, if it matters)

Exactly the pattern the events calendar already uses: fetch server-side on a
schedule, write a JSON file, render it in our own type. It would look like the
rest of the site, with booking deep-linking out to Mindbody.

Why it isn't the Monday answer:

- **Four approval gates.** Developer account → build against the sandbox →
  Mindbody's manual review (billing details required) → a per-studio
  activation code only the owner can complete. That last step can't be rushed.
- **It's metered.** Roughly $0.002 a call with about 5,000 free per cycle.
  Refreshing every 30 minutes is ~1,400 calls a month, so realistically free —
  but it is a billing relationship you'd be opening.
- **It needs a server.** The API wants an API key, a Site ID and a staff
  token, none of which can live in the page. So it needs the same Cloudflare
  Worker or GitHub Action described in `launch-stack.md`.

Perfectly doable. It's a two-week job gated on someone else's approval queue,
not a Monday job.

## What I'd do

**Ship Option A.** Get the widget ID this week, spend twenty minutes on the
Branded Web theme settings, and the site has a live bookable schedule for
nothing. If the widget's look still bothers everyone in a month, start
Option B's approval process then — the events calendar already proves the
pattern works, so it becomes a known quantity rather than a gamble.

## Where it appears

`data-pm-schedule` currently sits on `/classes/#schedule`. The homepage and
`/events/` link there rather than repeating it. If you want the timetable on
the homepage too, that's one line — say the word.
