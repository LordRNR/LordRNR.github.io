---
# FICTIONAL EXAMPLE. Used only by scripts/test-add-project.mjs and the guide. Never copy it into src/content/projects/.
name: Example Weather Dashboard
tagline: A fictional example project used to test that new projects need no code changes.
summary: This is a made-up project that exists only in the documentation and in an automated test. It checks that a new Markdown file becomes a project page, a card in the list, a filter option and a sitemap entry.
category: web
tech: [TypeScript, Astro]
status: planned
statusNote: Example only
period:
  start: 2027-01-01
featured: false
order: 50
evidence:
  - claim: The test project builds into its own page
    state: tested
    kind: process
    source: scripts/test-add-project.mjs (automated test of the site, not a real project)
    basis: measured
    verified: true
caseStudy:
  enabled: true
  template: generic
---

Optional body text. The page is generated from the fields above.
