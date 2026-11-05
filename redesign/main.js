// FordFit redesign preview: autoplaying hero video, sticky nav, reveals, counters.
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) root.classList.add('reduced');

  // ---------- Hero video: autoplay, but leave it paused for reduced motion ----------
  const hero = document.querySelector('[data-hero]');
  const heroVideo = hero.querySelector('video');
  if (reduced) { heroVideo.removeAttribute('autoplay'); heroVideo.pause(); }
  else heroVideo.play().catch(() => {});

  // ---------- Sticky nav: shows once the hero is out of view ----------
  const nav = document.querySelector('[data-nav]');
  const navIo = new IntersectionObserver(([e]) => nav.classList.toggle('is-on', !e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' });
  navIo.observe(hero);

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
