#!/usr/bin/env python3
"""
Build schedule.json for design-9 from Mindbody's PUBLIC class-times API.

WHY THIS EXISTS
---------------
There were three routes to showing the timetable and two of them cost money
or time:

  1. Branded Web / Healcode widget — works, but it's a paid add-on and it
     renders in a cross-origin iframe we can't style.
  2. Mindbody Public API v6 — four approval gates, metered billing, needs a
     server-held staff token.
  3. THIS. The same public endpoint that powers mindbodyonline.com/explore,
     Mindbody's own consumer directory. No API key, no account, no cost. It
     is the studio's own data, published by Mindbody for public consumption.

Because we fetch it server-side and write a JSON file, the page renders the
timetable in OUR type and colour, and a Mindbody outage can't break it — the
last good file just keeps serving.

CAVEAT WORTH KNOWING
--------------------
This endpoint is undocumented. It could change shape or disappear without
notice. That is why the page degrades in order: our schedule.json, then the
Healcode widget if a widget ID is ever set, then a plain link to Mindbody.
Nothing here can leave a blank space on the site.

Booking is NOT handled here. Every class links out to Mindbody to book, which
is correct — they are the system of record and the merchant.

    python3 tools/fetch_schedule.py
"""
import json, sys, urllib.request, urllib.parse, datetime, pathlib, collections

TERM     = "Primal Moves Venice Beach"
SLUG     = "primal-moves-venice-beach"
SITE_ID  = "5745965"
DAYS     = 8                      # how far ahead to publish
BASE     = "https://prod-mkt-gateway.mindbody.io/v1/search/class_times"
OUT      = pathlib.Path(__file__).resolve().parent.parent / "design-9" / "schedule.json"
BOOK_URL = ("https://clients.mindbodyonline.com/classic/ws"
            f"?studioid={SITE_ID}&stype=-7&sView=day&sLoc=0&sTG=0")


def fetch_page(page):
    q = urllib.parse.urlencode({
        "filter[term]": TERM, "page[size]": 100, "page[number]": page,
    })
    req = urllib.request.Request(
        f"{BASE}?{q}",
        headers={"Accept": "application/json", "User-Agent": "primalmoves-site/1.0"},
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)


def main():
    rows = []
    try:
        for page in range(1, 8):
            data = fetch_page(page)
            batch = data.get("data", [])
            rows += [x["attributes"] for x in batch
                     if x["attributes"].get("location_slug") == SLUG]
            if len(batch) < 100:
                break
    except Exception as e:                                        # noqa: BLE001
        print(f"! could not reach Mindbody: {e}", file=sys.stderr)
        print("  leaving the existing schedule.json in place", file=sys.stderr)
        return 1

    now = datetime.datetime.now(datetime.timezone.utc)
    horizon = now + datetime.timedelta(days=DAYS)

    seen, out = set(), []
    for r in rows:
        start = r.get("class_time_start_time")
        if not start:
            continue
        dt = datetime.datetime.fromisoformat(start.replace("Z", "+00:00"))
        if not (now - datetime.timedelta(hours=1) <= dt <= horizon):
            continue
        name = (r.get("class_time_display_name") or r.get("course_name") or "").strip()
        staff = (r.get("instructor_name") or "").strip().rstrip(" .")
        # the index carries duplicates of the same session
        key = (start, name, staff)
        if key in seen:
            continue
        seen.add(key)
        out.append({
            "start": dt.isoformat().replace("+00:00", "Z"),
            "name": name,
            "staff": staff,
            "minutes": r.get("class_time_duration"),
            "category": (r.get("class_time_text_category") or "").strip(),
        })

    out.sort(key=lambda x: x["start"])
    payload = {
        "source": "mindbody-public",
        "siteId": SITE_ID,
        "days": DAYS,
        "fetchedAt": now.isoformat().replace("+00:00", "Z"),
        "bookUrl": BOOK_URL,
        "classes": out,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=1) + "\n")

    days = collections.Counter(c["start"][:10] for c in out)
    print(f"wrote {OUT} — {len(out)} classes across {len(days)} days")
    for d in sorted(days):
        print(f"   {d}  {days[d]:2d}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
