/**
 * Returns the absolute base URL of the widget host (where widget.js was loaded
 * from). Set by public/widget.js as window.__WAXSTAT_WIDGET_BASE__. Falls back
 * to the production deployment so direct visits to the widget app still work.
 */
const FALLBACK_BASE = 'https://waxstat-web-widget.vercel.app/';

export function getWidgetBase() {
  if (typeof window !== 'undefined' && window.__WAXSTAT_WIDGET_BASE__) {
    return window.__WAXSTAT_WIDGET_BASE__;
  }
  return FALLBACK_BASE;
}

/** Resolve a path against the widget host (e.g. "waxstat-logo.svg" or "api/foo"). */
export function widgetUrl(path) {
  const cleaned = String(path || '').replace(/^\//, '');
  try {
    return new URL(cleaned, getWidgetBase()).href;
  } catch {
    return FALLBACK_BASE + cleaned;
  }
}

/** True when the current page is being served from the widget's own host. */
export function isOnWidgetHost() {
  if (typeof window === 'undefined') return false;
  try {
    return new URL(getWidgetBase()).host === window.location.host;
  } catch {
    return false;
  }
}
