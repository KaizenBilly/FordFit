// FordFit redesign preview: autoplaying hero video, sticky nav, reveals, rotating client quotes.
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

  // ---------- Client quotes: one at a time, advancing every 8 seconds ----------
  const stage = document.querySelector('[data-quotes]');
  if (stage) {
    const quotes = [...stage.children];
    const count = document.querySelector('.quote-count');
    let at = 0, timer;
    const show = (i) => {
      at = (i + quotes.length) % quotes.length;
      quotes.forEach((q, n) => q.classList.toggle('is-on', n === at));
      count.textContent = `${at + 1} / ${quotes.length}`;
    };
    const auto = () => { clearInterval(timer); if (!reduced) timer = setInterval(() => show(at + 1), 8000); };
    document.querySelector('[data-prev]').addEventListener('click', () => { show(at - 1); auto(); });
    document.querySelector('[data-next]').addEventListener('click', () => { show(at + 1); auto(); });
    stage.addEventListener('mouseenter', () => clearInterval(timer));
    stage.addEventListener('mouseleave', auto);
    auto();
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

  // ---------- App video: play only while on screen ----------
  const vio = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !reduced) e.target.play().catch(() => {});
      else e.target.pause();
    }
  }, { threshold: 0.35 });
  document.querySelectorAll('video[data-autoplay]').forEach((v) => vio.observe(v));
})();
