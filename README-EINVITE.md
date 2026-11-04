# The Tale of F & A — e-invite

A single-page, mobile-first e-invitation for **Asim & Femina · 4–7 December 2026**.
Lives in `the-tale/`, deploys to GitHub Pages via GitHub Actions (`/.github/workflows/deploy-pages.yml`).

**Live URL (after first deploy):** https://asimmerchant.github.io/wedding-invites/

## First-time setup (one click)

1. Push this branch to `main`.
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Run the workflow once (**Actions → Deploy the-tale → Run workflow**) or push a change under `the-tale/`.
4. Send the link on WhatsApp — the preview card comes from `assets/img/og-card.png`.

## Editing

- All wording (names, dates, venues, times) is plain HTML text in `the-tale/index.html`.
- Event details for the "Calendar" buttons live in `the-tale/assets/js/calendar.js` (keep in sync with the HTML).
- Palette lives in `body[data-theme=…]` blocks at the top of `the-tale/assets/css/style.css`.
- Fonts and JS libraries are vendored locally — the site has zero external requests at runtime.

## Structure

```
the-tale/
  index.html                     all chapters + inline SVG illustrations
  assets/css/style.css           design system + per-chapter themes
  assets/js/main.js              veil, Lenis, themes, reveals, countdown, cursor, share
  assets/js/thread.js            the golden thread path + scroll scrub
  assets/js/particles.js         gold dust canvas
  assets/js/audio.js             generative ambience (off by default)
  assets/js/calendar.js          event data, .ics download, maps, copy
  assets/js/vendor/              gsap · ScrollTrigger · lenis
  assets/fonts/                  self-hosted woff2 (Pinyon, Marcellus, Cormorant)
  assets/img/                    favicon, og-card
```

Older concept folders (`design*`, `original/`, `planning/`, `mockups/`) are kept untouched and are not deployed.
