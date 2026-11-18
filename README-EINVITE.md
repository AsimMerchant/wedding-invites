# The Tale of F & A — e-invite

A single-page, mobile-first e-invitation for **Asim & Femina · 4–7 December 2026**.
Lives in `the-tale/`, deploys to GitHub Pages via GitHub Actions (`/.github/workflows/deploy-pages.yml`).

**Public link (reception guests):** https://asimmerchant.github.io/wedding-invites/reception/ —
same design, only the Reception chapter (7 Dec, Farohar Farms, Surat) with the
no-gifts note. Its WhatsApp preview card is `assets/img/og-card-reception.png`
(regenerate: `python3 planning/make-og-reception.py`).

**Full all-events invite:** lives at an unguessable path under `the-tale/` (the
`tale-…` directory). The path token is deliberately NOT written in this public
repo's docs — get it from Asim. The site root redirects to the reception invite,
so stripping `/reception/` from the public link reveals nothing. Share the full
link only with guests invited to all events.

## First-time setup (one click)

1. Push this branch to `main`.
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Run the workflow once (**Actions → Deploy the-tale → Run workflow**) or push a change under `the-tale/`.
4. Send the link on WhatsApp — the preview card comes from `assets/img/og-card.png`.

## Editing

- All wording (names, dates, venues, times) is plain HTML text in the full invite's
  `index.html` (inside the `tale-…` directory) and `the-tale/reception/index.html` — keep the two in sync.
- Event details for the "Calendar" buttons: `tale-…/events.js` (all events, secret path only)
  and `the-tale/assets/js/events-reception.js` (reception only). `calendar.js` holds just the
  .ics/maps/copy helpers. Keep data in sync with the HTML.
- Privacy rule: nothing under shared `assets/` may carry other events' dates, venues or
  links, and no shared file may contain the full invite's path token.
- Palette lives in `body[data-theme=…]` blocks at the top of `the-tale/assets/css/style.css`.
- Fonts and JS libraries are vendored locally — the site has zero external requests at runtime.

## Structure

```
the-tale/
  index.html                     redirect to reception/ (carries no event info)
  tale-…/                        FULL invite: index.html, reel*.html, events.js,
                                 reel.js / lab.js / reel.css, og-card.png (secret path)
  reception/index.html           reception-only invite (same design assets, own OG card)
  assets/css/style.css           design system + per-chapter themes
  assets/js/main.js              veil, Lenis, themes, reveals, countdown, cursor, share
  assets/js/thread.js            the golden thread path + scroll scrub
  assets/js/particles.js         gold dust canvas
  assets/js/audio.js             generative ambience (off by default)
  assets/js/calendar.js          .ics download, maps, copy (helpers only)
  assets/js/events-reception.js  reception-only event data
  assets/js/vendor/              gsap · ScrollTrigger · lenis
  assets/fonts/                  self-hosted woff2 (Pinyon, Marcellus, Cormorant)
  assets/img/                    favicon, og-card-reception (full og-card lives in tale-…)
```

Older concept folders (`design*`, `original/`, `planning/`, `mockups/`) are kept untouched and are not deployed.

Residual exposure (accepted): the GitHub repo is public, so a determined person can browse
source/history and find the full invite; shared design files (`style.css`, `main.js`,
`webgl.js`) mention chapter *names* but no dates, venues or links; search-engine/WhatsApp
caches of the old root URL may linger after the move.
