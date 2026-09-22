/* ============================================================
   Рух сайту. Провідний прийом: паралакс шарів.
   Плюс: шторка переходу між сторінками, зміна теми по скролу,
   reveal, FAQ, мобільне меню.
   ============================================================ */

(() => {
  document.documentElement.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- шторка: вхід ---------- */
  const curtain = document.querySelector('.curtain');
  window.addEventListener('load', () => {
    requestAnimationFrame(() => {
      curtain && curtain.classList.add('is-open');
      document.body.classList.add('is-loaded');
    });
  });

  /* ---------- шторка: вихід за внутрішніми посиланнями ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || !curtain || reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
    if (a.target === '_blank' || /^https?:\/\//.test(href)) return;
    e.preventDefault();
    curtain.classList.remove('is-open');
    curtain.classList.add('is-closing');
    setTimeout(() => { window.location.href = href; }, 600);
  });

  window.addEventListener('pageshow', () => {
    curtain.classList.remove('is-closing');
    curtain.classList.add('is-open');
  });

  /* ---------- шапка ---------- */
  const header = document.querySelector('.header');
  const burger = document.querySelector('.header__burger');
  const nav = document.querySelector('.header__nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); burger.focus(); }
  });
  window.matchMedia('(max-width: 1100px)').addEventListener('change', () => setMenu(false));

  /* ---------- шари паралаксу ---------- */
  const heroLayers = [...document.querySelectorAll('.hero__layer[data-speed]')];
  const frames = [...document.querySelectorAll('.frame__img')];
  const themeZones = [...document.querySelectorAll('[data-theme-zone]')];
  const hero = document.querySelector('.hero');

  let vh = window.innerHeight;
  window.addEventListener('resize', () => { vh = window.innerHeight; });

  function tick() {
    const y = window.scrollY;

    // шапка
    header && header.classList.toggle('is-scrolled', y > 24);

    if (!reduce) {
      // hero: шари їдуть з різною швидкістю поки другий екран наїжджає
      if (hero && y < vh * 1.2) {
        heroLayers.forEach((l) => {
          const s = parseFloat(l.dataset.speed);
          l.style.transform = `translate3d(0, ${y * s}px, 0)`;
        });
      }
      // кадри у стрічці: фото їде повільніше за сторінку
      frames.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        img.style.transform = `translate3d(0, ${p * -12}%, 0)`;
      });
    }

    // тема: перемикається, коли зона проходить середину екрана
    let theme = 'dark';
    for (const z of themeZones) {
      const r = z.getBoundingClientRect();
      if (r.top <= vh * 0.5 && r.bottom >= vh * 0.5) { theme = z.dataset.themeZone; break; }
    }
    if (document.documentElement.dataset.theme !== theme) {
      document.documentElement.dataset.theme = theme;
    }
  }
  window.addEventListener('scroll', tick, { passive: true });
  tick();

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq__item').forEach((item) => {
    const q = item.querySelector('.faq__q');
    const a = item.querySelector('.faq__a');
    q.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', String(open));
    });
  });

})();
