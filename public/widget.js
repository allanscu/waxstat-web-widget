(function() {
  // Check if React and ReactDOM are already loaded
  if (window.React && window.ReactDOM) {
    initializeWidget();
  } else {
    // Load React and ReactDOM from CDN
    loadScript('https://unpkg.com/react@18/umd/react.production.min.js', () => {
      loadScript('https://unpkg.com/react-dom@18/umd/react-dom.production.min.js', () => {
        initializeWidget();
      });
    });
  }

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

    // Load the widget app
    loadScript(
      'https://waxstat-web-widget.vercel.app/widget-app.js',
      () => {
        if (window.WaxstatWidget) {
          window.WaxstatWidget.render(container);
        } else {
          showFallback();
        }
      }
    );
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
