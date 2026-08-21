/* ============================================================================
   PRIMAL MOVES VENICE — DESIGN STUDIO
   A small in-page panel for trying colours and photos without touching code.

   WHAT IT DOES        Changes the live page instantly so you can see a choice
                       in context, and hands you the exact config to save.
   WHAT IT DOES NOT DO Save anything. This is a static site — there's no server
                       to write to. Everything lives in your browser until you
                       hit "Copy config" and paste it into the repo (or send it
                       to whoever pushes).

   NOT SECURITY        The /admin gate hides the panel from casual visitors.
                       Anyone determined can turn it on. That's fine, because
                       it cannot change what other people see — only your own
                       browser. Don't mistake it for a login.

   TURN IT ON          Visit /admin/ , or add ?admin=1 to any URL.
   TURN IT OFF         The Exit button, or ?admin=0.
   ========================================================================== */
(function () {
  "use strict";

  var KEY_ON = "pm_studio_on", KEY_COLORS = "pm_studio_colors", KEY_PHOTOS = "pm_studio_photos";

  function q(p) { return new URLSearchParams(location.search).get(p); }
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  if (q("admin") === "1") ls(KEY_ON, "1");
  if (q("admin") === "0") { lsDel(KEY_ON); }
  if (ls(KEY_ON) !== "1") return;

  /* ---------------------------------------------------------------- data -- */

  var PALETTE = [
    ["Cream",       "#EDE8D2"], ["Taupe",      "#DCCFB9"], ["Sage grey",  "#B0AB94"],
    ["Navy",        "#132238"], ["Forest",     "#303F16"], ["Dark olive", "#453A1D"],
    ["Olive",       "#888151"], ["Light sage", "#B9B784"], ["Mushroom",   "#A68460"],
    ["Blush",       "#CD826A"], ["Orange",     "#C16838"], ["Rust",       "#9F663A"],
    ["Brown",       "#945A38"], ["Gold",       "#CE9C3B"], ["Burnt red",  "#AE411C"],
    ["Oxblood",     "#7A3A34"], ["Off-white",  "#F7F3E7"]
  ];

  var ROLES = [
    { v: "--paper",    label: "Page ground",      hint: "the default background" },
    { v: "--paper-2",  label: "Alternate bands",  hint: "every other section" },
    { v: "--deep",     label: "Dark sections",    hint: "and the footer" },
    { v: "--ink",      label: "Body text",        hint: "headings and paragraphs" },
    { v: "--mid",      label: "Secondary text",   hint: "ledes, captions" },
    { v: "--sage",     label: "Accent",           hint: "rules, dots, marks" },
    { v: "--sage-btn", label: "Button fill",      hint: "the primary CTA" },
    { v: "--sage-txt", label: "Accent as text",   hint: "kickers, pull quotes" },
    { v: "--clay",     label: "Second accent",    hint: "used sparingly" }
  ];

  /* ------------------------------------------------------------ contrast -- */

  function lum(hex) {
    var h = hex.replace("#", "");
    var rgb = [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16) / 255; });
    var f = rgb.map(function (v) { return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2];
  }
  function ratio(a, b) {
    var l1 = lum(a), l2 = lum(b), hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "#000000";
  }

  /* --------------------------------------------------------------- state -- */

  var colors = {}, photos = {};
  try { colors = JSON.parse(ls(KEY_COLORS) || "{}"); } catch (e) { colors = {}; }
  try { photos = JSON.parse(ls(KEY_PHOTOS) || "{}"); } catch (e) { photos = {}; }

  function applyColors() {
    Object.keys(colors).forEach(function (k) {
      document.documentElement.style.setProperty(k, colors[k]);
    });
  }
  function applyPhotos() {
    Object.keys(photos).forEach(function (slot) {
      var img = document.querySelector('[data-pm-photo="' + slot + '"]');
      if (!img) return;
      var base = (img.getAttribute("src") || "").replace(/[^/]+$/, "");
      img.src = photos[slot].indexOf("data:") === 0 ? photos[slot] : base + photos[slot];
    });
  }
  applyColors();

  /* ----------------------------------------------------------------- ui --- */

  var css = document.createElement("style");
  css.textContent = [
    "#pm-studio{position:fixed;right:0;top:0;bottom:0;width:334px;z-index:99999;",
    "  background:#15171A;color:#E8E6E0;font:400 13px/1.5 'Helvetica Neue',Helvetica,Inter,Arial,sans-serif;",
    "  display:flex;flex-direction:column;box-shadow:-14px 0 40px rgba(0,0,0,.3);transition:transform .22s ease}",
    "#pm-studio.closed{transform:translateX(334px)}",
    "#pm-studio *,#pm-picker *{box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Inter,Arial,sans-serif}",
    "#pm-studio h2,#pm-studio h3,#pm-studio p,#pm-studio b,#pm-studio div,#pm-studio label,#pm-studio span,#pm-studio code,",
    "#pm-picker h3,#pm-picker p,#pm-picker div,#pm-picker span{color:inherit;font-style:normal;letter-spacing:normal;",
    "  text-transform:none;border:0;background:none;margin:0;padding:0;text-shadow:none}",
    "#pm-studio{color:#E8E6E0}",
    "#pm-studio header{padding:16px 18px;border-bottom:1px solid #2A2D31;display:flex;",
    "  align-items:center;justify-content:space-between;gap:10px;flex:none}",
    "#pm-studio header h2{margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:600;color:#E8E6E0}",
    "#pm-studio header .sub{font-size:11px;color:#8D9198;margin-top:4px}",
    "#pm-tabs{display:flex;gap:2px;padding:12px 14px 0;flex:none}",
    "#pm-tabs button{flex:1;background:none;border:0;border-bottom:2px solid transparent;color:#8D9198;",
    "  font:inherit;font-size:12px;padding:8px 4px;cursor:pointer;letter-spacing:.06em}",
    "#pm-tabs button.on{color:#E8E6E0;border-bottom-color:#8BA85F}",
    "#pm-body{flex:1;overflow-y:auto;padding:16px 18px 10px}",
    "#pm-studio .role{margin-bottom:20px}",
    "#pm-studio .role-h{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:2px}",
    "#pm-studio .role-h b{font-weight:500;font-size:12.5px;color:#E8E6E0}",
    "#pm-studio .role-h code{font:400 10.5px ui-monospace,Menlo,monospace !important;color:#6E737A !important;letter-spacing:0 !important}",
    "#pm-studio .role-hint{font-size:11px;color:#7E838A;margin-bottom:9px}",
    "#pm-studio .sw-row{display:grid;grid-template-columns:repeat(9,1fr);gap:4px}",
    "#pm-studio .sw{aspect-ratio:1;border-radius:3px;border:1px solid rgba(255,255,255,.14);",
    "  cursor:pointer;padding:0;position:relative}",
    "#pm-studio .sw.on{outline:2px solid #8BA85F;outline-offset:1px}",
    "#pm-studio .warn{font-size:10.5px;color:#E0A05A;margin-top:7px;display:none}",
    "#pm-studio .warn.show{display:block}",
    "#pm-studio .field{margin-bottom:16px}",
    "#pm-studio label.tog{display:flex;align-items:center;gap:9px;cursor:pointer;font-size:12.5px}",
    "#pm-studio .slots{display:grid;gap:7px;margin-top:12px}",
    "#pm-studio .slot{display:flex;justify-content:space-between;gap:8px;font-size:11.5px;",
    "  padding:8px 10px;background:#1D2024;border-radius:3px}",
    "#pm-studio .slot b{font-weight:500;color:#B9C79E !important}",
    "#pm-studio .slot span{color:#7E838A !important;text-align:right;word-break:break-all;text-transform:none !important;letter-spacing:0 !important;font-size:11px}",
    "#pm-studio footer{padding:12px 18px 16px;border-top:1px solid #2A2D31;display:grid;gap:7px;flex:none}",
    "#pm-studio button.act{background:#8BA85F;color:#11140E;border:0;border-radius:3px;padding:10px;",
    "  font:inherit;font-weight:600;font-size:12px;cursor:pointer;letter-spacing:.05em}",
    "#pm-studio button.act.ghost{background:transparent !important;color:#B4B9C0 !important;border:1px solid #33373C;font-weight:400}",
    "#pm-studio footer{background:#15171A}",
    "#pm-studio .pm-note,#pm-picker .pm-note{font-size:10.5px;color:#7E838A;line-height:1.45;",
    "  border:0;padding:0;margin:0;font-style:normal;background:none}",
    "#pm-handle{position:fixed;right:334px;top:50%;transform:translateY(-50%);z-index:99999;",
    "  background:#15171A;color:#E8E6E0;border:0;border-radius:4px 0 0 4px;padding:14px 7px;cursor:pointer;",
    "  writing-mode:vertical-rl;font:600 11px/1 'Helvetica Neue',Arial,sans-serif;letter-spacing:.16em;",
    "  transition:right .22s ease}",
    "#pm-studio.closed + #pm-handle{right:0}",
    "body.pm-studio-open{padding-right:334px}",
    "body.pm-studio-open header.site{right:334px}",
    "@media (max-width:900px){body.pm-studio-open header.site{right:0}}",
    /* photo edit badges */
    ".pm-swap-badge{position:absolute;z-index:99990;background:#15171A;color:#fff;border:0;",
    "  border-radius:3px;padding:7px 11px;font:600 11px/1 'Helvetica Neue',Arial,sans-serif;",
    "  letter-spacing:.1em;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.4)}",
    ".pm-swap-badge:hover{background:#8BA85F;color:#11140E}",
    /* picker */
    "#pm-picker{position:fixed;top:0;bottom:0;left:0;right:334px;z-index:99998;background:rgba(10,11,13,.82);display:flex;",
    "@media (max-width:900px){#pm-picker{right:0}}",
    "  align-items:center;justify-content:center;padding:30px}",
    "#pm-picker .box{background:#15171A;color:#E8E6E0;border-radius:5px;max-width:940px;width:100%;",
    "  max-height:86vh;display:flex;flex-direction:column;font:400 13px/1.5 'Helvetica Neue',Arial,sans-serif}",
    "#pm-picker .box h3{margin:0;padding:17px 20px;border-bottom:1px solid #2A2D31;font-size:13px;font-weight:500}",
    "#pm-picker .box h3 span{color:#8BA85F}",
    "#pm-picker .grid{overflow-y:auto;padding:16px 20px;display:grid;",
    "  grid-template-columns:repeat(auto-fill,minmax(132px,1fr));gap:11px}",
    "#pm-picker .grid button{padding:0;border:1px solid #2A2D31;background:#1D2024;border-radius:3px;",
    "  cursor:pointer;overflow:hidden;display:block}",
    "#pm-picker .grid img{width:100%;height:92px;object-fit:cover;display:block}",
    "#pm-picker .grid .nm{font-size:10px;color:#8D9198;padding:5px 6px;word-break:break-all;text-align:left}",
    "#pm-picker .foot{padding:14px 20px;border-top:1px solid #2A2D31;display:flex;gap:9px;align-items:center;flex-wrap:wrap}",
    "#pm-picker .foot .pm-note{flex:1;min-width:200px}",
    "@media (max-width:900px){#pm-studio{width:100%}#pm-studio.closed{transform:translateX(100%)}",
    "  body.pm-studio-open{padding-right:0}#pm-handle{right:0}}"
  ].join("\n");
  document.head.appendChild(css);

  var panel = document.createElement("aside");
  panel.id = "pm-studio";
  panel.innerHTML =
    '<header><div><h2>Design studio</h2><div class="sub">Preview only · nothing is saved</div></div></header>' +
    '<div id="pm-tabs"><button data-tab="color" class="on">Colour</button>' +
    '<button data-tab="photo">Photos</button></div>' +
    '<div id="pm-body"></div>' +
    '<footer>' +
      '<button class="act" id="pm-copy">Copy config</button>' +
      '<button class="act ghost" id="pm-reset">Reset to saved</button>' +
      '<button class="act ghost" id="pm-exit">Exit studio</button>' +
      '<p class="pm-note">Changes are yours alone until the copied config is pasted into the repo.</p>' +
    '</footer>';
  document.body.appendChild(panel);

  var handle = document.createElement("button");
  handle.id = "pm-handle";
  handle.textContent = "STUDIO";
  document.body.appendChild(handle);
  document.body.classList.add("pm-studio-open");

  handle.addEventListener("click", function () {
    var closed = panel.classList.toggle("closed");
    document.body.classList.toggle("pm-studio-open", !closed);
  });

  /* ------------------------------------------------------------ colour ---- */

  function renderColor() {
    var body = document.getElementById("pm-body");
    body.innerHTML = ROLES.map(function (r) {
      var cur = (colors[r.v] || cssVar(r.v)).toUpperCase();
      var sws = PALETTE.map(function (p) {
        var on = p[1].toUpperCase() === cur ? " on" : "";
        return '<button class="sw' + on + '" style="background:' + p[1] + '" title="' + p[0] + " " + p[1] +
               '" data-var="' + r.v + '" data-hex="' + p[1] + '"></button>';
      }).join("");
      return '<div class="role" data-role="' + r.v + '">' +
        '<div class="role-h"><b>' + r.label + "</b><code>" + cur + "</code></div>" +
        '<div class="role-hint">' + r.hint + "</div>" +
        '<div class="sw-row">' + sws + "</div>" +
        '<div class="warn"></div></div>';
    }).join("");
    checkContrast();
  }

  function checkContrast() {
    var ground = colors["--paper"] || cssVar("--paper");
    [["--ink", 4.5, "Body text"], ["--mid", 4.5, "Secondary text"],
     ["--sage-txt", 4.5, "Accent text"], ["--clay", 4.5, "Second accent"]].forEach(function (t) {
      var el = document.querySelector('.role[data-role="' + t[0] + '"] .warn');
      if (!el) return;
      var c = colors[t[0]] || cssVar(t[0]);
      var r = ratio(c, ground);
      if (r < t[1]) {
        el.textContent = "⚠ " + r.toFixed(2) + ":1 on the page ground — needs 4.5 for body text.";
        el.classList.add("show");
      } else { el.classList.remove("show"); }
    });
    var btn = document.querySelector('.role[data-role="--sage-btn"] .warn');
    if (btn) {
      var f = colors["--sage-btn"] || cssVar("--sage-btn");
      var r2 = ratio(cssVar("--cream") || "#F7F3E7", f);
      if (r2 < 4.5) {
        btn.textContent = "⚠ " + r2.toFixed(2) + ":1 against the button label — the text will be hard to read.";
        btn.classList.add("show");
      } else { btn.classList.remove("show"); }
    }
  }

  /* ------------------------------------------------------------- photos --- */

  var library = null, badgesOn = false;

  function loadLibrary() {
    if (library) return Promise.resolve(library);
    var base = (document.querySelector("[data-pm-photo]") || {}).src || "";
    var dir = base.replace(/[^/]+$/, "");
    var jsonUrl = (document.querySelector('link[rel="stylesheet"][href*="style.css"]') || {}).href || "";
    jsonUrl = jsonUrl.replace(/style\.css.*$/, "photos.json");
    return fetch(jsonUrl).then(function (r) { return r.json(); })
      .then(function (d) { library = { dir: dir, files: d.photos || [] }; return library; })
      .catch(function () { library = { dir: dir, files: [] }; return library; });
  }

  function renderPhoto() {
    var body = document.getElementById("pm-body");
    var slots = [].slice.call(document.querySelectorAll("[data-pm-photo]"));
    body.innerHTML =
      '<div class="field"><label class="tog"><input type="checkbox" id="pm-badges"' +
      (badgesOn ? " checked" : "") + "> Show a swap button on every photo</label>" +
      '<p class="pm-note" style="margin-top:8px">' + slots.length +
      " photo slot" + (slots.length === 1 ? "" : "s") + " on this page. Other pages have their own.</p></div>" +
      '<div class="slots">' + (slots.length ? slots.map(function (img) {
        var slot = img.getAttribute("data-pm-photo");
        var file = photos[slot] || (img.getAttribute("src") || "").split("/").pop();
        if (file.indexOf("data:") === 0) file = "(local preview)";
        return '<div class="slot"><b>' + slot + "</b><span>" + file + "</span></div>";
      }).join("") : '<p class="pm-note">No photo slots on this page.</p>') + "</div>";
    document.getElementById("pm-badges").addEventListener("change", function (e) {
      badgesOn = e.target.checked;
      badgesOn ? showBadges() : hideBadges();
    });
  }

  function hideBadges() {
    [].slice.call(document.querySelectorAll(".pm-swap-badge")).forEach(function (b) { b.remove(); });
  }

  function showBadges() {
    hideBadges();
    [].slice.call(document.querySelectorAll("[data-pm-photo]")).forEach(function (img) {
      var b = document.createElement("button");
      b.className = "pm-swap-badge";
      b.textContent = "SWAP";
      b.addEventListener("click", function (ev) { ev.preventDefault(); openPicker(img); });
      document.body.appendChild(b);
      var place = function () {
        var r = img.getBoundingClientRect();
        if (r.width < 2) { b.style.display = "none"; return; }
        b.style.display = "";
        b.style.position = "absolute";
        b.style.top = (window.scrollY + r.top + 12) + "px";
        b.style.left = (window.scrollX + r.left + 12) + "px";
      };
      place();
      window.addEventListener("scroll", place, { passive: true });
      window.addEventListener("resize", place);
    });
  }

  function openPicker(img) {
    var slot = img.getAttribute("data-pm-photo");
    loadLibrary().then(function (lib) {
      var wrap = document.createElement("div");
      wrap.id = "pm-picker";
      wrap.innerHTML =
        '<div class="box"><h3>Swap <span>' + slot + "</span></h3>" +
        '<div class="grid">' + lib.files.map(function (f) {
          return '<button data-file="' + f + '"><img src="' + lib.dir + f + '" alt="" loading="lazy">' +
                 '<div class="nm">' + f + "</div></button>";
        }).join("") + "</div>" +
        '<div class="foot"><label class="act ghost" style="cursor:pointer">Upload from this computer' +
        '<input type="file" accept="image/*" id="pm-file" hidden></label>' +
        '<button class="act ghost" id="pm-close">Cancel</button>' +
        '<p class="pm-note">An upload previews here only — the file still has to be added to ' +
        "assets/photos/ in the repo to go live.</p></div></div>";
      document.body.appendChild(wrap);

      wrap.addEventListener("click", function (e) {
        if (e.target === wrap || e.target.id === "pm-close") wrap.remove();
        var btn = e.target.closest("button[data-file]");
        if (btn) {
          photos[slot] = btn.getAttribute("data-file");
          ls(KEY_PHOTOS, JSON.stringify(photos));
          applyPhotos(); renderPhoto(); if (badgesOn) showBadges();
          wrap.remove();
        }
      });
      wrap.querySelector("#pm-file").addEventListener("change", function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        var rd = new FileReader();
        rd.onload = function () {
          photos[slot] = rd.result;
          ls(KEY_PHOTOS, JSON.stringify(photos));
          applyPhotos(); renderPhoto(); if (badgesOn) showBadges();
          wrap.remove();
        };
        rd.readAsDataURL(f);
      });
    });
  }

  /* ---------------------------------------------------------------- wire -- */

  document.getElementById("pm-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-tab]");
    if (!b) return;
    [].slice.call(this.querySelectorAll("button")).forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
    b.dataset.tab === "color" ? renderColor() : renderPhoto();
  });

  document.getElementById("pm-body").addEventListener("click", function (e) {
    var sw = e.target.closest(".sw");
    if (!sw) return;
    colors[sw.dataset.var] = sw.dataset.hex;
    ls(KEY_COLORS, JSON.stringify(colors));
    applyColors(); renderColor();
  });

  document.getElementById("pm-copy").addEventListener("click", function () {
    var out = "/* Paste into :root in design-9/style.css */\n:root{\n";
    ROLES.forEach(function (r) {
      if (colors[r.v]) out += "  " + r.v + ":" + colors[r.v] + ";  /* " + r.label + " */\n";
    });
    out += "}\n";
    var named = Object.keys(photos).filter(function (k) { return photos[k].indexOf("data:") !== 0; });
    if (named.length) {
      out += "\n/* Paste into the photos block in design-9/config.js */\nphotos: {\n";
      out += named.map(function (k) { return '  "' + k + '": "' + photos[k] + '"'; }).join(",\n");
      out += "\n},\n";
    }
    var skipped = Object.keys(photos).length - named.length;
    if (skipped) out += "\n/* " + skipped + " uploaded preview(s) not included — add those files to assets/photos/ first. */\n";
    if (out.indexOf("--") === -1 && !named.length) out = "/* Nothing changed yet. */";
    navigator.clipboard ? navigator.clipboard.writeText(out).then(flash, function () { prompt("Copy:", out); })
                        : prompt("Copy:", out);
    function flash() {
      var b = document.getElementById("pm-copy"), t = b.textContent;
      b.textContent = "Copied ✓"; setTimeout(function () { b.textContent = t; }, 1400);
    }
  });

  document.getElementById("pm-reset").addEventListener("click", function () {
    colors = {}; photos = {};
    lsDel(KEY_COLORS); lsDel(KEY_PHOTOS);
    location.reload();
  });

  document.getElementById("pm-exit").addEventListener("click", function () {
    lsDel(KEY_ON); lsDel(KEY_COLORS); lsDel(KEY_PHOTOS);
    location.href = location.pathname;
  });

  if (Object.keys(photos).length) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyPhotos);
    else setTimeout(applyPhotos, 60);
  }
  renderColor();
})();
