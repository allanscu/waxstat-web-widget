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
    const sortedByDate = boxes
      .filter(box => box.release_date)
      .sort((a, b) => {
        const dateA = new Date(a.release_date);
        const dateB = new Date(b.release_date);
        return dateB - dateA; // Newest first
      })
      .slice(0, limit);

    console.log('Top releases:', sortedByDate);
    return sortedByDate;
  } catch (error) {
    console.error('Error fetching top releases:', error.message);
    throw error;
  }
};

export const getWeekReleases = async (weekStart, limit = 50) => {
  try {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    console.log(`Fetching releases for week ${weekStart.toDateString()}`);
    const response = await apiClient.get(`/v1/boxes/search/2026`);
    const boxes = response.data.boxes || [];

    // Filter releases within the week and sort by date
    const weekReleases = boxes
      .filter(box => {
        if (!box.release_date) return false;
        const releaseDate = new Date(box.release_date);
        return releaseDate >= weekStart && releaseDate <= weekEnd;
      })
      .sort((a, b) => {
        const dateA = new Date(a.release_date);
        const dateB = new Date(b.release_date);
        return dateA - dateB; // Earliest first
      })
      .slice(0, limit);

    console.log('Week releases:', weekReleases);
    return weekReleases;
  } catch (error) {
    console.error('Error fetching week releases:', error.message);
    throw error;
  }
};
