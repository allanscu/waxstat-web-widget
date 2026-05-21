import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY;

// Use local proxy in development, full URL in production
const API_BASE_URL = process.env.NODE_ENV === 'development' ? '/api' : process.env.REACT_APP_API_BASE_URL;

console.log('API Config:', { API_BASE_URL, API_KEY: API_KEY ? '***set***' : 'NOT SET' });

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'API-KEY': API_KEY,
  },
});

export const searchBoxes = async (term) => {
  try {
    const response = await apiClient.get(`/v1/boxes/search/${term}`);
    return response.data.boxes || [];
  } catch (error) {
    console.error('Error searching boxes:', error);
    throw error;
  }
};

export const getBoxBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/v1/boxes/${slug}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching box:', error);
    throw error;
  }
};

export const getTopReleases = async (limit = 5) => {
  try {
    console.log('Fetching releases...');
    const response = await apiClient.get(`/v1/boxes/search/2026`);
    const boxes = response.data.boxes || [];

    // Sort by release_date (most recent first)
    let sortedByDate = boxes
      .filter(box => box.release_date)
      .sort((a, b) => {
        const dateA = new Date(a.release_date);
        const dateB = new Date(b.release_date);
        return dateB - dateA; // Newest first
      })
      .slice(0, limit);

    // If no results, try scraping current week
    if (sortedByDate.length === 0) {
      console.log('No API results for top releases, trying current week scrape...');
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      sortedByDate = await scrapeWeeklyReleases(weekStart);
    }

    console.log('Top releases:', sortedByDate);
    return sortedByDate;
  } catch (error) {
    console.error('Error fetching top releases:', error.message);
    // Fallback to scraping current week
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      return await scrapeWeeklyReleases(weekStart);
    } catch (scrapeError) {
      console.error('Scrape fallback also failed:', scrapeError.message);
      return [];
    }
  }
};

export const getBoxDetails = async (slug) => {
  try {
    const response = await apiClient.get(`/v1/boxes/${slug}`);
    const box = response.data;
    return {
      ...box,
      image: `https://slabstat-production.s3.amazonaws.com/Listings/${slug}.png`
    };
  } catch (error) {
    console.error(`Error fetching details for ${slug}:`, error);
    return null;
  }
};

export const scrapeWeeklyReleases = async (weekStart) => {
  try {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Format dates as MMMM-DD-YYYY (e.g., May-17-2026)
    const formatDate = (date) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const month = months[date.getMonth()];
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    const startStr = formatDate(weekStart);
    const endStr = formatDate(weekEnd);
    const url = `https://www.waxstat.com/release-dates/${startStr}-${endStr}`;

    console.log(`Scraping releases for week: ${url}`);

    const response = await fetch(url);
    const html = await response.text();

    // Extract box slugs from the page
    const boxes = [];
    const lines = html.split('\n');
    const slugs = new Set();

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('href="/boxes/')) {
        const slugMatch = line.match(/href="\/boxes\/([^"]+)"/);
        if (slugMatch) {
          slugs.add(slugMatch[1]);
        }
      }
    }

    // Fetch detailed info for each slug
    for (const slug of Array.from(slugs).slice(0, 5)) {
      const details = await getBoxDetails(slug);
      if (details) {
        boxes.push({
          slug: details.slug,
          name: details.name || slug.replace(/-/g, ' '),
          'waxstat-avg': details['waxstat-avg'],
          release_date: details.release_date || weekStart.toISOString().split('T')[0],
          image: details.image
        });
      }
    }

    return boxes;
  } catch (error) {
    console.error('Error scraping weekly releases:', error.message);
    return [];
  }
};

export const getWeekReleases = async (weekStart, limit = 50) => {
  try {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    console.log(`Fetching releases for week ${weekStart.toDateString()}`);
    const response = await apiClient.get(`/v1/boxes/search/2026`);
    const boxes = response.data.boxes || [];

    // Filter releases within the week and sort by date, add image URLs
    let weekReleases = boxes
      .filter(box => {
        if (!box.release_date) return false;
        const releaseDate = new Date(box.release_date);
        return releaseDate >= weekStart && releaseDate <= weekEnd;
      })
      .map(box => ({
        ...box,
        image: `https://slabstat-production.s3.amazonaws.com/Listings/${box.slug}.png`
      }))
      .sort((a, b) => {
        const dateA = new Date(a.release_date);
        const dateB = new Date(b.release_date);
        return dateA - dateB; // Earliest first
      })
      .slice(0, limit);

    // If no results from API, try scraping waxstat.com
    if (weekReleases.length === 0) {
      console.log('No API results, falling back to scraping...');
      weekReleases = await scrapeWeeklyReleases(weekStart);
    }

    console.log('Week releases:', weekReleases);
    return weekReleases;
  } catch (error) {
    console.error('Error fetching week releases, trying scrape fallback:', error.message);
    // Fallback to scraping if API fails
    try {
      return await scrapeWeeklyReleases(weekStart);
    } catch (scrapeError) {
      console.error('Scrape fallback also failed:', scrapeError.message);
      return [];
    }
  }
};
