import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;

export const statusMeta: Record<Project['data']['status'], { label: string; tone: 'live' | 'done' | 'arch' | 'plan' }> = {
  'in-development': { label: 'In development', tone: 'live' },
  completed: { label: 'Completed', tone: 'done' },
  archived: { label: 'Archived', tone: 'arch' },
  planned: { label: 'Planned', tone: 'plan' },
};

export const categoryLabel: Record<Project['data']['category'], string> = {
  game: 'Game',
  research: 'Research',
  'ai-app': 'AI app',
  saas: 'SaaS',
  automation: 'Automation',
  web: 'Web',
  mobile: 'Mobile',
  academic: 'Academic',
};

const byOrder = (a: Project, b: Project) => a.data.order - b.data.order || a.data.name.localeCompare(b.data.name);

export async function getProjects(): Promise<Project[]> {
  return (await getCollection('projects')).sort(byOrder);
}

/** Featured projects appear on the home page automatically, ordered by `order`. */
export async function getFeatured(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.featured && p.data.status !== 'planned');
}

export const hasCaseStudy = (p: Project) => p.data.caseStudy.enabled;
export const projectHref = (p: Project) => (hasCaseStudy(p) ? `/projects/${p.id}/` : null);

/** Evidence that may be shown publicly: verified claims only. */
export const publicEvidence = (p: Project) => p.data.evidence.filter((e) => e.verified);

export const formatPeriod = (p: Project) => {
  const fmt = (d: Date) => d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
  const { start, end } = p.data.period;
  if (!end) return `${fmt(start)} – present`;
  return fmt(start) === fmt(end) ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
};

export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);

export function formatMetric(m: Project['data']['metrics'][number]) {
  return m.display ?? `${m.prefix ?? ''}${m.value.toLocaleString('en-US', { minimumFractionDigits: m.decimals, maximumFractionDigits: m.decimals })}${m.suffix ?? ''}`;
}
