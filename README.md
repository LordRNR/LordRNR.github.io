# Portfolio source

Source of **https://lordrnr.github.io**, the portfolio of Lucas Ramos: an [Astro](https://astro.build) static site (no runtime framework, a few small scripts for motion and theme).

## Run it

```bash
npm ci
npm run dev        # development server
npm run build      # static site in dist/
npm run preview    # serve the production build
npm run check      # build + site checks + contrast
npm run check:publish   # fails only on critical publication blockers
```

Requires Node.js 22.23.4 or newer.

## How content works

- `src/data/site.json`: identity and contact. A value set to `null` is simply not rendered.
- `src/content/projects/*.md`: one file per project. A new file appears in `/projects`, gets its own page, its category filter and a sitemap entry, and can be featured on the home page. No component needs editing.
- `src/data/media.json`: every image or video the site uses. Replacing a file and its entry replaces it everywhere.
- `src/data/research/`: the verified figures behind the research case study.

The long guide is in [`GUIDE.md`](GUIDE.md).

## Publishing

The site is deployed to GitHub Pages with GitHub Actions, never from a branch: in the repository settings, Pages must use the source **GitHub Actions**. The workflow (`.github/workflows/deploy.yml`) runs **only when started manually** (Actions → Deploy to GitHub Pages → Run workflow, or `gh workflow run deploy.yml`), so a push never publishes anything by itself. It builds with `npm ci`, runs the checks above and uploads `dist/`. Its actions are pinned to full commit SHAs and its permissions are limited to reading the code, plus the two that the deploy job needs.

## Not in this repository

Source code, models and assets of private projects. The case studies describe them; they do not contain them.

## Licence

Project descriptions, screenshots and text are © Lucas Ramos, all rights reserved. Fonts are self-hosted under their own licences (OFL-1.1). A licence for the site's source code has not been chosen yet.
