document.documentElement.classList.remove('no-js');
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Nav: background on scroll + mobile menu */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const menuBtn = $('#menuBtn');
  const links = $('#navLinks');
  const setMenu = (open) => {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
  $$('a', links).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* Active nav link */
  const sections = $$('main section[id]');
  const navMap = new Map($$('.nav-links a[href^="#"]').map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navMap.forEach((a) => a.classList.remove('is-active'));
      navMap.get(en.target.id)?.classList.add('is-active');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* Reveal on scroll (staggered within a parent) */
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const siblings = $$(':scope > .reveal', el.parentElement);
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 6) * 70}ms`;
      el.classList.add('in');
      reveal.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => (reduceMotion ? el.classList.add('in') : reveal.observe(el)));

  /* Hero rotator */
  const words = ['Gen AI programs', 'ServiceNow roadmaps', 'conversational experiences', 'calm under pressure', 'raags on the bansuri'];
  const rot = $('#rotator');
  if (rot && !reduceMotion) {
    let i = 0;
    setInterval(() => {
      rot.classList.add('is-out');
      setTimeout(() => {
        i = (i + 1) % words.length;
        rot.textContent = words[i];
        rot.classList.remove('is-out');
      }, 350);
    }, 2600);
  }

  /* Count-up stats */
  const counter = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const end = +el.dataset.count;
      const t0 = performance.now();
      const dur = 1200;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      if (!reduceMotion) requestAnimationFrame(tick);
      counter.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => counter.observe(el));

  /* Experience accordion */
  $$('.job').forEach((job) => {
    const head = $('.job-head', job);
    head.addEventListener('click', () => {
      const open = !job.classList.contains('is-open');
      job.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', String(open));
    });
  });

  /* Toolkit spotlight follows the cursor */
  $$('.tile').forEach((tile) => {
    tile.addEventListener('pointermove', (e) => {
      const r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', `${e.clientX - r.left}px`);
      tile.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });

  /* Certification filters */
  const certs = $$('.cert');
  const certWrap = $('#certs');
  const showAll = $('#showAll');
  const expandCerts = () => { certWrap.classList.add('is-expanded'); showAll.setAttribute('aria-expanded', 'true'); };
  showAll.addEventListener('click', expandCerts);
  $$('.filters button').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.filters button').forEach((b) => b.classList.toggle('is-active', b === btn));
      const f = btn.dataset.filter;
      certs.forEach((c) => c.classList.toggle('is-hidden', f !== 'all' && c.dataset.cat !== f));
      if (f !== 'all') expandCerts();
    });
  });

  /* Videos: only one plays at a time; hide caption while playing */
  const videos = $$('.m-video video');
  videos.forEach((v) => {
    v.addEventListener('play', () => {
      videos.forEach((o) => { if (o !== v) o.pause(); });
      v.parentElement.classList.add('is-playing');
    });
    v.addEventListener('pause', () => v.parentElement.classList.remove('is-playing'));
  });

  /* Gallery strip arrows */
  const strip = $('#strip');
  $$('.scroll-btns button').forEach((b) => {
    b.addEventListener('click', () => strip.scrollBy({ left: +b.dataset.dir * strip.clientWidth * 0.7, behavior: 'smooth' }));
  });

  /* Footer year */
  const y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
