(function() {
  // Resolve widget-app.js relative to this script's URL so the loader works
  // from any host (production, staging, localhost), not just the prod CDN.
  var scriptUrl = (document.currentScript && document.currentScript.src) ||
    'https://waxstat-web-widget.vercel.app/widget.js';
  var widgetBase = new URL('./', scriptUrl).href;
  var widgetAppUrl = new URL('./widget-app.js', scriptUrl).href;

  // Expose the widget's own host base URL so the bundled app can resolve its
  // own assets (logos) and serverless endpoints (/api/*) without colliding
  // with the embedder's relative paths.
  window.__WAXSTAT_WIDGET_BASE__ = widgetBase;

  // widget-app.js bundles its own React, so we no longer need to preload UMD.
  initializeWidget();

  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = () => {
      console.error('Failed to load script:', src);
      showFallback();
    };
    document.head.appendChild(script);
  }

  function initializeWidget() {
    const container = document.getElementById('waxstat-releases-widget');
    if (!container) {
      console.warn('Waxstat widget container not found. Please add <div id="waxstat-releases-widget"></div> to your page.');
      return;
    }

    // Load the widget app (resolved relative to widget.js's own URL)
    loadScript(widgetAppUrl, () => {
      if (window.WaxstatWidget) {
        window.WaxstatWidget.render(container);
      } else {
        showFallback();
      }
    });
  }

  function showFallback() {
    const container = document.getElementById('waxstat-releases-widget');
    if (container) {
      container.innerHTML = `
        <div style="
          padding: 24px;
          background: #f5f5f5;
          border-radius: 8px;
          text-align: center;
          font-family: system-ui, sans-serif;
          color: #333;
        ">
          <p>Waxstat Releases Widget</p>
          <p style="font-size: 14px; color: #666; margin-top: 8px;">
            <a href="https://waxstat.com" style="color: #71D8A7; text-decoration: none;">
              View releases on Waxstat →
            </a>
          </p>
        </div>
      `;
    }
  }
})();
