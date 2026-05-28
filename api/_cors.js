/**
 * Wrap a Vercel serverless handler so it returns permissive CORS headers and
 * short-circuits OPTIONS preflights. The widget is meant to be embedded on
 * any host, so we allow * for the origin. The proxy still keeps the upstream
 * API key off the embedder, so no credentials cross the browser.
 */
export function withCors(handler) {
  return async function corsHandler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    return handler(req, res);
  };
}
