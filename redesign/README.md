# FordFit homepage redesign (preview)

A standalone preview of a new homepage, built with plain HTML, CSS and JavaScript (no build step).
It is not part of the live Astro site and is not deployed.

```
cd redesign && python3 -m http.server 8000   # http://localhost:8000
```

- Palette: bone `#efece6`, ink `#0c0c0c`, ember accent `#ff5a1f`
- Type: Archivo (wide, for headlines) and Inter (body), from Google Fonts
- Hero: 130 frames from Toby's brand film (`public/assets/video/hero.mp4`, 12.1s–22.9s), scrubbed on scroll.
  `assets/frames` is 1280px wide, `assets/frames-mobile` is 800px for phones.
- Photos are Toby's own, shown in black and white; colour returns on hover.
- Reviews are real Google reviews from `src/data/reviews.js`.
