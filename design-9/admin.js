/* ============================================================================
   PRIMAL MOVES VENICE - DESIGN STUDIO
   A small in-page panel for trying colours and photos without touching code.

   WHAT IT DOES        Changes the live page instantly so you can see a choice
                       in context, and hands you the exact config to save.
   WHAT IT DOES NOT DO Save anything. This is a static site - there's no server
                       to write to. Everything lives in your browser until you
                       hit "Copy config" and paste it into the repo (or send it
                       to whoever pushes).

   NOT SECURITY        The /admin gate hides the panel from casual visitors.
                       Anyone determined can turn it on. That's fine, because
                       it cannot change what other people see - only your own
                       browser. Don't mistake it for a login.

   TURN IT ON          Visit /admin/ , or add ?admin=1 to any URL.
   TURN IT OFF         The Exit button, or ?admin=0.
   ========================================================================== */
(function () {
  "use strict";

  var KEY_ON = "pm_studio_on", KEY_COLORS = "pm_studio_colors", KEY_PHOTOS = "pm_studio_photos",
      KEY_FOCUS = "pm_studio_focus", KEY_LOCAL = "pm_studio_local", KEY_WKEY = "pm_studio_wkey", KEY_COPY = "pm_studio_copy", KEY_LAYOUT = "pm_studio_layout",
      KEY_ACTIVE = "pm_studio_active", KEY_TEX = "pm_studio_texture";

  function q(p) { return new URLSearchParams(location.search).get(p); }
  function ls(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }

  var CFG = window.PM_CONFIG || {};

  // Layout A / B. Applied before the panel exists so there's no flash.
  var layout = ls(KEY_LAYOUT) || CFG.layout || "a";
  function applyLayout(v) {
    layout = v;
    document.body.classList.toggle("tight", v === "tight");
    document.body.classList.toggle("house", v === "house");
    document.documentElement.classList.remove("tight-pending");
    document.documentElement.classList.remove("house-pending");
    ls(KEY_LAYOUT, v);
  }
  if (document.body) applyLayout(layout);
  else document.addEventListener("DOMContentLoaded", function () { applyLayout(layout); });
  if (q("admin") === "1") ls(KEY_ON, "1");
  if (q("admin") === "0") { lsDel(KEY_ON); }

  // Who gets the panel at all: anyone, while studioOpenToAll is true; only
  // someone who has been to /?admin=1 once, after that flips to false.
  var invited = ls(KEY_ON) === "1";
  var openToAll = CFG.studioOpenToAll === true;
  if (!invited && !openToAll) return;

  // It always STARTS closed. Every load is the untouched page plus a small
  // EDIT tab; the drawer is a deliberate click, never the thing you land on.
  var startClosed = true;

  /* ---------------------------------------------------------------- live --
     Photographs are the one thing that publishes. Swap or upload one and it
     is live for every visitor within seconds - no push, no deploy. Colour
     and wording deliberately do NOT work this way: they are saved into
     configs so people can try things without moving the real site.
     The store is the Worker in tools/pm-worker.js.                       */

  var LIVE = String(CFG.liveApi || "").replace(/\/+$/, "");
  var livePhotos = { photos: {}, photoFocus: {}, updatedAt: "" };
  var liveErr = "";
  var liveOpen = false;      // the store is letting anyone with the link write

  function writeKey(force) {
    if (liveOpen) return "";                    // nothing to ask for
    var k = ls(KEY_WKEY);
    if (k && !force) return k;
    k = prompt("Write key\n\nThis is what lets you change the live site. Ask Jeremy for it - " +
               "it is stored in this browser only.");
    if (k) ls(KEY_WKEY, k);
    return k;
  }

  // headers for a write. Returns null when a key is needed and not given.
  function writeHeaders(extra) {
    var h = extra || {};
    if (liveOpen) return h;
    var k = writeKey();
    if (!k) return null;
    h["X-Write-Key"] = k;
    return h;
  }

  function loadLive() {
    if (!LIVE) return Promise.resolve(null);
    return fetch(LIVE + "/live", { cache: "no-cache" })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && !d.error) {
          livePhotos = { photos: d.photos || {}, photoFocus: d.photoFocus || {},
                         updatedAt: d.updatedAt || "", by: d.by || "" };
          liveOpen = d.open === true;
        }
        return livePhotos;
      })
      .catch(function () { liveErr = "The photo store is not answering."; return null; });
  }

  // publish one slot. `file` is a filename from the repo or a URL from the
  // upload endpoint; "" puts the slot back to whatever the repo ships.
  function publishSlot(slot, file, focus) {
    if (!LIVE) return Promise.resolve({ skipped: true });
    var h = writeHeaders(file === "" ? {} : { "Content-Type": "application/json" });
    if (!h) return Promise.resolve({ error: "No write key." });
    var opts = file === ""
      ? { method: "DELETE", headers: h }
      : { method: "POST", headers: h,
          body: JSON.stringify({ slot: slot, file: file, focus: focus || focusOf(slot) }) };
    var url = LIVE + "/live/photo" + (file === "" ? "?slot=" + encodeURIComponent(slot) : "");
    return fetch(url, opts).then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.error) { if (/write key/i.test(d.error)) lsDel(KEY_WKEY); return d; }
        livePhotos = { photos: d.live.photos || {}, photoFocus: d.live.photoFocus || {},
                       updatedAt: d.live.updatedAt || "", by: d.live.by || "" };
        if (window.PM_CONFIG) {
          window.PM_CONFIG.photos = Object.assign({}, window.PM_CONFIG.photos || {}, livePhotos.photos);
          if (window.PM_FILL_AVATARS) window.PM_FILL_AVATARS();
        }
        return d;
      })
      .catch(function () { return { error: "Could not reach the photo store." }; });
  }

  function focusOf(slot) { return focus[slot] || ""; }

  function uploadPhoto(file) {
    var h = writeHeaders({ "Content-Type": file.type });
    if (!h) return Promise.resolve({ error: "No write key." });
    // Say no here, with the real reason, rather than letting the edge cut the
    // connection mid-upload and reporting "not answering". The store caps a
    // film at 64MB and a photograph at 12MB - and a hero loop should be ~10MB
    // once it's compressed for the web anyway.
    var film = /^video\//.test(file.type);
    var capMB = film ? 64 : 12;
    if (file.size > capMB * 1048576) {
      return Promise.resolve({ error: "This " + (film ? "video" : "photo") + " is " +
        Math.round(file.size / 1048576) + "MB - the store takes up to " + capMB +
        "MB. Compress it for the web first (a hero loop wants to be ~10MB)." });
    }
    return fetch(LIVE + "/upload?name=" + encodeURIComponent(file.name), {
      method: "POST", headers: h, body: file
    }).then(function (r) {
      return r.json().catch(function () {
        return { error: "Upload failed - the store said " + r.status + " " + r.statusText + "." };
      });
    }).catch(function () { return { error: "Upload failed - the photo store is not answering." }; });
  }

  function toast(msg, bad) {
    var t = document.getElementById("pm-toast") || document.createElement("div");
    t.id = "pm-toast"; t.textContent = msg;
    t.className = bad ? "bad" : "";
    if (!t.parentNode) document.body.appendChild(t);
    t.classList.add("on");
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove("on"); }, 3200);
  }

  /* ---------------------------------------------------------------- data -- */

  var PALETTE = [
    ["Cream",       "#EDE8D2"], ["Taupe",      "#DCCFB9"], ["Sage grey",  "#B0AB94"],
    ["Navy",        "#132238"], ["Forest",     "#303F16"], ["Dark olive", "#453A1D"],
    ["Olive",       "#888151"], ["Light sage", "#B9B784"], ["Mushroom",   "#A68460"],
    ["Blush",       "#CD826A"], ["Orange",     "#C16838"], ["Rust",       "#9F663A"],
    ["Brown",       "#945A38"], ["Gold",       "#CE9C3B"], ["Burnt red",  "#AE411C"],
    ["Oxblood",     "#7A3A34"], ["Off-white",  "#F7F3E7"],
    /* Miki's second set. Flame and mustard are mark colours - at 2.8 and 1.6
       against cream they cannot carry words, so the two darkened versions sit
       beside them for when they have to. */
    ["Mustard",     "#D4B906"], ["Deep mustard", "#6F5E03"],
    ["Flame",       "#F1540A"], ["Deep flame",   "#B33A05"],
    ["Oxblood black", "#370707"], ["Warm cream", "#F0E6D3"]
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
    { v: "--clay",     label: "Second accent",    hint: "used sparingly" },
    /* Tea & Cafe runs its own warmer ground - everything else on that page
       (its rules, muted type and panels) is mixed from these two. */
    { v: "--cherish-paper", label: "Cafe + Tea ground", hint: "that page only" },
    { v: "--oxblood",       label: "Cafe + Tea accent", hint: "buttons and marks there" },
    { v: "--cherish-ink",   label: "Cafe + Tea text",   hint: "and everything mixed from it" }
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

  /* Limewash - the studio's wall finish, generated in CSS so it tints with
     whatever palette is loaded. See the block at the end of style.css. */
  // 0 off · 1 limewash · 2 a heavier coat
  var texture = (function () {
    var v = ls(KEY_TEX);
    if (v === null) return CFG.texture ? (CFG.texture === "faint" ? 1 : 2) : 0;
    return parseInt(v, 10) || 0;
  })();

  function applyTexture() {
    document.body.classList.toggle("texture", texture > 0);
    document.body.classList.toggle("lime-faint", texture === 1);
    document.documentElement.classList.remove("texture-pending");
  }

  function applyColors() {
    Object.keys(colors).forEach(function (k) {
      document.documentElement.style.setProperty(k, colors[k]);
    });
  }
  function photoBase() {
    var any = document.querySelector("img[data-pm-photo][src]");
    if (any) return (any.getAttribute("src") || "").replace(/[^/]+$/, "");
    var css = document.querySelector('link[rel="stylesheet"][href*="style.css"]');
    return css ? css.href.replace(/design-9\/style\.css.*$/, "assets/photos/") : "../../assets/photos/";
  }
  function isFilm(u) { return /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u) || /^data:video\//.test(u); }

  function applyPhotos() {
    // the page's avatar painter reads window.PM_CONFIG.photos - keep it fed
    if (window.PM_CONFIG) {
      window.PM_CONFIG.photos = Object.assign({}, window.PM_CONFIG.photos || {}, photos);
      if (window.PM_FILL_AVATARS) window.PM_FILL_AVATARS();
    }
    Object.keys(photos).forEach(function (slot) {
      var els = [].slice.call(document.querySelectorAll('[data-pm-photo="' + slot + '"]'))
        .filter(function (e) { return !(e.classList && e.classList.contains("s-ava")); });
      var el = els[0];
      if (!el) return;
      // a published photograph is a full URL; a repo one is just a filename
      var val = String(photos[slot]);
      var abs = /^(https?:)?\/\//.test(val) || val.charAt(0) === "/" || val.indexOf("data:") === 0;
      var src = abs ? val : photoBase() + val;

      if (isFilm(src)) {                       // a film in a picture slot
        if (el.tagName === "VIDEO") { if (el.getAttribute("src") !== src) el.setAttribute("src", src); return; }
        var v = document.createElement("video");
        v.setAttribute("data-pm-photo", slot);
        v.setAttribute("src", src);
        v.setAttribute("poster", el.getAttribute("src") || "");
        v.setAttribute("playsinline", ""); v.setAttribute("muted", "");
        v.setAttribute("autoplay", ""); v.setAttribute("loop", "");
        v.muted = true; v.autoplay = true; v.loop = true;
        if (el.className) v.className = el.className;
        if (el.getAttribute("style")) v.setAttribute("style", el.getAttribute("style"));
        el.replaceWith(v);
        var p = v.play(); if (p && p.catch) p.catch(function () {});
        return;
      }
      if (el.tagName === "VIDEO") {            // film → photograph
        var im = document.createElement("img");
        im.setAttribute("data-pm-photo", slot);
        im.src = src; im.alt = "";
        if (el.className) im.className = el.className;
        if (el.getAttribute("style")) im.setAttribute("style", el.getAttribute("style"));
        el.replaceWith(im);
        return;
      }
      if (el.tagName === "IMG") { el.src = src; return; }
      // a frame - a teacher portrait, a photo slot - gets the picture put
      // INSIDE it, so the frame's own aspect-ratio still governs the size
      var inner = el.querySelector("img[data-pm-fill]");
      if (!inner) {
        inner = document.createElement("img");
        inner.setAttribute("data-pm-fill", "");
        inner.alt = "";
        el.textContent = "";
        el.appendChild(inner);
      }
      inner.src = src;
      el.classList.remove("empty");
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
    /* Reset only TEXT elements - resetting div wiped the panel's own padding,
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
    "#pm-studio .role-h code{font:400 10.5px ui-monospace,Menlo,monospace !important;color:#9AA0A7 !important;letter-spacing:0 !important}",
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
    /* while photo mode is on, even coaches with no portrait yet show a
       clickable empty circle on the timetable */
    "body.pm-photos-on .s-ava{display:inline-block;background-color:rgba(139,168,95,.3);",
    "  outline:1px dashed #8BA85F;outline-offset:2px}",

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
    "#pm-picker .grid img,#pm-picker .grid video{width:100%;height:94px;object-fit:cover;display:block}",
    "#pm-picker .grid button{position:relative}",
    "#pm-picker .grid .film{position:absolute;top:6px;left:6px;background:rgba(10,11,13,.78);",
    "  color:#B4D18A;font-size:9px;letter-spacing:.14em;text-transform:uppercase;",
    "  padding:2px 6px;border-radius:3px}",
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
    /* the class-card description lives in a clipped reveal wrapper, which
       was eating its dashed box. In copy mode every description opens and
       the wrapper stops clipping, so each one is visible and boxed. */
    ".pm-copy-mode .cls .desc{grid-template-rows:1fr !important;opacity:1 !important;",
    "  margin-top:12px !important;overflow:visible !important}",
    ".pm-copy-mode .cls .desc .pm-editing{display:block}",
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
    "#pm-studio .preset.lay{cursor:pointer}",
    "#pm-studio .preset.lay:hover{border-color:#3D4348}",
    "#pm-studio .preset.lay.on{border-color:#8BA85F;background:#1F241B}",
    "#pm-studio .lay-list{list-style:none;margin:11px 0 0;padding:0}",
    "#pm-studio .lay-list li{font-size:11.5px;color:#8D9198;line-height:1.5;padding-left:14px;",
    "  position:relative;margin-bottom:5px}",
    "#pm-studio .lay-list li::before{content:'\\2022';position:absolute;left:2px;color:#8BA85F}",
    "#pm-studio .preset .p-del{margin-top:11px;background:none;border:0;color:#6E737A;cursor:pointer;",
    "  font:inherit;font-size:11px;padding:0}",
    "#pm-studio .preset .p-del:hover{color:#D08A72}",
    /* live state, toasts */
    "#pm-studio .tex-field{padding-bottom:14px;border-bottom:1px solid #26292E;margin-bottom:16px}",
    "#pm-studio .seg-row{display:flex;gap:0;border:1px solid #2F3338;border-radius:5px;overflow:hidden}",
    "#pm-studio .seg{flex:1;background:#1D2024;border:0;border-right:1px solid #2F3338;color:#8D9198;",
    "  font:inherit;font-size:11.5px;padding:9px 6px;cursor:pointer}",
    "#pm-studio .seg:last-child{border-right:0}",
    "#pm-studio .seg:hover{color:#E8E6E0}",
    "#pm-studio .seg.on{background:#8BA85F;color:#11140E;font-weight:600}",
    "#pm-studio .live-state{background:#1D2024;border:1px solid #26292E;border-left:2px solid #6E737A;",
    "  border-radius:4px;padding:11px 13px;margin-top:11px;font-size:11.5px;line-height:1.55;color:#8D9198}",
    "#pm-studio .live-state.on{border-left-color:#8BA85F}",
    "#pm-studio .live-state b{color:#E8E6E0;font-weight:600}",
    "#pm-studio .live-state span{display:block;margin-top:5px;font-size:10.5px;color:#6E737A}",
    "#pm-studio .slot .tagline{display:block;margin-top:5px;font-size:10px;color:#8BA85F}",
    "#pm-studio .pm-save{font-size:10.5px;letter-spacing:.02em}",
    "#pm-studio .st-row{display:flex;gap:8px;align-items:center;margin:0 0 8px}",
    "#pm-studio .st-thumb{flex:none;width:34px;height:34px;border-radius:50%;background:#2A2F35 center/cover;",
    "  display:grid;place-items:center;color:#8BA85F;font-size:16px;cursor:pointer;border:1px solid #33383E}",
    "#pm-studio .st-row input{flex:1;min-width:0;background:#1D2024;border:1px solid #26292E;border-radius:4px;",
    "  color:#E8E6E0;font:inherit;font-size:12px;padding:8px 10px}",
    "#pm-studio .st-row .st-role{flex:0 0 92px}",
    "#pm-studio .st-del{flex:none;background:none;border:0;color:#6E737A;cursor:pointer;font-size:15px;padding:4px}",
    "#pm-studio .st-del:hover{color:#D08A72}",
    "#pm-studio .st-add{margin-top:6px}",
    "#pm-studio .pm-save.busy{color:#B7A34A}",
    "#pm-studio .pm-save.ok{color:#8BA85F}",
    "#pm-studio .pm-save.err{color:#E8B48A}",
    "#pm-studio .p-reset{background:none;border:0;padding:0;font:inherit;font-size:10px;",
    "  color:#6E737A;cursor:pointer;text-decoration:underline}",
    "#pm-studio .p-reset:hover{color:#D08A72}",
    "#pm-toast{position:fixed;left:50%;bottom:26px;transform:translate(-50%,14px);z-index:100000;",
    "  background:#1F241B;color:#DDEBC6;border:1px solid #8BA85F;border-radius:5px;padding:11px 18px;",
    "  font:500 12.5px/1.4 'Helvetica Neue',Arial,sans-serif;opacity:0;pointer-events:none;",
    "  transition:opacity .18s ease,transform .18s ease;max-width:min(520px,86vw);text-align:center}",
    "#pm-toast.on{opacity:1;transform:translate(-50%,0)}",
    "#pm-toast.bad{background:#2A1E1A;color:#F0C6AE;border-color:#B4694A}",
    /* configs */
    "#pm-studio .preset.cfg.on{border-color:#8BA85F;background:#1F241B}",
    "#pm-studio .p-meta{font-size:10.5px;color:#6E737A;margin-top:7px;letter-spacing:.02em}",
    "#pm-studio .p-active{background:#1D2024;border:1px solid #26292E;border-radius:4px;",
    "  padding:10px 12px;margin-bottom:10px;font-size:12px;color:#E8E6E0;line-height:1.5}",
    "#pm-studio .p-active span{display:block;font-size:10.5px;color:#6E737A;margin-top:3px}",
    "#pm-studio .p-row{display:flex;align-items:center;gap:14px;margin-top:11px;flex-wrap:wrap}",
    "#pm-studio .p-row .p-del{margin-top:0}",
    "#pm-studio .p-up{background:none;border:0;padding:0;font:inherit;font-size:11px;",
    "  color:#8D9198;cursor:pointer;text-align:left}",
    "#pm-studio .p-up:hover{color:#B4D18A}",
    "#pm-studio .p-up.armed{color:#E8B48A;font-weight:600}",
    /* picker: the upload is the first thing you see, not a footnote */
    "#pm-picker .box{display:flex;flex-direction:column;overflow:hidden}",
    "#pm-lib{flex:1;min-height:0;overflow-y:auto;padding-bottom:18px}",
    "#pm-picker .grid{overflow:visible}",
    "#pm-picker .p-head{display:flex;align-items:flex-start;gap:14px;padding:16px 22px;",
    "  border-bottom:1px solid #2A2D31}",
    "#pm-picker .p-head h3{padding:0;border:0;flex:1}",
    "#pm-picker .p-x{background:none;border:0;color:#8D9198;font:inherit;font-size:20px;",
    "  line-height:1;cursor:pointer;padding:0 2px}",
    "#pm-picker .p-x:hover{color:#E8E6E0}",
    "#pm-picker .drop{margin:16px 22px 0;border:1px dashed #3A3F45;border-radius:6px;",
    "  padding:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;background:#191B1F}",
    "#pm-picker .drop.over{border-color:#8BA85F;background:#1F241B}",
    "#pm-picker .up{background:#8BA85F;color:#11140E;border:0;border-radius:4px;font:inherit;",
    "  font-size:13px;font-weight:600;padding:12px 20px;cursor:pointer;flex:none}",
    "#pm-picker .up:hover{background:#9CBA6C}",
    "#pm-picker .drop .d-txt{flex:1;min-width:200px;font-size:11.5px;color:#8D9198;line-height:1.5}",
    "#pm-picker .drop .d-txt b{color:#E8E6E0;font-weight:600}",
    "#pm-picker .g-head{padding:18px 22px 0;font-size:10.5px;font-weight:600;letter-spacing:.16em;",
    "  text-transform:uppercase;color:#7E838A}",
    "#pm-picker .grid button.fresh{border-color:#8BA85F}",
    "#pm-picker .grid .nm.new{color:#B4D18A}",
    "#pm-picker .p-search{background:#1D2024;border:1px solid #2F3338;border-radius:4px;color:#E8E6E0;",
    "  font:inherit;font-size:12.5px;padding:9px 12px;width:190px}",
    "#pm-picker .p-search:focus{outline:0;border-color:#8BA85F}",
    "#pm-studio code{font:400 11px ui-monospace,Menlo,monospace !important;color:#CBDCA8 !important;",
    "  background:#2A2E33;padding:1px 5px;border-radius:3px}",
    "@media (max-width:900px){#pm-studio{width:100%}#pm-studio.closed{transform:translateX(100%)}",
    "  body.pm-studio-open{padding-right:0}#pm-handle{right:0}}"
  ].join("\n");
  document.head.appendChild(css);

  var panel = document.createElement("aside");
  panel.id = "pm-studio";
  panel.innerHTML =
    '<header><div><h2>Design studio</h2><div class="sub" id="pm-sub">Preview only · nothing is saved</div></div></header>' +
    '<div id="pm-tabs"><button data-tab="color" class="on">Colour</button>' +
    '<button data-tab="photo">Photos</button>' +
    '<button data-tab="copy">Copy</button>' +
    '<button data-tab="staff">Staff</button>' +
    '<button data-tab="layout">Layout</button>' +
    '<button data-tab="preset">Configs</button></div>' +
    '<div id="pm-body"></div>' +
    '<footer>' +
      '<button class="act" id="pm-copy">Copy config</button>' +
      '<button class="act ghost" id="pm-reset">Reset to saved</button>' +
      '<button class="act ghost" id="pm-exit">Exit studio</button>' +
      '<p class="pm-note" id="pm-foot-note">Changes are yours alone until the copied config is pasted ' +
      "into the repo.</p>" +
    '</footer>';
  document.body.appendChild(panel);

  var handle = document.createElement("button");
  handle.id = "pm-handle";
  handle.textContent = "EDIT";
  document.body.appendChild(handle);
  if (startClosed) panel.classList.add("closed");
  if (!startClosed) document.body.classList.add("pm-studio-open");
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
  var W = startClosed ? 0 : (window.matchMedia("(max-width:900px)").matches ? 0 : 344);
  setInset(W);
  window.addEventListener("resize", function () {
    if (!panel.classList.contains("closed")) {
      setInset(window.matchMedia("(max-width:900px)").matches ? 0 : 344);
    }
  });

  handle.addEventListener("click", function () {
    var closed = panel.classList.toggle("closed");
    if (!closed) ls(KEY_ON, "1");   // remembers you may edit, not that it was open
    document.body.classList.toggle("pm-studio-open", !closed);
    setInset(closed ? 0 : (window.matchMedia("(max-width:900px)").matches ? 0 : 344));
    if (closed) { hideBadges(); closeFocus(); if (copyOn) stopCopy(); }
    else {
      showBadges();
      [].slice.call(document.querySelectorAll(".pm-swap-badge")).forEach(function (x) { if (x._place) x._place(); });
    }
  });

  /* ------------------------------------------------------------ colour ---- */

  function textureField() {
    var opts = [[0, "Off"], [1, "Faint"], [2, "Limewash"]].map(function (o) {
      return '<button class="seg' + (texture === o[0] ? " on" : "") + '" data-tex="' + o[0] + '">' +
        o[1] + "</button>";
    }).join("");
    return '<div class="field tex-field"><label class="p-lab">Wall finish</label>' +
      '<div class="seg-row">' + opts + "</div>" +
      '<p class="pm-note" style="margin-top:9px">The studio\u2019s own walls - mineral plaster, ' +
      "cloudy rather than flat. Drawn in CSS, so it takes the colour of whatever is under it, never " +
      "repeats, and leaves the photographs alone.</p></div>";
  }

  function wireTexture() {
    [].slice.call(document.querySelectorAll("#pm-body .seg[data-tex]")).forEach(function (b) {
      b.addEventListener("click", function () {
        texture = parseInt(b.dataset.tex, 10);
        autosave();
        ls(KEY_TEX, String(texture));
        applyTexture();
        renderColor();
      });
    });
  }

  function renderColor() {
    var body = document.getElementById("pm-body");
    body.innerHTML = textureField() + ROLES.map(function (r) {
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
    wireTexture();
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
        el.textContent = "⚠ " + r.toFixed(2) + ":1 on the page ground - needs 4.5 for body text.";
        el.classList.add("show");
      } else { el.classList.remove("show"); }
    });
    var btn = document.querySelector('.role[data-role="--sage-btn"] .warn');
    if (btn) {
      var f = colors["--sage-btn"] || cssVar("--sage-btn");
      var r2 = ratio(cssVar("--cream") || "#F7F3E7", f);
      if (r2 < 4.5) {
        btn.textContent = "⚠ " + r2.toFixed(2) + ":1 against the button label - the text will be hard to read.";
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
    // The panel's copy of the live map can be stale - opened before the store
    // answered, or another editor published since. Re-read it, then paint.
    if (LIVE && !renderPhoto._fresh) {
      renderPhoto._fresh = true;
      setTimeout(function () { renderPhoto._fresh = false; }, 4000);
      fetch(LIVE + "/live", { cache: "no-cache" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (!d || d.error) return;
          livePhotos = { photos: d.photos || {}, photoFocus: d.photoFocus || {},
                         updatedAt: d.updatedAt || "", by: d.by || "" };
          var pane = document.getElementById("pm-body");
          if (pane && pane.querySelector(".slots")) renderPhoto();
        })
        .catch(function () {});
    }
    var body = document.getElementById("pm-body");
    var slots = [].slice.call(document.querySelectorAll("[data-pm-photo]"));
    var when = livePhotos.updatedAt
      ? new Date(livePhotos.updatedAt).toLocaleString(undefined,
          { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
      : "";

    body.innerHTML =
      '<div class="field"><p class="pm-note">A <b style="color:#B9C79E">Swap</b> button sits on every photo ' +
      "while this panel is open - empty slots included.</p>" +
      '<div class="live-state' + (LIVE ? " on" : "") + '">' +
        (LIVE
          ? "<b>Photographs are live.</b> A swap or an upload here changes the site for every visitor " +
            "within seconds - no push, no deploy." +
            (when ? "<span>Last change " + when + (livePhotos.by ? " by " + livePhotos.by : "") + "</span>" : "") +
            (liveOpen ? "<span style=\"color:#E8B48A\">Open: anyone with this link can change photographs. " +
                        "Lock it down before launch.</span>" : "") +
            (liveErr ? '<span style="color:#E8B48A">' + liveErr + "</span>" : "")
          : "<b>Preview only.</b> No photo store is connected, so a swap changes your browser and nobody " +
            "else&rsquo;s. Set <code>liveApi</code> in <code>config.js</code> - see " +
            "<code>strategy/live-editing.md</code>.") +
      "</div>" +
      '<p class="pm-note" style="margin-top:10px">Colour and wording are <b>not</b> published this way. ' +
      "Those save into configs, so you can try versions without moving the real site.</p></div>" +
      '<div class="slots">' + (slots.length ? slots.map(function (img) {
        var slot = img.getAttribute("data-pm-photo");
        var file = photos[slot] || (img.getAttribute("src") || "").split("/").pop();
        if (String(file).indexOf("data:") === 0) file = "(local preview)";
        else file = String(file).split("/").pop().replace(/^[0-9a-f]{8,32}-/, "");
        var f = focus[slot] ? " &middot; focus " + focus[slot] : "";
        var isLive = LIVE && livePhotos.photos[slot];
        return '<div class="slot" data-slot="' + slot + '"><b>' + slot + "</b><span>" + file + f + "</span>" +
          (isLive ? '<span class="tagline">Published &middot; <button class="p-reset">put the original back</button></span>' : "") +
          "</div>";
      }).join("") : '<p class="pm-note">No photo slots on this page.</p>') + "</div>" +
      (LIVE ? '<div class="p-actions" style="margin-top:14px">' +
        '<button class="act ghost" id="pm-live-undo">Undo the last photo change</button></div>' : "");

    body.querySelectorAll(".p-reset").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var slot = btn.closest(".slot").getAttribute("data-slot");
        publishSlot(slot, "").then(function (d) {
          if (d.error) { toast(d.error, true); return; }
          delete photos[slot];
          ls(KEY_PHOTOS, JSON.stringify(photos));
          toast("Back to the photograph in the repo.");
          location.reload();
        });
      });
    });

    // clicking a card scrolls to its photograph and pulses the Swap button -
    // the card itself was never the control, but everyone clicks it first
    [].slice.call(body.querySelectorAll(".slot")).forEach(function (card) {
      card.style.cursor = "pointer";
      card.addEventListener("click", function (e) {
        if (e.target.closest(".p-reset")) return;
        var el = document.querySelector('[data-pm-photo="' + card.getAttribute("data-slot") + '"]');
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        var badge = el.parentElement && el.parentElement.querySelector(".pm-swap-badge");
        if (!badge) badge = document.querySelector(".pm-swap-badge");
        [0, 400, 800].forEach(function (t) {
          setTimeout(function () {
            (badge || el).style.outline = "3px solid #B9C79E";
            setTimeout(function () { (badge || el).style.outline = ""; }, 220);
          }, t);
        });
      });
    });

    var undo = document.getElementById("pm-live-undo");
    if (undo) undo.addEventListener("click", function () {
      var h = writeHeaders(); if (!h) return;
      fetch(LIVE + "/live/undo", { method: "POST", headers: h })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.error) { toast(d.error, true); return; }
          toast("Rolled back."); location.reload();
        })
        .catch(function () { toast("Could not reach the photo store.", true); });
    });
  }


  function hideBadges() {
    document.body.classList.remove("pm-photos-on");
    [].slice.call(document.querySelectorAll(".pm-swap-badge")).forEach(function (b) { b.remove(); });
  }

  function navH() {
    var h = document.querySelector("header.site");
    return h ? h.offsetHeight : 0;
  }

  function showBadges() {
    hideBadges();
    document.body.classList.add("pm-photos-on");
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
        // Focus is a toggle - pressing it again leaves focus mode
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
      // publish where the crop holds, once the clicking stops
      if (LIVE && livePhotos.photos[slot]) {
        clearTimeout(set._h);
        set._h = setTimeout(function () {
          publishSlot(slot, livePhotos.photos[slot], focus[slot]).then(function (d) {
            if (d && d.error) toast(d.error, true); else toast("Crop published.");
          });
        }, 700);
      }
    }
    lay.addEventListener("click", set);
    function esc(e) {
      if (e.key !== "Escape") return;
      document.removeEventListener("keydown", esc);
      closeFocus();
    }
    document.addEventListener("keydown", esc);
  }

  /* Photographs added in the browser live here for the session. They are
     previews: a static site has no server to write to, so the file itself
     still has to reach assets/photos/ in the repo before anyone else sees
     it. Uploading many at once is fine - they queue up in the picker and
     you assign them slot by slot. */
  var freshUploads = [];

  function openPicker(img) {
    var slot = img.getAttribute("data-pm-photo");

    loadLibrary().then(function (lib) {
      var wrap = document.createElement("div");
      wrap.id = "pm-picker";
      wrap.innerHTML =
        '<div class="box">' +
          '<div class="p-head">' +
            "<h3>Swap <span>" + slot + "</span></h3>" +
            '<input class="p-search" id="pm-search" type="search" placeholder="Filter by name">' +
            '<button class="p-x" id="pm-close" aria-label="Close">&times;</button>' +
          "</div>" +
          '<div class="drop" id="pm-drop">' +
            '<button class="up" id="pm-up">Upload photos</button>' +
            '<div class="d-txt">' + (LIVE
              ? "<b>Drag them anywhere in this window</b> - as many as you like. " +
                "They upload to the photo store and go live for every visitor as soon as you pick one."
              : "<b>Drag them anywhere in this window</b> - as many as you like. " +
                "No photo store is connected yet, so an upload previews in this browser only: the file " +
                "still has to reach <code>assets/photos/</code> and be pushed.") + "</div>" +
            '<input type="file" accept="image/*,video/mp4,video/webm,video/quicktime" multiple id="pm-file" hidden>' +
          "</div>" +
          '<div id="pm-lib"></div>' +
        "</div>";
      document.body.appendChild(wrap);

      var libBox = wrap.querySelector("#pm-lib");
      var fileEl = wrap.querySelector("#pm-file");
      var drop   = wrap.querySelector("#pm-drop");

      // repo photographs are stored by filename (that's what config.js wants);
      // an upload is stored as the data URL itself
      function tile(src, label, fresh, file) {
        var media = isFilm(src)
          ? '<video src="' + src + '" muted loop playsinline preload="metadata"></video>' +
            '<span class="film">film</span>'
          : '<img src="' + src + '" alt="" loading="lazy">';
        return '<button data-src="' + src + '"' + (file ? ' data-file="' + file + '"' : "") +
          ' class="' + (fresh ? "fresh" : "") + (isFilm(src) ? " isfilm" : "") + '">' +
          media + '<div class="nm' + (fresh ? " new" : "") + '">' + label + "</div></button>";
      }

      function renderLib() {
        var term = (wrap.querySelector("#pm-search").value || "").toLowerCase();
        var files = lib.files.filter(function (f) { return !term || f.toLowerCase().indexOf(term) > -1; });
        var ups = freshUploads.filter(function (u) { return !term || u.name.toLowerCase().indexOf(term) > -1; });
        libBox.innerHTML =
          (ups.length ? '<div class="g-head">Just uploaded &middot; ' +
             (LIVE ? "in the photo store" : "preview only, not in the repo") + "</div><div class=\"grid\">" +
             ups.map(function (u) { return tile(u.url, u.name, true); }).join("") + "</div>" : "") +
          '<div class="g-head">In the repo &middot; ' + lib.files.length + " photographs</div>" +
          (files.length ? '<div class="grid">' + files.map(function (f) {
              return tile(lib.dir + f, f, false, f);
            }).join("") + "</div>"
          : '<p class="pm-note" style="padding:16px 22px">Nothing matches &ldquo;' + term + "&rdquo;.</p>");
      }
      renderLib();

      function choose(src) {
        photos[slot] = src;
        try { ls(KEY_PHOTOS, JSON.stringify(photos)); }
        catch (e) { /* a data: URL can overflow the quota - the preview still works */ }
        applyPhotos(); showBadges();
        wrap.remove();
        if (!LIVE) { renderPhoto(); return; }
        if (String(src).indexOf("data:") === 0) { renderPhoto(); return; }  // never publishable
        publishSlot(slot, src).then(function (d) {
          if (d.error) toast(d.error, true);
          else toast("Published - everyone sees this now.");
          renderPhoto();
        });
      }

      function say(msg, bad) {
        var el = wrap.querySelector(".d-txt");
        if (el) el.innerHTML = '<b style="color:' + (bad ? "#E8B48A" : "#B4D18A") + '">' + msg + "</b>";
      }

      function take(files) {
        var list = [].slice.call(files || []).filter(function (f) { return /^(image|video)\//.test(f.type); });
        if (!list.length) return;

        /* With a photo store connected the file goes UP - to R2, through the
           Worker - and comes back as a URL every visitor can load. Without
           one all we can do is read it into this browser as a preview. */
        if (LIVE) {
          var done = 0, urls = [];
          say("Uploading 0 of " + list.length + "&hellip;");
          list.forEach(function (f, i) {
            uploadPhoto(f).then(function (d) {
              done++;
              if (d.error) { say(d.error, true); return; }
              urls[i] = { name: f.name, url: d.url };
              freshUploads.unshift({ name: f.name, url: d.url, live: true });
              say("Uploading " + done + " of " + list.length + "&hellip;");
              if (done < list.length) return;
              var ok = urls.filter(Boolean);
              if (ok.length === 1) choose(ok[0].url);          // you meant this slot
              else { say(ok.length + " uploaded - pick one for this slot."); renderLib(); }
            });
          });
          return;
        }

        var left = list.length, added = [];
        list.forEach(function (f, i) {
          var rd = new FileReader();
          rd.onload = function () {
            added[i] = { name: f.name, url: rd.result };
            if (--left) return;
            added.filter(Boolean).forEach(function (u) { freshUploads.unshift(u); });
            // one file means you meant this slot; several means you're stocking up
            if (added.length === 1) choose(added[0].url);
            else renderLib();
          };
          rd.readAsDataURL(f);
        });
      }

      wrap.querySelector("#pm-up").addEventListener("click", function () { fileEl.click(); });
      libBox.addEventListener("mouseover", function (e) {
        var v = e.target.closest("button") && e.target.closest("button").querySelector("video");
        if (v && v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
      });
      fileEl.addEventListener("change", function (e) { take(e.target.files); e.target.value = ""; });
      wrap.querySelector("#pm-search").addEventListener("input", renderLib);

      ["dragenter", "dragover"].forEach(function (ev) {
        wrap.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("over"); });
      });
      ["dragleave", "drop"].forEach(function (ev) {
        wrap.addEventListener(ev, function (e) {
          e.preventDefault();
          if (ev === "dragleave" && wrap.contains(e.relatedTarget)) return;
          drop.classList.remove("over");
          if (ev === "drop") take(e.dataTransfer && e.dataTransfer.files);
        });
      });

      wrap.addEventListener("click", function (e) {
        if (e.target === wrap || e.target.id === "pm-close") { wrap.remove(); return; }
        var btn = e.target.closest("button[data-src]");
        if (btn) choose(btn.getAttribute("data-file") || btn.getAttribute("data-src"));
      });

      function esc(e) {
        if (e.key !== "Escape") return;
        document.removeEventListener("keydown", esc);
        wrap.remove();
      }
      document.addEventListener("keydown", esc);
    });
  }

  /* ------------------------------------------------------------- layout --- */

  var LAYOUTS = [
    { id: "a", name: "Current", note: "The design as built.",
      bullets: ["Eight sections at roughly equal weight",
                "Every section ends with buttons",
                "Nine-plus type sizes in play"] },
    { id: "tight", name: "Tightened", note: "The design critique applied.",
      bullets: ["Two big moments per page, the rest become bands",
                "Secondary CTAs demoted to text links - one primary per screen",
                "Type collapsed to six sizes",
                "Statement bands go dark; clay stops carrying display type",
                "Shorter: smaller series images, tighter heroes",
                "Empty teacher frames hidden until there are photographs"] },
    { id: "house", name: "Primal Moves", note: "primalmoves.com's treatment, in our colours and limewash.",
      bullets: ["Headings in caps at the lightest weight",
                "No italics anywhere",
                "One heading per section, never a second poetic line",
                "Body copy in sentence case, held to one column",
                "Roughly twice the vertical air",
                "Outline pill buttons; tall photographs"] }
  ];

  function renderLayout() {
    var body = document.getElementById("pm-body");
    body.innerHTML =
      '<p class="pm-note" style="margin-bottom:18px">Three takes on the same content. Switch and scroll - ' +
      "the choice follows you from page to page.</p>" +
      LAYOUTS.map(function (L) {
        var on = layout === L.id;
        return '<div class="preset lay' + (on ? " on" : "") + '" data-lay="' + L.id + '">' +
          '<div class="p-top"><b>' + L.name + "</b>" +
          '<span class="p-apply">' + (on ? "Showing" : "Switch") + "</span></div>" +
          '<div class="p-note">' + L.note + "</div>" +
          "<ul class=\"lay-list\">" + L.bullets.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" +
          "</div>";
      }).join("") +
      '<p class="pm-note" style="margin-top:16px">Neither can fix the real gap: <b>two photographs in 5,700px of homepage</b>. ' +
      "That needs pictures, not CSS. See <code>strategy/design-critique.md</code>.</p>" +
      '<p class="pm-note" style="margin-top:12px">To make one the default for everyone, set ' +
      "<code>layout</code> in <code>config.js</code>.</p>";

    body.querySelectorAll(".preset.lay").forEach(function (el) {
      el.addEventListener("click", function () {
        applyLayout(el.getAttribute("data-lay"));
        autosave();
        renderLayout();
        [].slice.call(document.querySelectorAll(".pm-swap-badge")).forEach(function (x) { if (x._place) x._place(); });
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

  // The words as the repo has them. Captured before any saved edit is put on
  // the page, so switching configs can always get back to the written copy.
  function snapshotOriginals() {
    copyTargets().forEach(function (el) {
      var k = el.getAttribute("data-pm-copy");
      if (!(k in originals)) originals[k] = el.innerHTML;
    });
  }

  // Replace the whole set of text edits at once - anything the incoming set
  // doesn't mention goes back to the written copy rather than lingering.
  function setCopy(map) {
    snapshotOriginals();
    Object.keys(copyEdits).forEach(function (k) {
      if (k in map) return;
      var el = document.querySelector('[data-pm-copy="' + k + '"]');
      if (el && k in originals) el.innerHTML = originals[k];
    });
    copyEdits = Object.assign({}, map);
    ls(KEY_COPY, JSON.stringify(copyEdits));
    applyCopy();
  }

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
  // keystroke - re-rendering mid-type would steal the caret
  function onBlur() { if (copyOn) renderCopy(); }

  function onEdit(e) {
    var el = e.target, k = el.getAttribute("data-pm-copy");
    if (el.innerHTML === originals[k]) delete copyEdits[k];
    else copyEdits[k] = el.innerHTML;
    ls(KEY_COPY, JSON.stringify(copyEdits));
    var n = document.getElementById("pm-copy-count");
    if (n) n.textContent = Object.keys(copyEdits).length;
    autosave();
  }

  /* Every tracked change writes itself to the ACTIVE config in the shared
     store, debounced - type, pause a beat, and it is saved for every device.
     No active config means the Default site is on screen, and the Default
     never takes an edit: it only changes through a deploy. */
  function saveState(el, cls, txt) {
    var t = el || document.getElementById("pm-autosave");
    if (!t) return;
    t.className = "pm-save " + cls; t.textContent = txt;
  }
  function autosave() {
    if (!activeName || !api()) return;
    saveState(null, "busy", "saving\u2026");
    clearTimeout(autosave._t);
    autosave._t = setTimeout(function () {
      var note = ((remote || []).filter(function (x) { return x.name === activeName; })[0] || {}).note || "";
      var body = Object.assign({ name: activeName, note: note }, current());
      var h = writeHeaders({ "Content-Type": "application/json" });
      if (!h) { saveState(null, "err", "no write key"); return; }
      fetch(api(), { method: "POST", headers: h, body: JSON.stringify(body) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.error) { saveState(null, "err", d.error); return; }
          remote = d.presets || remote;
          saveState(null, "ok", "saved \u2713 \u00b7 every device sees it");
        })
        .catch(function () { saveState(null, "err", "store not answering \u2014 kept locally"); });
    }, 900);
  }

  function renderCopy() {
    var body = document.getElementById("pm-body");
    var keys = Object.keys(copyEdits);
    var shared = (remote || []).map(function (x) { return x.name; }).filter(function (n) { return String(n).indexOf("__") !== 0; });
    var locked = !activeName;
    body.innerHTML =
      '<div class="field"><h4 style="margin:0 0 8px">Editing</h4>' +
        '<select id="pm-cfg-pick" style="width:100%;padding:10px 12px;background:#1D2024;color:#E8E6E0;' +
          'border:1px solid #26292E;border-radius:5px;font:inherit;font-size:12.5px">' +
          '<option value=""' + (locked ? " selected" : "") + ">Default \u2014 the real site (locked)</option>" +
          shared.map(function (n) {
            return '<option value="' + n.replace(/"/g, "&quot;") + '"' +
              (n === activeName ? " selected" : "") + ">" + n + "</option>";
          }).join("") +
          '<option value="__new__">\u002b New config\u2026</option>' +
        "</select>" +
        (locked
          ? '<p class="pm-note" style="margin-top:9px">The Default is what visitors see \u2014 it only ' +
            "changes through a deploy, so it can\u2019t be edited here. Pick a config, or create one, " +
            "and everything you type saves to it as you go.</p>"
          : '<p class="pm-note" style="margin-top:9px">Everything you change saves to ' +
            "<b style=\"color:#B9C79E\">" + activeName + "</b> as you type \u2014 open the same config " +
            'on any device and it\u2019s there. <span id="pm-autosave" class="pm-save"></span></p>') +
      "</div>" +
      '<div class="field">' +
        '<label class="tog"><input type="checkbox" id="pm-copy-on"' +
        (copyOn && !locked ? " checked" : "") + (locked ? " disabled" : "") +
        "> Edit text on the page</label>" +
        '<p class="pm-note" style="margin-top:9px">' +
        (locked
          ? "Editing unlocks once a config is selected."
          : "Every heading and paragraph becomes editable. Click into one and type. " +
            "<b>Enter</b> finishes, <b>Esc</b> puts the original back.") + "</p>" +
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

    document.getElementById("pm-copy-on").checked = copyOn && !locked;
    document.getElementById("pm-copy-on").addEventListener("change", function (e) {
      e.target.checked ? startCopy() : stopCopy();
    });
    document.getElementById("pm-cfg-pick").addEventListener("change", function (e) {
      var v = e.target.value;
      if (v === "__new__") {
        var n = (prompt("Name the config \u2014 e.g. \u201cmiki\u201d or \u201ccaley 2\u201d") || "").trim();
        if (!n) { renderCopy(); return; }
        if ((remote || []).some(function (x) { return x.name === n; })) {
          toast("\u201c" + n + "\u201d already exists \u2014 selected it instead.");
          var pr = (remote || []).filter(function (x) { return x.name === n; })[0];
          applyPreset(pr); renderCopy(); return;
        }
        setActive(n); autosave(); if (!copyOn) startCopy(); renderCopy();
        toast("\u201c" + n + "\u201d created \u2014 edits save to it as you type.");
        return;
      }
      if (!v) {                       // back to the locked Default
        if (copyOn) stopCopy();
        colors = {}; ls(KEY_COLORS, "{}");
        ROLES.forEach(function (r) { document.documentElement.style.removeProperty(r.v); });
        applyColors(); setCopy({}); applyLayout(CFG.layout || "a");
        texture = CFG.texture ? (CFG.texture === "faint" ? 1 : 2) : 0;
        ls(KEY_TEX, String(texture)); applyTexture();
        setActive(""); renderCopy(); return;
      }
      var pr = (remote || []).filter(function (x) { return x.name === v; })[0];
      if (pr) { applyPreset(pr); if (!copyOn) startCopy(); renderCopy(); }
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

  /* -------------------------------------------------------------- staff --- */
  /* Teachers and staff, managed in place - names, roles, add, remove -
     saved to the shared store so every device and every visitor gets the
     same roster. Photographs still publish through the photo slots; the
     thumbnail here jumps you to that person's portrait when it is on the
     current page. */
  function rosterState() {
    var r = window.PM_ROSTER;
    if (r && r.teachers) return { teachers: r.teachers.slice(), staff: (r.staff || []).slice() };
    return { teachers: [], staff: [] };
  }
  function nextSlot(r) {
    var n = 1;
    r.teachers.concat(r.staff).forEach(function (t) {
      var m = /teacher-(\d+)$/.exec(t.slot || "");
      if (m) n = Math.max(n, parseInt(m[1], 10));
    });
    return "studio.teacher-" + (n + 1);
  }
  function saveRoster(r, chipEl) {
    window.PM_ROSTER = r;
    if (window.PM_APPLY_ROSTER) window.PM_APPLY_ROSTER(r);
    clearTimeout(saveRoster._t);
    var chip = function (cls, txt) { if (chipEl) { chipEl.className = "pm-save " + cls; chipEl.textContent = txt; } };
    chip("busy", "saving\u2026");
    saveRoster._t = setTimeout(function () {
      var h = writeHeaders({ "Content-Type": "application/json" });
      if (!h || !api()) { chip("err", "no store"); return; }
      fetch(api(), { method: "POST", headers: h,
        body: JSON.stringify({ name: "__staff__", note: "the roster - managed from the Staff tab",
          copy: { __roster__: JSON.stringify(r) } }) })
        .then(function (x) { return x.json(); })
        .then(function (d) { chip(d.error ? "err" : "ok", d.error || "saved \u2713 \u00b7 live for everyone"); })
        .catch(function () { chip("err", "store not answering"); });
    }, 800);
  }
  function renderStaff() {
    var body = document.getElementById("pm-body");
    var r = rosterState();
    function rows(list, kind) {
      return list.map(function (t, i) {
        var ph = (window.PM_CONFIG && (window.PM_CONFIG.photos || {})[t.slot]) || "";
        var abs = /^(https?:)?\/\//.test(ph) || ph.indexOf("data:") === 0 || ph.charAt(0) === "/";
        var thumb = ph ? '<span class="st-thumb" data-slot="' + t.slot + '" style="background-image:url(' +
          (abs ? ph : ((document.querySelector("[data-pm-photo][src]") || { src: "" }).src || "").replace(/[^/]+$/, "") + ph) + ')"></span>'
          : '<span class="st-thumb empty" data-slot="' + t.slot + '">+</span>';
        return '<div class="st-row" data-kind="' + kind + '" data-i="' + i + '">' + thumb +
          '<input class="st-name" value="' + String(t.name || "").replace(/"/g, "&quot;") + '" placeholder="Name">' +
          '<input class="st-role" value="' + String(t.role || "").replace(/"/g, "&quot;") + '" placeholder="Role">' +
          '<button class="st-del" aria-label="Remove">\u00d7</button></div>';
      }).join("");
    }
    body.innerHTML =
      '<div class="field"><p class="pm-note">Names and roles save as you type - to the shared store, ' +
      "so every device sees the same roster. The thumbnail jumps to that person\u2019s portrait " +
      "when their card is on this page (teachers live on Classes, staff on Studio). " +
      '<span id="pm-staff-save" class="pm-save"></span></p></div>' +
      '<div class="p-group"><h4>Teachers \u00b7 on the classes page</h4><div id="st-teachers">' +
      rows(r.teachers, "teachers") + "</div>" +
      '<button class="act ghost st-add" data-kind="teachers">+ Add a teacher</button></div>' +
      '<div class="p-group"><h4>Staff \u00b7 on the studio page</h4><div id="st-staff">' +
      rows(r.staff, "staff") + "</div>" +
      '<button class="act ghost st-add" data-kind="staff">+ Add staff</button></div>';

    var chip = document.getElementById("pm-staff-save");
    function commit() { saveRoster(r, chip); }
    body.addEventListener("input", function (e) {
      var row = e.target.closest(".st-row"); if (!row) return;
      var t = r[row.getAttribute("data-kind")][+row.getAttribute("data-i")];
      if (e.target.classList.contains("st-name")) t.name = e.target.value.trim();
      if (e.target.classList.contains("st-role")) t.role = e.target.value.trim();
      commit();
    });
    body.addEventListener("click", function (e) {
      var del = e.target.closest(".st-del");
      if (del) {
        var row = del.closest(".st-row");
        r[row.getAttribute("data-kind")].splice(+row.getAttribute("data-i"), 1);
        saveRoster(r, chip); renderStaff(); return;
      }
      var add = e.target.closest(".st-add");
      if (add) {
        r[add.getAttribute("data-kind")].push({ slot: nextSlot(r), name: "", role: add.getAttribute("data-kind") === "staff" ? "Front desk" : "Coach", bio: "" });
        saveRoster(r, chip); renderStaff(); return;
      }
      var th = e.target.closest(".st-thumb");
      if (th) {
        var el = document.querySelector('.portrait[data-pm-photo="' + th.getAttribute("data-slot") + '"], [data-pm-photo="' + th.getAttribute("data-slot") + '"]');
        if (el && el.offsetParent) { openPicker(el); }
        else toast("Their portrait frame isn\u2019t on this page - open Classes (teachers) or Studio (staff) and try again.");
      }
    });
  }

  /* ------------------------------------------------------------ presets --- */
  /* Three places a preset can live:
       shared   - the Worker, if PM_CONFIG.presetsApi is set. Everyone sees it.
       repo     - presets.json, committed. Everyone sees it, saving needs a push.
       mine     - this browser only, for something half-finished.             */

  // read lazily: config.js derives presetsApi from liveApi, and depending on
  // load order this file can run first
  function api() { return String((window.PM_CONFIG || {}).presetsApi || ""); }
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
    if (api()) {
      jobs.push(fetch(api(), { cache: "no-store" }).then(function (r) { return r.json(); })
        .then(function (d) { remote = d.presets || []; }).catch(function () { remote = null; }));
    }
    return Promise.all(jobs);
  }

  // A config is colour, wording and layout. Photographs are deliberately NOT
  // in here: they publish to everyone the moment they're swapped, so putting
  // them in a config would mean two sources of truth for the same picture.
  function current() {
    return { colors: colors, copy: copyEdits, layout: layout, texture: texture };
  }

  var activeName = ls(KEY_ACTIVE) || "";
  function setActive(n) { activeName = n || ""; n ? ls(KEY_ACTIVE, n) : lsDel(KEY_ACTIVE); }

  function applyPreset(pr) {
    colors = Object.assign({}, pr.colors || {});
    ls(KEY_COLORS, JSON.stringify(colors));
    // clear any previously-set vars that this config doesn't define
    ROLES.forEach(function (r) {
      if (!colors[r.v]) document.documentElement.style.removeProperty(r.v);
    });
    applyColors();
    if (pr.texture !== undefined) {
      texture = typeof pr.texture === "number" ? pr.texture : (pr.texture ? 1 : 0);
      ls(KEY_TEX, String(texture)); applyTexture();
    }
    setCopy(pr.copy || {});
    applyLayout(pr.layout || "a");
    setActive(pr.name);
    renderPresets();
  }

  function countOf(pr) {
    var bits = [];
    var c = Object.keys(pr.colors || {}).length; if (c) bits.push(c + " colour" + (c > 1 ? "s" : ""));
    var cp = Object.keys(pr.copy || {}).length; if (cp) bits.push(cp + " text edit" + (cp > 1 ? "s" : ""));
    bits.push((pr.layout === "tight" ? "Tightened" : "Current") + " layout");
    if (pr.texture) bits.push(pr.texture === 1 ? "faint limewash" : "limewash");
    return bits.join(" \u00b7 ");
  }

  function renderPresets() {
    var body = document.getElementById("pm-body");
    var mine = localPresets();
    var shared = (remote !== null ? remote : repo || []).filter(function (x) { return String(x.name).indexOf("__") !== 0; });
    var sharedLabel = remote !== null ? "Shared &middot; everyone sees these" : "Shared &middot; from the repo";
    var active = shared.concat(mine).filter(function (x) { return x.name === activeName; })[0];

    function card(pr, where) {
      var on = pr.name === activeName;
      return '<div class="preset cfg' + (on ? " on" : "") + '" data-name="' +
        pr.name.replace(/"/g, "&quot;") + '" data-where="' + where + '">' +
        '<div class="p-top"><b>' + pr.name + "</b>" +
        '<span class="p-apply">' + (on ? "Showing" : "Apply") + "</span></div>" +
        (pr.note ? '<div class="p-note">' + pr.note + "</div>" : "") +
        '<div class="p-meta">' + countOf(pr) + "</div>" +
        '<div class="p-chips">' + ROLES.slice(0, 9).map(function (r) {
          var c = (pr.colors || {})[r.v];
          return c ? '<i style="background:' + c + '"></i>' : "";
        }).join("") + "</div>" +
        '<div class="p-row">' +
          '<button class="p-up">Save what&rsquo;s on screen into this</button>' +
          (where !== "repo" ? '<button class="p-del">Delete</button>' : "") +
        "</div></div>";
    }

    body.innerHTML =
      '<p class="pm-note" style="margin-bottom:16px">A config is colour, wording and layout together. ' +
      "Save one, keep working, then save back into it. Nothing here changes what visitors see - " +
      "photographs are the part that publishes.</p>" +
      '<div class="live-state' + (api() ? " on" : "") + '" style="margin-bottom:16px">' +
        (api()
          ? "<b>Saved for everyone.</b> Configs live in the shared store, so anyone who opens this " +
            "site sees the same list - name one <i>Caley 1</i> and Caley can load it on her own laptop." +
            (remote === null ? '<span style="color:#E8B48A">Not reachable right now - showing the repo copy.</span>' : "")
          : "<b>This browser only.</b> No shared store is connected, so a config saves locally. " +
            "Set <code>liveApi</code> in <code>config.js</code>.") +
      "</div>" +
      '<div class="field">' +
        '<label class="p-lab">' + (active ? "Working from" : "Nothing loaded") + "</label>" +
        '<div class="p-active">' + (active ? "<b>" + active.name + "</b><span>" + countOf(current()) + "</span>"
                                           : "<span>Changes on screen aren’t part of a config yet.</span>") + "</div>" +
        (active ? '<button class="act" id="pm-pupdate">Update &ldquo;' + active.name + '&rdquo;</button>' : "") +
        '<label class="p-lab" style="margin-top:16px">Save as a new config</label>' +
        '<input id="pm-pname" type="text" placeholder="Name it - e.g. Warmer, tighter" maxlength="60">' +
        '<input id="pm-pnote" type="text" placeholder="One line about it (optional)" maxlength="200">' +
        '<div class="p-actions">' +
          '<button class="act' + (active ? " ghost" : "") + '" id="pm-psave">' +
            (api() ? "Save for everyone" : "Save to this browser") + "</button>" +
          (api() ? "" : '<button class="act ghost" id="pm-pcopy">Copy presets.json</button>') +
        "</div>" +
        (api() ? "" : '<p class="pm-note" style="margin-top:10px">No shared store connected yet, so a save stays in your browser. ' +
          "Use <b>Copy presets.json</b> and paste it into <code>design-9/presets.json</code> so everyone sees it. " +
          "Wire up the Worker in <code>tools/presets-worker.js</code> and saves become instant for the whole team.</p>") +
      "</div>" +
      '<div class="p-group"><h4>' + sharedLabel + "</h4>" +
        (shared.length ? shared.map(function (p2) { return card(p2, remote !== null ? "remote" : "repo"); }).join("")
                       : '<p class="pm-note">Nothing saved yet.</p>') +
      "</div>" +
      (mine.length ? '<div class="p-group"><h4>Only in this browser</h4>' +
        mine.map(function (p2) { return card(p2, "local"); }).join("") + "</div>" : "");

    /* ---- saving ---------------------------------------------------------
       Same path for a new config and for an update: the store replaces by
       name, so "update" is a save under a name that already exists.        */
    function persist(pr, where, done) {
      if (!api() || where === "local") {
        var list = localPresets().filter(function (x) { return x.name !== pr.name; });
        list.push(pr); saveLocal(list); setActive(pr.name); if (done) done(); renderPresets(); return;
      }
      var h = writeHeaders({ "Content-Type": "application/json" }); if (!h) return;
      fetch(api(), { method: "POST", headers: h, body: JSON.stringify(pr) })
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.error) { lsDel(KEY_WKEY); alert(d.error); return; }
          remote = d.presets; setActive(pr.name); if (done) done(); renderPresets();
        })
        .catch(function () { alert("Could not reach the config store."); });
    }

    function snapshot(name, note) {
      var cur = current();
      return { name: name, note: note || "", colors: cur.colors, copy: cur.copy,
               layout: cur.layout, texture: cur.texture };
    }

    var upBtn = document.getElementById("pm-pupdate");
    if (upBtn) upBtn.addEventListener("click", function () {
      var where = mine.some(function (x) { return x.name === active.name; }) ? "local"
                : remote !== null ? "remote" : "local";
      persist(snapshot(active.name, active.note), where, function () {
        // a repo config edited here can only live locally until it's pushed
      });
    });

    body.querySelectorAll(".preset.cfg").forEach(function (el) {
      var name = el.getAttribute("data-name"), where = el.getAttribute("data-where");
      var list = where === "local" ? mine : shared;
      var pr = list.filter(function (x) { return x.name === name; })[0];

      el.querySelector(".p-apply").addEventListener("click", function () { if (pr) applyPreset(pr); });

      // two-step, so a stray click can't overwrite somebody's config
      var up = el.querySelector(".p-up");
      if (up) up.addEventListener("click", function () {
        if (up.dataset.armed !== "1") {
          up.dataset.armed = "1";
          up.classList.add("armed");
          up.innerHTML = "Overwrite &ldquo;" + name + "&rdquo;?";
          setTimeout(function () {
            if (!up.parentNode) return;
            up.dataset.armed = ""; up.classList.remove("armed");
            up.innerHTML = "Save what&rsquo;s on screen into this";
          }, 4000);
          return;
        }
        persist(snapshot(name, pr ? pr.note : ""), where === "repo" ? "local" : where);
      });

      var del = el.querySelector(".p-del");
      if (del) del.addEventListener("click", function () {
        if (name === activeName) setActive("");
        if (where === "local") { saveLocal(mine.filter(function (x) { return x.name !== name; })); renderPresets(); return; }
        var h = writeHeaders(); if (!h) return;
        fetch(api() + "?name=" + encodeURIComponent(name), { method: "DELETE", headers: h })
          .then(function (r) { return r.json(); })
          .then(function (d) { if (d.error) { lsDel(KEY_WKEY); alert(d.error); return; } remote = d.presets; renderPresets(); })
          .catch(function () { alert("Could not reach the config store."); });
      });
    });

    var saveBtn = document.getElementById("pm-psave");
    if (saveBtn) saveBtn.addEventListener("click", function () {
      var nameEl = document.getElementById("pm-pname");
      var name = (nameEl.value || "").trim();
      if (!name) { nameEl.focus(); toast("Give the config a name first.", true); return; }
      var snap = snapshot(name, (document.getElementById("pm-pnote").value || "").trim());
      var n = Object.keys(snap.copy || {}).length;
      persist(snap, api() ? "remote" : "local", function () {
        toast("Saved \u201c" + name + "\u201d" + (api() ? " for everyone" : " in this browser") +
              " \u00b7 " + n + " text edit" + (n === 1 ? "" : "s"));
      });
    });

    var copyBtn = document.getElementById("pm-pcopy");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var all = (repo || []).concat(localPresets());
      var seen = {}, dedup = [];
      all.reverse().forEach(function (x) { if (!seen[x.name]) { seen[x.name] = 1; dedup.unshift(x); } });
      var out = JSON.stringify({ presets: dedup }, null, 2);
      navigator.clipboard ? navigator.clipboard.writeText(out).then(function () {
        copyBtn.textContent = "Copied ✓";
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
    else if (b.dataset.tab === "staff") renderStaff();
    else if (b.dataset.tab === "layout") renderLayout();
    else renderPresets();
  });

  document.getElementById("pm-body").addEventListener("click", function (e) {
    var sw = e.target.closest(".sw");
    if (!sw) return;
    colors[sw.dataset.var] = sw.dataset.hex;
    autosave();
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
    out += "\n/* config.js */\ntexture: " +
      (texture === 1 ? '"faint"' : texture === 2 ? "true" : "false") + ",\n";
    var skipped = Object.keys(photos).length - named.length;
    if (skipped) out += "\n/* " + skipped + " uploaded preview(s) not included - add those files to assets/photos/ first. */\n";
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
    lsDel(KEY_ON); lsDel(KEY_COLORS); lsDel(KEY_PHOTOS); lsDel(KEY_FOCUS); lsDel(KEY_COPY); lsDel(KEY_LAYOUT);
    location.href = location.pathname;
  });

  var applyAll = function () { applyTexture(); applyPhotos(); applyFocus();
    setTimeout(function () { snapshotOriginals(); applyCopy(); }, 260); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", applyAll);
  else setTimeout(applyAll, 60);
  renderColor();
  loadPresets();

  // what's live right now - and a header line that tells the truth about it
  if (LIVE) {
    loadLive().then(function () {
      var sub = document.getElementById("pm-sub");
      if (sub) sub.innerHTML = "Photos publish live &middot; colour and text are configs";
      var fn = document.getElementById("pm-foot-note");
      if (fn) fn.innerHTML = "Photographs publish as you swap them. Colour and wording stay yours " +
        "until a config is pushed.";
      var on = document.querySelector("#pm-tabs button.on");
      if (on && on.dataset.tab === "photo") renderPhoto();
    });
  }
  if (!startClosed) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", showBadges);
    else setTimeout(showBadges, 120);
  }
})();
