// Service to fetch product images from waxstat.com
import axios from 'axios';

// Simple in-memory cache for images
const imageCache = {};

export const getProductImage = async (slug) => {
  try {
    // Return cached image if available
    if (imageCache[slug]) {
      return imageCache[slug];
    }

    // Try to fetch the product page
    const url = `https://www.waxstat.com/boxes/${slug}`;
    console.log('Fetching image for:', slug);

    // Use a CORS-friendly approach - fetch through our proxy
    const response = await axios.get(`/api/proxy?url=${encodeURIComponent(url)}`);

    if (response.data && response.data.imageUrl) {
      imageCache[slug] = response.data.imageUrl;
      return response.data.imageUrl;
    }

    return null;
  } catch (error) {
    console.error('Error fetching product image:', error.message);
    return null;
  }
};

// Batch fetch images for multiple products
export const getProductImages = async (slugs) => {
  const results = {};
  for (const slug of slugs) {
    results[slug] = await getProductImage(slug);
  }
  return results;
};
