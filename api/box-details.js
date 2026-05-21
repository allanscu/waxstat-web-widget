export default async function handler(req, res) {
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Missing slug parameter' });
  }

  try {
    const apiKey = process.env.REACT_APP_API_KEY;
    const apiUrl = `https://api.waxstat.com/v1/boxes/${encodeURIComponent(slug)}`;

    const response = await fetch(apiUrl, {
      headers: {
        'API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching box details:', error);
    res.status(500).json({ error: error.message });
  }
}
