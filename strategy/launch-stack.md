# Getting primalmoves Venice live, properly

Written 21 Aug 2026. Recommendations, with the reasoning, so you can disagree
with any of it on the merits.

---

## The short version

| Layer | Recommendation |
|---|---|
| Hosting | **Cloudflare Pages** — free, git-connected, global CDN, edge logic for the A/B test |
| DNS | **Cloudflare DNS** — free, and you need it there anyway for the above |
| Registrar | **Cloudflare Registrar** eventually — at-cost, no renewal markup. *Not before launch* |
| Analytics | **Google Tag Manager** container → **GA4**, plus **Cloudflare Web Analytics** as a cookieless baseline |
| Ads tracking | **Google Ads conversion tag** and/or **Meta Pixel**, both fired through GTM — only once you actually spend |
| Email | **Klaviyo** onsite script + form (this is your primary conversion) |
| Images | No image CDN. Your host's CDN plus responsive `srcset` is enough |
| Commerce | Stays in **MindBody**. Cafe in **Toast**. Events in **Luma**. Don't rebuild any of it |
| Build | None. It's static HTML — generated locally, committed, served |

Total recurring cost: **$0 for hosting**, plus the domain (~$10–12/yr at cost),
plus whatever Klaviyo tier you land on.

---

## 1. Is GitHub Pages fine?

For what it's doing right now — showing eight design directions to five people
— it's perfect. Keep using it for that.

For the live business site, no, and for a specific reason. GitHub's own docs say:

> "GitHub Pages is not intended for or allowed to be used as a free web-hosting
> service to run your online business, e-commerce site, or any other website
> that is primarily directed at either facilitating commercial transactions..."

A site whose hero CTA is "buy a $40 day pass" is arguably exactly that. Nobody
gets taken down for a gym homepage on a Tuesday, but you don't want your
business's front door sitting on a service whose terms you're technically
outside of.

The practical reasons are stronger anyway. GitHub Pages gives you no server-side
redirects, no control over cache or security headers, no edge logic — which
means **no A/B test**. The notes call for "two landing variants, day pass versus
2-week trial, alternating traffic." GitHub Pages cannot do that. You'd end up
faking it in JavaScript, which flickers, hurts SEO, and gets blocked by ad
blockers often enough to skew your results.

## 2. Why Cloudflare Pages over the alternatives

**Bluehost** — no. Shared cPanel hosting is a worse product than it was ten
years ago: slower for static files than any CDN, an upsell at every screen, and
you'd be paying for a MySQL database and a PHP runtime you have no use for.
Bluehost makes sense if you're running WordPress. You aren't.

**Vercel** — good product, wrong plan. Their Hobby tier is explicitly
"non-commercial, personal use only," so a business site means Pro at $20/user/mo.
Fine if you were shipping a Next.js app; you're shipping HTML files.

**Netlify** — genuinely fine. Comparable free tier, comparable developer
experience, allows commercial use. If someone on the team already knows Netlify,
use Netlify and don't overthink it.

**Cloudflare Pages** — what I'd pick, for four reasons in order of how much
they matter to you:

1. **The A/B test works.** A Cloudflare Snippet or Worker can split traffic
   between `/a/` and `/b/` at the edge, on the server side, before the page
   renders. No flicker, no ad-blocker problem, and the split is sticky per
   visitor via a cookie. This is the single feature that decides it.
2. **Your DNS is going to live at Cloudflare regardless** — it's the best free
   DNS available and the fastest to propagate. One vendor instead of two.
3. **No bandwidth billing surprises.** Static asset requests aren't metered the
   way Vercel and Netlify meter them. The free plan allows 500 builds/month,
   20,000 files, 25 MB per file, and 100 custom domains per project — you'll use
   a fraction of all four.
4. **Preview deploys per branch.** Every design branch gets its own URL
   automatically, which is exactly the review workflow you've been doing by hand.

The migration itself is about twenty minutes: connect the repo, set the output
directory, add the domain. Your `git push` habit doesn't change.

## 3. The domain — what to actually ask Patrick for

This is your critical-path blocker and it's worth being precise about it,
because **you do not need the domain transferred to launch.**

There are three levels of access, easiest first:

1. **Ask Patrick to point the nameservers at Cloudflare.** You sign up for
   Cloudflare, add the domain, Cloudflare gives you two nameserver addresses,
   Patrick pastes them into whatever registrar he's using. That's it — you then
   control all DNS from your own account without touching his. **This is what
   you want.** It takes him ninety seconds.
2. **Failing that, ask for the specific records.** You'd send him a CNAME (or A
   records) pointing at the Pages project, and he adds them. Workable, but every
   future change goes back through him, and you'll want changes.
3. **Full transfer.** Get the auth/EPP code and move the domain to Cloudflare
   Registrar, which sells at wholesale with no renewal markup and includes WHOIS
   privacy. Do this *after* launch — transfers take up to five days, are locked
   for 60 days after any recent registration or prior transfer, and there is no
   reason to put that on the critical path.

Also worth asking him for now, while you have his attention: whether any **email**
is running on that domain. If there are MX records and you move nameservers
without copying them across, you break the studio's email. That's the one way
this goes badly.

The Klaviyo SMS registration that failed website review will almost certainly
pass once there's a real site on a real domain with a visible privacy policy and
terms — that's usually what those reviews are actually checking.

## 4. Tracking — "Google pixel" isn't a thing, and that matters

There are two different Google tags and people blur them:

- **GA4** (`gtag.js`) — analytics. Sessions, pages, events, where traffic comes
  from. This is what you want first.
- **The Google Ads conversion tag** — only relevant when you're spending on
  Google Ads. The notes say ~7 new customers a day with **no ad spend**, so this
  is a later problem.

"Pixel" as a word usually means **Meta Pixel** (Facebook/Instagram). Same story:
install it when you start spending on Meta, not before.

**What to install now, in this order:**

1. **Google Tag Manager container** on every page. One snippet, and every future
   tag goes in through the GTM interface instead of a code change and a deploy.
   Worth doing even for one tag, because it means Mickey or a marketing
   contractor can add things without touching the repo.
2. **GA4** through GTM.
3. **Klaviyo's onsite script** through GTM, plus a real email-capture form.
   Email capture is your stated high-priority conversion and — this is the good
   news — it happens **on your own domain**, so it tracks cleanly with no
   attribution problem at all.
4. **Cloudflare Web Analytics** — free, cookieless, no consent banner needed,
   and it doesn't get blocked. Useful as a sanity check when GA4's numbers look
   wrong, which they will.

**The hard part, stated plainly.** Your actual purchases happen on
`clients.mindbodyonline.com`, a domain you don't control and can't put tags on.
GA4's cross-domain tracking requires the *destination* site to run your tag.
MindBody won't. So you cannot get true click-to-purchase attribution through
GA4, and any agency who tells you otherwise is guessing.

What you can do:
- Track the **outbound click** as a GA4 event — "clicked Book Day Pass." That
  gives you funnel shape, not revenue.
- For the A/B test, use the **two-promo-code trick** we discussed: variant A's
  buttons carry one MindBody promo code or SKU, variant B's carry another. Then
  the answer to "which variant sold more day passes" comes out of MindBody's own
  reporting, exactly, with no tracking involved. This sidesteps the whole problem
  and it's the only method I'd trust for a revenue decision.
- Klaviyo closes the loop on the email side, since it can match a captured email
  against a later MindBody import.

**One legal note:** you're in California. If you run Meta ads and fire their
pixel, CPRA obligations kick in and you need a privacy policy and a
"Do Not Sell or Share My Personal Information" link. Cheap to do upfront,
annoying to retrofit. I'm not a lawyer — worth ten minutes with one before you
spend on Meta.

## 5. The CDN question — you don't have this problem

Your entire photo library is **36 images at about 12.8 MB total**. Cloudflare
Pages will serve those from ~300 edge locations, free, with no configuration.

Cloudflare Images ($5 per 100k stored, $1 per 100k delivered) or Cloudinary
solve a problem that starts somewhere north of a few thousand images or
user-uploaded content. Buying one now is paying for complexity.

What will actually make the site fast is unglamorous:

- **Responsive `srcset`.** Right now a phone downloads the same 2200px JPEG a
  desktop does. Generating 800/1200/2200px variants at build time is a small
  script and it's the single biggest win available.
- **AVIF and WebP** alongside the JPEGs — typically 30–50% smaller at the same
  quality.
- **`loading="lazy"`** on everything below the fold, and *not* on the hero.
- **Cache headers** via a `_headers` file — immutable, one-year caching on
  hashed asset filenames.

**The real bandwidth question is the hero video, not the photos.** A 30-second
1080p loop is easily 15–20× your entire photo library, and it's the first thing
every visitor loads. When Mickey's cut lands: compress it hard, strip the audio
track, serve a poster frame so something appears instantly, and use a still
image instead of the video on mobile. If it ends up long or you want several,
that's when Cloudflare Stream ($5 per 1,000 minutes delivered) earns its keep —
but try a well-compressed MP4 first.

## 6. What the stack looks like assembled

```
GitHub repo (unchanged)
  └── push to main
        └── Cloudflare Pages  ── builds nothing, serves /design-9/ as the root
              ├── Cloudflare DNS  ── primalmoves domain (nameservers, from Patrick)
              ├── Cloudflare Snippet  ── 50/50 A/B split, sticky cookie
              └── Cloudflare Web Analytics
GTM container on every page
  ├── GA4
  ├── Klaviyo onsite
  └── (later) Google Ads tag / Meta Pixel
Off-site, linked out, not rebuilt:
  MindBody (booking, memberships, payments)
  Toast (cafe ordering)
  Luma (events)
  Klaviyo (email, then SMS)
```

## 7. Minimum path to a live site

If Tuesday is still the target for the Moss announcement, this is the order:

1. **Today** — ask Patrick for the nameserver change, and ask whether email runs
   on the domain. Nothing else can start until this is moving.
2. **Today** — create the Cloudflare account, add the site, connect the repo.
   You can do this before the domain resolves; Pages gives you a
   `*.pages.dev` URL immediately.
3. **Before launch** — a privacy policy and terms page. Klaviyo's review wants
   them, CPRA wants them, and they take an hour.
4. **Before launch** — the Community Partners section with the real Moss signup
   link. This is what the announcement email points at, and it doesn't exist in
   any of the three designs yet.
5. **Before launch** — pull the placeholder testimonials and the invented cafe
   menu. Everything else on the site can be improved after launch; fabricated
   quotes can't be un-published.
6. **Launch week** — GTM + GA4 + Klaviyo.
7. **After** — the A/B split, once there's a stable baseline to compare against.

The site does not need to be finished on Tuesday. It needs to be *true*, and to
have somewhere for the Moss email to land.
