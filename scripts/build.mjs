import { readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

export async function build({ check = false } = {}) {
  const entries = JSON.parse(await readFile(path.join(root, 'content/sites.json'), 'utf8'));
  if (!Array.isArray(entries) || !entries.length) throw new Error('Add at least one entry to content/sites.json.');
  const urls = new Set();
  for (const entry of entries) {
    for (const field of ['title', 'version', 'date', 'description', 'url', 'image', 'alt']) {
      if (typeof entry[field] !== 'string' || !entry[field].trim()) throw new Error(`Every entry needs a non-empty ${field}.`);
    }
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(entry.date)) throw new Error(`Invalid date: ${entry.date}. Use YYYY-MM.`);
    if (urls.has(entry.url)) throw new Error(`Duplicate archive URL: ${entry.url}`);
    urls.add(entry.url);
    for (const field of ['url', 'image']) {
      const relative = entry[field];
      if (!/^[a-zA-Z0-9][a-zA-Z0-9_./-]*$/.test(relative) || relative.split('/').includes('..')) throw new Error(`Use a local relative path for ${field}: ${relative}`);
      if (!(await stat(path.join(root, relative))).isFile()) throw new Error(`File missing: ${relative}`);
    }
  }
  entries.sort((a, b) => b.date.localeCompare(a.date));
  const cards = entries.map((entry, index) => {
    const date = new Date(`${entry.date}-01T12:00:00Z`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    const e = Object.fromEntries(Object.entries(entry).map(([key, value]) => [key, escape(value)]));
    return `            <article class="site-card">
              <a class="preview-link" href="${e.url}" aria-label="Explore ${e.title} version ${e.version}">
                <img src="${e.image}" alt="${e.alt}" width="1024" height="576"${index > 0 ? ' loading="lazy"' : ' fetchpriority="high"'} decoding="async">
                <span class="preview-arrow" aria-hidden="true">↗</span>
              </a>
              <div class="card-meta"><span class="version">Version ${e.version}</span><time datetime="${e.date}">${date}</time></div>
              <h3><a href="${e.url}">${e.title} V${e.version.replace(/^0/, '')}</a></h3>
              <p>${e.description}</p>
              <div class="card-bottom"><a href="${e.url}" aria-label="Visit ${e.title} version ${e.version}">Visit archive <span aria-hidden="true">↗</span></a><span class="entry-number">${String(index + 1).padStart(2, '0')} / ${String(entries.length).padStart(2, '0')}</span></div>
            </article>`;
  }).join('\n');
  const years = entries.map(entry => entry.date.slice(0, 4));
  const range = years.at(-1) === years[0] ? years[0] : `${years.at(-1)}—${years[0]}`;
  const template = await readFile(path.join(root, 'src/index.html'), 'utf8');
  const html = template.replace(/\{\{(CARDS|COUNT|RANGE)\}\}/g, (_, key) => ({ CARDS: cards, COUNT: String(entries.length).padStart(2, '0'), RANGE: range })[key]);
  if (check) {
    if (html !== await readFile(path.join(root, 'index.html'), 'utf8')) throw new Error('index.html is out of date. Run npm run build.');
    console.log(`Checked ${entries.length} entries; generated homepage is current.`);
  } else {
    await writeFile(path.join(root, 'index.html'), html);
    console.log(`Built index.html with ${entries.length} archived sites.`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build({ check: process.argv.includes('--check') }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
