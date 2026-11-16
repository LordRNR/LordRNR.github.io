/** Tooltip for chart marks: [data-tip]. Works with mouse and keyboard focus. Loaded only where charts exist. */
const tip = document.createElement('div');
tip.setAttribute('role', 'tooltip');
tip.className = 'chart-tip';
tip.hidden = true; // an empty tooltip in the accessibility tree has no name: it only exists while it shows text
tip.style.cssText =
  'position:fixed;z-index:120;pointer-events:none;max-width:260px;padding:9px 12px;border-radius:10px;background:var(--ink);color:var(--bg);font:500 12px/1.4 var(--font-mono)';
document.body.appendChild(tip);

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const show = (el: Element) => {
  tip.textContent = (el as HTMLElement).dataset.tip ?? '';
  tip.hidden = false;
  const r = el.getBoundingClientRect();
  tip.style.left = `${clamp(r.left + r.width / 2 - tip.offsetWidth / 2, 8, innerWidth - tip.offsetWidth - 8)}px`;
  tip.style.top = `${Math.max(8, r.top - tip.offsetHeight - 10)}px`;
};
const hide = () => {
  tip.hidden = true;
  tip.textContent = '';
};

document.addEventListener('pointerover', (e) => {
  const t = (e.target as Element).closest('[data-tip]');
  if (t) show(t);
});
document.addEventListener('pointerout', (e) => {
  if ((e.target as Element).closest('[data-tip]')) hide();
});
document.addEventListener('focusin', (e) => {
  const t = (e.target as Element).closest('[data-tip]');
  if (t) show(t);
});
document.addEventListener('focusout', hide);
