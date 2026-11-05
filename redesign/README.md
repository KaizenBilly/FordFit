# FordFit homepage redesign (preview)

A standalone preview of a new homepage, built with plain HTML, CSS and JavaScript (no build step).
It is not part of the live Astro site and is not deployed.

```
cd redesign && python3 -m http.server 8000   # http://localhost:8000
```

- Palette: frost `#eef1f6`, navy `#0a1124`, electric blue `#2f6bff`, with a blue grade on photos and video
- Type: Archivo (wide, for headlines) and Inter (body), from Google Fonts
- Hero: Toby's brand film (`public/assets/video/hero.mp4` from 8.4s, after the letterboxed opening),
  autoplaying muted on a loop. `assets/hero.webm` is tried first, `assets/hero.mp4` is the fallback.
- Photos are Toby's own, given the same blue grade; full colour returns on hover.
- Reviews are real Google reviews from `src/data/reviews.js`.
