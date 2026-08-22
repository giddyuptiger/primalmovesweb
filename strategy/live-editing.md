# Live photo editing — what publishes, and how to turn it on

## The rule

| What you change in the EDIT panel | Who sees it |
|---|---|
| **A photograph** — swapped or uploaded | **Everyone, within seconds.** No push, no deploy. |
| Colour | You, until it's saved into a config and someone pushes it |
| Wording | Same — a config, then a push |
| Layout (A / Tightened) | Same |

Photographs behave differently on purpose. Miki will be dropping in new shots
constantly and nobody wants a git push in that loop. Colour and copy are
decisions, not content — those stay deliberate.

## What's holding it

One Cloudflare Worker, `tools/pm-worker.js`:

- **KV** — the published slot→photograph map, and the saved configs
- **R2** — the photograph files themselves, served from `/img/<key>`

Both sit inside Cloudflare's free tier at this size: KV gives 100,000 reads a
day, R2 gives 10GB of storage and a million operations a month. The whole photo
library is about 13MB. Expect **$0/month** until the site is doing serious
traffic, and single dollars after that.

## Setting it up — about five minutes

```bash
npm i -g wrangler          # once
wrangler login             # opens a browser; use the Primal Moves account

# storage
wrangler kv namespace create PM_STUDIO      # prints an id
wrangler r2 bucket create pm-photos
```

Paste the KV id into `tools/wrangler.toml`, then:

```bash
wrangler secret put WRITE_KEY -c tools/wrangler.toml    # invent a passphrase
wrangler deploy -c tools/wrangler.toml                  # prints the Worker URL
```

Last step — put that URL into `design-9/config.js`:

```js
liveApi: "https://pm-studio.<account>.workers.dev",
```

Commit, push. Open any page with `?admin=1`, go to **Photos**, and the panel
will say *"Photographs are live."* The first swap asks for the write key; it's
remembered in that browser afterwards.

## Day to day

- **Swap a photo:** open the panel, hit **Swap** on any picture, pick or upload.
  It's live for everyone the moment you choose it.
- **Upload a batch:** drag them all onto the picker. They go to R2 immediately;
  assign them to slots one at a time.
- **Move the crop:** the focus dot publishes too, about a second after you stop
  clicking.
- **Put one back:** Photos tab → *put the original back* on that slot.
- **Undo a mistake:** *Undo the last photo change* rolls back one step.

## Keeping the repo honest

The live store is the fast path, not the source of truth. Every so often:

```bash
python3 tools/pull_live.py https://pm-studio.<account>.workers.dev
git add -A && git commit -m "pull the live photographs into the repo"
```

That downloads every published photograph into `assets/photos/`, writes the
filenames into `config.js`, and reindexes `photos.json`. After it runs the site
would look identical even if the Worker were deleted.

## Before launch

- Set `ALLOW_ORIGIN` in `tools/wrangler.toml` to the real domain — right now
  it's `*` so the GitHub Pages preview can talk to the Worker.
- Set `studioOpenToAll: false` in `config.js` so the EDIT tab isn't public.
- Give the write key only to the people who should be able to change the site.
  It's a shared password, not a login: anyone holding it can publish, and there
  is no per-person audit trail beyond the "last change" timestamp.
