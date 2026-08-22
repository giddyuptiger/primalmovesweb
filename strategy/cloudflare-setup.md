# Getting the site onto Cloudflare — step by step

Written for a Monday lock-in, with the domain still with Patrick.

**The point of doing this now:** everything below works *before* you have the
nameservers. The site goes up on a `.pages.dev` URL today, the team reviews it
on a real URL instead of a GitHub Pages path, and the day Patrick hands over
DNS you point the domain at a project that's already built and tested. No
scramble.

---

## The account question, first

You asked for a project separate from your own so staff can be added and it can
be handed over later. Cloudflare's answer is **an account, not a project** —
members and billing live at the account level, so a project inside your personal
account can't be shared or transferred cleanly.

So: **create a second Cloudflare account for Primal Moves.** It's free, takes a
minute, and it's the difference between "Jeremy's side project" and "the
company's website".

1. Sign out, or open a private window.
2. Go to **dash.cloudflare.com/sign-up**.
3. Use an address the *studio* controls, not your personal one —
   `hello@venice.primalmoves.com` or similar. This matters: whoever owns that
   inbox owns the account. If you sign up with your Gmail, handing it over later
   means handing over a login rather than transferring an asset.
4. Verify the email, then in the dashboard go to **Manage Account → Members**
   and invite yourself (and Gus) as **Administrator**.

Now you administer it, but the studio owns it. Handing it over later is just
removing your membership — nothing has to move.

> **How handover actually works** (checked against Cloudflare's docs, Aug 2026):
> you cannot transfer a Pages project, a Worker, KV or R2 to another account —
> there is no such feature, and Cloudflare's own staff answer is to recreate
> them. What you *can* do, in two minutes, is change who owns the account:
> **Members → add them as Super Administrator → remove yourself.** Nothing
> moves; the projects, URLs and photographs stay exactly as they are.
>
> So the account is the unit. One account, everything inside it, handed over
> whole when the time comes. A domain can also be moved between accounts
> separately if it ever needs to be.

---

## 1 · Connect the repo (10 minutes)

1. In the new account: **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorise Cloudflare for GitHub. Grant it access to **only**
   `giddyuptiger/primalmovesweb` — not all your repos.
3. Pick the repo. Production branch: **main**.
4. Build settings:
   - Framework preset: **None**
   - Build command: **leave empty** (the HTML is already built and committed)
   - Build output directory: **`/`** (repo root)
5. **Save and Deploy.**

You get `primalmovesweb.pages.dev` in about a minute. Design-9 is at
`primalmovesweb.pages.dev/design-9/`.

Every push to `main` redeploys automatically. Every other branch gets its own
preview URL — which is a better review loop than what we've been doing.

## 2 · Make design-9 the site root (5 minutes)

Right now the repo root lists design-1 through design-9. Before launch you want
`/` to *be* design-9. Two options:

**Simplest:** change the build output directory to **`design-9`**. The other
designs stay in the repo but stop being served. Reversible in one dropdown.

**Cleaner, later:** move design-9's files to the repo root and delete the rest,
once the choice is locked. Don't do this before Monday.

## 3 · A holding page while you wait (5 minutes)

Until the site is signed off, put the project behind **Cloudflare Access** so
only invited emails can see it:

**Workers & Pages → your project → Settings → Access policy → Enable**, then add
the emails that should get in. They receive a one-time code by email. No
password to share, and Google can't index a half-finished site.

Turn it off the moment you go live.

## 4 · When the nameservers arrive

1. **Add a site** in the Cloudflare account → enter the domain → choose **Free**.
2. Cloudflare scans the existing DNS and shows you what it found. **Check the
   MX records carefully** — if the studio's email runs on that domain and the
   records don't come across, you break email. Screenshot the current DNS from
   Patrick's registrar before anything moves.
3. Cloudflare gives you two nameservers. **That's what Patrick needs** — he
   pastes them into whatever registrar he's using. Ninety seconds of his time.
4. Propagation is usually under an hour, sometimes minutes.
5. Back in the Pages project: **Custom domains → Set up a domain** → enter the
   domain. Cloudflare adds the DNS record and issues the TLS certificate itself.
6. Add **www** too, redirecting to the apex (or the other way round — pick one
   and be consistent).

## 5 · The bits worth doing before launch

- **`_headers` file** at the output root for caching and security headers.
- **Cloudflare Web Analytics** — free, cookieless, no consent banner. One
  toggle in the dashboard.
- **A privacy policy and terms page.** Klaviyo's review wants them, CPRA wants
  them, and they take an hour.
- **Turn Access off**, and check the site loads for someone not signed in.

---

## Timeline to Monday

| When | What | Blocks on |
|---|---|---|
| Today | Create the Primal Moves account, connect the repo, deploy | nothing |
| Today | Turn on Access, send the `.pages.dev` link to the team | nothing |
| Fri–Sun | Lock the design decisions — cards or compare table, colour, photos | the team |
| Monday | Point the build at `design-9`, turn Access off | the decisions |
| When Patrick replies | Add the domain, hand over the nameservers | **Patrick** |

The only genuine blocker is Patrick. Everything else can be finished and waiting.

## Cost

Nothing changes from the estimate in `launch-stack.md`: **$0/month** for
hosting, DNS, Access and analytics. The domain is the only line item, and it
stays wherever it is until you choose to transfer it.
