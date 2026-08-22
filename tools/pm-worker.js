/* ============================================================================
   PRIMAL MOVES VENICE — STUDIO WORKER
   The piece that makes an edit real. Without it the EDIT panel can only ever
   change your own browser, because a static site has nowhere to write.

   WHAT IT HOLDS
     KV  PM_STUDIO   "live"     the published design everyone sees
                     "presets"  the saved configs
     R2  PM_PHOTOS              photographs uploaded through the panel

   WHAT PUBLISHES AND WHAT DOESN'T
     Photographs are the site. Swap one in the panel and it is live for
     everyone straight away — that is the whole point of this Worker.
     Colour and wording are NOT published: they are saved into configs, so
     the team can try versions without touching what visitors see. Making
     one of those the default is still a push to the repo, deliberately.

   ROUTES
     GET    /live                 the published photographs (public, 30s)
     POST   /live/photo           publish one slot      (needs X-Write-Key)
     DELETE /live/photo?slot=x    back to the repo photo (needs X-Write-Key)
     POST   /upload?name=x.jpg    store a photograph    (needs X-Write-Key)
     GET    /img/<key>            serve one            (public, immutable)
     GET    /presets              saved configs        (public)
     POST   /presets              save one             (needs X-Write-Key)
     DELETE /presets?name=x       delete one           (needs X-Write-Key)

   DEPLOY  see strategy/live-editing.md — about four commands.

   ON SECURITY: two modes.
     OPEN_WRITES = "true"   anyone with the link can change photographs. Right
                            for now — the team is choosing pictures and a
                            password in that loop helps nobody.
     OPEN_WRITES = "false"  the write key is required. Flip this before launch.
   The key is a shared password, not a login: it stops a passer-by, not a
   determined person, and there is no per-person audit beyond a timestamp.
   ========================================================================== */

const LIVE = "live";
const PRESETS = "presets";
const MAX_UPLOAD = 12 * 1024 * 1024;        // 12MB — a 2200px JPEG is ~1MB
const OK_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];

function cors(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOW_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Write-Key",
    "Access-Control-Max-Age": "86400",
  };
}
function json(env, data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors(env), ...extra },
  });
}
/* OPEN_WRITES = "true" means anybody with the link can change photographs.
   That is the right setting while the team is still choosing pictures — no
   key to pass around, no friction. Flip it to "false" before launch and the
   write key takes over. See strategy/GO-LIVE.md, "Locking it down". */
function isOpen(env) {
  return String(env.OPEN_WRITES || "").toLowerCase() === "true";
}
function authed(request, env) {
  if (isOpen(env)) return true;
  const key = request.headers.get("X-Write-Key") || "";
  return Boolean(env.WRITE_KEY) && key === env.WRITE_KEY;
}
async function readJSON(env, k, fallback) {
  const raw = await env.PM_STUDIO.get(k);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

/* The live record holds photographs and nothing else. Colour and copy are
   dropped on the floor here even if something sends them — publishing those
   is a repo push, on purpose. */
function cleanLive(body) {
  const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const strMap = (v, limit) => {
    const out = {}, src = obj(v);
    for (const k of Object.keys(src).slice(0, limit)) {
      if (typeof src[k] === "string") out[String(k).slice(0, 120)] = src[k].slice(0, 600);
    }
    return out;
  };
  return {
    photos: strMap(body.photos, 300),
    photoFocus: strMap(body.photoFocus || body.focus, 300),
    by: String(body.by || "").slice(0, 60),
    updatedAt: new Date().toISOString(),
  };
}

/* A config is the other half: colour, wording, layout — saved, never live. */
function cleanPreset(body) {
  const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) ? v : {});
  const strMap = (v, limit) => {
    const out = {}, src = obj(v);
    for (const k of Object.keys(src).slice(0, limit)) {
      if (typeof src[k] === "string") out[String(k).slice(0, 120)] = src[k].slice(0, 4000);
    }
    return out;
  };
  return {
    colors: strMap(body.colors, 60),
    copy: strMap(body.copy, 600),
    layout: body.layout === "tight" ? "tight" : "a",
    savedAt: new Date().toISOString(),
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (request.method === "OPTIONS") return new Response(null, { headers: cors(env) });

    /* ---- photographs ---------------------------------------------------- */
    if (path.startsWith("/img/")) {
      const key = decodeURIComponent(path.slice(5));
      const obj = await env.PM_PHOTOS.get(key);
      if (!obj) return new Response("Not found", { status: 404, headers: cors(env) });
      return new Response(obj.body, {
        headers: {
          ...cors(env),
          "Content-Type": obj.httpMetadata?.contentType || "image/jpeg",
          // the key contains a hash, so a file at a given URL never changes
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    if (path === "/upload" && request.method === "POST") {
      if (!authed(request, env)) return json(env, { error: "Bad or missing write key." }, 401);
      const type = request.headers.get("Content-Type") || "";
      if (!OK_TYPES.includes(type.split(";")[0].trim()))
        return json(env, { error: "Photographs only — JPEG, PNG, WebP, AVIF or GIF." }, 415);

      const buf = await request.arrayBuffer();
      if (!buf.byteLength) return json(env, { error: "Empty upload." }, 400);
      if (buf.byteLength > MAX_UPLOAD)
        return json(env, { error: `Too big — ${(buf.byteLength / 1048576).toFixed(1)}MB, the limit is 12MB.` }, 413);

      // content hash, so the same photograph uploaded twice is stored once
      const digest = await crypto.subtle.digest("SHA-256", buf);
      const hash = [...new Uint8Array(digest)].slice(0, 8)
        .map((b) => b.toString(16).padStart(2, "0")).join("");
      const raw = (url.searchParams.get("name") || "photo.jpg").split(/[\\/]/).pop();
      const safe = raw.replace(/[^\w.\-]+/g, "-").replace(/^-+|-+$/g, "").slice(-60) || "photo.jpg";
      const key = `${hash}-${safe}`;

      await env.PM_PHOTOS.put(key, buf, { httpMetadata: { contentType: type } });
      return json(env, { ok: true, key, url: `${url.origin}/img/${encodeURIComponent(key)}`,
                         bytes: buf.byteLength });
    }

    /* ---- the published photographs -------------------------------------- */
    if (path === "/live" && request.method === "GET") {
      const live = await readJSON(env, LIVE, null);
      // `open` tells the panel whether to ask for a key at all
      return json(env, { photos: {}, photoFocus: {}, ...(live || {}), open: isOpen(env) }, 200,
                  { "Cache-Control": "public, max-age=30" });
    }

    // one slot at a time, merged — two people editing different photographs
    // at once can't wipe each other out
    if (path === "/live/photo" && request.method === "POST") {
      if (!authed(request, env)) return json(env, { error: "Bad or missing write key." }, 401);
      let body;
      try { body = await request.json(); } catch { return json(env, { error: "Body must be JSON." }, 400); }
      const slot = String(body.slot || "").trim().slice(0, 120);
      if (!slot) return json(env, { error: "Which slot?" }, 400);
      const file = String(body.file || "").slice(0, 600);
      if (file.startsWith("data:"))
        return json(env, { error: "Upload the file first — a preview can't be published." }, 400);

      const live = await readJSON(env, LIVE, { photos: {}, photoFocus: {} });
      await env.PM_STUDIO.put(LIVE + ":prev", JSON.stringify(live));
      if (file) live.photos[slot] = file; else delete live.photos[slot];
      if (typeof body.focus === "string" && body.focus) live.photoFocus[slot] = body.focus.slice(0, 40);
      live.by = String(body.by || live.by || "").slice(0, 60);
      live.updatedAt = new Date().toISOString();

      await env.PM_STUDIO.put(LIVE, JSON.stringify(cleanLive(live)));
      return json(env, { ok: true, live });
    }

    if (path === "/live/photo" && request.method === "DELETE") {
      if (!authed(request, env)) return json(env, { error: "Bad or missing write key." }, 401);
      const slot = url.searchParams.get("slot");
      if (!slot) return json(env, { error: "Which slot? Pass ?slot=" }, 400);
      const live = await readJSON(env, LIVE, { photos: {}, photoFocus: {} });
      await env.PM_STUDIO.put(LIVE + ":prev", JSON.stringify(live));
      delete live.photos[slot]; delete live.photoFocus[slot];
      live.updatedAt = new Date().toISOString();
      await env.PM_STUDIO.put(LIVE, JSON.stringify(cleanLive(live)));
      return json(env, { ok: true, live });
    }

    /* ---- saved configs --------------------------------------------------- */
    if (path === "/presets" || path === "/") {
      const list = await readJSON(env, PRESETS, []);

      if (request.method === "GET")
        return json(env, { presets: list }, 200, { "Cache-Control": "no-store" });

      if (!authed(request, env)) return json(env, { error: "Bad or missing write key." }, 401);

      if (request.method === "POST") {
        let body;
        try { body = await request.json(); } catch { return json(env, { error: "Body must be JSON." }, 400); }
        const name = String(body.name || "").trim().slice(0, 60);
        if (!name) return json(env, { error: "A config needs a name." }, 400);

        const preset = { name, note: String(body.note || "").slice(0, 200), ...cleanPreset(body) };
        const next = list.filter((p) => p.name !== name);
        next.push(preset);
        if (next.length > 40) next.shift();
        await env.PM_STUDIO.put(PRESETS, JSON.stringify(next));
        return json(env, { ok: true, presets: next });
      }

      if (request.method === "DELETE") {
        const name = url.searchParams.get("name");
        if (!name) return json(env, { error: "Which one? Pass ?name=" }, 400);
        const next = list.filter((p) => p.name !== name);
        await env.PM_STUDIO.put(PRESETS, JSON.stringify(next));
        return json(env, { ok: true, presets: next });
      }
    }

    return json(env, { error: "No such route." }, 404);
  },
};
