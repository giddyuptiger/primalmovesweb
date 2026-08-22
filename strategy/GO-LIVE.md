# Cloudflare, start to finish

**Nothing is deployed yet.** The Worker code, the config and this runbook are
written and committed; no Cloudflare account has been touched. Everything below
is yours to run — Cloudflare needs a browser login, so it can't be done for you.

Total time: about 40 minutes, most of it waiting for DNS you don't have yet.
Cost: **$0/month** at this size.

---

## 0 · Get today's work pushed (2 minutes)

In `~/code/primalmovesweb`:

```bash
tar xzf pm-live-photos.tar.gz
rm pm-live-photos.tar.gz pm-configs-uploader.tar.gz pm-schedule-layout.tar.gz 2>/dev/null
git add -A
git commit -m "live photo publishing, configs, layout fixes"
git push
```

**Don't run `tools/pull_live.py` yet.** It pulls published photographs down from
a Worker that doesn't exist. It's for later, once the studio is running.

---

## 1 · The account (5 minutes)

Make a **second Cloudflare account owned by the studio**, not your personal one.
Members and billing live at the account level, so this is the difference between
handing over an asset later and handing over your login.

1. Private window → **dash.cloudflare.com/sign-up**
2. Sign up with an address the studio controls — `hello@venice.primalmoves.com`,
   not your Gmail. Whoever owns that inbox owns the account.
3. **Manage Account → Members** → invite yourself and Gus as **Administrator**.

## 2 · Hosting: the Pages project (10 minutes)

Full detail in `cloudflare-setup.md`; the short version:

1. **Workers & Pages → Create → Pages → Connect to Git**
2. Authorise Cloudflare for **only** `giddyuptiger/primalmovesweb`
3. Production branch **main**, framework preset **None**, build command **empty**,
   output directory **`design-9`**
4. **Save and Deploy**

You get `primalmovesweb.pages.dev` in about a minute, and every push redeploys.
Every branch gets its own preview URL, which beats the GitHub Pages loop.

## 3 · The photo store: the Worker (10 minutes)

This is what makes a photo swap real for everyone. From the repo root:

```bash
npm install -g wrangler
wrangler login                              # browser → pick the STUDIO account

wrangler kv namespace create PM_STUDIO      # prints an id — copy it
wrangler r2 bucket create pm-photos
```

Open `tools/wrangler.toml`, paste the KV id over `PASTE_KV_ID_HERE`. Then:

```bash
wrangler secret put WRITE_KEY -c tools/wrangler.toml    # invent a passphrase, keep it
wrangler deploy -c tools/wrangler.toml                  # prints the Worker URL
```

Set the key now even though writes are open — locking down later is then one
word and one deploy, not a scramble.

> **R2 needs a card on file** even for the free tier (10GB storage, a million
> operations a month — the whole photo library is 13MB). Cloudflare asks once
> when you first open R2. Nothing bills at this volume.

## 4 · Wire it up (2 minutes)

In `design-9/config.js`:

```js
liveApi: "https://pm-studio.<your-account>.workers.dev",
```

```bash
git commit -am "point the studio at the photo store" && git push
```

Wait for the Pages deploy, then open any page with `?admin=1` → **Photos**. It
should say *"Photographs are live"* and, underneath, that writes are open.

## 5 · Check it actually works (3 minutes)

1. Swap a photo in the panel. No password should be asked for.
2. Open the same page in a **private window**. The new photograph is there.
3. Send the link to Miki on her phone. She swaps one. It changes for you too.
4. Photos tab → *put the original back* → it reverts everywhere.

If step 2 fails, it's almost always `ALLOW_ORIGIN` — leave it `"*"` until the
real domain is live.

---

## Right now: anyone with the link can change photographs

`OPEN_WRITES = "true"` in `tools/wrangler.toml`. No key, no login — Miki opens
the link on her phone and swaps a picture. That's what you want this week.

What it means honestly: anyone who has the URL can change the photographs on
the site, and there's no record of who did what beyond a timestamp. Fine among
five people choosing pictures before launch. Not fine on a live business site.

### Locking it down (launch day, 5 minutes)

```bash
# tools/wrangler.toml → OPEN_WRITES = "false"
wrangler deploy -c tools/wrangler.toml
```

Then, in the same pass:

- `ALLOW_ORIGIN` in `wrangler.toml` → the real domain, redeploy
- `studioOpenToAll: false` in `config.js` → the EDIT tab stops being public
- Give the write key to the two or three people who should have it
- `tools/pre-launch-checklist.md` for the rest

After that the panel asks for the key once per browser and remembers it.

---

## When Patrick sends the nameservers

1. Cloudflare → **Add a site** → the domain → **Free**
2. **Screenshot the existing DNS at his registrar first.** Check the MX records
   come across, or you break the studio's email.
3. Cloudflare gives two nameservers → that's all Patrick needs to paste
4. Pages project → **Custom domains** → add the domain, and `www` redirecting
   to it. Cloudflare issues the certificate itself.
5. Worker → **Settings → Domains & Routes** → add `studio.<domain>`, and put
   that in `liveApi` instead of the `workers.dev` URL. Photographs then load
   from your own domain rather than a Cloudflare subdomain — which is the
   difference between looking like a business and looking like a side project.
6. R2 bucket → **Settings → Public access → Custom domain** → `img.<domain>`
   if you want the image URLs on-brand too. Optional.

## Keeping the repo honest

The live store is the fast path, not the record. Once a week, or before any
big change:

```bash
python3 tools/pull_live.py https://pm-studio.<your-account>.workers.dev
git add -A && git commit -m "pull the live photographs into the repo" && git push
```

That downloads every published photograph into `assets/photos/`, writes the
filenames into `config.js` and reindexes `photos.json`. After it runs, the site
would look identical even if the Worker were deleted tomorrow.

## What this costs

| | |
|---|---|
| Pages hosting, DNS, TLS, Access, analytics | $0 |
| Worker (100k requests/day free) | $0 |
| KV (100k reads/day free) | $0 |
| R2 (10GB + 1M ops/month free; you use ~13MB) | $0 |
| Domain | wherever it is now |

The first thing that would ever cost money is traffic far beyond what a Venice
studio's website sees. If it happens, Workers Paid is $5/month and covers all
of it.
