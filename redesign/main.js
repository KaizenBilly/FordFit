// FordFit redesign preview: scroll-scrubbed hero, sticky nav, reveals, counters.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) root.classList.add('reduced');

  // ---------- Hero frames ----------
  const FRAME_COUNT = 130;
  const hero = document.querySelector('[data-hero]');
  const canvas = hero.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const lines = [...hero.querySelectorAll('.hero-line')];
  const bar = hero.querySelector('.hero-progress span');
  const preBar = document.querySelector('.preloader-bar span');
  const mobile = matchMedia('(max-width: 767px)').matches;
  const dir = mobile ? 'assets/frames-mobile' : 'assets/frames';
  const src = (i) => `${dir}/frame_${String(i + 1).padStart(4, '0')}.jpg`;
  const frames = new Array(FRAME_COUNT);
  let loaded = 0;
  let current = -1;
  let ready = false;

  const reveal = () => {
    if (ready) return;
    ready = true;
    root.classList.add('is-loaded');
    resize();
    tick();
  };

  // Nearest loaded frame, so scrubbing ahead of the stream never shows a blank canvas.
  const nearest = (i) => {
    for (let d = 0; d < FRAME_COUNT; d++) {
      if (frames[i - d]?.complete && frames[i - d].naturalWidth) return frames[i - d];
      if (frames[i + d]?.complete && frames[i + d].naturalWidth) return frames[i + d];
    }
    return null;
  };

  const draw = (i) => {
    const img = nearest(i);
    if (!img) return;
    const cw = canvas.width, ch = canvas.height;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
    // Bias the crop slightly left on narrow screens, where the hoodie sits.
    const fx = cw < ch ? 0.25 : 0.5;
    ctx.drawImage(img, (cw - w) * fx, (ch - h) / 2, w, h);
  };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    current = -1;
    tick();
  }

  const load = (i) => new Promise((res) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = img.onerror = () => {
      loaded++;
      preBar.style.width = `${Math.min(100, (loaded / (FRAME_COUNT * 0.2)) * 100)}%`;
      if (loaded >= FRAME_COUNT * 0.2) reveal();
      if (i === current || current === -1) tick(true);
      res();
    };
    img.src = src(i);
    frames[i] = img;
  });

  if (reduced) {
    // One still: the last frame, with the final message.
    load(FRAME_COUNT - 1).then(() => { reveal(); resize(); draw(FRAME_COUNT - 1); });
  } else {
    // First fifth in order (the preloader waits on these), then every 4th, then the rest.
    (async () => {
      const first = Math.ceil(FRAME_COUNT * 0.2);
      await Promise.all(Array.from({ length: first }, (_, i) => load(i)));
      const rest = [];
      for (let i = first; i < FRAME_COUNT; i += 4) rest.push(i);
      for (let i = first; i < FRAME_COUNT; i++) if (!frames[i]) rest.push(i);
      for (let n = 0; n < rest.length; n += 8) await Promise.all(rest.slice(n, n + 8).filter((i) => !frames[i]).map(load));
    })();
  }
  // Never trap anyone behind the preloader on a slow connection.
  setTimeout(reveal, 6000);

  // ---------- Scroll loop ----------
  const nav = document.querySelector('[data-nav]');
  let queued = false;

  function progress() {
    const r = hero.getBoundingClientRect();
    const total = hero.offsetHeight - innerHeight;
    return total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
  }

  function tick(force) {
    const p = progress();
    if (!reduced) {
      const i = Math.min(FRAME_COUNT - 1, Math.floor(p * FRAME_COUNT));
      if (i !== current || force === true) { current = i; draw(i); }
      for (const el of lines) {
        const from = +el.dataset.from, to = +el.dataset.to, span = to - from;
        // Fade in over the first 18% of a line's window, out over the last 18%.
        const t = (p - from) / span;
        let o = t < 0 || t > 1 ? 0 : Math.min(1, t / 0.18, (1 - t) / 0.18);
        if (to > 1 && t >= 0.18) o = 1; // last line stays
        if (from === 0 && p < from + span * 0.18) o = 1; // first line is up on arrival
        el.style.opacity = o;
        el.style.transform = `translateY(${(1 - o) * 24}px)`;
        el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
      }
      bar.style.transform = `scaleX(${p})`;
    }
    nav.classList.toggle('is-on', hero.getBoundingClientRect().bottom < 80);
  }

  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; tick(); });
  }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(resize));

  // ---------- Community strip: second copy for a seamless loop ----------
  const track = document.querySelector('.community-track');
  if (track && !reduced) {
    [...track.children].forEach((img) => {
      const c = img.cloneNode(true);
      c.alt = '';
      c.setAttribute('aria-hidden', 'true');
      track.append(c);
    });
  }

  // ---------- Reveals ----------
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      // Stagger siblings that arrive together.
      const sibs = [...e.target.parentElement.children].filter((c) => c.classList.contains('reveal'));
      e.target.style.transitionDelay = `${Math.min(sibs.indexOf(e.target), 5) * 70}ms`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  // ---------- Counters ----------
  const fmt = (n, d) => n.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
  const cio = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      cio.unobserve(e.target);
      const el = e.target, end = +el.dataset.count, d = +(el.dataset.decimals || 0);
      if (reduced) { el.textContent = fmt(end, d); continue; }
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 1600);
        el.textContent = fmt(end * (1 - Math.pow(1 - k, 3)), d);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => cio.observe(el));

  // ---------- App video: play only while on screen ----------
  const vio = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !reduced) e.target.play().catch(() => {});
      else e.target.pause();
    }
  }, { threshold: 0.35 });
  document.querySelectorAll('video[data-autoplay]').forEach((v) => vio.observe(v));
})();
