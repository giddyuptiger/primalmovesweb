#!/usr/bin/env python3
"""
Pull opening hours from the Google Business listing into design-9/config.js.

WHY THIS ISN'T AUTOMATIC
------------------------
Google's Places API needs an API key, and the key can't live in the page —
anyone could read it out of config.js and bill your account. So the fetch has
to happen server-side, exactly like tools/fetch_events.py does for Luma.

Right now the hours are typed into config.js by hand. That's the honest
trade: they change maybe once a year, and the footer already works out
open/closed live in the browser, so it's never stale in the way that matters.

TO SWITCH THIS ON
-----------------
1. Google Cloud console → enable the "Places API (New)".
2. Create an API key, restrict it to the Places API.
3. Find the Place ID for Primal Moves Venice:
   https://developers.google.com/maps/documentation/places/web-service/place-id
4. Export both and run this:

       export GOOGLE_MAPS_API_KEY=...
       export PRIMAL_PLACE_ID=...
       python3 tools/fetch_hours.py

It prints the `hours: [...]` block to paste into design-9/config.js. On
Cloudflare Pages this becomes a scheduled build step and the paste goes away.

Cost: Place Details is billed per call. One call a day is free-tier territory;
calling it per page view is not — another reason it belongs at build time.
"""
import json, os, sys, urllib.request

KEY = os.environ.get("GOOGLE_MAPS_API_KEY")
PLACE = os.environ.get("PRIMAL_PLACE_ID")
DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]


def main():
    if not KEY or not PLACE:
        print(__doc__)
        print("! GOOGLE_MAPS_API_KEY and PRIMAL_PLACE_ID must both be set.", file=sys.stderr)
        return 1

    url = f"https://places.googleapis.com/v1/places/{PLACE}"
    req = urllib.request.Request(url, headers={
        "X-Goog-Api-Key": KEY,
        "X-Goog-FieldMask": "regularOpeningHours,displayName",
    })
    try:
        data = json.load(urllib.request.urlopen(req, timeout=30))
    except Exception as e:                                        # noqa: BLE001
        print(f"! Places API call failed: {e}", file=sys.stderr)
        return 1

    periods = data.get("regularOpeningHours", {}).get("periods", [])
    if not periods:
        print("! No regularOpeningHours on that place.", file=sys.stderr)
        return 1

    rows = {}
    for p in periods:
        o, c = p.get("open", {}), p.get("close", {})
        d = DAYS[o.get("day", 0)]
        rows[d] = (f"{o.get('hour',0):02d}:{o.get('minute',0):02d}",
                   f"{c.get('hour',0):02d}:{c.get('minute',0):02d}")

    print(f"// {data.get('displayName',{}).get('text','')} — from Google Places")
    print("  hours: [")
    out = []
    for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]:
        o, c = rows.get(d, ("00:00", "00:00"))
        out.append(f'    {{ day: "{d}", open: "{o}", close: "{c}" }}')
    print(",\n".join(out))
    print("  ],")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
