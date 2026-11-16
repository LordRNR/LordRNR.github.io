import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * PROJECT SCHEMA — the single source of truth for every project.
 * Adding a project = adding one Markdown file in src/content/projects/ that satisfies this schema.
 * The home page (featured projects), /projects (filters), the case-study route, the ledger,
 * the sitemap all read from here. The build FAILS if the data is incomplete or inconsistent.
 */
const state = z.enum(['implemented', 'tested', 'pending']);
const basis = z.enum(['measured', 'documented']); // measured = re-measured when written; documented = stated by the project's own reports
const mediaId = z.string().min(2);

const metric = z.object({
  label: z.string().min(3),
  short: z.string().optional(), // compact label for the hero figures; falls back to `label`
  value: z.number(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  decimals: z.number().int().min(0).max(2).default(0),
  display: z.string().optional(), // free text override, e.g. "248k → 545k" (not animated)
  asOf: z.coerce.date(),
  source: z.string().min(5), // a metric without a source cannot be built
  basis: basis.default('measured'),
  hero: z.boolean().default(false), // eligible for the home hero figures
});

const evidence = z.object({
  claim: z.string().min(5),
  detail: z.string().optional(),
  state,
  kind: z.enum(['feature', 'engineering', 'process']).default('feature'),
  source: z.string().min(5),
  basis,
  verified: z.boolean(), // false => never rendered publicly
  highlight: z.boolean().default(false), // shown in the compact home ledger
});

const note = z.object({
  big: z.string().min(1), // the headline figure/phrase of the card, e.g. "52→32"
  title: z.string().min(5),
  text: z.string().min(20),
  source: z.string().min(5),
  highlight: z.boolean().default(false), // shown in the home evidence strip
});

const chapter = z.object({
  key: z.string(),
  kicker: z.string(),
  title: z.string(),
  text: z.string().min(20),
  media: mediaId,
  tags: z.array(z.object({ state, label: z.string() })).default([]),
  figures: z.array(z.object({ value: z.string(), label: z.string(), source: z.string() })).default([]),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string().min(2),
    tagline: z.string().min(10).max(160),
    summary: z.string().min(60),
    category: z.enum(['game', 'research', 'ai-app', 'saas', 'automation', 'web', 'mobile', 'academic']),
    tech: z.array(z.string()).min(1),
    status: z.enum(['in-development', 'completed', 'archived', 'planned']),
    statusNote: z.string().optional(), // e.g. "Research concluded"
    period: z.object({ start: z.coerce.date(), end: z.coerce.date().optional() }),
    featured: z.boolean().default(false),
    order: z.number().int().default(100),
    links: z
      .object({
        repo: z.string().url().optional(), // public repository (omit until it exists)
        demo: z.string().url().optional(),
        video: z.string().url().optional(),
      })
      .default({}),
    media: z
      .object({
        hero: mediaId.optional(),
        gallery: z.array(mediaId).default([]),
        video: mediaId.optional(),
      })
      .default({ gallery: [] }),
    metrics: z.array(metric).default([]),
    evidence: z.array(evidence).default([]),
    notes: z.array(note).default([]),
    chapters: z.array(chapter).default([]),
    architecture: z.array(z.object({ title: z.string(), text: z.string() })).default([]),
    contribution: z
      .object({
        human: z.array(z.string()).default([]),
        assisted: z.array(z.string()).default([]),
      })
      .default({ human: [], assisted: [] }),
    roadmap: z.array(z.string()).default([]),
    privateNote: z.string().optional(), // what is not public and why
    caseStudy: z
      .object({
        enabled: z.boolean().default(true),
        template: z.enum(['game', 'research', 'generic']).default('generic'),
      })
      .default({ enabled: true, template: 'generic' }),
  }),
});

export const collections = { projects };
