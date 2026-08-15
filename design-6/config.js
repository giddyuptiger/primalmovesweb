/* ============================================================================
   PRIMAL MOVES VENICE — DESIGN 6 CONFIG
   One file. Fill a value, commit, done. Blank values degrade gracefully:
   buttons hide or link to a sensible fallback, embeds show a real card
   instead of a broken iframe.
   ========================================================================== */

window.PM_CONFIG = {

  /* --- THE TWO TRIALS (the site's primary + secondary conversions) -------- */
  // Where "Start Your 2-Week Trial" goes. Blank = Mindbody pricing options.
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
  healcodeWidgetId: "",                  // <-- paste the Healcode widget ID here

  /* --- EVENTS ------------------------------------------------------------ */
  // Events are native to this site (per the brief). These are only for
  // registration links and the legacy Linktree redirect.
  lumaPageUrl: "https://luma.com/user/PrimalMoves",

  // Live Luma Calendar embed (cal-CRQbJyS4jRRrfsN). Verified iframe-able:
  // 200, no X-Frame-Options. Only *Calendars* have embed URLs — host
  // profiles do not. Replace via Luma → Manage Calendar → Embed.
  lumaEmbedUrl: "https://luma.com/embed/calendar/cal-CRQbJyS4jRRrfsN/events",

  linktreeUrl: "",

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

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    // data-pm-link="key" → href; data-pm-hide removes it when the key is blank
    document.querySelectorAll("[data-pm-link]").forEach(function (el) {
      var url = C[el.getAttribute("data-pm-link")];
      if (url) { el.setAttribute("href", url); return; }
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
        console.warn("[PM_CONFIG] Set `" + key + "` in design-6/config.js to enable this embed.");
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

    // duplicate the ticker track so the marquee loops seamlessly
    var track = document.querySelector(".ticker-track");
    if (track && !track.dataset.cloned) {
      track.innerHTML += track.innerHTML;
      track.dataset.cloned = "1";
    }
  });
})();
