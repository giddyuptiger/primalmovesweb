/* ============================================================================
   PRIMAL MOVES VENICE — SITE CONFIG
   ----------------------------------------------------------------------------
   This is the only file you need to edit to wire up the third-party embeds.
   Fill in a value, save, push. Anything left as "" shows a friendly
   "coming soon" placeholder instead of a broken embed.
   ========================================================================== */

window.PM_CONFIG = {

  /* --- LUMA EVENTS ------------------------------------------------------- */
  // Public Luma page people can browse and subscribe to.
  // Currently our HOST PROFILE (33 events hosted). This works as a link.
  lumaPageUrl: "https://luma.com/user/PrimalMoves",

  // Luma embed URL — ONLY works for a Luma *Calendar*, not a host profile.
  // Luma has no embed for user profiles, so this stays blank until we create
  // a Calendar: luma.com → Calendars → Create Calendar → move//host events
  // there → Manage Calendar → Embed → copy the src="..." out of the snippet.
  // It looks like: "https://lu.ma/embed/calendar/cal-XXXXXXXXXXXXXXX/events"
  // Until then the Events page links out to lumaPageUrl instead.
  lumaEmbedUrl: "",


  /* --- TOAST (CAFE) ------------------------------------------------------ */
  // Toast online ordering page. e.g. "https://www.toasttab.com/primal-moves-cafe"
  toastOrderUrl: "",

  // Toast catering / large-order page. Leave "" to hide the catering button.
  toastCateringUrl: "",

  // Toast gift card page. Leave "" to hide.
  toastGiftCardUrl: "",


  /* --- MINDBODY (CLASS SCHEDULE) ----------------------------------------- */
  // Verified site ID for "Primal Moves Venice Beach" (Marina del Rey).
  mindbodySiteId: "5745965",

  // NOTE: Mindbody's own schedule page sends X-Frame-Options: SAMEORIGIN, so
  // it CANNOT be iframed on our domain — it renders as a blank white box.
  // The only supported inline option is a Healcode / Branded Web widget:
  //   Mindbody → Home → Branded Web (Healcode) → Widgets → New Schedule
  // Paste the data-widget-id value below. Blank = a clean card + button.
  healcodeWidgetId: "",


  /* --- OFFER ------------------------------------------------------------- */
  // Where the "2 weeks unlimited — $69" buttons point.
  // Defaults to the Mindbody pricing-options page for the site ID above.
  offerUrl: "",


  /* --- EXTERNAL ---------------------------------------------------------- */
  bookingUrl:      "https://app.primalmoves.com/login/",
  digitalStudioUrl:"https://primalmoves.com/digital-studio/",
  methodUrl:       "https://primalmoves.com/about/",
  instagramUrl:    "https://www.instagram.com/primalmovesvenice",
  appStoreUrl:     "https://apps.apple.com/app/id6749153748"
};

/* ============================================================================
   Runtime — no need to edit below this line.
   ========================================================================== */
(function () {
  var C = window.PM_CONFIG;

  C.mindbodyScheduleUrl =
    "https://clients.mindbodyonline.com/classic/ws?studioid=" + C.mindbodySiteId +
    "&stype=-7&sView=week&sLoc=0&sTG=0";
  C.mindbodyPricingUrl =
    "https://clients.mindbodyonline.com/classic/ws?studioid=" + C.mindbodySiteId + "&stype=-98";
  if (!C.offerUrl) C.offerUrl = C.mindbodyPricingUrl;

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    // data-pm-link="keyName" → sets href, or disables the element if unset.
    document.querySelectorAll("[data-pm-link]").forEach(function (el) {
      var url = C[el.getAttribute("data-pm-link")];
      if (url) {
        el.setAttribute("href", url);
      } else if (el.hasAttribute("data-pm-hide")) {
        el.remove();
      } else {
        el.setAttribute("href", "#");
        el.setAttribute("aria-disabled", "true");
        el.setAttribute("title", "Link not configured yet");
      }
    });

    // data-pm-embed="keyName" → injects an iframe, or a placeholder if unset.
    document.querySelectorAll("[data-pm-embed]").forEach(function (el) {
      var key = el.getAttribute("data-pm-embed");
      var url = C[key];
      if (url) {
        var f = document.createElement("iframe");
        f.src = url;
        f.title = el.getAttribute("data-pm-embed-title") || "Embedded content";
        f.loading = "lazy";
        f.setAttribute("allowfullscreen", "");
        if (el.getAttribute("data-pm-embed-height")) {
          f.style.minHeight = el.getAttribute("data-pm-embed-height");
        }
        el.classList.add("embed");
        el.innerHTML = "";
        el.appendChild(f);
      } else {
        // No embed available. If a fallback link is configured, show a real
        // call-to-action rather than anything that reads as broken.
        var fbKey = el.getAttribute("data-pm-embed-fallback");
        var fbUrl = fbKey ? C[fbKey] : "";
        el.classList.remove("embed");
        el.classList.add("embed-placeholder");
        el.innerHTML =
          '<div class="ph-title">' +
            (el.getAttribute("data-pm-embed-label") || "Coming soon") +
          "</div>" +
          "<p>" + (el.getAttribute("data-pm-embed-hint") || "") + "</p>" +
          (fbUrl
            ? '<div class="cta-row" style="justify-content:center;margin-top:22px">' +
              '<a class="btn" href="' + fbUrl + '" target="_blank" rel="noopener">' +
              (el.getAttribute("data-pm-embed-cta") || "Open in a new tab ↗") +
              "</a></div>"
            : "");
        // Dev note goes to the console, never onto the live page.
        if (window.console && console.warn) {
          console.warn("[PM_CONFIG] Set `" + key + "` in design-4/config.js to enable this embed.");
        }
      }
    });

    // data-pm-schedule → Healcode widget if configured, otherwise a real CTA.
    // Never an iframe: Mindbody blocks framing outright.
    document.querySelectorAll("[data-pm-schedule]").forEach(function (el) {
      if (C.healcodeWidgetId) {
        var w = document.createElement("healcode-widget");
        w.setAttribute("data-type", "schedules");
        w.setAttribute("data-widget-partner", "object");
        w.setAttribute("data-widget-id", C.healcodeWidgetId);
        w.setAttribute("data-widget-version", "1");
        el.classList.add("embed");
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
      el.classList.add("embed-placeholder");
      el.innerHTML =
        '<div class="ph-title">Book through Mindbody</div>' +
        "<p>Our live timetable and booking run on Mindbody. Opening it in a new tab keeps your account, class credits and bookings in one place.</p>" +
        '<div class="cta-row" style="justify-content:center;margin-top:22px">' +
          '<a class="btn solid" href="' + C.mindbodyScheduleUrl + '" target="_blank" rel="noopener">See this week&rsquo;s schedule ↗</a>' +
        "</div>";
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
  });
})();
