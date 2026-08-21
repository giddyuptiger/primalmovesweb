/* ============================================================================
   PRIMAL MOVES VENICE — DESIGN 8 CONFIG
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

  // Where "Try Primal Online Free" goes — the digital studio's free week.
  // Note: primalmoves.com currently advertises a 14-DAY free trial, not 7.
  // Confirm which is right before launch; the label below is what visitors see.
  onlineTrialUrl: "https://app.primalmoves.com/register/trial/",
  onlineTrialLabel: "1 week free",

  /* --- BOOKING / SCHEDULE ------------------------------------------------
     IMPORTANT: Mindbody's own schedule page (clients.mindbodyonline.com)
     sends `X-Frame-Options: SAMEORIGIN`, so it CANNOT be put in an iframe
     on our domain — it renders as a blank white box in every browser.

     The only supported way to show the live timetable inline is a
     Healcode / Branded Web widget, generated inside your Mindbody account:
       Mindbody → Home → Branded Web (Healcode) → Widgets → New Schedule
     It gives you a snippet containing data-widget-id="XXXXXXXXXX".
     Paste just that ID below and the real schedule renders on the page.
     Leave it blank and visitors get a clean "Book through Mindbody"
     card with a working button instead of an empty frame.            */
  mindbodySiteId: "5745965",             // verified: Primal Moves Venice Beach
  healcodeWidgetId: "",                  // <-- paste the Healcode SCHEDULE widget ID here

  // OPTIONAL escape hatch. Renders Mindbody's own pricing widget inline —
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
  // 200, no X-Frame-Options. Only *Calendars* have embed URLs — host
  // profiles do not. Replace via Luma → Manage Calendar → Embed.
  lumaEmbedUrl: "https://luma.com/embed/calendar/cal-CRQbJyS4jRRrfsN/events",

  linktreeUrl: "",

  /* --- COMMUNITY PARTNERS ------------------------------------------------
     Moss sells the joint membership in THEIR system, so this must deep-link
     straight to Moss's own signup — not to a page on our site. Blank = the
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
  address1:         "1038 Princeton Dr, Ste B",
  address2:         "Marina del Rey, CA 90292"
};

/* ============================================================================
   Runtime — no need to edit below.
   ========================================================================== */
(function () {
  var C = window.PM_CONFIG;

  C.mindbodyScheduleUrl =
    "https://clients.mindbodyonline.com/classic/ws?studioid=" + C.mindbodySiteId +
    "&stype=-7&sView=week&sLoc=0&sTG=0";
  C.mindbodyPricingUrl =
    "https://clients.mindbodyonline.com/classic/ws?studioid=" + C.mindbodySiteId + "&stype=-98";
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

    // data-pm-schedule → Healcode widget if configured, otherwise a real
    // call-to-action. Never an iframe: Mindbody blocks framing outright.
    document.querySelectorAll("[data-pm-schedule]").forEach(function (el) {
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
          var s = document.createElement("script");
          s.id = "healcode-js";
          s.src = "https://widgets.mindbodyonline.com/javascripts/healcode.js";
          s.async = true;
          document.body.appendChild(s);
        }
        return;
      }
      el.classList.add("embed-placeholder");
      el.innerHTML =
        '<div class="ph-title">' +
          (el.getAttribute("data-pm-schedule-label") || "Book through Mindbody") +
        "</div>" +
        "<p>" + (el.getAttribute("data-pm-schedule-hint") || "") + "</p>" +
        '<div class="cta-row" style="justify-content:center;margin-top:24px">' +
          '<a class="btn lg" href="' + C.mindbodyScheduleUrl + '" target="_blank" rel="noopener">See this week&rsquo;s schedule ↗</a>' +
        "</div>";
      if (window.console && console.warn) {
        console.warn("[PM_CONFIG] Set `healcodeWidgetId` in config.js to render the live timetable inline. " +
                     "Mindbody's own schedule page cannot be iframed (X-Frame-Options: SAMEORIGIN).");
      }
    });

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
      // the intended presentation — Mindbody's own widget markup does not
      // match this design system.
      el.remove();
    });

    // data-pm-calendar → our own month grid, built from events.json.
    // The data comes from Luma's public ICS feed via tools/fetch_events.py,
    // so nothing is hand-typed and nothing shows that isn't already in Luma.
    document.querySelectorAll("[data-pm-calendar]").forEach(function (el) {
      var src = el.getAttribute("data-pm-calendar-src") || "events.json";
      var months = parseInt(el.getAttribute("data-pm-calendar-months") || "2", 10);
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
          el.innerHTML = '<div class="pm-cal-empty">Nothing on the calendar just now — ' +
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

        var first = events[0]._la;
        var cursor = new Date(first.y, first.m, 1);
        var nowLa = la(new Date().toISOString());
        var html = '<div class="pm-cal-grid">';

        for (var m = 0; m < months; m++) {
          var y = cursor.getFullYear(), mo = cursor.getMonth();
          var startDow = new Date(y, mo, 1).getDay();
          var days = new Date(y, mo + 1, 0).getDate();
          html += '<div class="pm-month"><div class="pm-month-name">' + MON[mo] + " " + y + "</div>";
          html += '<div class="pm-dows">' + DOW.map(function (d) { return "<span>" + d + "</span>"; }).join("") + "</div>";
          html += '<div class="pm-days">';
          for (var b = 0; b < startDow; b++) html += '<span class="pm-day pad"></span>';
          for (var d1 = 1; d1 <= days; d1++) {
            var key = y + "-" + mo + "-" + d1;
            var on = byDay[key];
            var isToday = (y === nowLa.y && mo === nowLa.m && d1 === nowLa.d);
            var cls = "pm-day" + (on ? " has" : "") + (isToday ? " today" : "");
            if (on) {
              html += '<a class="' + cls + '" href="#pm-ev-' + key + '">' + d1 + "<i></i></a>";
            } else {
              html += '<span class="' + cls + '">' + d1 + "</span>";
            }
          }
          html += "</div></div>";
          cursor.setMonth(cursor.getMonth() + 1);
        }
        html += "</div>";

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
        el.innerHTML = html;
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
