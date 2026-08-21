/**
 * Primal Moves Venice — shared design presets
 * A Cloudflare Worker with a KV namespace. About 60 lines of actual logic.
 *
 * WHY THIS EXISTS
 * A static site has nowhere to write. Presets saved in the /admin studio live
 * in one person's browser until they're committed to the repo. This Worker
 * gives them a shared home, so Miki saves a preset and Gus sees it on refresh.
 *
 * READS are public — anyone loading the studio sees every preset.
 * WRITES need a key. It's a shared passphrase, not real auth, and that is the
 * right amount of security for a list of colour choices: the worst a leak
 * allows is someone adding a preset nobody has to use. Don't reuse a password.
 *
 * DEPLOY
 *   npm create cloudflare@latest primal-presets -- --type hello-world
 *   cd primal-presets
 *   # replace src/index.js with this file
 *   npx wrangler kv namespace create PRESETS
 *   # paste the returned id into wrangler.toml:
 *   #   [[kv_namespaces]]
 *   #   binding = "PRESETS"
 *   #   id = "..."
 *   npx wrangler secret put WRITE_KEY        # pick a passphrase
 *   npx wrangler secret put ALLOWED_ORIGIN   # e.g. https://venice.primalmoves.com
 *   npx wrangler deploy
 *
 * Then put the deployed URL into design-9/config.js as `presetsApi`.
 *
 * COST  Free tier: 100,000 KV reads and 1,000 writes a day. You will use
 *       single digits of writes. This costs nothing.
 */

const KEY = "presets:v1";

function cors(env, extra = {}) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,X-Write-Key",
    "Cache-Control": "no-store",
    ...extra,
  };
}

const json = (env, body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: cors(env, { "Content-Type": "application/json" }),
  });

async function load(env) {
  const raw = await env.PRESETS.get(KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function authed(request, env) {
  return Boolean(env.WRITE_KEY) &&
         request.headers.get("X-Write-Key") === env.WRITE_KEY;
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(env) });
    }

    // --- read: public -----------------------------------------------------
    if (request.method === "GET") {
      return json(env, { presets: await load(env) });
    }

    if (!authed(request, env)) {
      return json(env, { error: "Bad or missing write key." }, 401);
    }

    // --- save (create or replace by name) ---------------------------------
    if (request.method === "POST") {
      let body;
      try { body = await request.json(); }
      catch { return json(env, { error: "Body must be JSON." }, 400); }

      const name = String(body.name || "").trim().slice(0, 60);
      if (!name) return json(env, { error: "A preset needs a name." }, 400);

      const preset = {
        name,
        note: String(body.note || "").slice(0, 200),
        colors: body.colors && typeof body.colors === "object" ? body.colors : {},
        photos: body.photos && typeof body.photos === "object" ? body.photos : {},
        focus:  body.focus  && typeof body.focus  === "object" ? body.focus  : {},
        savedAt: new Date().toISOString(),
      };

      // reject data: URLs — a base64 image would blow past the 25MB value cap
      for (const k of Object.keys(preset.photos)) {
        if (String(preset.photos[k]).startsWith("data:")) delete preset.photos[k];
      }

      const list = (await load(env)).filter((p) => p.name !== name);
      list.push(preset);
      if (list.length > 40) list.shift();
      await env.PRESETS.put(KEY, JSON.stringify(list));
      return json(env, { ok: true, presets: list });
    }

    // --- delete by name ---------------------------------------------------
    if (request.method === "DELETE") {
      const name = new URL(request.url).searchParams.get("name");
      if (!name) return json(env, { error: "Which one? Pass ?name=" }, 400);
      const list = (await load(env)).filter((p) => p.name !== name);
      await env.PRESETS.put(KEY, JSON.stringify(list));
      return json(env, { ok: true, presets: list });
    }

    return json(env, { error: "Method not allowed." }, 405);
  },
};
