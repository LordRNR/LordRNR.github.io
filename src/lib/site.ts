import data from '../data/site.json';

export const site = data;

/** "*word*" marks the italic accent word in a headline. Returns plain segments, no HTML injection. */
export function parseEmphasis(text: string): { text: string; em: boolean }[] {
  return text
    .split(/(\*[^*]+\*)/g)
    .filter(Boolean)
    .map((s) => (s.startsWith('*') && s.endsWith('*') ? { text: s.slice(1, -1), em: true } : { text: s, em: false }));
}

export const heroLines = (): string[] => {
  const variants = site.hero.variants as Record<string, string[]>;
  return variants[site.hero.active] ?? variants.A;
};

/** Only confirmed, non-null contact data is ever returned; callers render nothing for `null`. */
export const contact = {
  github: site.links.github,
  // An address is only ever rendered when it is set AND explicitly allowed. It is never committed while hidden.
  email: site.show.email && site.links.email ? site.links.email : null,
  linkedin: site.links.linkedin,
};

export const base = (path: string) => path; // site is served from the domain root (user site)

export const nav = [
  { href: '/projects/', label: 'Projects' },
  { href: '/about/', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];
