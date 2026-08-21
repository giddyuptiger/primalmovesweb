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

  var KEY_ON = "pm_studio_on", KEY_COLORS = "pm_studio_colors", KEY_PHOTOS = "pm_studio_photos",
      KEY_FOCUS = "pm_studio_focus", KEY_LOCAL = "pm_studio_local", KEY_WKEY = "pm_studio_wkey", KEY_COPY = "pm_studio_copy";

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
  var focus = {};
  try { focus = JSON.parse(ls(KEY_FOCUS) || "{}"); } catch (e) { focus = {}; }
  function applyFocus() {
    Object.keys(focus).forEach(function (slot) {
      var el = document.querySelector('[data-pm-photo="' + slot + '"]');
      if (el && el.tagName === "IMG") el.style.objectPosition = focus[slot];
    });
  }

  function applyColors() {
    Object.keys(colors).forEach(function (k) {
      document.documentElement.style.setProperty(k, colors[k]);
    });
  }
  function photoBase() {
    var any = document.querySelector("img[data-pm-photo]");
    if (any) return (any.getAttribute("src") || "").replace(/[^/]+$/, "");
    var css = document.querySelector('link[rel="stylesheet"][href*="style.css"]');
    return css ? css.href.replace(/design-9\/style\.css.*$/, "assets/photos/") : "../../assets/photos/";
  }
  function applyPhotos() {
    Object.keys(photos).forEach(function (slot) {
      var el = document.querySelector('[data-pm-photo="' + slot + '"]');
      if (!el) return;
      var src = photos[slot].indexOf("data:") === 0 ? photos[slot] : photoBase() + photos[slot];
      if (el.tagName === "IMG") { el.src = src; return; }
      // an empty slot becomes a real image, keeping the slot name
      var img = document.createElement("img");
      img.setAttribute("data-pm-photo", slot);
      img.src = src; img.alt = "";
      img.style.cssText = "width:100%;height:100%;object-fit:cover;border-radius:3px;display:block";
      el.replaceWith(img);
    });
  }
  applyColors();

  /* ----------------------------------------------------------------- ui --- */

  var css = document.createElement("style");
  css.textContent = [
    "#pm-studio{position:fixed;right:0;top:0;bottom:0;width:344px;z-index:99999;",
    "  background:#15171A;color:#E8E6E0;font:400 13px/1.55 'Helvetica Neue',Helvetica,Inter,Arial,sans-serif;",
    "  display:flex;flex-direction:column;box-shadow:-14px 0 40px rgba(0,0,0,.3);transition:transform .22s ease}",
    "#pm-studio.closed{transform:translateX(344px)}",
    "#pm-studio *,#pm-picker *{box-sizing:border-box;font-family:'Helvetica Neue',Helvetica,Inter,Arial,sans-serif}",
    /* Reset only TEXT elements — resetting div wiped the panel's own padding,
       which is what made it feel cramped. */
    "#pm-studio h2,#pm-studio h3,#pm-studio p,#pm-studio b,#pm-studio label,#pm-studio span,#pm-studio code,",
    "#pm-picker h3,#pm-picker p,#pm-picker span{color:inherit;font-style:normal;letter-spacing:normal;",
    "  text-transform:none;border:0;background:none;margin:0;padding:0;text-shadow:none;line-height:inherit}",
    "#pm-studio div,#pm-picker div{color:inherit;font-style:normal;text-transform:none;text-shadow:none;",
    "  border:0;background:none;margin:0;letter-spacing:normal}",
    "#pm-studio{color:#E8E6E0}",

    /* header */
    "#pm-studio header{padding:20px 22px 18px;border-bottom:1px solid #2A2D31;flex:none}",
    "#pm-studio header h2{font-size:11.5px;letter-spacing:.2em;text-transform:uppercase;font-weight:600;color:#E8E6E0}",
    "#pm-studio header .sub{font-size:11.5px;color:#8D9198;margin-top:6px}",

    /* tabs */
    "#pm-tabs{display:flex;gap:0;padding:0 22px;border-bottom:1px solid #2A2D31;flex:none}",
    "#pm-tabs button{flex:1;background:none;border:0;border-bottom:2px solid transparent;color:#8D9198;",
    "  font:inherit;font-size:12.5px;font-weight:500;padding:14px 4px 12px;cursor:pointer;margin-bottom:-1px}",
    "#pm-tabs button.on{color:#E8E6E0;border-bottom-color:#8BA85F}",

    /* body */
    "#pm-body{flex:1;overflow-y:auto;padding:22px 22px 24px}",
    "#pm-studio .role{margin-bottom:26px}",
    "#pm-studio .role:last-child{margin-bottom:8px}",
    "#pm-studio .role-h{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:3px}",
    "#pm-studio .role-h code{flex:none}",
    "#pm-studio .role-h b{font-weight:500;font-size:13px;color:#E8E6E0}",
    "#pm-studio .role-h code{font:400 10.5px ui-monospace,Menlo,monospace !important;color:#6E737A !important;letter-spacing:0 !important}",
    "#pm-studio .role-hint{font-size:11.5px;color:#7E838A;margin-bottom:11px}",
    "#pm-studio .sw-row{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}",
    "#pm-studio .sw{aspect-ratio:1;border-radius:3px;border:1px solid rgba(255,255,255,.14);",
    "  cursor:pointer;padding:0;position:relative;transition:transform .12s ease}",
    "#pm-studio .sw:hover{transform:scale(1.14)}",
    "#pm-studio .sw.on{outline:2px solid #8BA85F;outline-offset:2px}",
    "#pm-studio .warn{font-size:11px;color:#E0A05A;margin-top:9px;line-height:1.45;display:none}",
    "#pm-studio .warn.show{display:block}",

    /* photos tab */
    "#pm-studio .field{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #23262A}",
    "#pm-studio .slots{display:grid;gap:8px}",
    "#pm-studio .slot{display:grid;gap:3px;font-size:11.5px;padding:11px 13px;",
    "  background:#1D2024;border-radius:4px}",
    "#pm-studio .slot b{font-weight:500;color:#B9C79E !important;font-size:12px}",
    "#pm-studio .slot span{color:#7E838A !important;text-transform:none !important;letter-spacing:0 !important;",
    "  font-size:11px;word-break:break-all}",

    /* footer */
    "#pm-studio footer{padding:16px 22px 20px;border-top:1px solid #2A2D31;display:grid;gap:9px;",
    "  flex:none;background:#15171A}",
    "#pm-studio button.act{background:#8BA85F;color:#11140E;border:0;border-radius:4px;padding:12px;",
    "  font:inherit;font-weight:600;font-size:12.5px;cursor:pointer;letter-spacing:.04em}",
    "#pm-studio button.act:hover{background:#9CBA6C}",
    "#pm-studio button.act.ghost{background:transparent !important;color:#B4B9C0 !important;",
    "  border:1px solid #33373C;font-weight:400}",
    "#pm-studio button.act.ghost:hover{border-color:#4A4F55;color:#E8E6E0 !important}",
    "#pm-studio .pm-note,#pm-picker .pm-note{font-size:11px;color:#7E838A;line-height:1.5;",
    "  border:0;padding:0;margin:0;font-style:normal;background:none}",
    "#pm-studio footer .pm-note{margin-top:3px}",

    /* handle */
    "#pm-handle{position:fixed;right:344px;top:50%;transform:translateY(-50%);z-index:99999;",
    "  background:#15171A;color:#E8E6E0;border:0;border-radius:5px 0 0 5px;padding:16px 8px;cursor:pointer;",
    "  writing-mode:vertical-rl;font:600 11.5px/1 'Helvetica Neue',Arial,sans-serif;letter-spacing:.22em;",
    "  transition:right .22s ease}",
    "#pm-studio.closed + #pm-handle{right:0}",
    "body.pm-studio-open{padding-right:344px;overflow-x:hidden}",
    "body.pm-studio-open header.site{right:344px}",
    "@media (max-width:900px){body.pm-studio-open header.site{right:0}}",

    /* swap / focus badges */
    ".pm-swap-badge{position:fixed;z-index:99992;display:flex;gap:1px;border-radius:4px;overflow:hidden;",
    "  box-shadow:0 3px 14px rgba(0,0,0,.45)}",
    ".pm-swap-badge button{background:#15171A;color:#fff;border:0;padding:8px 13px;cursor:pointer;",
    "  font:600 11px/1 'Helvetica Neue',Arial,sans-serif;letter-spacing:.08em}",
    ".pm-swap-badge button:hover{background:#8BA85F;color:#11140E}",

    /* focus picker overlay */
    ".pm-focus{box-shadow:inset 0 0 0 2px #8BA85F, 0 0 0 9999px rgba(10,11,13,.45)}",
    ".pm-focus-dot{position:absolute;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;",
    "  border:2px solid #fff;background:rgba(139,168,95,.55);box-shadow:0 0 0 2px rgba(0,0,0,.4)}",
    ".pm-focus-hint{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);white-space:nowrap;",
    "  background:#15171A;color:#E8E6E0;padding:8px 14px;border-radius:4px;",
    "  font:400 12px/1 'Helvetica Neue',Arial,sans-serif}",

    /* picker */
    "#pm-picker{position:fixed;top:0;bottom:0;left:0;right:344px;z-index:99998;background:rgba(10,11,13,.82);",
    "  display:flex;align-items:center;justify-content:center;padding:30px}",
    "@media (max-width:900px){#pm-picker{right:0}}",
    "#pm-picker .box{background:#15171A;color:#E8E6E0;border-radius:6px;max-width:940px;width:100%;",
    "  max-height:86vh;display:flex;flex-direction:column;font:400 13px/1.55 'Helvetica Neue',Arial,sans-serif}",
    "#pm-picker .box h3{padding:18px 22px;border-bottom:1px solid #2A2D31;font-size:13px;font-weight:500}",
    "#pm-picker .box h3 span{color:#8BA85F}",
    "#pm-picker .grid{overflow-y:auto;padding:18px 22px;display:grid;",
    "  grid-template-columns:repeat(auto-fill,minmax(136px,1fr));gap:12px}",
    "#pm-picker .grid button{padding:0;border:1px solid #2A2D31;background:#1D2024;border-radius:4px;",
    "  cursor:pointer;overflow:hidden;display:block}",
    "#pm-picker .grid button:hover{border-color:#8BA85F}",
    "#pm-picker .grid img{width:100%;height:94px;object-fit:cover;display:block}",
    "#pm-picker .grid .nm{font-size:10px;color:#8D9198;padding:6px 7px;word-break:break-all;text-align:left}",
    "#pm-picker .foot{padding:16px 22px;border-top:1px solid #2A2D31;display:flex;gap:10px;",
    "  align-items:center;flex-wrap:wrap}",
    "#pm-picker .foot .pm-note{flex:1;min-width:210px}",
    "#pm-picker .act{background:transparent;color:#B4B9C0;border:1px solid #33373C;border-radius:4px;",
    "  padding:10px 16px;font:inherit;font-size:12.5px;cursor:pointer}",
    "#pm-picker .act:hover{border-color:#4A4F55;color:#E8E6E0}",

    /* presets */
    ".pm-swap-badge button.on{background:#8BA85F;color:#11140E}",
    ".pm-editing{outline:1px dashed rgba(139,168,95,.75);outline-offset:4px;border-radius:2px;",
    "  transition:outline-color .15s ease}",
    ".pm-editing:hover{outline-color:#8BA85F;outline-style:solid}",
    ".pm-editing:focus{outline:2px solid #8BA85F;outline-offset:4px;background:rgba(139,168,95,.10)}",
    "body.pm-copy-mode .pm-swap-badge{opacity:.28}",
    "#pm-studio label.tog{display:flex;align-items:center;gap:10px;cursor:pointer;font-size:12.5px;color:#E8E6E0}",
    "#pm-studio label.tog input{accent-color:#8BA85F;width:15px;height:15px}",
    "#pm-studio .p-lab{display:block;font-size:12px;font-weight:500;color:#E8E6E0;margin-bottom:10px}",
    "#pm-studio input[type=text]{width:100%;background:#1D2024;border:1px solid #2F3338;border-radius:4px;",
    "  color:#E8E6E0;font:inherit;font-size:12.5px;padding:10px 12px;margin-bottom:8px}",
    "#pm-studio input[type=text]:focus{outline:0;border-color:#8BA85F}",
    "#pm-studio input::placeholder{color:#5F646A}",
    "#pm-studio .p-actions{display:grid;gap:7px;margin-top:4px}",
    "#pm-studio .p-group{margin-bottom:24px}",
    "#pm-studio .p-group h4{font-size:10.5px;font-weight:600;letter-spacing:.18em;text-transform:uppercase;",
    "  color:#7E838A;margin-bottom:11px}",
    "#pm-studio .preset{background:#1D2024;border:1px solid #26292E;border-radius:5px;",
    "  padding:13px 14px;margin-bottom:9px}",
    "#pm-studio .preset .p-top{display:flex;justify-content:space-between;align-items:center;gap:10px}",
    "#pm-studio .preset b{font-size:12.5px;font-weight:600;color:#E8E6E0}",
    "#pm-studio .p-apply{font-size:11px;font-weight:600;letter-spacing:.08em;color:#8BA85F;cursor:pointer;flex:none}",
    "#pm-studio .p-apply:hover{color:#B4D18A;text-decoration:underline}",
    "#pm-studio .p-note{font-size:11px;color:#7E838A;margin-top:5px;line-height:1.45}",
    "#pm-studio .p-chips{display:flex;gap:3px;margin-top:10px}",
    "#pm-studio .p-chips i{width:17px;height:17px;border-radius:3px;display:block;",
    "  border:1px solid rgba(255,255,255,.12)}",
    "#pm-studio .preset .p-del{margin-top:11px;background:none;border:0;color:#6E737A;cursor:pointer;",
    "  font:inherit;font-size:11px;padding:0}",
    "#pm-studio .preset .p-del:hover{color:#D08A72}",
    "#pm-studio code{font:400 11px ui-monospace,Menlo,monospace !important;color:#B9C79E !important;",
    "  background:#23262A;padding:1px 5px;border-radius:3px}",
    "@media (max-width:900px){#pm-studio{width:100%}#pm-studio.closed{transform:translateX(100%)}",
    "  body.pm-studio-open{padding-right:0}#pm-handle{right:0}}"
  ].join("\n");
  document.head.appendChild(css);

  var panel = document.createElement("aside");
  panel.id = "pm-studio";
  panel.innerHTML =
    '<header><div><h2>Design studio</h2><div class="sub">Preview only · nothing is saved</div></div></header>' +
    '<div id="pm-tabs"><button data-tab="color" class="on">Colour</button>' +
    '<button data-tab="photo">Photos</button>' +
    '<button data-tab="copy">Copy</button>' +
    '<button data-tab="preset">Presets</button></div>' +
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
  handle.textContent = "EDIT";
  document.body.appendChild(handle);
  document.body.classList.add("pm-studio-open");
  // set the offsets from JS too, so this can never depend on a cached stylesheet
  var siteHdr = document.querySelector("header.site");
  function setInset(w) {
    document.documentElement.style.setProperty("--pm-studio-w", w + "px");
    document.body.style.setProperty("padding-right", w + "px", "important");
    if (!siteHdr) return;
    // belt and braces: `right` alone depends on the header still being
    // position:fixed with left:0. Setting width as well survives a cached
    // stylesheet, a sticky header, or anything else the cascade throws.
    if (w) {
      siteHdr.style.setProperty("right", w + "px", "important");
      siteHdr.style.setProperty("width", "calc(100% - " + w + "px)", "important");
      siteHdr.style.setProperty("max-width", "calc(100% - " + w + "px)", "important");
    } else {
      ["right", "width", "max-width"].forEach(function (k) { siteHdr.style.removeProperty(k); });
    }
  }
  var W = window.matchMedia("(max-width:900px)").matches ? 0 : 344;
  setInset(W);
  window.addEventListener("resize", function () {
    if (!panel.classList.contains("closed")) {
      setInset(window.matchMedia("(max-width:900px)").matches ? 0 : 344);
    }
  });

  handle.addEventListener("click", function () {
    var closed = panel.classList.toggle("closed");
    document.body.classList.toggle("pm-studio-open", !closed);
    setInset(closed ? 0 : (window.matchMedia("(max-width:900px)").matches ? 0 : 344));
    if (closed) { hideBadges(); closeFocus(); if (copyOn) stopCopy(); }
    else {
      showBadges();
      [].slice.call(document.querySelectorAll(".pm-swap-badge")).forEach(function (x) { if (x._place) x._place(); });
    }
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

  var library = null;

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
      '<div class="field"><p class="pm-note">A <b style="color:#B9C79E">Swap</b> button sits on every photo while this panel is open &mdash; empty slots included.</p>' +
      '<p class="pm-note" style="margin-top:8px">' + slots.length +
      " photo slot" + (slots.length === 1 ? "" : "s") + " on this page. Other pages have their own.</p></div>" +
      '<div class="slots">' + (slots.length ? slots.map(function (img) {
        var slot = img.getAttribute("data-pm-photo");
        var file = photos[slot] || (img.getAttribute("src") || "").split("/").pop();
        if (file.indexOf("data:") === 0) file = "(local preview)";
        var f = focus[slot] ? ' &middot; focus ' + focus[slot] : "";
        return '<div class="slot"><b>' + slot + "</b><span>" + file + f + "</span></div>";
      }).join("") : '<p class="pm-note">No photo slots on this page.</p>') + "</div>";
  }

  function hideBadges() {
    [].slice.call(document.querySelectorAll(".pm-swap-badge")).forEach(function (b) { b.remove(); });
  }

  function navH() {
    var h = document.querySelector("header.site");
    return h ? h.offsetHeight : 0;
  }

  function showBadges() {
    hideBadges();
    [].slice.call(document.querySelectorAll("[data-pm-photo]")).forEach(function (el) {
      var b = document.createElement("div");
      b.className = "pm-swap-badge";
      var isImg = el.tagName === "IMG";
      b.innerHTML = '<button data-a="swap">' + (isImg ? "Swap" : "+ Add photo") + "</button>" +
                    (isImg ? '<button data-a="focus">Focus</button>' : "");
      b.addEventListener("click", function (ev) {
        var t = ev.target.closest("button"); if (!t) return;
        ev.preventDefault(); ev.stopPropagation();
        if (t.dataset.a === "swap") { openPicker(el); return; }
        // Focus is a toggle — pressing it again leaves focus mode
        if (activeFocus === el) { closeFocus(); return; }
        focusMode(el);
      });
      b._el = el;
      document.body.appendChild(b);
      var place = function () {
        var r = el.getBoundingClientRect();
        if (r.width < 2 || r.bottom < 0 || r.top > window.innerHeight) { b.style.visibility = "hidden"; return; }
        b.style.visibility = "";
        b.style.position = "fixed";
        // keep clear of the fixed nav, and of the bottom of the element
        var top = Math.min(Math.max(r.top + 14, navH() + 14), r.bottom - 44);
        b.style.top = Math.max(top, navH() + 14) + "px";
        // full-bleed images: sit on the content gutter, not the window edge
        var gut = Math.max(24, Math.min(80, window.innerWidth * 0.045));
        b.style.left = Math.round(Math.max(r.left + 14, r.width > window.innerWidth * 0.9 ? gut : r.left + 14)) + "px";
      };
      place();
      window.addEventListener("scroll", place, { passive: true });
      window.addEventListener("resize", place);
      b._place = place;
    });
  }

  var activeFocus = null, activeFocusLayer = null;
  function closeFocus() {
    if (activeFocusLayer) activeFocusLayer.remove();
    activeFocusLayer = null; activeFocus = null;
    [].slice.call(document.querySelectorAll('.pm-swap-badge button[data-a="focus"]'))
      .forEach(function (x) { x.classList.remove("on"); x.textContent = "Focus"; });
  }

  function focusMode(img) {
    closeFocus();
    var slot = img.getAttribute("data-pm-photo");
    var r = img.getBoundingClientRect();
    var lay = document.createElement("div");
    lay.className = "pm-focus";
    lay.style.cssText = "position:fixed;top:" + r.top + "px;left:" + r.left + "px;width:" +
      r.width + "px;height:" + r.height + "px;z-index:99988;cursor:crosshair;";
    lay.innerHTML = '<div class="pm-focus-dot"></div>' +
      '<div class="pm-focus-hint">Click the part that should stay in frame &middot; <b>Esc</b> to finish</div>';
    document.body.appendChild(lay);
    activeFocus = img; activeFocusLayer = lay;
    [].slice.call(document.querySelectorAll(".pm-swap-badge")).forEach(function (bd) {
      var fb = bd.querySelector('button[data-a="focus"]');
      if (fb && bd._el === img) { fb.classList.add("on"); fb.textContent = "Done"; }
    });
    var dot = lay.querySelector(".pm-focus-dot");
    var cur = (focus[slot] || "50% 50%").split(" ");
    dot.style.left = cur[0]; dot.style.top = cur[1];

    function set(ev) {
      var box = lay.getBoundingClientRect();
      var x = Math.round(Math.max(0, Math.min(100, ((ev.clientX - box.left) / box.width) * 100)));
      var y = Math.round(Math.max(0, Math.min(100, ((ev.clientY - box.top) / box.height) * 100)));
      focus[slot] = x + "% " + y + "%";
      ls(KEY_FOCUS, JSON.stringify(focus));
      img.style.objectPosition = focus[slot];
      dot.style.left = x + "%"; dot.style.top = y + "%";
      renderPhoto();
    }
    lay.addEventListener("click", set);
    function esc(e) {
      if (e.key !== "Escape") return;
      document.removeEventListener("keydown", esc);
      closeFocus();
    }
    document.addEventListener("keydown", esc);
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
          applyPhotos(); renderPhoto(); showBadges();
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
          applyPhotos(); renderPhoto(); showBadges();
          wrap.remove();
        };
        rd.readAsDataURL(f);
      });
    });
  }

  /* --------------------------------------------------------------- copy --- */
  /* Text is edited in place with contenteditable, keyed by data-pm-copy.
     Same deal as everything else here: it previews live and exports a file.
     It does not write to the site.                                        */

  var copyEdits = {};
  try { copyEdits = JSON.parse(ls(KEY_COPY) || "{}"); } catch (e) { copyEdits = {}; }
  var copyOn = false, originals = {};

  function applyCopy() {
    Object.keys(copyEdits).forEach(function (k) {
      var el = document.querySelector('[data-pm-copy="' + k + '"]');
      if (el && el.innerHTML !== copyEdits[k]) el.innerHTML = copyEdits[k];
    });
  }

  function copyTargets() {
    return [].slice.call(document.querySelectorAll("[data-pm-copy]")).filter(function (el) {
      return !el.closest("#pm-studio") && !el.closest("#pm-picker") && (el.textContent || "").trim();
    });
  }

  function startCopy() {
    copyOn = true;
    copyTargets().forEach(function (el) {
      var k = el.getAttribute("data-pm-copy");
      if (!(k in originals)) originals[k] = el.innerHTML;
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "true");
      el.classList.add("pm-editing");
      el.addEventListener("input", onEdit);
      el.addEventListener("keydown", onKey);
      el.addEventListener("blur", onBlur);
    });
    document.body.classList.add("pm-copy-mode");
  }

  function stopCopy() {
    copyOn = false;
    copyTargets().forEach(function (el) {
      el.removeAttribute("contenteditable");
      el.classList.remove("pm-editing");
      el.removeEventListener("input", onEdit);
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("blur", onBlur);
    });
    document.body.classList.remove("pm-copy-mode");
  }

  function onKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.target.blur(); }
    if (e.key === "Escape") {
      var k = e.target.getAttribute("data-pm-copy");
      if (k in originals) e.target.innerHTML = originals[k];
      delete copyEdits[k];
      ls(KEY_COPY, JSON.stringify(copyEdits));
      e.target.blur(); renderCopy();
    }
  }

  // the list of changes refreshes when you leave a field, not on every
  // keystroke — re-rendering mid-type would steal the caret
  function onBlur() { if (copyOn) renderCopy(); }

  function onEdit(e) {
    var el = e.target, k = el.getAttribute("data-pm-copy");
    if (el.innerHTML === originals[k]) delete copyEdits[k];
    else copyEdits[k] = el.innerHTML;
    ls(KEY_COPY, JSON.stringify(copyEdits));
    var n = document.getElementById("pm-copy-count");
    if (n) n.textContent = Object.keys(copyEdits).length;
  }

  function renderCopy() {
    var body = document.getElementById("pm-body");
    var keys = Object.keys(copyEdits);
    body.innerHTML =
      '<div class="field">' +
        '<label class="tog"><input type="checkbox" id="pm-copy-on"' + (copyOn ? " checked" : "") +
        "> Edit text on the page</label>" +
        '<p class="pm-note" style="margin-top:9px">Every heading and paragraph becomes editable. ' +
        "Click into one and type. <b>Enter</b> finishes, <b>Esc</b> puts the original back.</p>" +
      "</div>" +
      '<div class="p-group"><h4>Changed &middot; <span id="pm-copy-count">' + keys.length + "</span></h4>" +
      (keys.length ? keys.map(function (k) {
        var el = document.querySelector('[data-pm-copy="' + k + '"]');
        var now = el ? (el.textContent || "").trim() : copyEdits[k];
        return '<div class="preset" data-k="' + k + '">' +
          '<div class="p-top"><b>' + k + "</b><span class=\"p-apply p-revert\">Revert</span></div>" +
          '<div class="p-note">' + now.slice(0, 120) + (now.length > 120 ? "\u2026" : "") + "</div></div>";
      }).join("") : '<p class="pm-note">Nothing changed yet.</p>') + "</div>" +
      '<div class="p-actions"><button class="act" id="pm-copy-export">Copy copy.json</button>' +
      '<button class="act ghost" id="pm-copy-clear">Revert everything</button></div>' +
      '<p class="pm-note" style="margin-top:10px">Paste the result into <code>design-9/copy.json</code>, ' +
      "commit and push, and everyone sees the new wording.</p>";

    document.getElementById("pm-copy-on").checked = copyOn;
    document.getElementById("pm-copy-on").addEventListener("change", function (e) {
      e.target.checked ? startCopy() : stopCopy();
    });
    body.querySelectorAll(".p-revert").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.closest(".preset").getAttribute("data-k");
        var el = document.querySelector('[data-pm-copy="' + k + '"]');
        if (el && k in originals) el.innerHTML = originals[k];
        delete copyEdits[k]; ls(KEY_COPY, JSON.stringify(copyEdits)); renderCopy();
      });
    });
    document.getElementById("pm-copy-clear").addEventListener("click", function () {
      Object.keys(copyEdits).forEach(function (k) {
        var el = document.querySelector('[data-pm-copy="' + k + '"]');
        if (el && k in originals) el.innerHTML = originals[k];
      });
      copyEdits = {}; lsDel(KEY_COPY); renderCopy();
    });
    document.getElementById("pm-copy-export").addEventListener("click", function () {
      var out = JSON.stringify({ copy: copyEdits }, null, 2);
      var btn = document.getElementById("pm-copy-export");
      navigator.clipboard ? navigator.clipboard.writeText(out).then(function () {
        btn.textContent = "Copied \u2713";
        setTimeout(function () { btn.textContent = "Copy copy.json"; }, 1500);
      }) : prompt("Copy:", out);
    });
  }

  /* ------------------------------------------------------------ presets --- */
  /* Three places a preset can live:
       shared   — the Worker, if PM_CONFIG.presetsApi is set. Everyone sees it.
       repo     — presets.json, committed. Everyone sees it, saving needs a push.
       mine     — this browser only, for something half-finished.             */

  var API = (window.PM_CONFIG || {}).presetsApi || "";
  var remote = null, repo = null;

  function localPresets() {
    try { return JSON.parse(ls(KEY_LOCAL) || "[]"); } catch (e) { return []; }
  }
  function saveLocal(list) { ls(KEY_LOCAL, JSON.stringify(list)); }

  function presetsUrl() {
    var css = document.querySelector('link[rel="stylesheet"][href*="style.css"]');
    return css ? css.href.replace(/style\.css.*$/, "presets.json") : "presets.json";
  }

  function loadPresets() {
    var jobs = [
      fetch(presetsUrl(), { cache: "no-cache" }).then(function (r) { return r.json(); })
        .then(function (d) { repo = d.presets || []; }).catch(function () { repo = []; })
    ];
    if (API) {
      jobs.push(fetch(API, { cache: "no-store" }).then(function (r) { return r.json(); })
        .then(function (d) { remote = d.presets || []; }).catch(function () { remote = null; }));
    }
    return Promise.all(jobs);
  }

  function current() {
    return { colors: colors, photos: photos, focus: focus };
  }

  function applyPreset(pr) {
    colors = Object.assign({}, pr.colors || {});
    photos = Object.assign({}, pr.photos || {});
    focus  = Object.assign({}, pr.focus  || {});
    ls(KEY_COLORS, JSON.stringify(colors));
    ls(KEY_PHOTOS, JSON.stringify(photos));
    ls(KEY_FOCUS,  JSON.stringify(focus));
    // clear any previously-set vars that this preset doesn't define
    ROLES.forEach(function (r) {
      if (!colors[r.v]) document.documentElement.style.removeProperty(r.v);
    });
    applyColors(); applyPhotos(); applyFocus();
    renderPresets();
  }

  function writeKey() {
    var k = ls(KEY_WKEY);
    if (k) return k;
    k = prompt("Write key for shared presets\n(ask Jeremy — it guards saving, not viewing)");
    if (k) ls(KEY_WKEY, k);
    return k;
  }

  function renderPresets() {
    var body = document.getElementById("pm-body");
    var mine = localPresets();
    var shared = remote !== null ? remote : repo || [];
    var sharedLabel = remote !== null ? "Shared &middot; live" : "Shared &middot; from the repo";

    function card(pr, where) {
      return '<div class="preset" data-name="' + pr.name.replace(/"/g, "&quot;") + '" data-where="' + where + '">' +
        '<div class="p-top"><b>' + pr.name + "</b>" +
        '<span class="p-apply">Apply</span></div>' +
        (pr.note ? '<div class="p-note">' + pr.note + "</div>" : "") +
        '<div class="p-chips">' + ROLES.slice(0, 9).map(function (r) {
          var c = (pr.colors || {})[r.v];
          return c ? '<i style="background:' + c + '"></i>' : "";
        }).join("") + "</div>" +
        (where !== "repo" ? '<button class="p-del">Delete</button>' : "") +
        "</div>";
    }

    body.innerHTML =
      '<div class="field">' +
        '<label class="p-lab">Save what\u2019s on screen</label>' +
        '<input id="pm-pname" type="text" placeholder="Name it \u2014 e.g. Warmer, clay accent" maxlength="60">' +
        '<input id="pm-pnote" type="text" placeholder="One line about it (optional)" maxlength="200">' +
        '<div class="p-actions">' +
          '<button class="act" id="pm-psave">' + (API ? "Save for everyone" : "Save to this browser") + "</button>" +
          (API ? "" : '<button class="act ghost" id="pm-pcopy">Copy presets.json</button>') +
        "</div>" +
        (API ? "" : '<p class="pm-note" style="margin-top:10px">No shared store connected yet, so a save stays in your browser. ' +
          "Use <b>Copy presets.json</b> and paste it into <code>design-9/presets.json</code> to share it with everyone. " +
          "Wire up the Worker in <code>tools/presets-worker.js</code> and saves become instant for the whole team.</p>") +
      "</div>" +
      '<div class="p-group"><h4>' + sharedLabel + "</h4>" +
        (shared.length ? shared.map(function (p2) { return card(p2, remote !== null ? "remote" : "repo"); }).join("")
                       : '<p class="pm-note">Nothing saved yet.</p>') +
      "</div>" +
      (mine.length ? '<div class="p-group"><h4>Only in this browser</h4>' +
        mine.map(function (p2) { return card(p2, "local"); }).join("") + "</div>" : "");

    body.querySelectorAll(".preset").forEach(function (el) {
      var name = el.getAttribute("data-name"), where = el.getAttribute("data-where");
      var list = where === "local" ? mine : shared;
      var pr = list.filter(function (x) { return x.name === name; })[0];
      el.querySelector(".p-apply").addEventListener("click", function () { if (pr) applyPreset(pr); });
      var del = el.querySelector(".p-del");
      if (del) del.addEventListener("click", function () {
        if (where === "local") { saveLocal(mine.filter(function (x) { return x.name !== name; })); renderPresets(); return; }
        var k = writeKey(); if (!k) return;
        fetch(API + "?name=" + encodeURIComponent(name), { method: "DELETE", headers: { "X-Write-Key": k } })
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d.error) { lsDel(KEY_WKEY); alert(d.error); return; } remote = d.presets; renderPresets(); })
          .catch(function () { alert("Could not reach the preset store."); });
      });
    });

    var saveBtn = document.getElementById("pm-psave");
    if (saveBtn) saveBtn.addEventListener("click", function () {
      var name = (document.getElementById("pm-pname").value || "").trim();
      if (!name) { document.getElementById("pm-pname").focus(); return; }
      var note = (document.getElementById("pm-pnote").value || "").trim();
      var cur = current();
      var pr = { name: name, note: note, colors: cur.colors, focus: cur.focus,
                 photos: {} };
      Object.keys(cur.photos).forEach(function (k) {
        if (String(cur.photos[k]).indexOf("data:") !== 0) pr.photos[k] = cur.photos[k];
      });
      if (!API) {
        var mineNow = localPresets().filter(function (x) { return x.name !== name; });
        mineNow.push(pr); saveLocal(mineNow); renderPresets(); return;
      }
      var k = writeKey(); if (!k) return;
      fetch(API, { method: "POST", headers: { "Content-Type": "application/json", "X-Write-Key": k },
                   body: JSON.stringify(pr) })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.error) { lsDel(KEY_WKEY); alert(d.error); return; } remote = d.presets; renderPresets(); })
        .catch(function () { alert("Could not reach the preset store."); });
    });

    var copyBtn = document.getElementById("pm-pcopy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var all = (repo || []).concat(localPresets());
      var seen = {}, dedup = [];
      all.reverse().forEach(function (x) { if (!seen[x.name]) { seen[x.name] = 1; dedup.unshift(x); } });
      var out = JSON.stringify({ presets: dedup }, null, 2);
      navigator.clipboard ? navigator.clipboard.writeText(out).then(function () {
        copyBtn.textContent = "Copied \u2713";
        setTimeout(function () { copyBtn.textContent = "Copy presets.json"; }, 1500);
      }) : prompt("Copy:", out);
    });
  }

  /* ---------------------------------------------------------------- wire -- */

  document.getElementById("pm-tabs").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-tab]");
    if (!b) return;
    [].slice.call(this.querySelectorAll("button")).forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
    if (b.dataset.tab === "color") renderColor();
    else if (b.dataset.tab === "photo") renderPhoto();
    else if (b.dataset.tab === "copy") renderCopy();
    else renderPresets();
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
    var fk = Object.keys(focus);
    if (fk.length) {
      out += "\n/* Paste into the photoFocus block in design-9/config.js */\nphotoFocus: {\n";
      out += fk.map(function (k) { return '  "' + k + '": "' + focus[k] + '"'; }).join(",\n");
      out += "\n},\n";
    }
    var skipped = Object.keys(photos).length - named.length;
    if (skipped) out += "\n/* " + skipped + " uploaded preview(s) not included — add those files to assets/photos/ first. */\n";
    if (out.indexOf("--") === -1 && !named.length && !fk.length) out = "/* Nothing changed yet. */";
    navigator.clipboard ? navigator.clipboard.writeText(out).then(flash, function () { prompt("Copy:", out); })
                        : prompt("Copy:", out);
    function flash() {
      var b = document.getElementById("pm-copy"), t = b.textContent;
      b.textContent = "Copied ✓"; setTimeout(function () { b.textContent = t; }, 1400);
    }
  });

  document.getElementById("pm-reset").addEventListener("click", function () {
    colors = {}; photos = {}; focus = {}; copyEdits = {};
    lsDel(KEY_COLORS); lsDel(KEY_PHOTOS); lsDel(KEY_FOCUS); lsDel(KEY_COPY);
    location.reload();
  });

  document.getElementById("pm-exit").addEventListener("click", function () {
    lsDel(KEY_ON); lsDel(KEY_COLORS); lsDel(KEY_PHOTOS); lsDel(KEY_FOCUS); lsDel(KEY_COPY);
    location.href = location.pathname;
  });

  var applyAll = function () { applyPhotos(); applyFocus(); setTimeout(applyCopy, 260); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyAll);
  else setTimeout(applyAll, 60);
  renderColor();
  loadPresets();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showBadges);
  else setTimeout(showBadges, 120);
})();
