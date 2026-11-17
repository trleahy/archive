# The archive

A small, static collection of past portfolio sites. No WordPress, LocalWP, npm dependencies, or export plugin required. The archived sites in `sites/` remain untouched.

## Preview locally

Use Node.js 22 or newer:

```sh
npm run dev
```

Open http://127.0.0.1:4321. Changes to content and the template rebuild automatically; refresh your browser to see them. CSS changes appear on refresh too. Press Ctrl+C to stop.

## Add an archived site

1. Put the exported site in a new folder under `sites/`, including its `index.html` and assets. Keep its links relative so it works under the archive URL.
2. Put a 16:9 screenshot in `images/` (around 1024 pixels wide is sufficient).
3. Add an entry to `content/sites.json`, using this shape:

```json
{
  "title": "Personal Portfolio",
  "version": "04",
  "date": "2027-01",
  "description": "A short description of this version.",
  "url": "sites/personal-portfolio-v4/index.html",
  "image": "images/personal-portfolio-v4.jpg",
  "alt": "A useful description of the screenshot."
}
```

Use a real archive date in `YYYY-MM` format. Entries sort newest first automatically; counts and the date range update from the content. Descriptions, titles and image alternative text are yours to edit.

4. Run `npm run build`, then `npm run check`.
5. Commit the content, images, archived site and generated `index.html`, then push as usual.

The build checks required fields, dates, duplicate URLs and the existence of each linked page and preview image before writing the homepage.

## Editing the design

- `src/index.html` — homepage template and general copy.
- `assets/styles.css` — responsive styles.
- `content/sites.json` — archive entries.
- `index.html` — generated homepage; edit the template instead.

Run `npm run build` after template or content changes. The published homepage needs no JavaScript to display or navigate.

## Publishing

The repository root is ready to serve as a static site, including under a GitHub Pages project subpath. Keep your existing GitHub Pages publishing settings; commit the generated homepage alongside the other files. No new hosting service or build pipeline is required.

This migration does not change the historical sites themselves. Their original scripts, external dependencies and any legacy behaviour remain part of each snapshot.
