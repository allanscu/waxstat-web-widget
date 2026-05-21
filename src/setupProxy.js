const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
  // Image scraping endpoint
  app.get('/api/proxy', async (req, res) => {
    try {
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ error: 'URL parameter required' });
      }

      console.log('Fetching and scraping:', url);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);

      // Try multiple selectors for product images
      let imageUrl = null;

      // Try common image selectors
      const selectors = [
        'img[alt*="product"], img[alt*="box"], img[alt*="card"]', // Alt text matches
        'img.product-image, img.box-image, img.main-image', // Common classes
        'img[src*="/boxes/"], img[src*="/products/"]', // URL pattern
        'picture img, figure img', // Semantic HTML
        'img:not([src*="logo"]):not([src*="icon"])', // Exclude logos
      ];

      for (const selector of selectors) {
        const img = $(selector).first();
        if (img && img.attr('src')) {
          imageUrl = img.attr('src');
          break;
        }
      }

      // If still no image, try the og:image meta tag
      if (!imageUrl) {
        imageUrl = $('meta[property="og:image"]').attr('content');
      }

      // Make absolute URL if needed
      if (imageUrl && !imageUrl.startsWith('http')) {
        if (imageUrl.startsWith('/')) {
          imageUrl = 'https://www.waxstat.com' + imageUrl;
        }
      }

      console.log('Found image:', imageUrl);
      res.json({ imageUrl });
    } catch (error) {
      console.error('Proxy error:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // API proxy to waxstat.com API
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.waxstat.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // Remove /api prefix when forwarding
      },
    })
  );
};
