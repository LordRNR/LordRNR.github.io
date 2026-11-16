/** Ledger filter: Implemented / Tested / Pending. Rows collapse smoothly; the status line is announced to assistive tech. */
document.querySelectorAll<HTMLElement>('[data-ledger]').forEach((ledger) => {
  const rows = [...ledger.querySelectorAll<HTMLElement>('[data-s]')];
  const chips = [...ledger.querySelectorAll<HTMLButtonElement>('[data-f]')];
  const status = ledger.querySelector<HTMLElement>('[data-ledger-status]');
  const count = (k: string) => (k === 'all' ? rows.length : rows.filter((r) => r.dataset.s === k).length);
  chips.forEach((c) => {
    const em = c.querySelector('em');
    if (em) em.textContent = String(count(c.dataset.f!));
  });
  chips.forEach((chip) =>
    chip.addEventListener('click', () => {
      const f = chip.dataset.f!;
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      rows.forEach((r) => {
        const hide = f !== 'all' && r.dataset.s !== f;
        r.classList.toggle('hide', hide);
        r.toggleAttribute('inert', hide);
        r.setAttribute('aria-hidden', String(hide));
      });
      if (status) status.textContent = `Showing ${count(f)} of ${rows.length} items`;
    }),
  );
});
