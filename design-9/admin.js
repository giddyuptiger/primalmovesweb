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
      KEY_FOCUS = "pm_studio_focus";

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
    ".pm-swap-badge{position:fixed;z-index:99990;display:flex;gap:1px;border-radius:4px;overflow:hidden;",
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
  handle.textContent = "EDIT";
  document.body.appendChild(handle);
  document.body.classList.add("pm-studio-open");
  // set the offsets from JS too, so this can never depend on a cached stylesheet
  var W = window.matchMedia("(max-width:900px)").matches ? 0 : 344;
  document.documentElement.style.setProperty("--pm-studio-w", W + "px");
  document.body.style.paddingRight = W + "px";
  var siteHdr = document.querySelector("header.site");
  if (siteHdr) siteHdr.style.right = W + "px";

  handle.addEventListener("click", function () {
    var closed = panel.classList.toggle("closed");
    document.body.classList.toggle("pm-studio-open", !closed);
    var w = closed ? 0 : (window.matchMedia("(max-width:900px)").matches ? 0 : 344);
    document.body.style.paddingRight = w + "px";
    if (siteHdr) siteHdr.style.right = w + "px";
    [].slice.call(document.querySelectorAll(".pm-swap-badge")).forEach(function (x) { if (x._place) x._place(); });
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
        if (t.dataset.a === "swap") openPicker(el); else focusMode(el);
      });
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

  function focusMode(img) {
    var slot = img.getAttribute("data-pm-photo");
    var r = img.getBoundingClientRect();
    var lay = document.createElement("div");
    lay.className = "pm-focus";
    lay.style.cssText = "position:fixed;top:" + r.top + "px;left:" + r.left + "px;width:" +
      r.width + "px;height:" + r.height + "px;z-index:99997;cursor:crosshair;";
    lay.innerHTML = '<div class="pm-focus-dot"></div>' +
      '<div class="pm-focus-hint">Click the part that should stay in frame &middot; <b>Esc</b> to finish</div>';
    document.body.appendChild(lay);
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
    function done(e) {
      if (e && e.key && e.key !== "Escape") return;
      lay.remove();
      document.removeEventListener("keydown", done);
    }
    document.addEventListener("keydown", done);
    setTimeout(function () { document.addEventListener("click", function once(e) {
      if (!lay.contains(e.target)) { done(); document.removeEventListener("click", once); }
    }); }, 10);
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
    colors = {}; photos = {}; focus = {};
    lsDel(KEY_COLORS); lsDel(KEY_PHOTOS); lsDel(KEY_FOCUS);
    location.reload();
  });

  document.getElementById("pm-exit").addEventListener("click", function () {
    lsDel(KEY_ON); lsDel(KEY_COLORS); lsDel(KEY_PHOTOS); lsDel(KEY_FOCUS);
    location.href = location.pathname;
  });

  var applyAll = function () { applyPhotos(); applyFocus(); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyAll);
  else setTimeout(applyAll, 60);
  renderColor();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showBadges);
  else setTimeout(showBadges, 120);
})();
