import React from 'react';
import ReactDOM from 'react-dom/client';
import WidgetContainer from './components/WidgetContainer';

const DEFAULT_CONTAINER_ID = 'waxstat-releases-widget';
const VALID_FORMATS = new Set([
  'leaderboard',
  'largeLeaderboard',
  'horizontalBanner',
  'mediumSquare',
  'smallSquare',
  'skyscraper',
  'wideSkyscraper',
  'halfPage',
  'responsive',
]);

function resolveFormat(container) {
  const raw = container && container.dataset ? container.dataset.format : null;
  if (raw && VALID_FORMATS.has(raw)) return raw;
  return 'responsive';
}

const rootCache = new WeakMap();

function render(container) {
  if (!container) return;
  const format = resolveFormat(container);

  let root = rootCache.get(container);
  if (!root) {
    root = ReactDOM.createRoot(container);
    rootCache.set(container, root);
  }
  root.render(React.createElement(WidgetContainer, { format }));
}

function init() {
  const containers = [
    ...Array.from(document.querySelectorAll(`#${DEFAULT_CONTAINER_ID}`)),
    ...Array.from(document.querySelectorAll(`[data-waxstat-widget="releases"]`)),
  ];
  if (containers.length === 0) {
    console.warn(
      `Waxstat widget: no container found. Add <div id="${DEFAULT_CONTAINER_ID}" data-format="responsive"></div> to your page.`
    );
    return;
  }
  containers.forEach(render);
}

window.WaxstatWidget = { render, init };

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
