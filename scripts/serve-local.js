#!/usr/bin/env node
/*
 * Local dev server that mirrors the Vercel deployment:
 *  - Serves static files from build/ (widget.js, widget-app.js, logos, etc.)
 *  - Mounts the serverless handlers under /api/*
 *
 * This lets the embedded widget on a third-party origin (e.g. our demo on
 * localhost:3140) hit /api/* on this host (localhost:3141) and exercise the
 * full proxy path without deploying to Vercel.
 *
 * Usage: PORT=3141 node scripts/serve-local.js
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = Number(process.env.PORT) || 3141;
const projectRoot = path.resolve(__dirname, '..');
const buildDir = path.join(projectRoot, 'build');

// Load .env.local so process.env.REACT_APP_API_KEY etc. are available to the
// serverless handlers (they read process.env directly).
function loadEnvFile(file) {
  const filePath = path.join(projectRoot, file);
  if (!fs.existsSync(filePath)) return;
  const txt = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of txt.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvFile('.env.local');
loadEnvFile('.env');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico':  'image/x-icon',
  '.txt':  'text/plain; charset=utf-8',
};

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  let pathname = decodeURIComponent(parsed.pathname || '/');
  if (pathname === '/') pathname = '/index.html';
  const filePath = path.join(buildDir, pathname);
  // Refuse traversal outside buildDir
  if (!filePath.startsWith(buildDir)) {
    res.writeHead(403); res.end('forbidden'); return;
  }
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404); res.end('not found'); return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

// Express-style req/res shim for the Vercel handlers.
function adaptHandler(handler) {
  return async (req, res, query) => {
    // req shim: add `query` like Vercel does, keep method/url/headers/body.
    req.query = query || {};
    // res shim: status/json/setHeader/send for Vercel-style handlers.
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (obj) => {
      if (!res.getHeader('content-type')) {
        res.setHeader('content-type', 'application/json; charset=utf-8');
      }
      res.end(JSON.stringify(obj));
      return res;
    };
    res.send = (body) => { res.end(body); return res; };
    try {
      await handler(req, res);
    } catch (e) {
      console.error('[handler error]', e);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.setHeader('content-type', 'application/json');
        res.end(JSON.stringify({ error: e.message }));
      }
    }
  };
}

// Dynamic-import each handler so we get ESM `export default` correctly.
async function loadHandler(file) {
  const mod = await import(url.pathToFileURL(path.join(projectRoot, 'api', file)).href);
  return mod.default;
}

async function main() {
  const handlers = {
    'boxes-search':   adaptHandler(await loadHandler('boxes-search.js')),
    'box-details':    adaptHandler(await loadHandler('box-details.js')),
    'scrape-releases': adaptHandler(await loadHandler('scrape-releases.js')),
  };

  const server = http.createServer(async (req, res) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname || '';

    if (pathname.startsWith('/api/')) {
      const name = pathname.slice('/api/'.length);
      const handler = handlers[name];
      if (!handler) {
        res.writeHead(404, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: `no handler for /api/${name}` }));
        return;
      }
      console.log(`[api] ${req.method} ${req.url}`);
      await handler(req, res, parsed.query);
      return;
    }
    serveStatic(req, res);
  });

  server.listen(PORT, () => {
    console.log(`[serve-local] http://localhost:${PORT}`);
    console.log(`[serve-local] static dir: ${buildDir}`);
    console.log(`[serve-local] api handlers: ${Object.keys(handlers).join(', ')}`);
    console.log(`[serve-local] REACT_APP_API_KEY: ${process.env.REACT_APP_API_KEY ? 'set' : 'NOT SET'}`);
  });
}

main().catch((e) => {
  console.error('[serve-local] failed to start:', e);
  process.exit(1);
});
