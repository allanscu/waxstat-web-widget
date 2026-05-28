import React from 'react';
import ReleasesWidget from './ReleasesWidget';
import { colors } from '../styles/brandColors';

const WidgetContainer = ({ format = 'responsive', featuredSlug = null }) => {
  // Standard ad sizes (in pixels)
  const formats = {
    // Horizontal Banners
    leaderboard: { width: 728, height: 90, columns: 1, items: 1 },
    largeLeaderboard: { width: 970, height: 90, columns: 1, items: 1 },
    horizontalBanner: { width: 600, height: 100, columns: 3, items: 3 },

    // Squares
    mediumSquare: { width: 300, height: 300, columns: 2, items: 2 },
    smallSquare: { width: 250, height: 250, columns: 1, items: 1 },

    // Vertical/Skyscraper
    skyscraper: { width: 160, height: 600, columns: 1, items: 5 },
    wideSkyscraper: { width: 300, height: 600, columns: 1, items: 5 },
    halfPage: { width: 300, height: 600, columns: 1, items: 5 },

    // Responsive (default)
    responsive: { width: '100%', height: 'auto', columns: 'auto', items: 5 },
  };

  const config = formats[format] || formats.responsive;

  const containerStyle = {
    width: config.width,
    height: config.height !== 'auto' ? config.height : 'auto',
    overflow: 'hidden',
    borderRadius: '4px',
    backgroundColor: colors.white,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontFamily: '"ROC Grotesk", system-ui, sans-serif',
  };

  const innerStyle = {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    boxSizing: 'border-box',
  };

  // For leaderboards, show only logo; for other banners, hide nav and header
  const isLeaderboard = format === 'leaderboard' || format === 'largeLeaderboard';
  const isHorizontalBanner = format === 'leaderboard' || format === 'largeLeaderboard' || format === 'horizontalBanner';

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        <ReleasesWidget
          title={null}
          limit={config.items}
          hideTitle={true}
          logoOnly={isLeaderboard}
          hideNav={!isLeaderboard && isHorizontalBanner}
          hideHeader={isHorizontalBanner}
          featuredSlug={isLeaderboard ? featuredSlug : null}
        />
      </div>
    </div>
  );
};

export default WidgetContainer;

// Export format options for reference
export const WIDGET_FORMATS = {
  LEADERBOARD: 'leaderboard',           // 728x90
  LARGE_LEADERBOARD: 'largeLeaderboard', // 970x90
  HORIZONTAL_BANNER: 'horizontalBanner',  // 600x100
  MEDIUM_SQUARE: 'mediumSquare',         // 300x300
  SMALL_SQUARE: 'smallSquare',           // 250x250
  SKYSCRAPER: 'skyscraper',              // 160x600
  WIDE_SKYSCRAPER: 'wideSkyscraper',     // 300x600
  HALF_PAGE: 'halfPage',                 // 300x600
  RESPONSIVE: 'responsive',              // 100% width
};
