/**
 * Scrollytelling for a project: a sticky stage whose image follows the chapter being read.
 * No scroll-jacking: the page scrolls normally; an IntersectionObserver only switches which scene is shown.
 * On narrow screens the stage is hidden by CSS and each chapter carries its own image.
 */
document.querySelectorAll<HTMLElement>('[data-story]').forEach((story) => {
  const steps = [...story.querySelectorAll<HTMLElement>('[data-step]')];
  const shots = [...story.querySelectorAll<HTMLElement>('[data-shot]')];
  const dots = [...story.querySelectorAll<HTMLElement>('[data-dot]')];
  const caption = story.querySelector<HTMLElement>('[data-caption]');
  if (!steps.length || !shots.length) return;

  const activate = (n: number) => {
    steps.forEach((s, i) => {
      s.classList.toggle('active', i === n);
      if (i === n) s.setAttribute('aria-current', 'step');
      else s.removeAttribute('aria-current');
    });
    shots.forEach((s, i) => s.classList.toggle('on', i === n));
    dots.forEach((d, i) => d.classList.toggle('on', i <= n));
    if (caption) caption.textContent = steps[n].dataset.caption ?? '';
  };
  activate(0);

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) activate(steps.indexOf(e.target as HTMLElement));
      }),
    { rootMargin: '-42% 0px -42% 0px' },
  );
  steps.forEach((s) => io.observe(s));
});
