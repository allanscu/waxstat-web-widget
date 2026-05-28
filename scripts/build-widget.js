#!/usr/bin/env node
/*
 * Builds src/widget-entry.js into build/widget-app.js with REACT_APP_* env vars
 * inlined at build time (matching CRA's behavior).
 */
const path = require('path');
const fs = require('fs');
const esbuild = require('esbuild');

const projectRoot = path.resolve(__dirname, '..');

// CRA loads env files in this order (later wins for keys already set is the
// opposite — earlier wins). We mirror that:
//   .env.{NODE_ENV}.local  >  .env.local (skipped in test)  >  .env.{NODE_ENV}  >  .env
const NODE_ENV = process.env.NODE_ENV || 'production';
const envFiles = [
  `.env.${NODE_ENV}.local`,
  NODE_ENV !== 'test' && '.env.local',
  `.env.${NODE_ENV}`,
  '.env',
].filter(Boolean);

function parseEnvFile(filePath) {
  const result = {};
  if (!fs.existsSync(filePath)) return result;
  const text = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    // Strip surrounding quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

// Load env vars: process.env wins, then files in CRA precedence order.
const fileEnv = {};
for (const file of envFiles) {
  const parsed = parseEnvFile(path.join(projectRoot, file));
  for (const [k, v] of Object.entries(parsed)) {
    if (!(k in fileEnv)) fileEnv[k] = v;
  }
}
const merged = { ...fileEnv, ...process.env };

// Only inline REACT_APP_* + NODE_ENV (CRA's whitelist).
const define = {
  'process.env.NODE_ENV': JSON.stringify(NODE_ENV),
};
for (const [k, v] of Object.entries(merged)) {
  if (k.startsWith('REACT_APP_')) {
    define[`process.env.${k}`] = JSON.stringify(v);
  }
}

const reactAppKeys = Object.keys(define).filter((k) => k.startsWith('process.env.REACT_APP_'));
console.log(
  `[build-widget] inlining ${reactAppKeys.length} REACT_APP_* var(s): ${reactAppKeys
    .map((k) => k.replace('process.env.', ''))
    .join(', ') || '(none)'}`
);

esbuild
  .build({
    entryPoints: [path.join(projectRoot, 'src/widget-entry.js')],
    bundle: true,
    minify: true,
    outfile: path.join(projectRoot, 'build/widget-app.js'),
    loader: { '.js': 'jsx' },
    target: 'es2018',
    legalComments: 'none',
    define,
  })
  .then(() => {
    const stat = fs.statSync(path.join(projectRoot, 'build/widget-app.js'));
    console.log(`[build-widget] wrote build/widget-app.js (${(stat.size / 1024).toFixed(1)} kB)`);
  })
  .catch((err) => {
    console.error('[build-widget] failed:', err);
    process.exit(1);
  });
