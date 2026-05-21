// Server-side scraping service for waxstat.com release dates
// This runs on the proxy server, not in the browser

export const getWeeklyReleases = async (weekStart, weekEnd) => {
  try {
    // Format dates as MMMM-DD-YYYY (e.g., May-17-2026)
    const formatDate = (date) => {
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
      const month = months[date.getMonth()];
      const day = date.getDate();
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    const startStr = formatDate(weekStart);
    const endStr = formatDate(weekEnd);
    const url = `https://www.waxstat.com/release-dates/${startStr}-${endStr}`;

    console.log('Scraping:', url);

    // Fetch the page through the local proxy
    const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(`Failed to scrape: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Scraped releases:', data);
    return data.releases || [];
  } catch (error) {
    console.error('Error scraping releases:', error);
    return [];
  }
};

export const getThisWeekReleases = async () => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return getWeeklyReleases(weekStart, weekEnd);
};

export const getNextWeekReleases = async () => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  return getWeeklyReleases(weekStart, weekEnd);
};
