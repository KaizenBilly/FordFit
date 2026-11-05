# FordFit homepage redesign (preview)

A standalone preview of a new homepage, built with plain HTML, CSS and JavaScript (no build step).
It is not part of the live Astro site and is not deployed.

```
cd redesign && python3 -m http.server 8000   # http://localhost:8000
```

- Direction: a private coaching practice for a very wealthy client. Consultation-led, no prices on the page.
- Palette: night `#0a0f1c`, mist `#e6e9ef`, platinum text, one steel-blue accent `#8ea6cb`; photos and video graded blue-black
- Type: Archivo (wide capitals for headlines) and Inter (body), from Google Fonts
- Hero: Toby's brand film (`public/assets/video/hero.mp4` from 8.4s, after the letterboxed opening),
  autoplaying muted on a loop. `assets/hero.webm` is tried first, `assets/hero.mp4` is the fallback.
- Photos are Toby's own. Group-class photos are left out to keep the one-to-one feel.
- Reviews are real Google reviews from `src/data/reviews.js`, shortened with … and shown with first name and initial.
