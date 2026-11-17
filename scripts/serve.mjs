import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { watch } from 'node:fs';
import path from 'node:path';
import { build, root } from './build.mjs';

await build();
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.gif': 'image/gif', '.ico': 'image/x-icon', '.zip': 'application/zip' };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname.split('/').some(part => part.startsWith('.'))) throw new Error('Hidden path');
    let file = path.resolve(root, `.${pathname}`);
    if (file !== root && !file.startsWith(root + path.sep)) throw new Error('Outside root');
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(301, { Location: `${pathname}/` }); response.end(); return; }
      file = path.join(file, 'index.html');
    }
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    response.end(content);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' }); response.end('Not found');
  }
});
let pending;
for (const directory of ['content', 'src']) watch(path.join(root, directory), () => {
  clearTimeout(pending);
  pending = setTimeout(() => build().catch(error => console.error(error.message)), 100);
});
server.listen(Number(process.env.PORT || 4321), '127.0.0.1', () => console.log(`Archive preview: http://127.0.0.1:${server.address().port}\nContent and template changes rebuild automatically. Refresh the browser to see changes.`));
