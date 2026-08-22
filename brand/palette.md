# Primal Moves Venice — brand palette

Sampled from Miki's colour board. Each hex is the measured average of that
circle's pixels, not an eyeballed match.

Contrast figures are against the cream ground `#EDE8D2`. **AA** means it clears
4.5:1 and can carry body-size text. **Large only** means 3:1 — safe for headings
at 24px+ but not for paragraphs. **Decorative** means fills, rules, dots and
photography only, never words.

## Neutrals — the grounds

| | Hex | Role |
|---|---|---|
| Cream | `#EDE8D2` | Default page ground |
| Taupe | `#DCCFB9` | Alternate sections |
| Sage grey | `#B0AB94` | Third tone — placeholders, panels |

## Dark neutral

| | Hex | On cream | Role |
|---|---|---|---|
| Navy | `#132238` | **13.0:1** | Body copy, headings, dark bands |

## Mains

| | Hex | On cream | Verdict |
|---|---|---|---|
| Blush | `#CD826A` | 2.44 | Decorative |
| Orange | `#C16838` | 3.22 | Large only |
| Mushroom | `#A68460` | 2.80 | Decorative |
| Olive | `#888151` | 3.22 | Large only |
| Dark olive | `#453A1D` | **9.10** | AA — text, fills, dark bands |
| Forest | `#303F16` | **9.24** | AA — text, fills, dark bands |
| Light sage | `#B9B784` | 1.68 | Decorative |
| Rust | `#9F663A` | 3.85 | Large only (white-on-fill is fine) |
| Brown | `#945A38` | **4.52** | AA — just clears it |

## Accents

| | Hex | On cream | Verdict |
|---|---|---|---|
| Gold | `#CE9C3B` | 2.02 | Decorative |
| Burnt red | `#AE411C` | **4.78** | AA — the natural accent-text colour |
| ~~Steel blue~~ | `#577C9F` | 3.57 | **Not used on the website** |
| ~~Electric blue~~ | `#030E9D` | 10.99 | **Not used on the website** |

## Text-safe variants

Eight of the seventeen colours are beautiful and too light to carry words. Rather
than drop them, here is each one darkened along its own hue until it clears AA on
cream. Use these when the colour is carrying text; use the originals above for
everything else.

| Colour | As drawn | Text variant | |
|---|---|---|---|
| Olive | `#888151` | `#6F6942` | 3.22 → 4.52 |
| Rust | `#9F663A` | `#905C34` | 3.85 → 4.53 |
| Orange | `#C16838` | `#9E552D` | 3.22 → 4.50 |
| Gold | `#CE9C3B` | `#836325` | 2.02 → 4.52 |
| Blush | `#CD826A` | `#8F5A4A` | 2.44 → 4.58 |
| Mushroom | `#A68460` | `#7C6348` | 2.80 → 4.57 |
| Light sage | `#B9B784` | `#6B6A4C` | 1.68 → 4.50 |
| Sage grey | `#B0AB94` | `#6B685A` | 1.88 → 4.55 |

## Buttons

These carry white label text at 4.5:1 or better, so they work as filled buttons:
**navy** `#132238` (16.0), **forest** `#303F16` (11.4), **dark olive** `#453A1D`
(11.2), **burnt red** `#AE411C` (5.9), **brown** `#945A38` (5.6), **rust**
`#9F663A` (4.7).

Gold, blush, orange, olive, mushroom and light sage do **not** — they need dark
label text instead, or they stay decorative.

## Suggested mapping for the site

| Site token | Brand colour |
|---|---|
| Page ground | Cream `#EDE8D2` |
| Alternate sections | Taupe `#DCCFB9` |
| Dark bands, footer | Forest `#303F16` or Navy `#132238` |
| Body copy | Navy `#132238` |
| Captions, meta | Sage grey text `#6B685A` |
| Primary button | Forest `#303F16` |
| Accent — rules, dots, small marks | Burnt red `#AE411C` |
| Accent text | Burnt red `#AE411C` or Brown `#945A38` |
| Photography surrounds, panels | Mushroom, blush, light sage, gold |

One thing worth flagging: this cream is **darker** than the one design-9 uses
(`#F5F1EA`), so every text colour on top of it loses a little contrast. That's
already accounted for in the figures above.


## Second set (Aug 22)

Four more from Miki, and the two darkened versions the accessible roles need.

| | Hex | Where it can go |
|---|---|---|
| Mustard | `#D4B906` | marks, dots, rules — **1.6 on cream, never words** |
| Deep mustard | `#6F5E03` | the same hue when it has to carry words (5.2) |
| Flame | `#F1540A` | the accent: rules, underlines, the odd mark (2.8 on cream) |
| Deep flame | `#B33A05` | flame as text (4.8) |
| Oxblood black | `#370707` | body copy, dark bands, button fill (14.2 on cream) |
| Warm cream | `#F0E6D3` | page ground |

Saved as the **Flame** configuration in the EDIT panel. Every role that carries
words clears 4.5:1; flame on the dark bands clears 3:1 for large type.
