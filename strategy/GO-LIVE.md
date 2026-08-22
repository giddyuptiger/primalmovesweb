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

**The transferable unit in Cloudflare is the account, not the project.** There
is no way to move a Pages project, a Worker, a KV namespace or an R2 bucket to
a different account — Cloudflare staff say so plainly: *"There is no Cloudflare
specific way to perform this."* You'd recreate them.

But you never need to, because handing over an account is trivial: you add the
new person as a **Super Administrator** and remove yourself. Nothing moves.
Same projects, same Worker, same URLs, same photographs — a different person
holds the keys. It takes two minutes and there is no migration at all.

So: **make one new account for Primal Moves and put everything in it.**

**You don't need a second email or a private window.** One Cloudflare login can
belong to any number of accounts — Cloudflare's own words: *"Users can belong to
multiple accounts, and each account maintains its own settings, including
billing profiles, account members, lists, and other configurations."* Same
Gmail, new account, switch between them in the dashboard.

1. Logged in, click the **account switcher** at the top left (next to the
   Cloudflare logo) → **+ Create Account**. Accounts are siblings, not nested:
   this makes a second, independent account your same login can reach, and
   your personal one is untouched.
2. Name it **Primal Moves Venice** so it's obvious in the switcher.
3. **Switch into it** before you build anything — the dashboard remembers the
   last account used, and `wrangler login` will ask which one to deploy to.
   Everything (Pages, Worker, KV, R2) must land in the new account.
4. **Manage Account → Members** → invite Gus as **Administrator** now.
5. Billing is per-account: opening R2 there asks for a card even though the
   free tier covers you. That's the point — the card sits on the studio's
   account, not yours.
6. Whenever you want out: add their address as **Super Administrator**, have
   them verify the email, then remove yourself. Done.

**Why not just use your existing account?** Technically you can, and everything
works. The catch is at handover: you'd be giving away the account, and anything
else of yours living in it goes too. If your account is empty, use it. If it
holds your own domains or projects, spend the two minutes on a new one.

Two things that are genuinely account-shaped, and the reason for a separate one:
**billing** (the card on file for R2) and **members**. Keep both out of your
personal account and the handover is clean.

> The domain is the one thing that *can* move between accounts — you re-add it
> in the new account and re-point the nameservers. Worth knowing, but if the
> domain lives in the studio account from day one you never do it.

## 2 · Hosting (10 minutes)

Cloudflare now funnels everything into "Create a Worker", so the Pages entry
point is easy to miss: it is the small **"Looking to deploy Pages? Get
started"** line *underneath* the Worker setup card. Two ways in, both free:

**Pages — nothing to change in the repo.** Full detail in
`cloudflare-setup.md`; the short version:

1. **Workers & Pages → Create application → "Looking to deploy Pages? Get
   started" → Connect to Git**
2. Authorise Cloudflare for **only** `giddyuptiger/primalmovesweb`
3. Production branch **main**, framework preset **None**, build command **empty**,
   output directory **`design-9`**
4. **Save and Deploy**

You get `primalmovesweb.pages.dev` in about a minute, and every push redeploys.
Every branch gets its own preview URL, which beats the GitHub Pages loop.

**Or the Worker path — where Cloudflare is heading.** `wrangler.toml` at the
repo root now describes the site as a Worker serving static assets from
`design-9`. So the dashboard's default flow works too: **Create a Worker →
Continue with GitHub → `primalmovesweb`**, build command empty, deploy command
`npx wrangler deploy`. It needs today's commits pushed first, since the config
has to exist in the repo the build clones.

Either is fine and both cost nothing. Pages is fewer moving parts tonight; the
Worker is the better long-term home, and switching later is one afternoon.

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
