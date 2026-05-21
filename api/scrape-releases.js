export default async function handler(req, res) {
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

    // Extract box slugs from the page
    const slugs = new Set();
    const lines = html.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('href="/boxes/')) {
        const slugMatch = line.match(/href="\/boxes\/([^"]+)"/);
        if (slugMatch) {
          slugs.add(slugMatch[1]);
        }
      }
    }

    res.status(200).json({ slugs: Array.from(slugs) });
  } catch (error) {
    console.error('Error scraping releases:', error);
    res.status(500).json({ error: error.message, slugs: [] });
  }
}
