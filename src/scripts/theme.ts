/** Theme toggle. Dark is the default; the stored choice is applied by an inline script in <head> (no flash). */
const KEY = 'pref-theme';
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((btn) => {
  const sync = () => btn.setAttribute('aria-pressed', String(root.dataset.theme === 'light'));
  sync();
  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
      try {
        localStorage.setItem(KEY, next);
      } catch {
        /* storage may be unavailable (private mode): the theme still changes for this visit */
      }
      sync();
    };
    const r = btn.getBoundingClientRect();
    root.style.setProperty('--vx', `${r.left + r.width / 2}px`);
    root.style.setProperty('--vy', `${r.top + r.height / 2}px`);
    if ('startViewTransition' in document && !reduce.matches) {
      root.classList.add('theme-vt');
      const vt = (document as Document & { startViewTransition: (cb: () => void) => { finished: Promise<void> } }).startViewTransition(apply);
      vt.finished.finally(() => root.classList.remove('theme-vt'));
    } else apply();
  });
});
