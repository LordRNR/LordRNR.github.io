/** Replaces each "Show email address" button with a mailto link built from its data attributes. */
document.querySelectorAll<HTMLButtonElement>('[data-email]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const address = `${btn.dataset.u}@${btn.dataset.d}`;
    const a = document.createElement('a');
    a.href = `mailto:${address}`;
    a.textContent = address;
    a.className = btn.className;
    btn.replaceWith(a);
    a.focus();
  });
});
