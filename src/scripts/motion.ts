/**
 * Site-wide motion. IntersectionObserver + rAF, no libraries.
 * - reveal / stagger / hairlines on enter
 * - count-up of numbers (the final value is already in the HTML)
 * - scroll progress, floating-nav state, scroll-scrubbed statement
 * - hero parallax / tilt, cursor spotlight, magnetic buttons (fine pointers only)
 * Everything is skipped or shown immediately under prefers-reduced-motion.
 */
const root = document.documentElement;
const reduceQuery = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $$ = <T extends Element = HTMLElement>(sel: string, ctx: ParentNode = document) => [...ctx.querySelectorAll<T>(sel)];
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const reduced = () => reduceQuery.matches;

/* ---------- load choreography: html.loaded starts the hero entrance ---------- */
const markLoaded = () => requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('loaded')));
if (document.readyState === 'complete') markLoaded();
else addEventListener('load', markLoaded, { once: true });
setTimeout(() => root.classList.add('loaded'), 1500); // never leave the hero hidden if `load` is slow

/* ---------- reveal on enter ---------- */
$$('[data-stagger]').forEach((parent) => [...parent.children].forEach((c, i) => (c as HTMLElement).style.setProperty('--i', String(i))));

function count(el: HTMLElement) {
  if (reduced() || el.dataset.done) return;
  el.dataset.done = '1';
  const end = parseFloat(el.dataset.count ?? '0');
  const dec = Number(el.dataset.dec ?? 0);
  const delay = el.closest('[data-count-delay]') ? 1500 : 0; // hero figures wait for the stage to appear
  const t0 = performance.now() + delay;
  const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const step = (t: number) => {
    const p = clamp((t - t0) / 1500, 0, 1);
    el.textContent = fmt(end * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const t = e.target as HTMLElement;
      t.classList.add('in');
      io.unobserve(t);
      $$('[data-count]', t).forEach(count);
      if (t.matches('[data-count]')) count(t);
    }),
  { threshold: 0.14, rootMargin: '0px 0px -7% 0px' },
);
$$('[data-reveal],[data-stagger],.draw,[data-inview]').forEach((el) => io.observe(el));

/* ---------- scroll-scrubbed statement: words go from --muted to --ink ---------- */
const scrub = document.querySelector<HTMLElement>('[data-scrub]');
let words: HTMLElement[] = [];
if (scrub) {
  // Words stay readable by assistive tech (no aria-hidden, no aria-label on a <p>): only their colour animates.
  const text = scrub.textContent?.trim() ?? '';
  scrub.innerHTML = text
    .split(/\s+/)
    .map((w) => `<span class="sw">${w.replace(/[&<>]/g, '')}</span>`)
    .join(' ');
  words = $$('.sw', scrub);
  if (reduced()) words.forEach((w) => w.classList.add('on'));
}

/* ---------- scroll loop: progress bar, nav state, parallax, scrub ---------- */
const nav = document.querySelector<HTMLElement>('[data-nav]');
const progress = document.querySelector<HTMLElement>('[data-progress]');
const parallax = $$('[data-parallax]');
let ticking = false;
function frame() {
  ticking = false;
  const y = scrollY;
  const vh = innerHeight;
  const max = root.scrollHeight - vh;
  progress?.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0');
  nav?.classList.toggle('scrolled', y > 40);
  if (finePointer && !reduced()) {
    parallax.forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      const r = parent.getBoundingClientRect();
      if (r.bottom < -80 || r.top > vh + 80) return;
      el.style.translate = `0 ${(-(r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.parallax ?? '0')).toFixed(1)}px`;
    });
  }
  if (scrub && words.length && !reduced()) {
    const r = scrub.getBoundingClientRect();
    const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.3), 0, 1);
    const n = Math.round(p * words.length * 1.15);
    words.forEach((w, i) => w.classList.toggle('on', i < n));
  }
}
const request = () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(frame);
  }
};
addEventListener('scroll', request, { passive: true });
addEventListener('resize', request);
frame();

/* ---------- fine-pointer effects ---------- */
if (finePointer && !reduced()) {
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  hero?.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
    hero.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
  const stage = document.querySelector<HTMLElement>('[data-tilt]');
  const inner = stage?.querySelector<HTMLElement>('[data-tilt-inner]');
  if (stage && inner) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      inner.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 3).toFixed(2)}deg`);
      inner.style.setProperty('--rx', `${(-((e.clientY - r.top) / r.height - 0.5) * 2.2).toFixed(2)}deg`);
    });
    stage.addEventListener('pointerleave', () => {
      inner.style.setProperty('--ry', '0deg');
      inner.style.setProperty('--rx', '0deg');
    });
  }
  $$('[data-spot]').forEach((c) =>
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--cx', `${(e as PointerEvent).clientX - r.left}px`);
      c.style.setProperty('--cy', `${(e as PointerEvent).clientY - r.top}px`);
    }),
  );
  $$('[data-mag]').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.translate = `${(((e as PointerEvent).clientX - r.left) / r.width - 0.5) * 10}px ${(((e as PointerEvent).clientY - r.top) / r.height - 0.5) * 8}px`;
    });
    b.addEventListener('pointerleave', () => (b.style.translate = ''));
  });
}

/* ---------- nav: sliding indicator, scroll-spy, mobile menu ---------- */
const links = $$<HTMLAnchorElement>('[data-nav-link]');
const indicator = document.querySelector<HTMLElement>('[data-nav-ind]');
function setActive(a: HTMLAnchorElement | null) {
  links.forEach((l) => l.classList.toggle('on', l === a));
  if (!indicator) return;
  if (a && a.offsetParent) {
    indicator.style.setProperty('--ix', `${a.offsetLeft}px`);
    indicator.style.setProperty('--iw', `${a.offsetWidth}px`);
    indicator.style.setProperty('--io', '1');
  } else indicator.style.setProperty('--io', '0');
}
const current = links.find((l) => l.getAttribute('aria-current') === 'page') ?? null;
setActive(current);
const spy = links.filter((l) => l.dataset.spy);
if (spy.length) {
  const so = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        const link = spy.find((l) => l.dataset.spy === e.target.id) ?? null;
        if (e.isIntersecting) setActive(link);
        else if (link && link.classList.contains('on')) setActive(current);
      }),
    { rootMargin: '-45% 0px -50% 0px' },
  );
  spy.forEach((l) => {
    const target = document.getElementById(l.dataset.spy!);
    if (target) so.observe(target);
  });
}
const menuBtn = document.querySelector<HTMLButtonElement>('[data-menu]');
menuBtn?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open') ?? false;
  menuBtn.setAttribute('aria-expanded', String(open));
});
links.forEach((l) =>
  l.addEventListener('click', () => {
    nav?.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }),
);
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav?.classList.contains('open')) {
    nav.classList.remove('open');
    menuBtn?.setAttribute('aria-expanded', 'false');
    menuBtn?.focus();
  }
});
addEventListener('resize', () => setActive(links.find((l) => l.classList.contains('on')) ?? current));
