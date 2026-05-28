import { withCors } from './_cors.js';

async function handler(req, res) {
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
    // Upstream wraps a single result as { boxes: [box] }. Unwrap so the
    // client can read fields like `waxstat-avg` directly off the response.
    const box = Array.isArray(data?.boxes) && data.boxes.length > 0
      ? data.boxes[0]
      : data;
    res.status(200).json(box);
  } catch (error) {
    console.error('Error fetching box details:', error);
    res.status(500).json({ error: error.message });
  }
}

export default withCors(handler);
