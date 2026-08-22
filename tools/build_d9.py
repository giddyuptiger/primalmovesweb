#!/usr/bin/env python3
"""design-9 — the agreed build. design-8's warmth, carrying every decision
 from the working session: day-pass hero, PRACTICE MAKES PRIMAL, The Method,
 partners, and a calendar built from Luma's ICS feed rather than their embed."""
import pathlib

ROOT = pathlib.Path("/tmp/primalmovesweb/design-9")

NAV = [
    ("practice/",    "Our Method"),
    ("classes/",     "Classes"),
    ("studio/",      "Studio"),
    ("memberships/", "Memberships"),
    ("cherish/",     "Tea &amp; Cafe"),
    ("events/",      "Events"),
]

def chrome(depth, active, cherish=False):
    up = "../" * depth
    asset = "../" * (depth + 1) + "assets/"


    nav_links = "".join(
        f'\n        <a class="{"current" if h == active else ""}" href="{up}{h}">{l}</a>'
        for h, l in NAV
    )
    mobile_items = "".join(f'\n        <li><a href="{up}{h}">{l}</a></li>' for h, l in NAV)

    header = f'''<header class="site">
  <div class="nav-inner">
    <a class="brand" href="{up}index.html">Primal Moves<span>Venice</span></a>
    <nav class="nav-links">{nav_links}
    </nav>
    <button class="nav-toggle" aria-expanded="false" aria-controls="mobile-menu">Menu</button>
    <div class="nav-cta">
      <a class="btn secondary" data-pm-link="onlineTrialUrl" target="_blank" rel="noopener">Online free</a>
      <a class="btn sage" data-pm-link="dayPassUrl" target="_blank" rel="noopener">$40 Day Pass</a>
    </div>
  </div>
  <nav class="mobile-menu" id="mobile-menu">
    <ul>{mobile_items}
      <li><a data-pm-link="dayPassUrl" target="_blank" rel="noopener">$40 Day Pass →</a></li>
      <li><a data-pm-link="onlineTrialUrl" target="_blank" rel="noopener">Try Primal online free →</a></li>
    </ul>
  </nav>
</header>'''

    footer = f'''<footer>
  <span class="foot-palm" aria-hidden="true"></span>
  <div class="wrap-wide">
    <div class="foot-grid">

      <div class="foot-id">
        <a class="foot-brand-mark" href="{up}index.html">Primal Moves<span>Venice</span></a>
      </div>

      <div class="foot-block">
        <h4>Find us</h4>
        <p>
          <a href="https://maps.google.com/?q=1038+Princeton+Dr+Ste+B,+Marina+del+Rey,+CA+90292" target="_blank" rel="noopener">
            <span data-pm-text="address1">1038 Princeton Dr, Ste B</span><br>
            <span data-pm-text="address2">Marina del Rey, CA 90292</span>
          </a>
        </p>
        <p style="margin-top:14px">
          <a data-pm-link="phoneHref"><span data-pm-text="phone">(310) 800-7061</span></a>
        </p>
      </div>

      <div class="foot-block">
        <h4>Hours</h4>
        <div class="foot-hours" data-pm-hours></div>
      </div>

    </div>
    <div class="foot-bottom">
      <div>&copy; 2026 Primal Moves Venice &middot; Part of Primal Moves &mdash; Ibiza &middot; Barcelona &middot; Lisbon &middot; Venice</div>
      <div><a href="https://primalmoves.com/privacy-policy/" target="_blank" rel="noopener">Privacy</a> &middot; <a href="https://primalmoves.com/terms/" target="_blank" rel="noopener">Terms</a> &middot; <a data-pm-link="instagramUrl" target="_blank" rel="noopener">@primalmovesvenice</a></div>
    </div>
  </div>
</footer>'''
    return header, footer, up, asset


import re as _re

# Editable copy gets a stable key so an override can find it again:
#   data-pm-copy="<page>.<tag><n>"
# Keys are positional within a tag, so adding a paragraph shifts the ones
# after it. That's the honest trade for not hand-labelling 400 elements —
# if the markup moves, re-check the copy overrides. The studio's export
# includes the original text, so a stale key is obvious rather than silent.
# every element that carries words a person might want to change — lists,
# table cells and the FAQ summaries included, so the EDIT panel reaches
# the whole page and not just the headings
_EDITABLE = ("h1", "h2", "h3", "h4", "h5", "p", "li", "td", "th",
             "summary", "figcaption", "blockquote", "dt", "dd")

def tag_copy(html, path):
    page_key = (path.replace("/index.html", "").replace("index.html", "") or "home").strip("/")
    counts = {}
    def add(m):
        tag, attrs = m.group(1), m.group(2)
        if "data-pm-copy" in attrs or "data-pm-text" in attrs:
            return m.group(0)
        counts[tag] = counts.get(tag, 0) + 1
        return "<%s data-pm-copy=\"%s.%s%d\"%s>" % (tag, page_key, tag, counts[tag], attrs)
    html = _re.sub(r"<(" + "|".join(_EDITABLE) + r")((?:\s[^>]*)?)>", add, html)
    # kickers are divs; tag those too since they carry real labels
    kn = [0]
    def addk(m):
        if "data-pm-copy" in m.group(0): return m.group(0)
        kn[0] += 1
        return m.group(0).replace("<div ", "<div data-pm-copy=\"%s.kicker%d\" " % (page_key, kn[0]), 1)
    html = _re.sub(r"<div class=\"kicker[^\"]*\"[^>]*>", addk, html)
    return html


def page(path, depth, active, title, desc, body_fn, cherish=False):
    header, footer, up, asset = chrome(depth, active, cherish)
    body = body_fn(up, asset)
    body_class = ' class="cherish-scope"' if cherish else ""
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="{asset}images/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Caveat:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{up}style.css">
<script src="{up}config.js"></script>
<script>/* layout class before first paint, so B never flashes as A */
(function(){{try{{var l=localStorage.getItem("pm_studio_layout")||(window.PM_CONFIG||{{}}).layout;
if(l==="tight")document.documentElement.classList.add("tight-pending");
if(l==="house")document.documentElement.classList.add("house-pending");
var t=localStorage.getItem("pm_studio_texture");
if(t==="1"||(t===null&&(window.PM_CONFIG||{{}}).texture))document.documentElement.classList.add("texture-pending");
}}catch(e){{}}}})();</script>
<script src="{up}admin.js?v=3" defer></script>
</head>
<body{body_class}>

{header}

{body}

{footer}

</body>
</html>
'''
    html = tag_copy(html, path)
    p = ROOT / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(html)
    print("wrote", p)


def phero(asset, img, title, sub="", kicker="", slot=""):
    k = f'<div class="kicker" style="color:rgba(255,255,255,.75)">{kicker}</div>' if kicker else ""
    s = f"<p>{sub}</p>" if sub else ""
    sl = f' data-pm-photo="{slot}"' if slot else ""
    return f'''<section class="phero flush">
  <img{sl} src="{asset}{img}" alt="">
  <div class="phero-inner">{k}
    <h1 class="display-sm">{title}</h1>
    {s}
  </div>
</section>'''


def two_ways(up, compact=False):
    """The closing pair. The day pass is the hero CTA; the trial closes."""
    return f'''<div class="ways">
  <div class="way feature">
    <div class="kicker">give us two weeks</div>
    <h3>two weeks unlimited</h3>
    <div class="price">$69</div>
    <p>Every class, the sauna, the cold plunge, for fourteen days. Long enough to stop thinking of it as a trial and start thinking of it as your week.</p>
    <p class="aside" style="font-size:15.5px">Not a single drop-in. A proper run at it.</p>
    <a class="btn sage lg" data-pm-link="veniceTrialUrl" target="_blank" rel="noopener">start two weeks &rarr;</a>
  </div>
  <div class="way">
    <div class="kicker">not local, or not yet</div>
    <h3>Primal Online</h3>
    <div class="price">free</div>
    <p>Live-streamed classes and the full recorded library. Learn the practice from wherever you are, then come find us on the floor when you&rsquo;re in town.</p>
    <a class="btn lg" data-pm-link="onlineTrialUrl" target="_blank" rel="noopener">start free &rarr;</a>
  </div>
</div>'''


def final_cta(up):
    return f'''<section class="flush">
  <div class="wrap-wide" style="padding-top:clamp(50px,8vh,90px)">
    <div class="kicker">two ways to start</div>
    <p class="lede" style="margin-bottom:36px;max-width:34em">One hour a day, five days a week. That is genuinely all it takes to find out what your body is capable of. Or come for a single $40 day first &mdash; nobody minds which.</p>
  </div>
    {two_ways(up)}
</section>'''


# ================================================================== HOME =====
def home(up, asset):
    return f'''<!-- 1 · HERO — video slot, poster frame until Miki's cut lands -->
<section class="hero flush" id="top">
  <img data-pm-photo="home.hero" src="{asset}photos/joy-laughing.jpg" alt="A member laughing mid-class at Primal Moves Venice" data-pm-video-poster>
  <div class="hero-meta">
    <i class="palm lg" aria-hidden="true"></i>
    <div>Venice, California</div>
    <div>open daily</div>
  </div>
  <div class="hero-inner">
    <div class="kicker hero-eyebrow">Come for the workouts, stay for the people.</div>
    <h1 class="display">practice makes<br><em>primal</em></h1>
    <p class="hero-sub">A daily movement practice, a sauna, a cold plunge, a cafe, and a room full of people.</p>
    <div class="cta-row">
      <a class="btn sage lg" data-pm-link="dayPassUrl" target="_blank" rel="noopener">$40 Day Pass</a>
      <a class="btn ghost-dark lg" data-pm-link="onlineTrialUrl" target="_blank" rel="noopener">Primal Online</a>
    </div>
    <p class="hero-invite">This is your invitation to feel better.</p>
  </div>
</section>

<!-- 2 · THE PRIMAL EXPERIENCE — moved directly under the hero, cut to one paragraph -->
<section>
  <div class="wrap-wide">
    <div class="split" style="align-items:start">
      <div>
        <div class="kicker">the Primal experience</div>
        <h2 class="display-sm" style="max-width:16ch;margin-bottom:26px">not a gym.<br>a <span class="ed-it">practice</span>.</h2>
        <p style="font-size:clamp(17px,1.6vw,20px);line-height:1.7">Movement built on how the body actually works — crawling, hanging, pushing, pulling, balancing, getting upside down. Patterns you\'d recognise from being a kid, taught so a complete beginner and a professional acrobat can stand in the same room and both get something out of it. What people stay for is the community.</p>
        <p class="pull" style="margin-top:26px">When was the last time you went to a gym where nobody was wearing headphones?</p>
        <p class="aside" style="margin-top:22px">Ask ten members what Primal is and you\'ll get ten answers. That\'s rather the point.</p>
        <div class="cta-row" style="margin-top:28px">
          <a class="btn" href="{up}practice/">our method</a>
          <a class="btn" href="{up}classes/">see the classes</a>
        </div>
      </div>
      <img data-pm-photo="home.what-is-primal" src="{asset}photos/collective-crawl.jpg" alt="A room full of people in practice together">
    </div>
  </div>
</section>

<!-- 3 · FAMILY — two named moments, near the top, and no more than two -->
<section class="alt pad-sm">
  <div class="wrap-wide">
    <div class="split" style="align-items:center">
      <div class="photo-slot" data-pm-photo="home.family"><span>Homepage &middot; family &middot; kids on the floor</span></div>
      <div>
        <div class="kicker">bring your family</div>
        <h2 class="display-sm" style="max-width:18ch;margin-bottom:22px">the kids train<br><span class="ed-it">here too</span></h2>
        <p style="font-size:clamp(17px,1.6vw,20px);line-height:1.7">Kids&rsquo; Primal runs on the same floor you train on, and Saturday mornings are the family session — parents and children in the room at the same time, doing the same practice at their own scale.</p>
        <div class="cta-row" style="margin-top:26px">
          <a class="btn" href="{up}classes/">kids&rsquo; classes</a>
          <a class="btn" href="{up}memberships/#family">family passes</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 4 · ONE STUDIO, ALL YOUR NEEDS -->
<section id="the-day" class="pad-sm">
  <div class="wrap-wide">
    <div class="kicker">what&rsquo;s here</div>
    <h2 class="display-sm" style="margin-bottom:34px">one studio,<br>all your <span class="ed-it">needs</span></h2>
    <div class="info-list">
      <div class="info-row">
        <div class="i-label">Fitness</div>
        <div class="i-val">Primal movement classes &middot; Weights &middot; Yoga &middot; Handstands &middot; Kids&rsquo; classes</div>
      </div>
      <div class="info-row">
        <div class="i-label">Amenities</div>
        <div class="i-val">Cafe &middot; Sauna &amp; cold plunge &middot; Tea lounge &middot; Spa &amp; bodywork</div>
      </div>
      <div class="info-row">
        <div class="i-label">Stillness</div>
        <div class="i-val">Tea ceremony &middot; Group meditation &middot; Breathwork &middot; Restore</div>
      </div>
    </div>
    <p class="aside" style="margin-top:30px;max-width:40em">One price, one day, no commitment of any kind.</p>
    <div class="cta-row" style="margin-top:28px">
      <a class="btn sage lg" data-pm-link="dayPassUrl" target="_blank" rel="noopener">$40 Day Pass</a>
      <a class="btn" href="{up}classes/#schedule">see today&rsquo;s schedule</a>
    </div>
  </div>
</section>

<!-- 5 · WHERE EVERYBODY KNOWS YOUR NAME — the calendar carries the picture
     duty here, so no photograph competes with it. -->
<section class="ink">
  <div class="wrap-wide">
    <div class="third-head">
      <div>
        <div class="kicker">the third place</div>
        <h2 class="display-sm" style="max-width:14ch">where everybody<br>knows your <span class="ed-it">name</span></h2>
      </div>
      <div>
        <p class="lede" style="margin:0">Not home, not work &mdash; the other one. It isn&rsquo;t that the workout is different. It&rsquo;s that you know six people in the room, and one of them saved you a spot.</p>
        <p style="margin-top:16px;color:var(--on-dark)">Most weeks the floor turns into something else in the evening: a workshop, a tea ceremony, a supper, live music. All open to day-pass holders.</p>
      </div>
    </div>

    <!-- Two months beside the next four events. The full grid is on /events/. -->
    <div class="home-cal">
      <div class="home-cal-months">
        <div data-pm-calendar data-pm-calendar-src="{up}events.json" data-pm-calendar-months="2"></div>
        <div class="cta-row home-cal-cta">
          <a class="btn on-dark" href="{up}events/">the full calendar</a>
        </div>
      </div>
      <div class="home-cal-list">
        <div data-pm-calendar-list></div>
      </div>
    </div>
  </div>
</section>

<!-- 7 · COMING BACK — membership as consequence, never as the ask -->
<section class="alt pad-sm">
  <div class="wrap-wide">
    <div class="band">
      <div>
        <div class="kicker">if you like it here</div>
        <h2 class="display-sm" style="max-width:18ch;margin:0">come often enough<br>and it gets <span class="ed-it">cheaper</span></h2>
      </div>
      <div>
        <p class="lede" style="margin:0 0 22px">That&rsquo;s the only real reason to take a membership. If a day here turns into a habit, there are better ways to pay for it &mdash; starting at $120 a month.</p>
        <div class="cta-row">
          <a class="btn" href="{up}memberships/">see the options</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- 8 · CLOSING CTA — the trial, framed around how they'll feel -->
<section class="statement flush">
  <div class="wrap-wide" style="padding-top:clamp(60px,9vw,120px);padding-bottom:clamp(34px,5vw,60px)">
    <div class="big">ready or not, let us show you<br>how <em>good</em> you can feel<br>in your body.</div>
  </div>
</section>
{final_cta(up)}'''


def practice(up, asset):
    """The Method — content carried across from primalmoves.com/about/."""
    return f'''{phero(asset, "photos/handstand-wall-wide.jpg", "Our Method", "A systematized movement method built on bipedal and quadrupedal flows.", "The method", slot="method.hero")}

<!-- ===== OBJECTIVES ===== -->
<section class="light" style="padding-top:clamp(50px,8vh,90px)">
  <div class="wrap">
    <div class="kicker">Objectives</div>
    <h2 class="display-sm" style="max-width:20ch;margin-bottom:26px">stability, strength,<br>mobility, <span class="ed-it">tone</span></h2>
    <p style="font-size:clamp(17px,1.7vw,21px);line-height:1.7">The primary focus of Primal Moves&trade; centers on developing stability, strength, mobility, and muscle tone using quadrupedal movements and dynamic maneuvers that mirror animal locomotion.</p>

    <div class="obj-list">
      <div class="obj">
        <h3>Enhancing functional movement</h3>
        <p>The practice improves efficiency in crawling, walking, running, jumping, and climbing through varied combinations and intensities, building coordination, balance, and functional capacity.</p>
      </div>
      <div class="obj">
        <h3>Building core strength and stability</h3>
        <p>Emphasis on developing core strength targeting the abdomen, back, hips, and pelvis to improve posture, prevent injury, and enhance athletic performance.</p>
      </div>
      <div class="obj">
        <h3>Enhancing body awareness and mind&ndash;body connection</h3>
        <p>The practice cultivates deeper body connection and awareness by focusing on movement patterns, sensations, and alignment to enhance proprioception and movement control.</p>
      </div>
      <div class="obj">
        <h3>Promoting natural movement patterns</h3>
        <p>Incorporating crawling, rolling, squatting, and primal movements reconnects individuals with innate movement abilities and overall physical fitness.</p>
      </div>
    </div>
  </div>
</section>

<!-- ===== THE FOUR SERIES — one per screen, with room to breathe ===== -->
<section class="alt" id="series">
  <div class="wrap-wide">
    <div class="section-head">
      <div class="kicker">The four series</div>
      <h2 class="display-sm">four series.<br>one <span class="ed-it">practice</span>.</h2>
      <p class="lede" style="margin-top:22px">A progressive system that loads the joints equally, so the practice keeps giving over decades rather than years.</p>
    </div>

    <div class="series">
      <div class="serie">
        <img data-pm-photo="method.series-1" src="{asset}photos/collective-crawl-2.jpg" alt="Series 1 — Primal">
        <div class="serie-body">
          <div class="s-n">Series 1</div>
          <h3>Primal</h3>
          <p>A functional bodyweight strength practice designed to balance anterior and posterior chains through push&ndash;pull movements.</p>
          <div class="s-note">Conditioning and movement foundations. No requirements &mdash; this is where everyone starts.</div>
        </div>
      </div>
      <div class="serie">
        <img data-pm-photo="method.series-2" src="{asset}photos/compound-dumbbells.jpg" alt="Series 2 — Moves">
        <div class="serie-body">
          <div class="s-n">Series 2</div>
          <h3>Moves</h3>
          <p>Progressive strength and mobility practice that expands movement capacity while developing structural balance and joint stability in the spine, shoulders, hips, and hands.</p>
        </div>
      </div>
      <div class="serie">
        <img data-pm-photo="method.series-3" src="{asset}photos/handstand-parallettes.jpg" alt="Series 3 — Progressions">
        <div class="serie-body">
          <div class="s-n">Series 3</div>
          <h3>Progressions</h3>
          <p>An intermediate practice focused on skill development, refining transitions from dynamic to static holds and increasing comfort with hand-supported movements.</p>
          <div class="s-note">Inversions and managing inertia. Around three months of consistent training recommended.</div>
        </div>
      </div>
      <div class="serie">
        <img data-pm-photo="method.series-4" src="{asset}photos/handstand-wall.jpg" alt="Series 4 — Handstand">
        <div class="serie-body">
          <div class="s-n">Series 4</div>
          <h3>Handstand</h3>
          <p>Focuses on skill refinement, complex movement sequences, and dynamic inversions requiring a solid foundation.</p>
          <div class="s-note">Requires strong, stable foundations in the wrists and shoulders, with consistent practice.</div>
        </div>
      </div>
    </div>

    <div class="cta-row" style="margin-top:clamp(40px,6vw,70px)">
      <a class="btn sage" data-pm-link="dayPassUrl" target="_blank" rel="noopener">$40 Day Pass</a>
      <a class="btn" href="{up}classes/">see the classes</a>
    </div>
  </div>
</section>

<!-- ===== FAQ — carried across from primalmoves.com ===== -->
<section id="faq">
  <div class="wrap">
    <div class="kicker">Frequently asked questions</div>
    <h2 class="display-sm" style="margin-bottom:34px">the method,<br><span class="ed-it">answered</span></h2>
    <div class="faq-block">
      <details>
        <summary>What is Primal Moves?</summary>
        <div class="a"><p>Primal Moves&trade; is a systematized movement method using bipedal and quadrupedal movement flows that trains a foundational base. Multi-joint, multi-planar closed kinetic chain movements develop stability, strength, and mobility with excellent muscle tone. The progressive 4-series system promotes longevity by loading joints equally. Sessions occur primarily in group formats, fostering community and social engagement.</p></div>
      </details>
      <details>
        <summary>What&rsquo;s the difference between Primal Moves and other training methods?</summary>
        <div class="a"><p>Primal Moves&trade; is accessible to all seeking strength, fitness, mobility, and well-being. Unlike some systems, it avoids advanced gymnastics moves like planche, front and back levers, and flags that lack long-term functional benefit.</p></div>
      </details>
      <details>
        <summary>What are the benefits of Primal Moves?</summary>
        <div class="a"><p>Quadrupedal movement trains motor coordination and physical cognition as all four limbs work simultaneously. The quadruped loads all joints equally across multiple planes without impact, releasing tissue stiffness and joint immobility. Physical imbalances are addressed as the body achieves structural equilibrium. Improvements in cardiovascular fitness, flexibility, muscular strength, endurance, and body composition naturally result.</p></div>
      </details>
      <details>
        <summary>How is the Primal Moves class sequence?</summary>
        <div class="a"><p>Classes work through fundamentals, restoring posture, conditioning the body, stabilizing joints, and preparing hands, wrists, and shoulders for progressive inversions. Floor-based flow sessions use dynamic movements to gently open myofascial networks.</p></div>
      </details>
      <details>
        <summary>What are the &ldquo;ABCs&rdquo; of Primal Moves?</summary>
        <div class="a">
          <ul>
            <li><strong>Series 1 &mdash; Primal Movement:</strong> conditioning and movement foundations; no requirements.</li>
            <li><strong>Series 2 &mdash; Primal Progressions:</strong> inversions and managing inertia; three months of consistent training recommended.</li>
            <li><strong>Series 3 &mdash; Handstand Training:</strong> requires strong, stable foundations in wrists and shoulders with consistent practice.</li>
          </ul>
        </div>
      </details>
      <details>
        <summary>Are there benefits to practicing Primal Moves with scientific backing?</summary>
        <div class="a"><p>All movement increases physical longevity by maintaining muscle and bone mass. Motor coordination and cognition, central to bodyweight movement, are scientifically important factors.</p></div>
      </details>
      <details>
        <summary>I&rsquo;m new to Primal Moves. Where should I start?</summary>
        <div class="a"><p>Join entry-level classes offering full body awareness and strong foundation building in a fun, dynamic community environment.</p></div>
      </details>
      <details>
        <summary>I can&rsquo;t do a handstand. Can I still do Primal Moves?</summary>
        <div class="a"><p>Yes. Primal Moves&trade; isn&rsquo;t specific handstand training; it incorporates handstand methods to develop body awareness and posture.</p></div>
      </details>
      <details>
        <summary>How long has Primal Moves been around?</summary>
        <div class="a"><p>Quadrupedal bodywork has existed for decades, used by gymnasts and circus performers. Primal Moves&trade; was created in Ibiza in 2016.</p></div>
      </details>
      <details>
        <summary>Who created Primal Moves?</summary>
        <div class="a"><p>Nick Brewer, the founder, developed the sequence after decades of movement training. He created an accessible yet physically challenging system fusing various movement modalities into a structured, safe format.</p></div>
      </details>
      <details>
        <summary>Is Primal Moves based on another discipline?</summary>
        <div class="a"><p>Yes &mdash; characteristics appear in gymnastics, pilates, and yoga, but Primal Moves&trade; offers a unique structured, complete method.</p></div>
      </details>
      <details>
        <summary>What&rsquo;s the difference between Primal Moves and Animal Flow or Capoeira?</summary>
        <div class="a"><p>All share bodyweight training concepts promoting conscious awareness. Primal Moves&trade; distinguishes itself as a structured, systematized method with a tiered progressive system.</p></div>
      </details>
      <details>
        <summary>Isn&rsquo;t this just yoga?</summary>
        <div class="a"><p>Although founder Nick Brewer studied yoga for 20 years, Primal Moves&trade; doesn&rsquo;t follow traditional mat-based asana practice. He found yoga incomplete as a functional movement practice, though some modern asana postures appear.</p></div>
      </details>
    </div>

    <div class="cta-row" style="margin-top:30px">
      <a class="btn" data-pm-link="teacherTrainingUrl" target="_blank" rel="noopener">Teacher Training &#8599;</a>
      <a class="btn" data-pm-link="digitalStudioUrl" target="_blank" rel="noopener">Digital Studio &#8599;</a>
    </div>
  </div>
</section>

{final_cta(up)}'''


def studio(up, asset):
    return f'''{phero(asset, "photos/space-rings-wide.jpg", "The Studio", "The room, the people who hold it, and everything you need to walk in the door.", "Where it happens", slot="studio.hero")}

<!-- ===== THE SPACE ===== -->
<section id="space">
  <div class="wrap-wide">
    <div class="section-head">
      <div>
        <div class="kicker">The space</div>
        <h2 class="display-sm">Eleven thousand<br>square <span class="ed-it">feet</span>.</h2>
      </div>
      <p class="lede" style="max-width:24em">One open floor, a sauna, a plunge, a lounge and a cafe. It is not laid out like a gym because it is not one.</p>
    </div>
    <div class="collage" style="margin-bottom:44px">
      <img data-pm-photo="studio.room-main-floor" class="c-a" src="{asset}photos/space-bus-rings.jpg" alt="The main floor at Primal Moves Venice">
      <img data-pm-photo="studio.room-lounge" class="c-b" src="{asset}photos/space-lounge-rugs.jpg" alt="The lounge">
      <img data-pm-photo="studio.room-sauna" class="c-c" src="{asset}photos/sauna-still.jpg" alt="The sauna">
      <img data-pm-photo="studio.room-plunge" class="c-d" src="{asset}photos/plunge-two.jpg" alt="The cold plunge">
      <img data-pm-photo="studio.room-tea" class="c-e" src="{asset}photos/tea-room.jpg" alt="The tea and meditation room">
      <img data-pm-photo="studio.collage-1" class="c-f" src="{asset}photos/space-floor-night.jpg" alt="The floor at night">
    </div>
    <div class="info-list" style="margin-bottom:clamp(40px,6vw,70px)">
      <div class="info-row">
        <div class="i-label">What you&rsquo;ll find</div>
        <div class="i-val">Primal movement &middot; Yoga &middot; Weights &middot; Handstands &middot; Breathwork &middot; Recovery
          <div class="i-note">One floor, one membership, no separate sign-ups.</div>
        </div>
      </div>
    </div>
    <div class="kicker">Room by room</div>
    <div class="info-list">
      <div class="info-row"><div class="i-label">Main floor</div><div class="i-val">11,000 ft² of open practice space — rigging, rings, bars, stall bars, racks and free weights. Where every class happens.</div></div>
      <div class="info-row"><div class="i-label">The lounge</div><div class="i-val">Sofas, rugs, a disco ball and a set of decks. Where people end up after class, and where events start.</div></div>
      <div class="info-row"><div class="i-label">Sauna</div><div class="i-val">On-site wood sauna. Included with membership and the two-week trial.</div></div>
      <div class="info-row"><div class="i-label">Cold plunge</div><div class="i-val">Two tubs, outdoors, in the sun. The other half of the sauna.</div></div>
      <div class="info-row"><div class="i-label">Tea &amp; meditation room</div><div class="i-val">A quiet room upstairs for meditation, breath work and tea sessions.</div></div>
      <div class="info-row"><div class="i-label">Cherish</div><div class="i-val">Our cafe and tea lounge — its own room, and its own world. <a href="{up}cherish/" style="text-decoration:underline">See Cherish →</a></div></div>
      <div class="info-row"><div class="i-label">Changing rooms</div><div class="i-val">Lockers, showers and a family restroom.</div></div>
      <div class="info-row"><div class="i-label">Getting in</div><div class="i-val">Step-free entrance, on-site parking and bike racks.</div></div>
    </div>

  </div>
</section>

<!-- ===== THE TEAM ===== -->
<section class="ink" id="teachers">
  <div class="wrap-wide">
    <div class="section-head">
      <div>
        <div class="kicker">The team</div>
        <h2 class="display-sm">Acrobats, stuntwomen,<br><span class="ed-it">somatic practitioners</span>.</h2>
      </div>
      <p class="lede" style="max-width:24em">Our coaches don't come from one place. They come from circus, stunt work, dance, bodywork and the desert.</p>
    </div>

    <!-- ============ TEACHER GRID ============
         To add a teacher: copy one .person block, edit name, role and bio.
         For their photo, replace <div class="portrait empty">…</div> with
         <div class="portrait"><img data-pm-photo="studio.collage-2" src="../../assets/photos/NAME.jpg" alt="NAME"></div>
         Portraits look best shot vertically at 4:5.
         ====================================== -->
    <div class="people">
      <div class="person">
        <div class="portrait empty" data-pm-photo="studio.teacher-1"><span>Portrait</span></div>
        <div class="person-body">
          <h3>Nick Brewer</h3>
          <div class="role">Founder</div>
          <p>Founded Primal Moves in Ibiza in 2016 after decades across movement modalities. “Think less, move more, breathe.”</p>
        </div>
      </div>
      <div class="person">
      <!-- Swap .portrait.empty for: <div class="portrait"><img data-pm-photo="studio.collage-3" src="../../assets/photos/NAME.jpg" alt="NAME"></div> -->
        <div class="portrait empty" data-pm-photo="studio.teacher-2"><span>Portrait</span></div>
        <div class="person-body">
          <h3>Add a teacher</h3>
          <div class="role">Role</div>
          <p>A short bio — background, what they teach, what a class with them actually feels like.</p>
        </div>
      </div>
      <div class="person">
        <div class="portrait empty" data-pm-photo="studio.teacher-3"><span>Portrait</span></div>
        <div class="person-body">
          <h3>Add a teacher</h3>
          <div class="role">Role</div>
          <p>Two or three sentences is plenty. Personality beats CV.</p>
        </div>
      </div>
      <div class="person">
        <div class="portrait empty" data-pm-photo="studio.teacher-4"><span>Portrait</span></div>
        <div class="person-body">
          <h3>Add a teacher</h3>
          <div class="role">Role</div>
          <p>Shoot portraits vertically at 4:5 (≈1000×1250) so the grid stays even.</p>
        </div>
      </div>
      <div class="person">
        <div class="portrait empty" data-pm-photo="studio.teacher-5"><span>Portrait</span></div>
        <div class="person-body">
          <h3>Add a teacher</h3>
          <div class="role">Role</div>
          <p>Acrobats, stuntwomen, somatic practitioners — say which.</p>
        </div>
      </div>
      <div class="person">
        <div class="portrait empty" data-pm-photo="studio.teacher-6"><span>Portrait</span></div>
        <div class="person-body">
          <h3>Add a teacher</h3>
          <div class="role">Role</div>
          <p>Add an Instagram handle if they want it public.</p>
        </div>
      </div>
      <div class="person">
        <div class="portrait empty" data-pm-photo="studio.teacher-7"><span>Portrait</span></div>
        <div class="person-body">
          <h3>Add a teacher</h3>
          <div class="role">Role</div>
          <p>Repeat for each coach on the team.</p>
        </div>
      </div>
      <div class="person">
        <div class="portrait empty" data-pm-photo="studio.teacher-8"><span>Portrait</span></div>
        <div class="person-body">
          <h3>Add a teacher</h3>
          <div class="role">Role</div>
          <p>Delete any tiles you don't need.</p>
        </div>
      </div>
    </div>
    <p class="note" style="margin-top:26px;border-color:var(--on-dark-soft);color:var(--on-dark)">
      Teacher names, roles, short bios and portraits.
    </p>
  </div>
</section>

<!-- ===== VISIT — merged in from the old /visit/ page ===== -->
<section class="alt" id="visit">
  <div class="wrap-wide">
    <div class="split" style="--split-ratio:1fr 1fr;align-items:start">
      <div>
        <div class="kicker">Find us</div>
        <h2 class="display-sm" style="margin-bottom:24px">1038<br>Princeton Dr.</h2>
        <div class="day">
          <div class="day-row" style="grid-template-columns:130px 1fr"><div class="act">Address</div><div class="desc"><span data-pm-text="address1">1038 Princeton Dr, Ste B</span><br><span data-pm-text="address2">Marina del Rey, CA 90292</span></div></div>
          <div class="day-row" style="grid-template-columns:130px 1fr"><div class="act">Phone</div><div class="desc"><a data-pm-link="phoneHref" style="text-decoration:underline"><span data-pm-text="phone">(310) 800-7061</span></a></div></div>
          <div class="day-row" style="grid-template-columns:130px 1fr"><div class="act">Email</div><div class="desc"><a href="mailto:hello@venice.primalmoves.com" style="text-decoration:underline">hello@venice.primalmoves.com</a></div></div>
          <div class="day-row" style="grid-template-columns:130px 1fr"><div class="act">Hours</div><div class="desc">Doors open from 6:30am; full weekly hours to be published.</div></div>
          <div class="day-row" style="grid-template-columns:130px 1fr"><div class="act">Parking</div><div class="desc">On-site parking and bike racks.</div></div>
          <div class="day-row" style="grid-template-columns:130px 1fr"><div class="act">Access</div><div class="desc">Step-free entrance, lockers, showers, family restroom.</div></div>
        </div>
        <div class="cta-row" style="margin-top:28px">
          <a class="btn" href="https://maps.google.com/?q=1038+Princeton+Dr+Ste+B+Marina+del+Rey+CA+90292" target="_blank" rel="noopener">Open in Maps ↗</a>
          <a class="btn secondary" href="{up}classes/#schedule">See the schedule</a>
        </div>
      </div>
      <div>
        <div class="kicker">bring less than you think</div>
        <div class="exp-grid" style="grid-template-columns:1fr 1fr">
          <div class="exp"><div class="n">01</div><h3>Wear</h3><p>Something you can move in. Bare feet or flat shoes.</p></div>
          <div class="exp"><div class="n">02</div><h3>Bring</h3><p>Water. A towel if you're using the sauna.</p></div>
          <div class="exp"><div class="n">03</div><h3>Arrive</h3><p>Ten minutes early on your first visit.</p></div>
          <div class="exp"><div class="n">04</div><h3>After</h3><p>Sauna, plunge, or tea at Cherish. Or all three.</p></div>
        </div>
      </div>
    </div>
  </div>
</section>


<!-- ===== PRIVATE HIRE — separated out; different visitor, different intent ===== -->
<section class="alt" id="hire">
  <div class="wrap-wide">
    <!-- private hire — the other half of the /events/ private hire block -->
    <div class="split" style="--split-ratio:1fr 1fr;align-items:center">
      <div>
        <div class="kicker">Private hire</div>
        <h3 style="font-size:clamp(22px,2.6vw,34px);margin-bottom:14px">Want to use it?</h3>
        <p style="color:var(--mid);max-width:36em">The whole floor is available for workshops, brand activations, retreat days, team offsites and film shoots — rigging, sauna and cold plunge included, with catering through Cherish. Tell us what you have in mind and we'll come back with availability and rates.</p>
        <div class="cta-row" style="margin-top:24px">
          <a class="btn" href="mailto:hello@venice.primalmoves.com?subject=Private%20hire%20enquiry%20%E2%80%94%20Primal%20Moves%20Venice">Enquire about hire</a>
          <a class="btn secondary" href="{up}events/">What we host here</a>
        </div>
      </div>
      <img data-pm-photo="studio.collage-4" src="{asset}photos/space-floor-night.jpg" alt="The studio floor set up for an event">
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="kicker">FAQs</div>
    <h2 style="margin-bottom:30px">The usual questions.</h2>
    <div class="faq">
      <details open><summary>I've never done anything like this. Am I going to embarrass myself?</summary><div class="a">No. Classes marked “Start here” assume zero experience, everything is scalable, and the room is genuinely unbothered by what anyone else is doing.</div></details>
      <details><summary>How do I book?</summary><div class="a">Through <a href="{up}classes/#schedule" style="text-decoration:underline">the schedule</a> or the Primal Moves app. Both run on the same Mindbody account, so your bookings stay in sync.</div></details>
      <details><summary>What's included in the two-week trial?</summary><div class="a">Unlimited classes across all series, plus sauna and cold plunge. Final trial terms.</div></details>
      <details><summary>Do you have showers?</summary><div class="a">Yes — showers, lockers and a family restroom.</div></details>
      <details><summary>Can I bring my kids?</summary><div class="a">We run Primal Kids classes. Check the schedule for current times.</div></details>
      <details><summary>Can I hire the space?</summary><div class="a">Yes, for workshops, activations, retreats, offsites and shoots. See <a href="{up}events/" style="text-decoration:underline">private hire</a>.</div></details>
      <details><summary>What's your cancellation policy?</summary><div class="a">Cancel or change a booking through the Mindbody app.</div></details>
    </div>
  </div>
</section>

{final_cta(up)}'''


# =============================================================== CLASSES =====

def classes(up, asset):
    rows = [
        ("01","Primal","The signature class. Functional bodyweight strength balancing push and pull, taught in the four-series method. If you take one thing here, take this.","Start here",True,"60 min"),
        ("02","Compound","Strength-focused compound movement work — loaded, deliberate, and a useful counterweight to the bodyweight practice.","Beginner friendly",True,"60 min"),
        ("03","Moves","Progressive strength and mobility. Real capacity in the spine, shoulders, hips and hands.","All levels",False,"60 min"),
        ("04","Progressions","Dynamic-to-static skill work and hand-supported transitions. For movers ready to go further.","Intermediate",False,"60–90 min"),
        ("05","Handstand","Complex sequences and dynamic inversions. Requires a foundation in the earlier series.","Advanced",False,"60 min"),
        ("06","Restore","Mobility, breath and active recovery. The other half of getting strong.","Start here",True,"45–60 min"),
        ("07","Primal Vinyasa","Breath-led flow with primal patterning underneath. Familiar shape, different engine.","All levels",False,"60 min"),
        ("08","Group Meditation","Nervous-system down-regulation, run as a four-week series.","All levels",False,"45 min"),
        ("09","Primal Kids","Youth movement classes. Crawling, climbing, falling over, getting up.","Kids",False,"45 min"),
        ("10","Team Practice","Open-floor group skill-building. Bring what you're working on.","Members",False,"90 min"),
    ]
    body = "".join(f'''
      <div class="cls">
        <div class="n">{n}</div>
        <div><h3>{name}</h3><div class="desc">{desc}</div></div>
        <div><span class="lvl{' beginner' if beg else ''}">{lvl}</span></div>
        <div class="lvl">{dur}</div>
      </div>''' for n, name, desc, lvl, beg, dur in rows)

    return f'''{phero(asset, "photos/collective-downdog.jpg", "Classes &amp; Schedule", "What's on, who it's for, and how to book it.", "Find your entry point", slot="classes.hero")}

<section class="pad-sm">
  <div class="wrap-wide">
    <div class="split" style="--split-ratio:1fr 1fr;align-items:start">
      <div>
        <div class="kicker">Never done this before?</div>
        <h2 class="display-sm" style="margin-bottom:20px">Take <span class="ed-it">Primal</span>.<br>That's the answer.</h2>
        <p class="lede">Every class marked <span class="mark" style="font-weight:600">Start here</span> assumes you've never crawled across a floor in your life. You'll be shown what to do, given a version that fits, and left alone about it.</p>
        <p style="margin-top:16px;color:var(--mid)">Come ten minutes early, wear something you can move in, bring water. Bare feet or flat shoes. That's genuinely the whole list.</p>
        <div class="cta-row" style="margin-top:28px">
          <a class="btn sage lg" href="#schedule">Book Now ↓</a>
        </div>
      </div>
      <div>
        <div class="kicker">what actually happens</div>
        <div class="day">
          <div class="day-row" style="grid-template-columns:60px 1fr"><div class="time">1</div><div class="desc">Arrive, sign in, drop your stuff. Say hi to whoever's teaching.</div></div>
          <div class="day-row" style="grid-template-columns:60px 1fr"><div class="time">2</div><div class="desc">Warm-up on the floor. Nobody's watching you, everyone's busy.</div></div>
          <div class="day-row" style="grid-template-columns:60px 1fr"><div class="time">3</div><div class="desc">The practice — patterns, strength, a skill to chip away at.</div></div>
          <div class="day-row" style="grid-template-columns:60px 1fr"><div class="time">4</div><div class="desc">Wind down. Sauna or plunge if you want. Tea at Cherish if you'd rather.</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="alt">
  <div class="wrap-wide">
    <div class="section-head">
      <div><div class="kicker">The full list</div><h2>Every class we run.</h2></div>
      <a class="link-arrow" href="#schedule">Jump to booking →</a>
    </div>
    <div class="cls-list">{body}
    </div>
  </div>
</section>

<!-- ===== SCHEDULE — merged in from the old /schedule/ page ===== -->
<section class="pad-sm" id="schedule">
  <div class="wrap-wide">
    <div class="section-head">
      <div><div class="kicker">Live from Mindbody</div><h2>Book your spot.</h2></div>
      <a class="link-arrow" data-pm-link="bookingUrl" target="_blank" rel="noopener">Primal Moves app →</a>
    </div>
    <div data-pm-schedule
         data-pm-schedule-label="Book through Mindbody"
         data-pm-schedule-hint="Our live timetable and booking run on Mindbody. Opening it in a new tab keeps your account, class credits and bookings in one place."></div>
    <div class="cta-row" style="margin-top:20px">
      <a class="btn secondary" data-pm-link="appStoreUrl" target="_blank" rel="noopener">Get the app</a>
      <a class="btn sage" data-pm-link="veniceTrialUrl" target="_blank" rel="noopener">Start your 2-week trial</a>
    </div>
    <p class="embed-note" style="margin-top:18px">First time? Book <strong>Primal</strong> or <strong>Restore</strong> — both assume no experience. Everything else will still be on the timetable next week.</p>
  </div>
</section>

{final_cta(up)}'''


# ============================================================== SCHEDULE =====

def memberships(up, asset):
    return f'''{phero(asset, "photos/boat-collective.jpg", "Memberships", "The natural next step — after you've felt what this is.", "Join", slot="memberships.hero")}

<section class="pad-sm">
  <div class="wrap-wide">
    <div class="kicker">Options</div>
    <h2 class="display-sm" style="margin-bottom:10px">Memberships &amp; passes</h2>
    <p class="lede" style="margin-bottom:clamp(26px,3.5vw,36px)">Come for a day first, then decide. Everything below is bookable through Mindbody.</p>
    <div data-pm-pricing style="margin-bottom:30px"></div>

    <!-- DESIGN-MODE TOGGLE. Two reads of the same data — keep whichever wins.
         The choice sticks in the URL (#compare) so it can be shared. -->
    <div class="mem-tabs" role="tablist" aria-label="How to view the memberships">
      <button role="tab" id="tab-cards" aria-controls="view-cards" aria-selected="true" class="on">Cards</button>
      <button role="tab" id="tab-compare" aria-controls="view-compare" aria-selected="false">Compare all</button>
    </div>

    <!-- Most people aren't ready to pick a plan on arrival. The two short
         lengths sit here, above both views, so the first thing on the page
         is a way in that costs $40. -->
    <div class="cmp-try">
      <div>
        <div class="kicker">before you commit</div>
        <p style="margin:6px 0 0">The Primal, bought short. Same floor, same sauna, same everything &mdash; nothing recurring.</p>
      </div>
      <div class="cta-row">
        <a class="btn sage" data-pm-link="dayPassUrl" target="_blank" rel="noopener">Try Primal for a day &middot; $40</a>
        <a class="btn" data-pm-link="veniceTrialUrl" target="_blank" rel="noopener">Two weeks &middot; $69</a>
      </div>
    </div>

<!-- ===== COMPARE VIEW =====
     One column is one level of ACCESS, not one SKU. Unlimited for a month,
     for two weeks and for a day are the same product bought in different
     lengths, so they share a column instead of pretending to be three
     different memberships. That drops the table from eight columns to six
     and makes every row an apples-to-apples comparison of monthly plans.
     ========================================================================= -->
<div class="mem-view" id="view-compare" hidden>
  <p class="lede" style="margin-bottom:clamp(24px,3.5vw,38px)">Everything side by side. Scroll sideways on a phone &mdash; the feature names stay put.</p>
  <div class="cmp-scroll">
    <table class="cmp">
      <caption class="sr-only">Membership comparison</caption>
      <thead>
        <tr><th scope="col" class="cmp-rowhead"><span class="sr-only">Feature</span></th><th scope="col" class="is-hero"><span class="cmp-flag">Most popular</span><span class="cmp-name">The Primal</span><span class="cmp-price">$315</span><span class="cmp-per">per month</span></th><th scope="col"><span class="cmp-flag empty" aria-hidden="true"></span><span class="cmp-name">The Nomad</span><span class="cmp-price">$375</span><span class="cmp-per">one month</span></th><th scope="col"><span class="cmp-flag empty" aria-hidden="true"></span><span class="cmp-name">The Explorer</span><span class="cmp-price">$200</span><span class="cmp-per">per month</span></th><th scope="col"><span class="cmp-flag empty" aria-hidden="true"></span><span class="cmp-name">Weekend Warrior</span><span class="cmp-price">$120</span><span class="cmp-per">per month</span></th><th scope="col"><span class="cmp-flag empty" aria-hidden="true"></span><span class="cmp-name">Kids&rsquo; Primal</span><span class="cmp-price">$125</span><span class="cmp-per">per month</span></th><th scope="col"><span class="cmp-flag empty" aria-hidden="true"></span><span class="cmp-name">Digital Studio</span><span class="cmp-price">$14</span><span class="cmp-per">per month</span></th></tr>
      </thead>
      <tbody><tr class="cmp-group"><th scope="colgroup" colspan="7">What you get</th></tr><tr><th scope="row">Classes</th><td data-l="The Primal" class="is-hero"><b>Unlimited</b></td><td data-l="The Nomad"><b>Unlimited</b></td><td data-l="The Explorer">8 a month</td><td data-l="Weekend Warrior">4 a month</td><td data-l="Kids&rsquo; Primal">Kids&rsquo; only</td><td data-l="Digital Studio">Online only</td></tr><tr><th scope="row">Sauna &amp; cold plunge</th><td data-l="The Primal" class="y is-hero">Unlimited</td><td data-l="The Nomad" class="y">Unlimited</td><td data-l="The Explorer" class="y">On class days</td><td data-l="Weekend Warrior" class="y">On class days</td><td data-l="Kids&rsquo; Primal" class="n">&mdash;</td><td data-l="Digital Studio" class="n">&mdash;</td></tr><tr><th scope="row">Gym access</th><td data-l="The Primal" class="y is-hero">Yes</td><td data-l="The Nomad" class="y">Yes</td><td data-l="The Explorer" class="y">On class days</td><td data-l="Weekend Warrior" class="y">On class days</td><td data-l="Kids&rsquo; Primal" class="n">&mdash;</td><td data-l="Digital Studio" class="n">&mdash;</td></tr><tr><th scope="row">Cowork &amp; wifi</th><td data-l="The Primal" class="y is-hero">Yes</td><td data-l="The Nomad" class="y">Yes</td><td data-l="The Explorer" class="y">On class days</td><td data-l="Weekend Warrior" class="y">On class days</td><td data-l="Kids&rsquo; Primal" class="n">&mdash;</td><td data-l="Digital Studio" class="n">&mdash;</td></tr><tr><th scope="row">Tea ceremony</th><td data-l="The Primal" class="y is-hero">Included</td><td data-l="The Nomad" class="y">Included</td><td data-l="The Explorer" class="n">&mdash;</td><td data-l="Weekend Warrior" class="n">&mdash;</td><td data-l="Kids&rsquo; Primal" class="n">&mdash;</td><td data-l="Digital Studio" class="n">&mdash;</td></tr><tr><th scope="row">Online library</th><td data-l="The Primal" class="n is-hero">&mdash;</td><td data-l="The Nomad" class="n">&mdash;</td><td data-l="The Explorer" class="n">&mdash;</td><td data-l="Weekend Warrior" class="n">&mdash;</td><td data-l="Kids&rsquo; Primal" class="n">&mdash;</td><td data-l="Digital Studio" class="y">Everything</td></tr><tr class="cmp-group"><th scope="colgroup" colspan="7">The details</th></tr><tr><th scope="row">Commitment</th><td data-l="The Primal" class="is-hero">3 months</td><td data-l="The Nomad"><b>None</b></td><td data-l="The Explorer">3 months</td><td data-l="Weekend Warrior">3 months</td><td data-l="Kids&rsquo; Primal">3 months</td><td data-l="Digital Studio">None</td></tr><tr><th scope="row">Best for</th><td data-l="The Primal" class="is-hero">Making it a habit</td><td data-l="The Nomad">Visitors &amp; short stays</td><td data-l="The Explorer">Twice a week</td><td data-l="Weekend Warrior">Once a week</td><td data-l="Kids&rsquo; Primal">Ages 5&ndash;12</td><td data-l="Digital Studio">Training anywhere</td></tr>
        <tr class="cmp-cta"><th scope="row"><span class="sr-only">Sign up</span></th><td data-l="The Primal" class="is-hero"><a class="btn sage" data-pm-link="mindbodyPricingUrl" target="_blank" rel="noopener">Join</a></td><td data-l="The Nomad"><a class="btn" data-pm-link="mindbodyPricingUrl" target="_blank" rel="noopener">Join</a></td><td data-l="The Explorer"><a class="btn" data-pm-link="mindbodyPricingUrl" target="_blank" rel="noopener">Join</a></td><td data-l="Weekend Warrior"><a class="btn" data-pm-link="mindbodyPricingUrl" target="_blank" rel="noopener">Join</a></td><td data-l="Kids&rsquo; Primal"><a class="btn" data-pm-link="mindbodyPricingUrl" target="_blank" rel="noopener">Join</a></td><td data-l="Digital Studio"><a class="btn" data-pm-link="digitalStudioUrl" target="_blank" rel="noopener">Start free</a></td></tr>
      </tbody>
    </table>
  </div>

</div>

<div class="mem-view" id="view-cards">
    <h3 id="family" class="group-h">Start here</h3>
    <p class="group-sub">No long commitment &mdash; and something for the family.</p>
    <div class="plans four">
      <div class="plan hero-plan">
        <div class="tier">a day at Primal</div>
        <div class="amt">$40</div>
        <div class="plan-line">One day. All of it.</div>
        <ul>
          <li>A class, sauna, cold plunge and gym</li>
          <li>Coffee and a seat at Cherish</li>
          <li>Nothing recurring, nothing to cancel</li>
        </ul>
        <a class="btn on-dark" data-pm-link="dayPassUrl" target="_blank" rel="noopener">book a day</a>
      </div>
      <div class="plan">
        <div class="tier">two weeks unlimited</div>
        <div class="amt">$69</div>
        <div class="plan-line">A proper run at it.</div>
        <ul>
          <li>Unlimited classes for two weeks</li>
          <li>Sauna and cold plunge included</li>
          <li>For people who already know they like it</li>
        </ul>
        <div class="fine">One per person, for anyone who hasn't trained with us before.</div>
        <a class="btn" data-pm-link="veniceTrialUrl" target="_blank" rel="noopener">start the trial</a>
      </div>
      <div class="plan">
        <div class="tier">The Nomad</div>
        <div class="amt">$375<small>/mo</small></div>
        <div class="plan-line">Unlimited, no contract.</div>
        <ul>
          <li>Everything in The Primal</li>
          <li>One month — nothing to cancel</li>
        </ul>
        <details class="plan-more">
          <summary>What's included</summary>
          <ul>
            <li>Unlimited classes, sauna, plunge and gym</li>
            <li>Morning tea ceremony included</li>
            <li>10% off spa &amp; wellness services</li>
            <li>Complimentary wellness consult</li>
            <li>Concert series and event discounts</li>
          </ul>
        </details>
        <div class="fine">An all-access month for visitors and short stays.</div>
        <a class="btn secondary" data-pm-link="mindbodyPricingUrl" target="_blank" rel="noopener">Join</a>
      </div>
      <div class="plan">
        <div class="tier">Digital Studio</div>
        <div class="amt">$14<small>/mo</small></div>
        <div class="plan-line">Train from anywhere.</div>
        <ul>
          <li>Live-streamed classes</li>
          <li>Full recorded library</li>
          <li>$107/year if paid annually</li>
        </ul>
        <div class="fine">Free trial before you pay.</div>
        <a class="btn" data-pm-link="digitalStudioUrl" target="_blank" rel="noopener">digital studio ↗</a>
      </div>
    </div>

    <h3 class="group-h" style="margin-top:clamp(48px,7vw,80px)">Memberships</h3>
    <p class="group-sub">Monthly autopay. Three-month minimum.</p>
    <div class="plans four">
      <div class="plan">
        <div class="tier">Weekend Warrior</div>
        <div class="amt">$120<small>/mo</small></div>
        <div class="plan-line">Four day passes a month.</div>
        <ul>
          <li>Each pass is one class plus sauna, plunge and gym</li>
          <li>3-month minimum</li>
        </ul>
        <details class="plan-more">
          <summary>What's included</summary>
          <ul>
            <li>50% off tea ceremonies</li>
            <li>Extra classes $30 each</li>
            <li>Free health assessment with our wellness consultant</li>
            <li>Concert series 50% off + members' lounge seating</li>
            <li>1 guest a month at 50% off</li>
          </ul>
        </details>
        <div class="fine">For training consistently without needing unlimited access.</div>
        <a class="btn secondary" data-pm-link="mindbodyPricingUrl" target="_blank" rel="noopener">Join</a>
      </div>
      <div class="plan">
        <div class="tier">The Explorer</div>
        <div class="amt">$200<small>/mo</small></div>
        <div class="plan-line">Eight classes a month.</div>
        <ul>
          <li>Sauna, plunge and gym on the days you train</li>
          <li>3-month minimum</li>
        </ul>
        <details class="plan-more">
          <summary>What's included</summary>
          <ul>
            <li>Extra classes $25 each</li>
            <li>Tea ceremony 50% off, as available</li>
            <li>Concert series 50% off + members' lounge seating</li>
            <li>1 guest a month at 50% off</li>
            <li>Unused classes don't roll over</li>
          </ul>
        </details>
        <div class="fine">For people who come for the movement and nothing else.</div>
        <a class="btn secondary" data-pm-link="mindbodyPricingUrl" target="_blank" rel="noopener">Join</a>
      </div>
      <div class="plan hero-plan">
        <div class="tier">The Primal — most popular</div>
        <div class="amt">$315<small>/mo</small></div>
        <div class="plan-line">Unlimited. Everything.</div>
        <ul>
          <li>Unlimited classes, sauna, plunge and gym</li>
          <li>Morning tea ceremony included</li>
          <li>3-month minimum</li>
        </ul>
        <details class="plan-more">
          <summary>What's included</summary>
          <ul>
            <li>10% off spa &amp; wellness services</li>
            <li>1 guest a month at 50% off</li>
            <li>Concert series 50% off + members' lounge seating</li>
            <li>Primal events: 3 guest tickets at 50% off</li>
            <li>Complimentary wellness consult each term</li>
          </ul>
        </details>
        <div class="fine">This is the work. Cheaper than The Explorer from nine classes a month.</div>
        <a class="btn on-dark" data-pm-link="mindbodyPricingUrl" target="_blank" rel="noopener">Join</a>
      </div>
      <div class="plan">
        <div class="tier">Kids' Primal</div>
        <div class="amt">$125<small>/mo</small></div>
        <div class="plan-line">Kids classes, one child.</div>
        <ul>
          <li>For households where the parent isn't a member</li>
          <li>3-month minimum</li>
        </ul>
        <details class="plan-more">
          <summary>What's included</summary>
          <ul>
            <li>Kids classes as scheduled, for one named child</li>
            <li>Coordination, strength and confidence — without pressure</li>
            <li>Adult sauna, plunge and gym access not included</li>
          </ul>
        </details>
        <a class="btn secondary" data-pm-link="mindbodyPricingUrl" target="_blank" rel="noopener">Join</a>
      </div>
    </div>
</div>
  </div>
</section>

<section class="alt" id="partners">
  <div class="wrap-wide">
    <div class="kicker">Community partners</div>
    <h2 class="display-sm" style="max-width:20ch;margin-bottom:14px">your membership<br>works <span class="ed-it">elsewhere</span></h2>
    <p class="lede" style="margin-bottom:34px;max-width:38em">We keep a small roster of studios and practitioners we actually send people to. Primal members get a standing discount at each.</p>
    <div class="info-list">
      <div class="info-row">
        <div class="i-label">Moss</div>
        <div class="i-val">Venice. Joint membership available, sold through Moss.
          <div class="i-note">Primal members get 10% off Moss &mdash; and Moss members get 10% off here.</div>
        </div>
      </div>
      <div class="info-row">
        <div class="i-label">Summit</div>
        <div class="i-val">25% off for Primal members.
          <div class="i-note">Details to come.</div>
        </div>
      </div>
    </div>
    <div class="cta-row" style="margin-top:28px">
      <a class="btn sage" data-pm-link="mossJoinUrl" data-pm-hide target="_blank" rel="noopener">join through Moss &rarr;</a>
      <a class="btn" href="{up}partners/">become a Primal partner</a>
    </div>
  </div>
</section>

<section>
  <div class="wrap-wide">
    <div class="section-head">
      <div><div class="kicker">Why people join</div><h2>Belonging, mostly.</h2></div>
    </div>
    <div class="voices">
      <div class="voice placeholder"><div class="theme">Theme — Consistency</div><div class="q ed">“Membership made me actually show up.”</div><div class="who">Add a real quote</div></div>
      <div class="voice placeholder"><div class="theme">Theme — Value</div><div class="q ed">“What I stopped paying for once I joined.”</div><div class="who">Add a real quote</div></div>
      <div class="voice placeholder"><div class="theme">Theme — Community</div><div class="q ed">“The people I've met here.”</div><div class="who">Add a real quote</div></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="kicker">Questions</div>
    <h2 style="margin-bottom:30px">Before you commit.</h2>
    <div class="faq">
      <details open><summary>Can I try before joining?</summary><div class="a">Yes — that's what the two-week trial is for. Unlimited classes, sauna and cold plunge included. Most people join after it, but you're under no obligation.</div></details>
      <details><summary>Do I need experience?</summary><div class="a">No. Classes marked “Start here” assume none at all, and every class has a scaled version of whatever's being taught.</div></details>
      <details><summary>Can I freeze or cancel?</summary><div class="a">Memberships can be paused once, for up to 30 days, on a three-month contract. Ask at the front desk.</div></details>
      <details><summary>Is the sauna and cold plunge included?</summary><div class="a">Yes — with membership and with the two-week trial. Recovery is treated as part of the practice, not an upsell.</div></details>
      <details><summary>What if I travel a lot?</summary><div class="a">The Digital Studio covers you when you're away — live classes and the recorded library, from anywhere.</div></details>
    </div>
  </div>
</section>

{final_cta(up)}'''


# ================================================================ EVENTS =====
def events(up, asset):
    evs = [
        ("Sample","Thu 21","Tea ceremony &amp; sit","7:00 PM · Cherish · Hosted by the tea team","Tea","tea"),
        ("Sample","Sat 23","Handstand intensive","10:00 AM · Main floor · 3 hours","Workshops","workshops"),
        ("Sample","Sun 24","Sunday sound &amp; supper","6:00 PM · Main floor + Cherish","Music","music"),
        ("Sample","Wed 27","New member welcome","6:30 PM · Free for trial members","Free","free"),
        ("Sample","Fri 29","Community potluck","7:00 PM · Cherish","Community","community"),
        ("Sample","Sat 30","Mobility workshop","11:00 AM · Main floor · 2 hours","Workshops","workshops"),
    ]
    rows = "".join(f'''
      <div class="ev" data-cat="{cat}">
        <div class="date"><b>{mon}</b>{day}</div>
        <div><h3>{name}</h3><div class="meta">{meta}</div></div>
        <div class="tag-cell"><span class="tag{' free' if cat=='free' else ''}">{tag}</span></div>
        <div class="go-cell"><a class="link-arrow" data-pm-link="lumaPageUrl" target="_blank" rel="noopener">Register →</a></div>
      </div>''' for mon, day, name, meta, tag, cat in evs)

    return f'''{phero(asset, "photos/space-floor-night.jpg", "Events", "Workshops, tea, music, community — and a lot of it free.", "What's on", slot="events.hero")}

<section class="pad-sm">
  <div class="wrap-wide">
    <!-- Two columns: the calendar holds the left edge and starts at the top;
         the heading, the answer sentence and the list run down the right.
         The heading says what the page IS — the poetic line is subordinate. -->
    <div class="ev-layout">
      <div class="ev-cal-col">
        <!-- Month grid built from events.json — see tools/fetch_events.py.
             Data is Luma's public ICS feed, so nothing here is hand-typed. -->
        <div data-pm-calendar data-pm-calendar-src="{up}events.json" data-pm-calendar-months="3"></div>
      </div>

      <div class="ev-main">
        <div class="kicker">What&rsquo;s on</div>
        <h2 class="display-sm" style="margin-bottom:16px">Upcoming events</h2>
        <p class="lede" style="margin-bottom:clamp(28px,4vw,42px)">A room that changes shape. Events are the front door for a lot of people &mdash; come for a dinner and discover the practice later. Most weeks there&rsquo;s something on, and some of it is free.</p>

        <div data-pm-calendar-list></div>

        <p class="embed-note" style="margin-top:22px">Published through Luma and refreshed automatically. <a data-pm-link="lumaPageUrl" target="_blank" rel="noopener" style="text-decoration:underline">See them on Luma &#8599;</a> Classes are booked separately &mdash; <a href="{up}classes/#schedule" style="text-decoration:underline">see the schedule</a>.</p>

        <div class="cta-row ev-cta">
          <a class="btn" data-pm-link="lumaPageUrl" target="_blank" rel="noopener">Follow us on Luma &#8599;</a>
          <a class="btn secondary" href="mailto:hello@venice.primalmoves.com?subject=Hosting%20an%20event%20at%20Primal%20Moves%20Venice">Host an event here</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="ink">
  <div class="wrap-wide">
    <div class="section-head">
      <div><div class="kicker">Private hire</div><h2>Use the floor.</h2></div>
    </div>
    <p class="lede" style="max-width:40em">11,000 ft², rigging overhead, sauna and cold plunge, a cafe attached. Available for workshops, brand activations, retreat days, team offsites and film shoots. Cherish handles catering.</p>
    <div class="cta-row" style="margin-top:28px">
      <a class="btn on-dark" href="mailto:hello@venice.primalmoves.com?subject=Private%20hire%20enquiry">Enquire about hire</a>
      <a class="btn ghost-dark" href="{up}studio/#space">See the space ↓</a>
      <a class="btn ghost-dark" href="{up}cherish/">Catering via Cherish</a>
    </div>
    <p class="embed-note" style="color:var(--on-dark)">Room-by-room detail, dimensions and photos are on <a href="{up}studio/#space" style="text-decoration:underline">the studio page</a>.</p>
  </div>
</section>

{final_cta(up)}'''


# =============================================================== CHERISH =====
def cherish(up, asset):
    """Placeholder until the permits clear and the Toast site is live."""
    return f'''{phero(asset, "photos/tea-room.jpg", "Slow down<br>with us.", "The cafe and tea lounge inside Primal Moves Venice.", "Cafe &amp; tea lounge", slot="cherish.hero")}

<section class="light">
  <div class="wrap">
    <div class="kicker">What Cherish is</div>
    <h2 class="display-sm" style="margin-bottom:22px">a room inside<br>a <span class="ed-it">room</span></h2>
    <p style="font-size:clamp(17px,1.6vw,20px);line-height:1.7">Cherish is the cafe and tea lounge inside the studio &mdash; coffee in the morning, somewhere to sit and work through the day, tea when you&rsquo;re done. It is the reason a day here can be a whole day rather than an hour.</p>
    <p style="margin-top:18px;color:var(--soft)">Nourishment is not only what we consume, but how we experience it. Presence. Ritual. Nourishment.</p>

    <div class="embed-placeholder" style="margin-top:clamp(40px,6vw,64px)">
      <div class="ph-title">Online ordering is coming</div>
      <p>Cherish is opening ordering and catering through Toast. Until the permits clear, come and see us in person &mdash; we&rsquo;re open whenever the studio is.</p>
      <div class="cta-row" style="justify-content:center;margin-top:24px">
        <a class="btn sage" data-pm-link="toastOrderUrl" data-pm-hide target="_blank" rel="noopener">Order online &rarr;</a>
        <a class="btn" href="{up}studio/#visit">Find us</a>
      </div>
    </div>

    <div class="cta-row" style="margin-top:34px">
      <a class="btn" href="{up}index.html">&larr; back to the practice</a>
    </div>
  </div>
</section>'''


def partners(up, asset):
    return f'''{phero(asset, "photos/compound-dumbbells-crop.jpg", "Primal Partners", "Brands, studios and people we actually work with.", "Collaborate", slot="partners.hero")}

<section class="pad-sm">
  <div class="wrap">
    <div class="kicker">Who we work with</div>
    <h2 class="display-sm" style="max-width:18ch;margin-bottom:26px">Aligned, not<br><span class="ed-it">sponsored</span>.</h2>
    <p class="lede">We partner with a small number of brands and practitioners whose work belongs in this room — equipment, apparel, food, bodywork, sound, and the people who run events here. If that sounds like you, get in touch.</p>
  </div>
</section>

<section class="alt">
  <div class="wrap-wide">
    <div class="section-head"><div><div class="kicker">Current partners</div><h2>The roster.</h2></div></div>
    <div class="exp-grid">
      <div class="exp"><div class="n">—</div><h3>Add a partner</h3><p>Name, what they do, and why they're here.</p></div>
      <div class="exp"><div class="n">—</div><h3>Add a partner</h3><p>Logo, one line, link out.</p></div>
      <div class="exp"><div class="n">—</div><h3>Add a partner</h3><p>Affiliate relationships can be flagged here.</p></div>
      <div class="exp"><div class="n">—</div><h3>Add a partner</h3><p>Event collaborators belong on this list too.</p></div>
      <div class="exp"><div class="n">—</div><h3>Add a partner</h3><p>Delete the tiles you don't need.</p></div>
    </div>
  </div>
</section>

<section class="ink">
  <div class="wrap-wide">
    <div class="split">
      <div>
        <div class="kicker">Work with us</div>
        <h2 class="display-sm" style="margin-bottom:20px">Pitch us<br><span class="ed-it">something.</span></h2>
        <p class="lede">Brand collaborations, product partnerships, event hosting, affiliate arrangements, or using the space for a shoot. Tell us what you have in mind.</p>
        <div class="cta-row" style="margin-top:28px">
          <a class="btn on-dark" href="mailto:hello@venice.primalmoves.com?subject=Partnership%20enquiry">Partnership enquiry</a>
          <a class="btn ghost-dark" href="{up}events/">Private hire</a>
        </div>
      </div>
      <img data-pm-photo="partners.pitch" src="{asset}photos/bands-effort.jpg" alt="">
    </div>
  </div>
</section>

{final_cta(up)}'''


# ================================================================== SHOP =====
def shop(up, asset):
    return f'''{phero(asset, "photos/barbell-joy.jpg", "Shop", "Merch treated like a cultural campaign, not a gym tee.", "Wear it", slot="shop.hero")}

<section class="pad-sm">
  <div class="wrap-wide">
    <div class="section-head">
      <div><div class="kicker">Merch</div><h2 class="display-sm">Not a<br><span class="ed-it">gym tee</span>.</h2></div>
      <a class="link-arrow" data-pm-link="shopUrl" data-pm-hide target="_blank" rel="noopener">Shop all →</a>
    </div>
    <div class="collage">
      <div class="c-a slot"><span>Hero merch shot — styled, on a person, in the space</span></div>
      <div class="c-b slot"><span>Product</span></div>
      <div class="c-c slot"><span>Product</span></div>
      <div class="c-d slot"><span>Product</span></div>
      <div class="c-e slot"><span>Campaign frame</span></div>
      <div class="c-f slot"><span>Detail / print</span></div>
    </div>
    <div class="cta-row" style="margin-top:26px">
      <a class="btn" data-pm-link="shopUrl" data-pm-hide target="_blank" rel="noopener">Shop online</a>
      <a class="btn secondary" href="{up}studio/#visit">Buy in studio</a>
    </div>
  </div>
</section>

<section class="statement flush">
  <div class="wrap-wide" style="padding:clamp(44px,7vw,92px) var(--gut)">
    <div class="big">If you know,<br>you <em>know</em>.</div>
  </div>
</section>

{final_cta(up)}'''


# ================================================================= VISIT =====


# ============================================================== GENERATE =====
page("index.html", 0, None,
     "Primal Moves Venice — Start Your 2-Week Trial",
     "A community wellness club in Venice built around a daily movement practice. Sauna, cold plunge, Cherish cafe and events. Start with a two-week trial, or try Primal online free.", home)
page("practice/index.html", 1, "practice/", "Our Method — Primal Moves Venice",
     "The Primal Moves method: stability, strength, mobility and muscle tone, in four series.", practice)
page("studio/index.html", 1, "studio/", "The Studio — Primal Moves Venice",
     "Inside the 11,000 ft² studio room by room, the coaching team, and everything you need for your first visit.", studio)
page("classes/index.html", 1, "classes/", "Classes &amp; Schedule — Primal Moves Venice",
     "Every class we run, who it's for, where to start, and the live schedule to book it.", classes)
page("memberships/index.html", 1, "memberships/", "Membership — Primal Moves Venice",
     "Membership options, benefits and FAQs — the natural next step after the two-week trial.", memberships)
page("cherish/index.html", 1, "cherish/", "Cherish — Cafe &amp; Tea Lounge at Primal Moves Venice",
     "Cherish is the cafe and tea lounge inside Primal Moves Venice. Slow down with us.", cherish, cherish=True)
page("events/index.html", 1, "events/", "Events — Primal Moves Venice",
     "Workshops, tea ceremonies, music, community nights and free events at Primal Moves Venice.", events)
page("partners/index.html", 1, "partners/", "Primal Partners — Primal Moves Venice",
     "Brands, studios and practitioners we work with, and how to partner with Primal Moves Venice.", partners)
page("shop/index.html", 1, "shop/", "Shop — Primal Moves Venice",
     "Primal Moves Venice merchandise.", shop)

# --- 404 -----------------------------------------------------------------
# Served by Cloudflare for any path that isn't a page (wrangler.toml,
# not_found_handling). A wrong URL should still look like the studio and
# offer a way back, not a browser error page.
def notfound(up, asset):
    return f"""
<section class="hero" style="min-height:min(72vh,640px)">
  <div class="wrap-wide" style="position:relative;z-index:2">
    <div class="kicker">404</div>
    <h1 class="display" style="max-width:16ch;margin:14px 0 0">this page<br>isn&rsquo;t <span class="ed-it">here</span></h1>
    <p class="lede" style="max-width:34em;margin-top:22px">Either it moved or the link was wrong. The floor, the sauna and the tea are all still where you left them.</p>
    <div class="cta-row" style="margin-top:32px">
      <a class="btn sage lg" href="{up}">back to the start</a>
      <a class="btn ghost-dark lg" href="{up}classes/">see the schedule</a>
    </div>
  </div>
</section>"""

page("404.html", 0, "", "Not found — Primal Moves Venice",
     "That page isn't here.", notfound)

# A 404 is served for any path — /nope, /a/b/c — so its relative links would
# resolve against whatever was typed. One <base> fixes the nav, the footer and
# the buttons at once. (Only true once design-9 is the site root, which is what
# the root wrangler.toml deploys.)
_p404 = ROOT / "404.html"
_h = _p404.read_text()
_p404.write_text(_h.replace("<head>", '<head>\n<base href="/">', 1))
print("404: base href set")

# --- redirect stubs so design-5 URLs don't 404 -------------------------------
REDIRECTS = {"schedule/": "../classes/#schedule", "visit/": "../studio/#visit", "about/": "../practice/"}
for path, target in REDIRECTS.items():
    p = ROOT / path / "index.html"
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="{target}">
<title>Redirecting…</title>
</head>
<body style="font-family:system-ui;padding:40px">
<p>This page moved. <a href="{target}">Continue →</a></p>
<script>location.replace("{target}");</script>
</body>
</html>
''')
    print("wrote redirect", p)
print("done")
