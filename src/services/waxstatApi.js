import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

console.log('API Config:', { API_BASE_URL, API_KEY: API_KEY ? '***set***' : 'NOT SET' });

// Create axios client for waxstat API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'API-KEY': API_KEY,
  },
});

// Helper to determine if we should use serverless functions
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

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
    if (isProduction) {
      const response = await fetch(`/api/boxes-search?query=${encodeURIComponent(term)}`);
      const data = await response.json();
      return data.boxes || [];
    } else {
      const response = await apiClient.get(`/v1/boxes/search/${term}`);
      return response.data.boxes || [];
    }
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

    let data;
    if (isProduction) {
      const response = await fetch(`/api/box-details?slug=${encodeURIComponent(slug)}`);
      data = await response.json();
    } else {
      const response = await apiClient.get(`/v1/boxes/${slug}`);
      data = response.data;
    }

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
    let boxes = [];

    if (isProduction) {
      const response = await fetch(`/api/boxes-search?query=2026`);
      const data = await response.json();
      boxes = data.boxes || [];
    } else {
      const response = await apiClient.get(`/v1/boxes/search/2026`);
      boxes = response.data.boxes || [];
    }

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

    let box;
    if (isProduction) {
      const response = await fetch(`/api/box-details?slug=${encodeURIComponent(slug)}`);
      box = await response.json();
    } else {
      const response = await apiClient.get(`/v1/boxes/${slug}`);
      box = response.data;
    }

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

    // Use serverless function to scrape
    let slugs = [];
    if (isProduction) {
      const response = await fetch(`/api/scrape-releases?startDate=${startStr}&endDate=${endStr}`);
      const data = await response.json();
      slugs = data.slugs || [];
    } else {
      const url = `https://www.waxstat.com/release-dates/${startStr}-${endStr}`;
      const response = await fetch(url);
      const html = await response.text();

      // Extract box slugs from actual product rows
      const slugSet = new Set();
      const slugMatches = html.matchAll(/href="\/boxes\/([^"]+)"\s+data-turbolinks="false"/g);

      for (const match of slugMatches) {
        const slug = match[1];
        // Filter out template syntax and invalid slugs
        if (slug && !slug.includes('{{') && !slug.includes('}}') && slug.length > 3) {
          slugSet.add(slug);
        }
      }
      slugs = Array.from(slugSet);
    }

    // Fetch detailed info for each slug
    const boxes = [];
    for (const slug of slugs.slice(0, 5)) {
      const details = await getBoxDetails(slug);
      if (details) {
        boxes.push({
          slug: details.slug || slug,
          name: details.name || slug.replace(/-/g, ' '),
          'waxstat-avg': details['waxstat-avg'],
          release_date: details.release_date || weekStart.toISOString().split('T')[0],
          image: details.image
        });
      } else {
        // Fallback if details fetch fails
        console.warn('Could not fetch details for slug:', slug);
        boxes.push({
          slug,
          name: slug.replace(/-/g, ' '),
          'waxstat-avg': null,
          release_date: weekStart.toISOString().split('T')[0],
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

export const getWeekReleases = async (weekStart, limit = 50) => {
  try {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    console.log(`Fetching releases for week ${weekStart.toDateString()}`);
    let boxes = [];

    if (isProduction) {
      const response = await fetch(`/api/boxes-search?query=2026`);
      const data = await response.json();
      boxes = data.boxes || [];
    } else {
      const response = await apiClient.get(`/v1/boxes/search/2026`);
      boxes = response.data.boxes || [];
    }

    // Filter releases within the week and sort by date, add image URLs
    let weekReleases = boxes
      .filter(box => {
        if (!box.release_date || !box.slug) {
          console.warn('Skipping box without release_date or slug:', box);
          return false;
        }
        const releaseDate = new Date(box.release_date);
        return releaseDate >= weekStart && releaseDate <= weekEnd;
      })
      .map(box => ({
        ...box,
        slug: box.slug || box.id,
        image: `https://slabstat-production.s3.amazonaws.com/Listings/${box.slug || box.id}.png`
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
