#!/usr/bin/env python3
"""
Build events.json for design-9 from Luma's public ICS feed.

Why this exists
---------------
Luma's own embed renders as a list and can't be restyled. But every Luma
calendar publishes a public iCalendar feed that needs no API key and no
Luma Plus subscription:

    https://api.lu.ma/ics/get?entity=calendar&id=<calendar-id>

That feed has no CORS headers, so a browser can't fetch it directly. This
script fetches it server-side, normalises it, and writes a small JSON file
the page renders itself. Run it at build time (or on a schedule) and commit
the result.

    python3 tools/fetch_events.py

Nothing here is hand-maintained: if an event isn't in Luma, it doesn't
appear on the site.
"""
import json, re, sys, urllib.request, datetime, pathlib

CALENDAR_ID = "cal-CRQbJyS4jRRrfsN"
FEED = f"https://api.lu.ma/ics/get?entity=calendar&id={CALENDAR_ID}"
OUT = pathlib.Path(__file__).resolve().parent.parent / "design-9" / "events.json"
FALLBACK = "https://luma.com/user/PrimalMoves"


def unfold(text):
    """iCal folds long lines with a leading space on the continuation."""
    return re.sub(r"\r?\n[ \t]", "", text)


def unescape(v):
    return (v.replace("\\,", ",").replace("\;", ";")
             .replace("\\n", " ").replace("\\N", " ").replace("\\\\", "\\")).strip()


def parse_dt(value, params):
    if "VALUE=DATE" in params:
        d = datetime.datetime.strptime(value, "%Y%m%d")
        return d.replace(tzinfo=datetime.timezone.utc), True
    if value.endswith("Z"):
        d = datetime.datetime.strptime(value, "%Y%m%dT%H%M%SZ")
        return d.replace(tzinfo=datetime.timezone.utc), False
    d = datetime.datetime.strptime(value, "%Y%m%dT%H%M%S")
    return d.replace(tzinfo=datetime.timezone.utc), False


def parse(ics):
    events, cur = [], None
    for line in unfold(ics).splitlines():
        if line == "BEGIN:VEVENT":
            cur = {}
            continue
        if line == "END:VEVENT":
            if cur:
                events.append(cur)
            cur = None
            continue
        if cur is None or ":" not in line:
            continue
        head, _, value = line.partition(":")
        name, _, params = head.partition(";")
        cur[name.upper()] = (value, params)
    return events


def event_url(e):
    """Luma's ICS has no URL field; the event link sits inside DESCRIPTION."""
    if "URL" in e:
        return unescape(e["URL"][0])
    desc = unescape(e["DESCRIPTION"][0]) if "DESCRIPTION" in e else ""
    m = re.search(r"https://(?:luma\.com|lu\.ma)/[A-Za-z0-9_-]+", desc)
    return m.group(0) if m else FALLBACK


def main():
    try:
        req = urllib.request.Request(FEED, headers={"User-Agent": "primalmoves-site/1.0"})
        ics = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "replace")
    except Exception as e:                                    # noqa: BLE001
        print(f"! could not reach Luma: {e}", file=sys.stderr)
        print("  leaving the existing events.json in place", file=sys.stderr)
        return 1

    now = datetime.datetime.now(datetime.timezone.utc)
    out = []
    for e in parse(ics):
        if "DTSTART" not in e or "SUMMARY" not in e:
            continue
        start, all_day = parse_dt(*e["DTSTART"])
        if start < now - datetime.timedelta(hours=12):
            continue                                          # past
        end = parse_dt(*e["END"])[0] if "END" in e else None
        out.append({
            "title": unescape(e["SUMMARY"][0]),
            "start": start.isoformat().replace("+00:00", "Z"),
            "allDay": all_day,
            "url": event_url(e),
            "location": unescape(e["LOCATION"][0]) if "LOCATION" in e else "",
        })

    out.sort(key=lambda x: x["start"])
    payload = {
        "source": "luma",
        "calendarId": CALENDAR_ID,
        "fetchedAt": now.isoformat().replace("+00:00", "Z"),
        "calendarUrl": FALLBACK,
        "events": out,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=1) + "\n")
    print(f"wrote {OUT} — {len(out)} upcoming events")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
