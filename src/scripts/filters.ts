/** /projects filters by category and technology. Without JavaScript every project is visible. */
const root = document.querySelector<HTMLElement>('[data-filters]');
if (root) {
  const cards = [...document.querySelectorAll<HTMLElement>('[data-card]')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-group]')];
  const status = document.querySelector<HTMLElement>('[data-filter-status]');
  const state: Record<string, string> = { category: 'all', tech: 'all' };

  const apply = () => {
    let shown = 0;
    cards.forEach((card) => {
      const cat = card.dataset.category ?? '';
      const tech = (card.dataset.tech ?? '').split('|');
      const ok = (state.category === 'all' || cat === state.category) && (state.tech === 'all' || tech.includes(state.tech));
      card.hidden = !ok;
      if (ok) shown++;
    });
    if (status) status.textContent = `Showing ${shown} of ${cards.length} projects`;
  };

  groups.forEach((group) => {
    const name = group.dataset.group!;
    group.querySelectorAll<HTMLButtonElement>('button[data-value]').forEach((btn) =>
      btn.addEventListener('click', () => {
        state[name] = btn.dataset.value!;
        group.querySelectorAll('button[data-value]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
        apply();
      }),
    );
  });
  apply();
}
