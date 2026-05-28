import React, { useState, useEffect } from 'react';
import { colors } from '../styles/brandColors';

// When a box's upstream product image is missing from S3, swap in a brand
// logo so the row never renders a blank cell. URLs point at the same
// slabstat-production bucket so they share CDN/caching with the box images.
const BRAND_FALLBACKS = [
  {
    match: /panini/i,
    url: 'https://slabstat-production.s3.amazonaws.com/Listings/box-panini-logo-20250613173139144.jpg',
  },
];

function brandFallbackUrl(box) {
  const haystack = `${box?.name || ''} ${box?.slug || ''} ${box?.id || ''}`;
  const hit = BRAND_FALLBACKS.find((b) => b.match.test(haystack));
  return hit ? hit.url : null;
}

const ReleaseCard = ({ box, waxstatUrl = 'https://www.waxstat.com', containerWidth = 728, logoOnly = false }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const price = parseFloat(box['waxstat-avg']) || 0;
  const slug = box.slug || box.id;
  const boxUrl = `${waxstatUrl}/boxes/${slug}`;

  if (!slug) {
    console.warn('ReleaseCard: Missing slug or id for box:', box);
  }

  // Responsive sizing based on container width
  const isVeryNarrow = containerWidth < 200;
  const isNarrow = containerWidth < 350;
  const isSquare = containerWidth >= 250 && containerWidth < 350; // Square formats (300x300, 250x250)
  const showImage = containerWidth > 250; // Show images in medium and larger formats

  // Use image from box object if available
  useEffect(() => {
    if (box.image) {
      setImageUrl(box.image);
      setUsedFallback(false);
    }
  }, [box.image]);

  const capitalizeWords = (str) => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatReleaseDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return '-';
    }
  };

  const formatSeasonDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';

      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      // May-December (5-12) are part of current year's season
      // January-April (1-4) are part of previous year's season
      let seasonStart, seasonEnd;
      if (month >= 5) {
        seasonStart = year;
        seasonEnd = year + 1;
      } else {
        seasonStart = year - 1;
        seasonEnd = year;
      }

      const startYY = String(seasonStart).slice(-2);
      const endYY = String(seasonEnd).slice(-2);
      return `${startYY}-${endYY}`;
    } catch (error) {
      return '-';
    }
  };

  const rowStyle = {
    borderBottom: `1px solid ${colors.lightGray}`,
    padding: logoOnly ? '2px 4px' : (isVeryNarrow ? '4px 6px' : isNarrow ? '6px 8px' : '12px 16px'),
    display: isVeryNarrow ? 'flex' : 'grid',
    flexDirection: isVeryNarrow ? 'row' : undefined,
    gridTemplateColumns: isVeryNarrow ? undefined : (isSquare ? '2fr 1fr 1fr' : '4fr 1fr 1fr'),
    gap: isNarrow ? '4px' : isVeryNarrow ? '3px' : '16px',
    alignItems: 'center',
    transition: 'background-color 0.2s ease',
    fontSize: logoOnly ? '10px' : (isVeryNarrow ? '9px' : isNarrow ? '10px' : '13px'),
  };

  const productColumnStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: showImage ? '12px' : '0',
    flex: '2fr',
    minWidth: 0,
  };

  const imageStyle = {
    width: '40px',
    height: '40px',
    flexShrink: 0,
    backgroundColor: colors.lightGray,
    borderRadius: '3px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const imageImgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const nameStyle = {
    fontSize: isVeryNarrow ? '9px' : isNarrow ? '10px' : '14px',
    fontWeight: '500',
    color: colors.onyx,
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'block',
    flex: '1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    minWidth: 0,
  };

  const cellStyle = {
    fontSize: isVeryNarrow ? '8px' : isNarrow ? '9px' : '13px',
    color: colors.darkGray,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: isVeryNarrow ? '0 0 auto' : 'auto',
    minWidth: 0,
  };

  const priceStyle = {
    fontSize: isVeryNarrow ? '8px' : isNarrow ? '9px' : '13px',
    fontWeight: '600',
    color: colors.teal,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flex: isVeryNarrow ? '0 0 auto' : 'auto',
    minWidth: 0,
  };

  return (
    <a
      href={boxUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={rowStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.ashWhite;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div style={productColumnStyle}>
        {showImage && (
          <div style={imageStyle}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={box.name}
                style={imageImgStyle}
                onError={(e) => {
                  // First failure: try a brand-specific fallback if we know one.
                  // Second failure (e.g. brand asset itself missing): give up
                  // and hide so the row collapses to the emoji.
                  if (!usedFallback) {
                    const fallback = brandFallbackUrl(box);
                    if (fallback) {
                      setUsedFallback(true);
                      e.target.src = fallback;
                      return;
                    }
                  }
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <span style={{ fontSize: '20px' }}>📦</span>
            )}
          </div>
        )}
        <div style={nameStyle}>{capitalizeWords(box.name)}</div>
      </div>
      <div style={cellStyle}>
        {containerWidth > 600 ? formatReleaseDate(box.release_date) : formatSeasonDate(box.release_date)}
      </div>
      <div style={priceStyle}>${price > 0 ? price.toFixed(2) : '-'}</div>
    </a>
  );
};

export default ReleaseCard;
