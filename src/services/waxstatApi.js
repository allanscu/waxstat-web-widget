import { widgetUrl } from '../lib/widgetBase';

const API_KEY = process.env.REACT_APP_API_KEY;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

console.log('API Config:', { API_BASE_URL, API_KEY: API_KEY ? '***set***' : 'NOT SET' });

// All data requests are proxied through the widget host's serverless functions
// (/api/* on the widget deployment). Two reasons:
//   1. The API key stays server-side instead of shipping in every embedder's JS.
//   2. Avoids cross-origin requests to api.waxstat.com from arbitrary embedder
//      origins, which would require CORS the upstream API doesn't provide.
// `widgetUrl` resolves the path against the widget host (set by widget.js).
async function getJson(apiPath) {
  const url = widgetUrl(apiPath);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Widget proxy ${apiPath} returned ${response.status}`);
  }
  return response.json();
}

// Cache management for box data
const CACHE_KEY_PREFIX = 'waxstat-box-';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

const getCachedBox = (slug) => {
  try {
    const cached = localStorage.getItem(CACHE_KEY_PREFIX + slug);
    if (!cached) return null;
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + slug);
      return null;
    }
    return data;
  } catch (error) {
    return null;
  }
};

const setCachedBox = (slug, data) => {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + slug, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error caching box data:', error);
  }
};

export const searchBoxes = async (term) => {
  try {
    const data = await getJson(`api/boxes-search?query=${encodeURIComponent(term)}`);
    return data.boxes || [];
  } catch (error) {
    console.error('Error searching boxes:', error);
    throw error;
  }
};

export const getBoxBySlug = async (slug) => {
  try {
    // Check cache first
    const cached = getCachedBox(slug);
    if (cached) {
      console.log('Using cached box data for:', slug);
      return cached;
    }

    const data = await getJson(`api/box-details?slug=${encodeURIComponent(slug)}`);

    // Cache the result
    if (data) {
      setCachedBox(slug, data);
    }

    return data;
  } catch (error) {
    console.error('Error fetching box:', error);
    // Return cached data if available even if fetch fails
    const cached = getCachedBox(slug);
    if (cached) return cached;
    throw error;
  }
};

export const getTopReleases = async (limit = 5) => {
  try {
    console.log('Fetching releases...');
    const data = await getJson(`api/boxes-search?query=2026`);
    let boxes = data.boxes || [];

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
    // Check cache first
    const cached = getCachedBox(slug);
    if (cached) {
      return {
        ...cached,
        image: `https://slabstat-production.s3.amazonaws.com/Listings/${slug}.png`
      };
    }

    const box = await getJson(`api/box-details?slug=${encodeURIComponent(slug)}`);

    // Cache the result
    if (box) {
      setCachedBox(slug, box);
    }

    return {
      ...box,
      image: `https://slabstat-production.s3.amazonaws.com/Listings/${slug}.png`
    };
  } catch (error) {
    console.error(`Error fetching details for ${slug}:`, error);
    // Return cached data if available even if fetch fails
    const cached = getCachedBox(slug);
    if (cached) {
      return {
        ...cached,
        image: `https://slabstat-production.s3.amazonaws.com/Listings/${slug}.png`
      };
    }
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

    console.log(`Scraping releases for week: ${startStr}-${endStr}`);

    // Always go through the widget host's scrape serverless function. Direct
    // scraping from the browser is blocked by CORS on waxstat.com.
    const data = await getJson(`api/scrape-releases?startDate=${startStr}&endDate=${endStr}`);
    const slugs = data.slugs || [];

    // Fetch detailed info for each slug
    const boxes = [];
    for (const slug of slugs.slice(0, 5)) {
      try {
        const details = await getBoxBySlug(slug);
        if (details) {
          boxes.push({
            slug: details.slug || slug,
            name: details.name || slug.replace(/-/g, ' '),
            'waxstat-avg': details['waxstat-avg'],
            release_date: details.release_date,
            image: `https://slabstat-production.s3.amazonaws.com/Listings/${slug}.png`
          });
        } else {
          console.warn('Could not fetch details for slug:', slug);
          boxes.push({
            slug,
            name: slug.replace(/-/g, ' '),
            'waxstat-avg': null,
            release_date: null,
            image: `https://slabstat-production.s3.amazonaws.com/Listings/${slug}.png`
          });
        }
      } catch (error) {
        console.warn('Error fetching details for slug:', slug, error);
        boxes.push({
          slug,
          name: slug.replace(/-/g, ' '),
          'waxstat-avg': null,
          release_date: null,
          image: `https://slabstat-production.s3.amazonaws.com/Listings/${slug}.png`
        });
      }
    }

    return boxes;
  } catch (error) {
    console.error('Error scraping weekly releases:', error.message);
    return [];
  }
};

export const getWeekReleases = async (weekStart, limit = 50, slug = null) => {
  try {
    // If a specific slug is provided, fetch that box with release date from scrape
    if (slug) {
      console.log(`Fetching specific box: ${slug}`);
      // First try to get box details from API for name, price, etc.
      const box = await getBoxBySlug(slug);

      // Then scrape the current week to get release date for this box
      const weekEnd = new Date(weekStart || new Date());
      if (!weekStart) {
        weekStart = new Date(weekEnd);
        weekStart.setDate(weekEnd.getDate() - weekEnd.getDay());
      }
      const scrapedReleases = await scrapeWeeklyReleases(weekStart);
      const scrapedBox = scrapedReleases.find(b => b.slug === slug);

      if (box && scrapedBox) {
        return [{
          ...box,
          release_date: scrapedBox.release_date,
          image: scrapedBox.image || `https://slabstat-production.s3.amazonaws.com/Listings/${slug}.png`
        }];
      } else if (scrapedBox) {
        return [scrapedBox];
      } else if (box) {
        return [box];
      }
      return [];
    }

    // For weekly releases, always scrape to get accurate release dates
    console.log(`Fetching releases for week ${weekStart.toDateString()}`);
    const weekReleases = await scrapeWeeklyReleases(weekStart);

    console.log('Week releases:', weekReleases);
    return weekReleases.slice(0, limit);
  } catch (error) {
    console.error('Error fetching week releases:', error.message);
    return [];
  }
};
