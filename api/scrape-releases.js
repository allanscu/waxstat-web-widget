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

    // Extract box slugs from actual product rows (data-turbolinks="false" links)
    const slugs = new Set();

    // Match patterns like: <a href="/boxes/2026-panini-donruss-baseball-hobby-box" data-turbolinks="false">
    const slugMatches = html.matchAll(/href="\/boxes\/([^"]+)"\s+data-turbolinks="false"/g);

    for (const match of slugMatches) {
      const slug = match[1];
      // Filter out template syntax and invalid slugs
      if (slug && !slug.includes('{{') && !slug.includes('}}') && slug.length > 3) {
        slugs.add(slug);
      }
    }

    res.status(200).json({ slugs: Array.from(slugs).slice(0, 50) });
  } catch (error) {
    console.error('Error scraping releases:', error);
    res.status(500).json({ error: error.message, slugs: [] });
  }
}

export default withCors(handler);
