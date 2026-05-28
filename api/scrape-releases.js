import { withCors } from './_cors.js';

async function handler(req, res) {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing startDate or endDate' });
  }

  try {
    const url = `https://www.waxstat.com/release-dates/${startDate}-${endDate}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Waxstat returned ${response.status}`);
    }

    const html = await response.text();

    // Extract box slugs and release dates from product rows
    const releases = [];
    const processedSlugs = new Set();

    // Look for product rows containing both the link and potentially the date
    // Match patterns like: <a href="/boxes/2026-panini-donruss-baseball-hobby-box" data-turbolinks="false">
    const slugMatches = html.matchAll(/href="\/boxes\/([^"]+)"\s+data-turbolinks="false">([^<]+)<\/a>/g);

    for (const match of slugMatches) {
      const slug = match[1];
      const productName = match[2];

      // Filter out template syntax and invalid slugs
      if (slug && !slug.includes('{{') && !slug.includes('}}') && slug.length > 3 && !processedSlugs.has(slug)) {
        processedSlugs.add(slug);

        // Try to extract release date from the page context around this link
        // The date is typically in the same row/section as the product
        const linkPos = match.index;
        const contextStart = Math.max(0, linkPos - 500);
        const contextEnd = Math.min(html.length, linkPos + 500);
        const context = html.substring(contextStart, contextEnd);

        // Look for common date patterns: May 16, 2026 or similar
        const dateMatch = context.match(/(\w+)\s+(\d{1,2}),?\s+(\d{4})/);
        let releaseDate = null;

        if (dateMatch) {
          // Format as YYYY-MM-DD
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
          const monthIndex = monthNames.findIndex(m => m.toLowerCase() === dateMatch[1].toLowerCase());
          if (monthIndex !== -1) {
            const month = String(monthIndex + 1).padStart(2, '0');
            const day = String(dateMatch[2]).padStart(2, '0');
            const year = dateMatch[3];
            releaseDate = `${year}-${month}-${day}`;
          }
        }

        releases.push({
          slug,
          release_date: releaseDate
        });
      }
    }

    res.status(200).json({
      slugs: releases.map(r => r.slug).slice(0, 50),
      releases: releases.slice(0, 50)
    });
  } catch (error) {
    console.error('Error scraping releases:', error);
    res.status(500).json({ error: error.message, slugs: [] });
  }
}

export default withCors(handler);
