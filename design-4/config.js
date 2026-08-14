/* ============================================================================
   PRIMAL MOVES VENICE — SITE CONFIG
   ----------------------------------------------------------------------------
   This is the only file you need to edit to wire up the third-party embeds.
   Fill in a value, save, push. Anything left as "" shows a friendly
   "coming soon" placeholder instead of a broken embed.
   ========================================================================== */

window.PM_CONFIG = {

  /* --- LUMA EVENTS ------------------------------------------------------- */
  // Your public Luma calendar page.  e.g. "https://lu.ma/primalmovesvenice"
  lumaPageUrl: "",

  // Luma embed URL. Get it from: your Luma calendar → Manage Calendar →
  // Embed → "Embed Calendar", then copy the src="..." out of the snippet.
  // Looks like: "https://lu.ma/embed/calendar/cal-XXXXXXXXXXXXXXX/events"
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

  // Leave as "" to use the standard Mindbody schedule embed built from the
  // site ID above. If you generate a branded Healcode widget in your Mindbody
  // account, paste its full iframe/script src here to override.
  mindbodyEmbedOverride: "",


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

  C.mindbodyScheduleUrl = C.mindbodyEmbedOverride ||
    ("https://clients.mindbodyonline.com/classic/ws?studioid=" + C.mindbodySiteId +
     "&stype=-7&sView=week&sLoc=0&sTG=0");
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
        el.classList.remove("embed");
        el.classList.add("embed-placeholder");
        el.innerHTML =
          '<div class="ph-title">' +
            (el.getAttribute("data-pm-embed-label") || "Not connected yet") +
          "</div>" +
          "<p>" + (el.getAttribute("data-pm-embed-hint") || "") + "</p>" +
          '<p style="margin-top:10px">Set <code>' + key +
          "</code> in <code>design-4/config.js</code> to switch this on.</p>";
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
  });
})();
