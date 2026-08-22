# Photos — how to swap one

Every photograph on design-9 sits in a named **slot**. Slots follow Miki's
`page - section - slot` convention, so a shot she labels *"studio page, private
hire picture"* has an obvious home.

## Uploading a lot of photographs at once

The browser can't write to the repo — a static site has no server — so the
fast path for a batch is the folder, not the panel:

1. Drop the whole batch into `assets/photos/`.
2. Commit and push.
3. The **Index photos** Action rewrites `design-9/photos.json`, and every new
   file shows up in the design studio's picker within a minute. (Locally:
   `python3 tools/index_photos.py`.)
4. Open any page with `?admin=1`, hit **Swap** on a slot and pick the new one.
   Copy the config out of the panel and paste it into `design-9/config.js`.

Uploading through the picker is for *trying* a picture — drag as many as you
like onto it and they appear immediately, but they live in that one browser
and vanish when it's cleared. Nothing anybody swaps in the panel is live for
visitors until a config is pasted into the repo and pushed.

## Two ways to change a picture

**1. Same filename — no code at all.**
Drop the new file into `assets/photos/` using the same name as the one you're
replacing. Commit, push, done.

**2. New filename — one line.**
Put the file in `assets/photos/`, then open `design-9/config.js`, find the slot
in the `photos: { … }` block, and change the filename. That's the only edit.

```js
photos: {
  "home.hero": "miki-walkthrough-still.jpg",   // <- just this
  …
}
```

If you point a slot at a file that isn't there, the page keeps the picture it
already had and logs a note in the browser console — a typo can never leave a
broken image on the live site.

## The slots

| Slot | Where it appears | Currently |
|---|---|---|
| `home.hero` | Homepage hero — the video poster until Miki's cut lands | `joy-laughing.jpg` |
| `home.what-is-primal` | Homepage, "not a gym, a practice" | `collective-crawl.jpg` |
| `home.third-place` | Homepage, "where everybody knows your name" | `sauna-laughing.jpg` |
| `home.family` | Homepage, bring your family | **empty — kids on the floor needed** |
| `method.hero` | The Method, page hero | `handstand-wall-wide.jpg` |
| `method.series-1` | The Method, Series 1 · Primal | `collective-crawl-2.jpg` |
| `method.series-2` | The Method, Series 2 · Moves | `compound-dumbbells.jpg` |
| `method.series-3` | The Method, Series 3 · Progressions | `handstand-parallettes.jpg` |
| `method.series-4` | The Method, Series 4 · Handstand | `handstand-wall.jpg` |
| `studio.hero` | Studio, page hero | `space-rings-wide.jpg` |
| `studio.room-main-floor` | Studio, room by room | `space-bus-rings.jpg` |
| `studio.room-lounge` | Studio, the lounge | `space-lounge-rugs.jpg` |
| `studio.room-sauna` | Studio, sauna | `sauna-still.jpg` |
| `studio.room-plunge` | Studio, cold plunge | `plunge-two.jpg` |
| `studio.room-tea` | Studio, tea & meditation room | `tea-room.jpg` |
| `classes.hero` | Classes, page hero | `collective-downdog.jpg` |
| `memberships.hero` | Memberships, page hero | `boat-collective.jpg` |
| `events.hero` | Events, page hero | `space-floor-night.jpg` |
| `cherish.hero` | Cafe & Tea Lounge, page hero | `tea-room.jpg` — **this is the upstairs tea room, not the cafe** |
| `partners.hero` | Partners, page hero | `compound-dumbbells-crop.jpg` |
| `partners.pitch` | Partners, work with us | `bands-effort.jpg` |
| `shop.hero` | Shop, page hero | `barbell-joy.jpg` |

## Teacher portraits

These aren't slots — they're a grid on the Studio page. Each one is either a
photo or a labelled empty frame. Drop portraits into `assets/photos/` and
replace the empty frame in `build_d9.py`:

```html
<div class="portrait empty"><span>Portrait</span></div>
<!-- becomes -->
<div class="portrait"><img src="../../assets/photos/NAME.jpg" alt="NAME"></div>
```

Portraits look best shot vertically at 4:5. **Nick Brewer's frame is
deliberately empty** — the photo that was there was of someone else.

## Specs worth hitting

- **2200px on the long edge**, JPEG quality ~80. Everything in here is
  already at that size; the whole library is about 13MB.
- **Landscape for heroes and series**, portrait 4:5 for people.
- Faces and hands near the centre — heroes crop hard on phones.
- Candid and flash-lit beats posed. Bodies mid-movement, not holding still
  for the camera.
