/* ============================================================================
   PRIMAL MOVES VENICE - DESIGN 8 CONFIG
   One file. Fill a value, commit, done. Blank values degrade gracefully:
   buttons hide or link to a sensible fallback, embeds show a real card
   instead of a broken iframe.
   ========================================================================== */

window.PM_CONFIG = {

  /* --- THE OFFER ----------------------------------------------------------
     design-8 leads with the $40 day pass. The two-week trial is demoted to
     the membership page. Point dayPassUrl at the day-pass pricing option in
     Mindbody (not the general pricing page) so the click lands on checkout. */
  dayPassUrl: "",
  dayPassPriceLabel: "$40",

  // Still used, but only on the membership page now.
  veniceTrialUrl: "",
  veniceTrialPriceLabel: "$69",          // shown on the card; edit if it changes

  // Where "Try Primal Online Free" goes - the digital studio's free week.
  // Note: primalmoves.com currently advertises a 14-DAY free trial, not 7.
  // Confirm which is right before launch; the label below is what visitors see.
  onlineTrialUrl: "https://app.primalmoves.com/register/trial/",
  onlineTrialLabel: "1 week free",

  /* --- BOOKING / SCHEDULE ------------------------------------------------
     IMPORTANT: Mindbody's own schedule page (clients.mindbodyonline.com)
     sends `X-Frame-Options: SAMEORIGIN`, so it CANNOT be put in an iframe
     on our domain - it renders as a blank white box in every browser.

     The only supported way to show the live timetable inline is a
     Healcode / Branded Web widget, generated inside your Mindbody account:
       Mindbody → Home → Branded Web (Healcode) → Widgets → New Schedule
     It gives you a snippet containing data-widget-id="XXXXXXXXXX".
     Paste just that ID below and the real schedule renders on the page.
     Leave it blank and visitors get a clean "Book through Mindbody"
     card with a working button instead of an empty frame.            */
  mindbodySiteId: "5745965",             // verified: Primal Moves Venice Beach
  healcodeWidgetId: "",                  // <-- paste the Healcode SCHEDULE widget ID here

  // OPTIONAL escape hatch. Renders Mindbody's own pricing widget inline -
  // which works, but arrives in Mindbody's markup and fights this design
  // system. Preferred approach is the hand-built tiers on the memberships
  // page, each linking out to its Mindbody purchase URL. Blank = slot is
  // removed entirely and only our own cards show.
  healcodePricingWidgetId: "",

  /* --- EVENTS ------------------------------------------------------------ */
  // Events are native to this site (per the brief). These are only for
  // registration links and the legacy Linktree redirect.
  lumaPageUrl: "https://luma.com/user/PrimalMoves",

  // Live Luma Calendar embed (cal-CRQbJyS4jRRrfsN). Verified iframe-able:
  // 200, no X-Frame-Options. Only *Calendars* have embed URLs - host
  // profiles do not. Replace via Luma → Manage Calendar → Embed.
  lumaEmbedUrl: "https://luma.com/embed/calendar/cal-CRQbJyS4jRRrfsN/events",

  linktreeUrl: "",

  /* --- PHOTOS ------------------------------------------------------------
     SWAPPING A PHOTO - two ways, both easy:

     1. Same name.  Drop your new file into assets/photos/ using the SAME
        filename as the one you're replacing. Nothing else to change.

     2. New name.   Put the file in assets/photos/ and change the filename
        on the matching line below. That's it - the page picks it up.

     Slot names follow Miki's `page - section - slot` convention. The full
     list, with what each shot is doing, is in assets/photos/PHOTOS.md.
     Anything not listed here keeps whatever the page already has.        */
  /* --- LAYOUT -------------------------------------------------------------
     "a"     = the current design.
     "tight" = the design critique applied: fewer competing CTAs, a collapsed
               type scale, a section rhythm with two big moments per page
               instead of eight equal ones, and shorter pages.
     Switch between them live in the EDIT panel under Layout. Whichever is
     set here is what a visitor sees.                                      */
  /* --- LIMEWASH -----------------------------------------------------------
     true = the mineral-plaster wash goes over every flat surface, the way the
     studio walls are finished. Photographs are left alone. Try it live in the
     EDIT panel under Colour; set it here to make it the default.          */
  texture: true,          // true = limewash · "faint" = a lighter coat · false = off

  layout: "a",

  /* --- DESIGN STUDIO ------------------------------------------------------
     true  = the EDIT tab shows for ANYONE who loads the site. Right for
             design mode: no passphrase, everyone can look and try things.
             The panel starts CLOSED, so a visitor sees a small tab and
             nothing else until they open it.
     false = hidden unless someone goes to /admin/ and enters the passphrase.

     >>> FLIP THIS TO false BEFORE THE SITE GOES LIVE. <<<
     Nothing the studio does can change what other people see - it's all
     preview - but a public EDIT tab on a real business site looks unfinished. */
  studioOpenToAll: true,

  /* --- COPY OVERRIDES -----------------------------------------------------
     Text edited in the /admin studio lands in design-9/copy.json. Anything
     not listed there uses whatever the page already says, so the file stays
     small and the markup remains the source of truth.                     */
  copyUrl: "copy.json",

  /* --- SHARED DESIGN PRESETS ---------------------------------------------
     Blank  = presets come from design-9/presets.json (committed to the repo,
              so everyone sees the same list; saving means a push).
     A URL  = the studio reads and writes live presets from that Cloudflare
              Worker, so a save is visible to everyone immediately.
              See tools/presets-worker.js for the Worker and how to deploy it. */
  presetsApi: "",

  /* --- THE LIVE PHOTO STORE ----------------------------------------------
     Blank  = photographs come from this file and assets/photos/ only. A swap
              in the EDIT panel is a preview in that one browser.
     A URL  = the Worker in tools/pm-worker.js. Now a photo swap is REAL:
              upload or pick a shot in the panel and every visitor sees it
              within seconds, with no push and no deploy.

     Photographs are the only thing that publishes this way. Colour and
     wording stay as saved configs - changing those for everyone is still a
     commit, on purpose. Setup: strategy/live-editing.md              */
  liveApi: "https://pm-studio.primal-0d7.workers.dev",

  // Focal point per slot - where the crop should hold as the frame changes
  // shape. "50% 50%" is the centre; "50% 30%" pulls the crop upward, which is
  // usually what a photo of a face wants. Set these in the /admin studio.
  photoFocus: {},

  photos: {
    // the hero film ships in the repo - no photo store involved, so it plays
    // even if the store is down. joy-laughing.jpg stays as the poster frame.
    "home.hero":              "hero-loop.mp4",
    "home.what-is-primal":    "collective-crawl.jpg",
    "home.third-place":       "sauna-laughing.jpg",
    "home.family":            "",                      // <-- kids on the floor, still needed

    "method.hero":            "handstand-wall-wide.jpg",
    "method.series-1":        "collective-crawl-2.jpg",
    "method.series-2":        "compound-dumbbells.jpg",
    "method.series-3":        "handstand-parallettes.jpg",
    "method.series-4":        "handstand-wall.jpg",

    "studio.hero":            "space-rings-wide.jpg",
    "studio.room-main-floor": "space-bus-rings.jpg",
    "studio.room-lounge":     "space-lounge-rugs.jpg",
    "studio.room-sauna":      "sauna-still.jpg",
    "studio.room-plunge":     "plunge-two.jpg",
    "studio.room-tea":        "tea-room.jpg",

    "classes.hero":           "collective-downdog.jpg",
    "memberships.hero":       "boat-collective.jpg",
    "events.hero":            "space-floor-night.jpg",
    "cherish.hero":           "tea-room.jpg",          // <-- needs a real CAFE shot
    "partners.hero":          "compound-dumbbells-crop.jpg",
    "partners.pitch":         "bands-effort.jpg",
    "shop.hero":              "barbell-joy.jpg"
  },

  /* --- COMMUNITY PARTNERS ------------------------------------------------
     Moss sells the joint membership in THEIR system, so this must deep-link
     straight to Moss's own signup - not to a page on our site. Blank = the
     button falls back to /partners/.                                      */
  mossJoinUrl: "",
  summitUrl: "",

  /* --- CHERISH (cafe + tea lounge) --------------------------------------- */
  toastOrderUrl: "",
  toastCateringUrl: "",

  /* --- SHOP -------------------------------------------------------------- */
  shopUrl: "",

  /* --- EXTERNAL ---------------------------------------------------------- */
  bookingUrl:       "https://app.primalmoves.com/login/",
  digitalStudioUrl: "https://primalmoves.com/digital-studio/",
  methodUrl:        "https://primalmoves.com/about/",
  teacherTrainingUrl:"https://primalmoves.com/teacher-training/",
  instagramUrl:     "https://www.instagram.com/primalmovesvenice",
  appStoreUrl:      "https://apps.apple.com/app/id6749153748",
  email:            "hello@venice.primalmoves.com",
  phone:            "(310) 800-7061",
  phoneHref:        "tel:+13108007061",
  /* --- HOURS --------------------------------------------------------------
     From the Google Business listing. The footer marks today and works out
     open/closed live in the browser, in LA time - so it's always current
     without calling anything. Edit here when the hours change.
     Use 24h "HH:MM". A day with open === close reads as Closed.          */
  hours: [
    { day: "Mon", open: "06:30", close: "20:00" },
    { day: "Tue", open: "06:30", close: "20:00" },
    { day: "Wed", open: "06:30", close: "20:00" },
    { day: "Thu", open: "06:30", close: "20:00" },
    { day: "Fri", open: "06:30", close: "20:00" },
    { day: "Sat", open: "08:00", close: "15:00" },
    { day: "Sun", open: "08:00", close: "17:00" }
  ],

  address1:         "1038 Princeton Dr, Ste B",
  address2:         "Marina del Rey, CA 90292"
};

/* ============================================================================
   Runtime - no need to edit below.
   ========================================================================== */
(function () {
  var C = window.PM_CONFIG;

  /* ---- published photographs -------------------------------------------
     The live set is cached in this browser, so a returning visitor gets the
     current photographs on the first paint rather than a flash of the old
     ones. The network copy refreshes it a moment later.                  */
  var LIVE_CACHE = "pm_live_photos";
  function mergeLive(d) {
    if (!d || typeof d !== "object") return;
    C.photos = Object.assign({}, C.photos || {}, d.photos || {});
    C.photoFocus = Object.assign({}, C.photoFocus || {}, d.photoFocus || {});
  }
  try { mergeLive(JSON.parse(localStorage.getItem(LIVE_CACHE) || "null")); } catch (e) {}

  C.mindbodyScheduleUrl =
    "https://clients.mindbodyonline.com/classic/ws?studioid=" + C.mindbodySiteId +
    "&stype=-7&sView=week&sLoc=0&sTG=0";
  C.mindbodyPricingUrl =
    "https://clients.mindbodyonline.com/classic/ws?studioid=" + C.mindbodySiteId + "&stype=-98";
  // one Worker serves both; presetsApi only needs setting if it lives elsewhere
  if (!C.presetsApi && C.liveApi) C.presetsApi = C.liveApi.replace(/\/+$/, "") + "/presets";

  // each membership's own contract checkout - straight to the plan, not the
  // whole store (prodIds from Mindbody's Online Store > Contracts)
  (function () {
    var contract = function (id) {
      return "https://clients.mindbodyonline.com/classic/ws?studioid=" +
        C.mindbodySiteId + "&stype=40&prodId=" + id;
    };
    if (!C.planPrimalUrl)   C.planPrimalUrl   = contract(413);
    if (!C.planNomadUrl)    C.planNomadUrl    = contract(414);
    if (!C.planExplorerUrl) C.planExplorerUrl = contract(412);
    if (!C.planWeekendUrl)  C.planWeekendUrl  = contract(411);
    if (!C.planKidsUrl)     C.planKidsUrl     = contract(416);
    if (!C.saunaHourUrl)    C.saunaHourUrl    =
      "https://go.mindbodyonline.com/book/app/pricing/bus_11kV2FCbMt1nMdkxkd/po_11kV2FCbMt1nM8pd9v?mbo_src=po-mgmt-copy-link";
  })();

  if (!C.veniceTrialUrl) C.veniceTrialUrl = C.mindbodyPricingUrl;
  if (!C.dayPassUrl) C.dayPassUrl = C.mindbodyPricingUrl;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    // data-pm-link="key" → href; data-pm-hide removes it when the key is blank
    document.querySelectorAll("[data-pm-link]").forEach(function (el) {
      var url = C[el.getAttribute("data-pm-link")];
      if (url) { el.setAttribute("href", url); return; }
      if (el.hasAttribute("data-pm-fallback")) {
        el.setAttribute("href", el.getAttribute("data-pm-fallback"));
        el.removeAttribute("target");
        return;
      }
      if (el.hasAttribute("data-pm-hide")) { el.remove(); return; }
      el.setAttribute("href", "#");
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("title", "Link not configured yet");
    });

    // data-pm-text="key" → replaces text content
    document.querySelectorAll("[data-pm-text]").forEach(function (el) {
      var v = C[el.getAttribute("data-pm-text")];
      if (v) el.textContent = v;
    });

    // data-pm-embed="key" → iframe, or a visitor-facing card with a fallback CTA
    document.querySelectorAll("[data-pm-embed]").forEach(function (el) {
      var key = el.getAttribute("data-pm-embed");
      var url = C[key];
      if (url) {
        var f = document.createElement("iframe");
        f.src = url;
        f.title = el.getAttribute("data-pm-embed-title") || "Embedded content";
        f.loading = "lazy";
        f.setAttribute("allowfullscreen", "");
        if (el.getAttribute("data-pm-embed-height")) f.style.minHeight = el.getAttribute("data-pm-embed-height");
        el.classList.add("embed");
        el.innerHTML = "";
        el.appendChild(f);
        return;
      }
      var fbKey = el.getAttribute("data-pm-embed-fallback");
      var fbUrl = fbKey ? C[fbKey] : "";
      el.classList.remove("embed");
      el.classList.add("embed-placeholder");
      el.innerHTML =
        '<div class="ph-title">' + (el.getAttribute("data-pm-embed-label") || "Coming soon") + "</div>" +
        "<p>" + (el.getAttribute("data-pm-embed-hint") || "") + "</p>" +
        (fbUrl ? '<div class="cta-row" style="justify-content:center;margin-top:22px">' +
                 '<a class="btn secondary" href="' + fbUrl + '" target="_blank" rel="noopener">' +
                 (el.getAttribute("data-pm-embed-cta") || "Open in a new tab") + "</a></div>" : "");
      if (window.console && console.warn) {
        console.warn("[PM_CONFIG] Set `" + key + "` in design-8/config.js to enable this embed.");
      }
    });

    // data-pm-schedule → the live timetable, in three fallbacks:
    //
    //   1. schedule.json - built by tools/fetch_schedule.py from Mindbody's
    //      own PUBLIC class-times API (the one behind mindbodyonline.com/
    //      explore). No key, no widget, no cost, and it renders in OUR type.
    //   2. the Branded Web / Healcode widget, if healcodeWidgetId is ever set.
    //      Works, but it's a paid add-on in a cross-origin iframe we cannot
    //      style.
    //   3. a plain link to Mindbody.
    //
    // Note clients.mindbodyonline.com can never be framed - it sends
    // X-Frame-Options: SAMEORIGIN. Link to it, never embed it.
    var teachersUrl = (function () {
      var css = (document.querySelector('link[rel="stylesheet"][href*="style.css"]') || {}).href || "";
      return css ? css.replace(/style\.css.*$/, "teachers.json") : "teachers.json";
    })();
    var teachersReady = fetch(teachersUrl, { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(function (d) { window.PM_TEACHERS = d || {}; })
      .catch(function () { window.PM_TEACHERS = {}; });

    document.querySelectorAll("[data-pm-schedule]").forEach(function (el) {
      var srcAttr = el.getAttribute("data-pm-schedule-src");
      var cssHref2 = (document.querySelector('link[rel="stylesheet"][href*="style.css"]') || {}).href || "";
      var schedUrl = srcAttr || (cssHref2 ? cssHref2.replace(/style\.css.*$/, "schedule.json") : "schedule.json");

      fetch(schedUrl, { cache: "no-cache" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
          if (!d.classes || !d.classes.length) throw new Error("empty");
          renderSchedule(el, d);
        })
        .catch(function () { healcodeOrLink(el); });
    });

    function renderSchedule(el, d) {
      var TZ = "America/Los_Angeles";
      function la(iso) {
        var dt = new Date(iso), o = {};
        try {
          var f = new Intl.DateTimeFormat("en-US", {
            timeZone: TZ, weekday: "short", month: "short", day: "numeric",
            hour: "numeric", minute: "2-digit", hour12: true
          }).formatToParts(dt).reduce(function (a2, p2) { a2[p2.type] = p2.value; return a2; }, {});
          o.wd = f.weekday; o.dd = f.day; o.mon = f.month;
          o.day = f.weekday + " " + f.day + " " + f.month;
          o.key = f.month + f.day;
          o.time = (f.hour + (f.minute === "00" ? "" : ":" + f.minute) +
                    (f.dayPeriod || "").toLowerCase()).replace(/\s+/g, "");
        } catch (e) {
          o.day = dt.toDateString(); o.key = o.day; o.wd = ""; o.dd = ""; o.mon = "";
          o.time = dt.getHours() + ":" + ("0" + dt.getMinutes()).slice(-2);
        }
        return o;
      }

      var groups = [], index = {};
      d.classes.forEach(function (c) {
        var L = la(c.start);
        if (!index[L.key]) {
          index[L.key] = { key: L.key, day: L.day, wd: L.wd, dd: L.dd, mon: L.mon, items: [] };
          groups.push(index[L.key]);
        }
        index[L.key].items.push({ t: L.time, c: c });
      });

      var todayKey = la(new Date().toISOString()).key;
      var book = d.bookUrl || C.mindbodyScheduleUrl;

      /* A day at a time, chosen from a rail you can scroll - the whole week
         stacked was eight screens of timetable nobody reads to the end. */
      var html = '<div class="daybar"><button class="dnav prev" type="button" aria-label="Earlier days">&#8249;</button>' +
        '<div class="days" role="tablist">' +
        groups.map(function (g, i) {
          var isToday = g.key === todayKey;
          return '<button class="dchip' + (i === 0 ? " on" : "") + '" role="tab" data-key="' + g.key +
            '" aria-selected="' + (i === 0) + '">' +
            '<span class="dw">' + (isToday ? "Today" : g.wd) + "</span>" +
            '<span class="dd">' + g.dd + "</span></button>";
        }).join("") +
        '</div><button class="dnav next" type="button" aria-label="Later days">&#8250;</button></div>';

      html += '<div class="sched">';
      groups.forEach(function (g, i) {
        html += '<div class="sched-day' + (i === 0 ? " on" : "") + '" data-key="' + g.key + '">' +
          '<div class="sched-date">' + g.day + "</div><ul>";
        g.items.forEach(function (x) {
          var staffParts = x.c.staff ? String(x.c.staff).split(/\s*[&+]\s*/) : [];
          var avas = staffParts.length
            ? '<span class="s-avas">' + staffParts.map(function (nm) {
                return '<span class="s-ava" data-t-name="' + nm.replace(/"/g, "&quot;") + '"></span>';
              }).join("") + "</span>"
            : "";
          html += '<li><a href="' + book + '" target="_blank" rel="noopener">' +
            '<span class="s-time">' + x.t + "</span>" + avas +
            '<span class="s-name">' + x.c.name + "</span>" +
            '<span class="s-meta">' + (x.c.staff || "") +
              (x.c.minutes ? '<span class="s-dur">' + x.c.minutes + " min</span>" : "") +
            "</span></a></li>";
        });
        html += "</ul></div>";
      });
      html += "</div>";
      // no "book a class" line here - the buttons under the timetable say it
      el.classList.add("sched-wrap");
      el.innerHTML = html;
      if (window.PM_FILL_AVATARS) window.PM_FILL_AVATARS();
      if (teachersReady) teachersReady.then(function () { if (window.PM_FILL_AVATARS) window.PM_FILL_AVATARS(); });

      var chips = [].slice.call(el.querySelectorAll(".dchip"));
      var panes = [].slice.call(el.querySelectorAll(".sched-day"));
      var rail = el.querySelector(".days");

      function show(key) {
        chips.forEach(function (b) {
          var on = b.getAttribute("data-key") === key;
          b.classList.toggle("on", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
          if (on && rail) {
            var bl = b.offsetLeft - rail.offsetLeft;
            rail.scrollLeft = Math.max(0, bl - (rail.clientWidth - b.offsetWidth) / 2);
          }
        });
        panes.forEach(function (p2) { p2.classList.toggle("on", p2.getAttribute("data-key") === key); });
      }
      chips.forEach(function (b) {
        b.addEventListener("click", function () { show(b.getAttribute("data-key")); });
      });
      // open on today when today has classes, otherwise on the first day listed
      if (chips.length) {
        var t = chips.filter(function (b) { return b.getAttribute("data-key") === todayKey; })[0];
        show((t || chips[0]).getAttribute("data-key"));
      }
      function nudge(dir) { if (rail) rail.scrollBy({ left: dir * 220, behavior: "smooth" }); }
      var prev = el.querySelector(".dnav.prev"), next = el.querySelector(".dnav.next");
      if (prev) prev.addEventListener("click", function () { nudge(-1); });
      if (next) next.addEventListener("click", function () { nudge(1); });
    }

    function healcodeOrLink(el) {
      if (C.healcodeWidgetId) {
        var w = document.createElement("healcode-widget");
        w.setAttribute("data-type", "schedules");
        w.setAttribute("data-widget-partner", "object");
        w.setAttribute("data-widget-id", C.healcodeWidgetId);
        w.setAttribute("data-widget-version", "1");
        el.classList.add("schedule-widget");
        el.innerHTML = "";
        el.appendChild(w);
        if (!document.getElementById("healcode-js")) {
          var s2 = document.createElement("script");
          s2.id = "healcode-js";
          s2.src = "https://widgets.mindbodyonline.com/javascripts/healcode.js";
          s2.async = true;
          document.body.appendChild(s2);
        }
        return;
      }
      el.classList.add("embed-placeholder");
      el.innerHTML =
        '<div class="ph-title">' +
          (el.getAttribute("data-pm-schedule-label") || "Book through Mindbody") + "</div>" +
        "<p>" + (el.getAttribute("data-pm-schedule-hint") || "") + "</p>" +
        '<div class="cta-row" style="justify-content:center;margin-top:24px">' +
          '<a class="btn sage lg" href="' + C.mindbodyScheduleUrl + '" target="_blank" rel="noopener">See this week&rsquo;s schedule &#8599;</a>' +
          '<a class="btn" data-pm-link="appStoreUrl" target="_blank" rel="noopener">Get the app</a>' +
        "</div>";
    }

    // data-pm-pricing → Healcode pricing-options widget, or a real CTA.
    document.querySelectorAll("[data-pm-pricing]").forEach(function (el) {
      if (C.healcodePricingWidgetId) {
        var w = document.createElement("healcode-widget");
        w.setAttribute("data-type", "pricing_options");
        w.setAttribute("data-widget-partner", "object");
        w.setAttribute("data-widget-id", C.healcodePricingWidgetId);
        w.setAttribute("data-widget-version", "0");
        el.classList.add("schedule-widget");
        el.innerHTML = "";
        el.appendChild(w);
        if (!document.getElementById("healcode-js")) {
          var sc = document.createElement("script");
          sc.id = "healcode-js";
          sc.src = "https://widgets.mindbodyonline.com/javascripts/healcode.js";
          sc.async = true;
          document.body.appendChild(sc);
        }
        return;
      }
      // Not configured: leave the slot empty. The hand-built tiers below are
      // the intended presentation - Mindbody's own widget markup does not
      // match this design system.
      el.remove();
    });

    // data-pm-hours → the week, with today marked and open/closed worked out
    // live in America/Los_Angeles (not the visitor's zone).
    document.querySelectorAll("[data-pm-hours]").forEach(function (el) {
      var H = C.hours || [];
      if (!H.length) { el.remove(); return; }
      var TZ = "America/Los_Angeles";
      var now = new Date(), dow, mins;
      try {
        var f = new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short",
                  hour: "2-digit", minute: "2-digit", hour12: false })
                .formatToParts(now).reduce(function (a, p2) { a[p2.type] = p2.value; return a; }, {});
        dow = f.weekday;
        mins = parseInt(f.hour, 10) * 60 + parseInt(f.minute, 10);
      } catch (err) {
        dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()];
        mins = now.getHours() * 60 + now.getMinutes();
      }
      function toM(t) { var b = t.split(":"); return +b[0] * 60 + +b[1]; }

      var open = false, todayRow = null;
      H.forEach(function (r) {
        if (r.day !== dow) return;
        todayRow = r;
        if (r.open !== r.close && mins >= toM(r.open) && mins < toM(r.close)) open = true;
      });
      function pretty(t) {
        var b = t.split(":"), h = +b[0], m = b[1];
        var ap = h < 12 ? "am" : "pm"; h = h % 12 || 12;
        return h + (m === "00" ? "" : ":" + m) + ap;
      }
      // Collapse runs of identical days: Mon-Fri / Sat-Sun rather than seven
      // near-identical lines. Simple beats complete here.
      function span(r) { return r.open === r.close ? "Closed" : pretty(r.open) + "\u2013" + pretty(r.close); }
      var groups = [];
      H.forEach(function (r) {
        var last = groups[groups.length - 1];
        if (last && span(last.rows[0]) === span(r)) last.rows.push(r);
        else groups.push({ rows: [r] });
      });
      var rows = groups.map(function (g) {
        var first = g.rows[0], lastR = g.rows[g.rows.length - 1];
        var label = g.rows.length === 1 ? first.day : first.day + "\u2013" + lastR.day;
        var isNow = g.rows.some(function (r) { return r.day === dow; });
        return '<div class="hr-row' + (isNow ? " is-today" : "") + '">' +
               '<span class="hr-day">' + label + "</span>" +
               '<span class="hr-time">' + span(first) + "</span></div>";
      }).join("");

      el.innerHTML = '<div class="hr-status ' + (open ? "open" : "shut") + '">' +
        (open ? "Open now" : "Closed now") +
        (todayRow && todayRow.open !== todayRow.close
          ? ' <span>&middot; today ' + pretty(todayRow.open) + "\u2013" + pretty(todayRow.close) + "</span>"
          : "") +
        "</div>" + '<div class="hr-list">' + rows + "</div>";
    });

    // data-pm-photo="slot" → swap the image for whatever config.photos says.
    // A blank or missing entry leaves the markup's own src alone; a named
    // file that doesn't exist falls back to it too, so a typo can't leave
    // a broken image on the page.
    // a slot holds a photograph or a film - .mp4/.webm/.mov means film
    function isFilm(u) { return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u) || /^data:video\//.test(u); }

    /* Where a bare filename lives. An <img> slot can tell us from its own src,
       but a FRAME - an empty portrait - has no src, and resolving against the
       page instead gave /studio/joy-laughing.jpg. That 404s quietly, which is
       why published portraits appeared for nobody. */
    function assetBase() {
      var any = document.querySelector("img[data-pm-photo][src]");
      if (any) return (any.getAttribute("src") || "").replace(/[^/]+$/, "");
      var css = (document.querySelector('link[rel="stylesheet"][href*="style.css"]') || {}).href || "";
      return css ? css.replace(/design-9\/style\.css.*$/, "assets/photos/") : "../../assets/photos/";
    }

    // swap an <img> for a silent looping <video> (or the other way back),
    // keeping the slot name and the shape the picture had
    function toFilm(el, url, slot) {
      if (el.tagName === "VIDEO") {
        if (el.getAttribute("src") !== url) el.setAttribute("src", url);
        return;
      }
      var v = document.createElement("video");
      v.setAttribute("data-pm-photo", slot);
      v.setAttribute("src", url);
      v.setAttribute("poster", el.getAttribute("src") || "");   // the photo holds the frame
      v.setAttribute("playsinline", "");                        // iOS won't full-screen it
      v.muted = true; v.autoplay = true; v.loop = true;
      v.setAttribute("muted", ""); v.setAttribute("autoplay", ""); v.setAttribute("loop", "");
      if (el.className) v.className = el.className;
      if (el.getAttribute("style")) v.setAttribute("style", el.getAttribute("style"));
      if (el.getAttribute("alt")) v.setAttribute("aria-label", el.getAttribute("alt"));
      el.replaceWith(v);
      var play = v.play(); if (play && play.catch) play.catch(function () { /* autoplay blocked */ });
    }

    function fillAvatars() {
      var slotFor = function (name) {
        var T = window.PM_TEACHERS || {};
        if (T[name]) return T[name];
        var norm = function (x) { return String(x).toLowerCase().trim(); };
        var first = function (x) { return norm(x).split(/\s+/)[0]; };
        var names = Object.keys(T);
        // unique first-name match: schedule "Gus" -> teacher "Gus", etc.
        var f = first(name);
        var matches = names.filter(function (n) { return first(n) === f; });
        return matches.length === 1 ? T[matches[0]] : "";
      };
      document.querySelectorAll(".s-ava[data-t-name]").forEach(function (el) {
        var slot = slotFor(el.getAttribute("data-t-name"));
        if (slot && !el.getAttribute("data-pm-photo")) el.setAttribute("data-pm-photo", slot);
        var file = slot ? (C.photos || {})[slot] : "";
        if (!file) return;
        var abs = /^(https?:)?\/\//.test(file) || file.charAt(0) === "/" || file.indexOf("data:") === 0;
        el.style.backgroundImage = "url(" + (abs ? file : assetBase() + file) + ")";
        el.classList.add("on");
      });
    }
    window.PM_FILL_AVATARS = fillAvatars;

    function applyPhotoSlots() {
      document.querySelectorAll("[data-pm-photo]").forEach(function (el) {
        if (el.classList && el.classList.contains("s-ava")) return;  // painted by fillAvatars
        var slot = el.getAttribute("data-pm-photo");
        var file = (C.photos || {})[slot];
        if (!file) return;
        // a published file arrives as a full URL; a repo one as a filename
        var abs = /^(https?:)?\/\//.test(file) || file.charAt(0) === "/" || file.indexOf("data:") === 0;
        var base = (el.getAttribute("src") || el.getAttribute("poster") || "").replace(/[^/]+$/, "");
        if (!base) base = assetBase();          // frames have no src of their own
        var next = abs ? file : base + file;
        if (next === el.getAttribute("src")) return;

        if (isFilm(next)) { toFilm(el, next, slot); return; }
        if (el.tagName === "VIDEO") {                    // film → photograph
          var img = document.createElement("img");
          img.setAttribute("data-pm-photo", slot);
          img.src = next; img.alt = "";
          if (el.className) img.className = el.className;
          if (el.getAttribute("style")) img.setAttribute("style", el.getAttribute("style"));
          el.replaceWith(img);
          return;
        }

        /* Some slots are FRAMES, not pictures - a teacher portrait is an
           empty <div class="portrait"> waiting for one. Fill it rather than
           replacing it: the frame carries the 4:5 aspect-ratio that keeps
           every portrait the same size, and replacing it would throw that
           away. (Setting .src on a <div> silently does nothing, which is why
           swapped portraits never appeared for anybody else.) */
        if (el.tagName !== "IMG") {
          var probe2 = new Image();
          probe2.onload = function () {
            var inner = el.querySelector("img[data-pm-fill]");
            if (!inner) {
              inner = document.createElement("img");
              inner.setAttribute("data-pm-fill", "");
              inner.alt = "";
              el.textContent = "";                       // drop the "PORTRAIT" label
              el.appendChild(inner);
            }
            inner.src = next;
            el.classList.remove("empty");
          };
          probe2.onerror = function () {
            if (window.console) console.warn("[PM_CONFIG] photos['" + slot + "'] → " + next +
              " did not load. Is the file in assets/photos/?");
          };
          probe2.src = next;
          return;
        }

        var probe = new Image();
        probe.onload = function () { el.src = next; };
        probe.onerror = function () {
          if (window.console) console.warn("[PM_CONFIG] photos['" + slot + "'] → " + file +
            " could not be loaded. Keeping the existing image.");
        };
        probe.src = next;
      });
    }
    applyPhotoSlots();

    // layout: apply the chosen one before anything paints
    if (C.layout === "tight") document.documentElement.classList.add("pm-pre-tight");
    if (C.layout === "house") document.body.classList.add("house");

    // limewash - on by default now; the panel can still turn it off
    if (C.texture) {
      document.body.classList.add("texture");
      if (C.texture === "faint") document.body.classList.add("lime-faint");
    }

    // data-pm-copy → text overrides from copy.json
    if (C.copyUrl) {
      var cssHref = (document.querySelector('link[rel="stylesheet"][href*="style.css"]') || {}).href || "";
      var copyHref = cssHref ? cssHref.replace(/style\.css.*$/, C.copyUrl) : C.copyUrl;
      fetch(copyHref, { cache: "no-cache" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          var map = (d && d.copy) || {};
          Object.keys(map).forEach(function (k) {
            var el = document.querySelector('[data-pm-copy="' + k + '"]');
            if (el) el.innerHTML = map[k];
          });
        })
        .catch(function () { /* no overrides file - the page stands as written */ });
    }

    // data-pm-photo-focus / config.photoFocus → object-position per slot
    function applyFocusSlots() {
      document.querySelectorAll("[data-pm-photo]").forEach(function (el) {
        var f = (C.photoFocus || {})[el.getAttribute("data-pm-photo")];
        if (!f) return;
        // On a frame slot the dial must reach the image INSIDE the frame -
        // object-position on the div itself does nothing. The custom property
        // survives the fill arriving later, so order stops mattering.
        el.style.objectPosition = f;
        el.style.setProperty("--pm-focus", f);
      });
    }
    applyFocusSlots();

    /* The live set, fetched fresh. Anything published since this browser
       last looked lands here - no deploy, no cache to bust. */
    if (C.liveApi) {
      fetch(C.liveApi.replace(/\/+$/, "") + "/live", { cache: "no-cache" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || d.error) return;
          try {
            localStorage.setItem(LIVE_CACHE, JSON.stringify({
              photos: d.photos || {}, photoFocus: d.photoFocus || {}
            }));
          } catch (e) { /* private browsing - the fetch still works, just no cache */ }
          mergeLive(d);
          applyPhotoSlots(); applyFocusSlots();
          if (window.PM_FILL_AVATARS) window.PM_FILL_AVATARS();
          document.dispatchEvent(new CustomEvent("pm:live", { detail: d }));
        })
        .catch(function () { /* Worker unreachable - the repo photographs stand */ });
    }

    // data-pm-calendar → our own month grid, built from events.json.
    // The data comes from Luma's public ICS feed via tools/fetch_events.py,
    // so nothing is hand-typed and nothing shows that isn't already in Luma.
    document.querySelectorAll("[data-pm-calendar]").forEach(function (el) {
      var src = el.getAttribute("data-pm-calendar-src") || "events.json";
      var months = parseInt(el.getAttribute("data-pm-calendar-months") || "2", 10);
      var mode = el.getAttribute("data-pm-calendar-mode") || "full";
      var limit = parseInt(el.getAttribute("data-pm-calendar-limit") || "0", 10);
      el.classList.add("pm-cal");
      el.innerHTML = '<div class="pm-cal-loading">Loading events…</div>';

      fetch(src, { cache: "no-cache" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (data) { render(data.events || [], data.calendarUrl); })
        .catch(function () {
          el.classList.remove("pm-cal");
          el.classList.add("embed-placeholder");
          el.innerHTML =
            '<div class="ph-title">Events live on Luma</div>' +
            "<p>We could not load the calendar just now.</p>" +
            '<div class="cta-row" style="justify-content:center;margin-top:20px">' +
            '<a class="btn" href="' + C.lumaPageUrl + '" target="_blank" rel="noopener">See all events \u2197</a></div>';
        });

      // The studio is in Venice, CA. Luma publishes UTC; a visitor in London
      // must still see the LA date and time, so every date is resolved in
      // America/Los_Angeles rather than the viewer's own zone.
      var TZ = "America/Los_Angeles";
      function la(iso) {
        var d = new Date(iso), out = {};
        try {
          var parts = new Intl.DateTimeFormat("en-US", {
            timeZone: TZ, year: "numeric", month: "numeric", day: "numeric",
            hour: "numeric", minute: "2-digit", weekday: "short", hour12: true
          }).formatToParts(d).reduce(function (a, p2) { a[p2.type] = p2.value; return a; }, {});
          out.y = +parts.year; out.m = +parts.month - 1; out.d = +parts.day;
          out.dow = parts.weekday;
          out.time = (parts.hour + (parts.minute === "00" ? "" : ":" + parts.minute) +
                      (parts.dayPeriod || "").toLowerCase()).replace(/\s+/g, "");
        } catch (err) {
          out.y = d.getFullYear(); out.m = d.getMonth(); out.d = d.getDate();
          out.dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
          out.time = d.getHours() + ":" + ("0" + d.getMinutes()).slice(-2);
        }
        out.key = out.y + "-" + out.m + "-" + out.d;
        return out;
      }

      function render(events, calUrl) {
        if (!events.length) {
          el.innerHTML = '<div class="pm-cal-empty">Nothing on the calendar just now - ' +
            '<a href="' + (calUrl || C.lumaPageUrl) + '" target="_blank" rel="noopener">follow us on Luma</a> ' +
            "and you'll hear about the next one first.</div>";
          return;
        }
        var MON = ["January","February","March","April","May","June",
                   "July","August","September","October","November","December"];
        var DOW = ["S","M","T","W","T","F","S"];
        var byDay = {};
        events.forEach(function (e) {
          e._la = la(e.start);
          (byDay[e._la.key] = byDay[e._la.key] || []).push(e);
        });

        var nowLa = la(new Date().toISOString());
        if (limit) events = events.slice(0, limit);
        // Start at the current month, never earlier - and inside that month,
        // skip whole weeks that have already been and gone.
        var first = events[0]._la;
        var startY = nowLa.y, startM = nowLa.m;
        if (first.y > nowLa.y || (first.y === nowLa.y && first.m > nowLa.m)) {
          startY = first.y; startM = first.m;
        }
        var cursor = new Date(startY, startM, 1);
        var html = "";
        if (mode === "list") months = 0;      // list-only: the homepage teaser
        else html += '<div class="pm-cal-grid">';

        for (var m = 0; m < months; m++) {
          var y = cursor.getFullYear(), mo = cursor.getMonth();
          var startDow = new Date(y, mo, 1).getDay();
          var days = new Date(y, mo + 1, 0).getDate();

          // build the full set of cells, then drop leading rows that are
          // entirely in the past (only ever in the current month)
          var cells = [];
          for (var bl = 0; bl < startDow; bl++) cells.push(null);
          for (var dd = 1; dd <= days; dd++) cells.push(dd);
          while (cells.length % 7 !== 0) cells.push(null);

          var isThisMonth = (y === nowLa.y && mo === nowLa.m);
          var skipped = 0;
          if (isThisMonth) {
            while (cells.length > 7) {
              var week = cells.slice(0, 7);
              var lastDay = null;
              for (var wi = 6; wi >= 0; wi--) { if (week[wi]) { lastDay = week[wi]; break; } }
              if (lastDay !== null && lastDay < nowLa.d) { cells = cells.slice(7); skipped++; }
              else break;
            }
          }

          html += '<div class="pm-month"><div class="pm-month-name">' + MON[mo] + " " + y + "</div>";
          html += '<div class="pm-dows">' + DOW.map(function (d) { return "<span>" + d + "</span>"; }).join("") + "</div>";
          html += '<div class="pm-days">';
          cells.forEach(function (d1) {
            if (d1 === null) { html += '<span class="pm-day pad"></span>'; return; }
            var key = y + "-" + mo + "-" + d1;
            var on = byDay[key];
            var isToday = (y === nowLa.y && mo === nowLa.m && d1 === nowLa.d);
            var past = isThisMonth && d1 < nowLa.d;
            var cls = "pm-day" + (on ? " has" : "") + (isToday ? " today" : "") + (past ? " past" : "");
            if (on) html += '<a class="' + cls + '" href="#pm-ev-' + key + '">' + d1 + "<i></i></a>";
            else html += '<span class="' + cls + '">' + d1 + "</span>";
          });
          html += "</div></div>";
          cursor.setMonth(cursor.getMonth() + 1);
        }
        if (mode !== "list") html += "</div>";
        if (mode === "list") el.classList.add("pm-cal-listonly");
        var listTarget = document.querySelector("[data-pm-calendar-list]");

        html += '<ul class="pm-cal-list">';
        var MON_S = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        events.forEach(function (e) {
          var L = e._la;
          var when = L.dow + " " + L.d + " " + MON_S[L.m];
          var time = e.allDay ? "all day" : L.time;
          html += '<li id="pm-ev-' + L.key + '"><a href="' + e.url + '" target="_blank" rel="noopener">' +
                  '<span class="pm-when">' + when + "</span>" +
                  '<span class="pm-what">' + e.title + "</span>" +
                  '<span class="pm-time">' + time + "</span></a></li>";
        });
        html += "</ul>";
        if (listTarget) {
          var split = html.indexOf('<ul class="pm-cal-list">');
          el.innerHTML = html.slice(0, split);
          listTarget.innerHTML = html.slice(split);
          listTarget.classList.add("pm-cal-listwrap");
        } else {
          el.innerHTML = html;
        }
      }
    });

    // sticky nav: publish its real height so the body offset is exact, and
    // flag the scrolled state for the shadow.
    var hdr = document.querySelector("header.site");
    if (hdr) {
      var setH = function () {
        document.documentElement.style.setProperty("--nav-h", hdr.offsetHeight + "px");
      };
      setH();
      window.addEventListener("resize", setH);
      var onScroll = function () {
        hdr.classList.toggle("scrolled", window.scrollY > 12);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // memberships: cards / compare toggle. The choice sticks in the URL so a
    // link to #compare opens on the table.
    var memTabs = document.querySelector(".mem-tabs");
    if (memTabs) {
      var views = { "tab-cards": "view-cards", "tab-compare": "view-compare" };
      var show = function (tabId, push) {
        Object.keys(views).forEach(function (t) {
          var on = t === tabId;
          var btn = document.getElementById(t), view = document.getElementById(views[t]);
          if (!btn || !view) return;
          btn.classList.toggle("on", on);
          btn.setAttribute("aria-selected", on ? "true" : "false");
          view.hidden = !on;
        });
        if (push) {
          var h = tabId === "tab-compare" ? "#compare" : " ";
          history.replaceState(null, "", h === " " ? location.pathname : h);
        }
      };
      memTabs.addEventListener("click", function (e) {
        var b = e.target.closest("button[role=tab]");
        if (b) show(b.id, true);
      });
      show(location.hash === "#cards" ? "tab-cards" : "tab-compare", false);
    }

    // class cards: the description opens on the plus, nowhere else.
    document.addEventListener("click", function (e) {
      var b = e.target.closest(".cls-more");
      if (!b) return;
      var card = b.closest(".cls");
      if (!card) return;
      // one at a time - two open tiles both claim a full row on a phone and
      // push everything else off the screen
      var wasOpen = card.classList.contains("open");
      var list = card.closest(".cls-list") || document;
      list.querySelectorAll(".cls.open").forEach(function (c) {
        c.classList.remove("open");
        var m = c.querySelector(".cls-more");
        if (m) m.setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        card.classList.add("open");
        b.setAttribute("aria-expanded", "true");
      }
    });

    // mobile nav
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.textContent = open ? "Close" : "Menu";
      });
    }

    // events category filter
    var chips = document.querySelectorAll(".chip[data-cat]");
    if (chips.length) {
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var cat = chip.getAttribute("data-cat");
          chips.forEach(function (c) { c.classList.toggle("on", c === chip); });
          document.querySelectorAll(".ev[data-cat]").forEach(function (ev) {
            ev.hidden = !(cat === "all" || ev.getAttribute("data-cat") === cat);
          });
        });
      });
    }

  });
})();
