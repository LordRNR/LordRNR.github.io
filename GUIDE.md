# Portfolio site guide (Astro)

Static Astro site: how to run it, add a project and replace media.

## Run it

Requires Node ≥ 22.23.4 (installed with Homebrew). Dependencies are already installed in `node_modules/` (exact versions, lockfile, `ignore-scripts=true`).

```bash
cd web/site
npm run dev        # http://localhost:4321, live reload
npm run build      # static output in dist/
npm run preview    # serves dist/ the way a static host would
```

## Quality checks (all reproducible, none invent scores)

| Command | What it checks |
|---|---|
| `npm run check` | build + site checks + contrast |
| `npm run check:site` | in `dist/`: broken internal links and anchors, `href="#"`, images without `alt`, exactly one `h1`, heading order, title/description, leaked placeholders (`[confirm`, `TODO`…), local paths, `target=_blank` without `noopener` |
| `npm run check:contrast` | WCAG contrast of every text token in both themes and in the dark "console" island (fails below 4.5:1) |
| `npm run check:publish` | the above plus **publication blockers**: draft pages, unverified media, unconfirmed personal data |
| `npm run media:audit` | every image/video with its type and verification state; lists what to replace |
| `npm run weight` | gzip transfer size of each page (HTML, CSS, JS, Latin fonts, eager images) |

Lighthouse and axe need a Chromium browser, which is not installed on this machine, so **no Lighthouse or axe result exists yet**. To measure later: `npx lighthouse http://localhost:4321 --preset=desktop --output=html`, and the same with `--form-factor=mobile`. Do not quote a score that was not measured.

## Structure

```
src/
  content/projects/*.md     one file per project (validated schema in content.config.ts)
  data/site.json            identity, links, which personal data is public, hero headline
  data/media.json           registry of every image/video (id, path, alt, caption, type, verification)
  data/research/<id>.json   verified numbers behind a research case study
  data/copy.ts              editorial copy shared across pages
  layouts/ components/ sections/   Base layout, UI pieces, home sections
  components/case/          case-study templates: CaseGame, CaseResearch, CaseGeneric
  scripts/                  small TypeScript modules (motion, theme, story, ledger, filters, tooltip)
  styles/                   tokens.css (design tokens), base.css, motion.css
  pages/                    /, /projects, /projects/[slug], /about, 404, sitemap.xml, robots.txt
scripts/                    Node checks (see above)
deploy/deploy.yml.example   Pages workflow template — NOT active
```

## Add a project (no code needed)

1. Create `src/content/projects/<id>.md`. The `id` becomes the URL: `/projects/<id>/`.
2. Fill the frontmatter. The build fails with a precise message if anything required is missing:

```yaml
---
name: My App
tagline: One sentence of at least ten characters.
summary: Two or three sentences, at least sixty characters.
category: ai-app            # game | research | ai-app | saas | automation | web | mobile | academic
tech: [Python, FastAPI]
status: planned             # in-development | completed | archived | planned
period: { start: 2027-03-01 }
featured: true              # featured + not planned => appears on the home page automatically
order: 3                    # position among projects
links: { repo: "https://github.com/LordRNR/my-app" }   # omit until it exists
metrics:                    # a metric without a source cannot be built
  - { label: "tests", value: 120, asOf: 2027-04-01, source: "pytest --collect-only", basis: measured }
evidence:                   # shown only when verified: true
  - { claim: "Login works", state: tested, source: "tests/test_login.py", basis: measured, verified: true, highlight: true }
caseStudy: { enabled: true, template: generic }
---
Markdown body: what it is, in your own words.
```

3. `npm run build`. The home page (if featured), `/projects` (with filters), the case study page, the sitemap and the "Verified" counts all update. `planned` projects are labelled **Planned** everywhere and are never featured on the home page.
4. For a bespoke layout use `template: game` (needs `chapters`) or `research` (needs `src/data/research/<id>.json`); otherwise `generic` works with whatever data the project has.

### Check that adding a project really needs no code

`npm run test:add-project` copies the site to a fresh temporary folder, adds `docs/example-project.md` (a **fictional** project that lives only in `docs/`, never in `src/content/`), builds it and checks: its own page, the `/projects` card, its category filter, the sitemap, the "planned" label, and that the home page and the two real projects are unchanged. It deletes nothing and prints where the temporary copy is.

## Replace an image or add a video

1. Put the new file in `src/assets/media/` (images) or `public/media/video/` (videos).
2. Edit **one entry** in `src/data/media.json`: `src`, `alt`, `caption`, `kind` (`gameplay`, `studio-capture`, `render`, `screenshot`, `diagram`, `video`) and set `verification` to `verified` once checked.
3. For a video add `"kind": "video"`, `"src": "gameplay.mp4"` and `"poster": "<id of an image entry>"`, then reference its id from a project (`media.video`) or a chapter. Keep videos short (under ~10 MB); they load on demand (`preload="none"`).

No component changes. Unknown ids and missing files fail the build. `npm run media:audit` lists everything still provisional.

## Identity and placeholders

`src/data/site.json` holds what is public. A value of `null` is **not rendered**, so a placeholder can never appear by accident:

- `links.linkedin`, `location`, `availability`, `education.start`, `education.expectedEnd`: `null` until you confirm them.
- `show.email`: the email address is rendered publicly while this is `true`. Set it to `false` to hide it.
- `hero.active`: pick the headline (`A`–`D`). A `*word*` marks the italic accent.

`npm run check:publish` lists everything that still blocks publication.

## Motion, accessibility, performance

- Animations use `transform`/`opacity` with `IntersectionObserver`; no animation library, no scroll-jacking. Under `prefers-reduced-motion` everything is shown immediately and nothing moves. Without JavaScript all content is visible.
- Heavy effects (film grain, parallax, tilt, backdrop blur, reveal blur) apply only to precise pointers.
- Fonts are self-hosted (Inter Tight, Fraunces italic, JetBrains Mono; OFL), Latin subset. Images are generated as AVIF/WebP/JPEG with `srcset`; the hero image is eager with `fetchpriority="high"`, the rest lazy.
- Page transitions are CSS cross-document view transitions (no router, no JS).

## Security

Exact dependency versions and a lockfile; `ignore-scripts=true`; Astro telemetry disabled in the npm scripts; no third-party scripts, fonts, analytics or cookies; the `site` URL only builds canonical links. The Pages workflow in `deploy/` is a template that does nothing until you authorise creating the repository.
