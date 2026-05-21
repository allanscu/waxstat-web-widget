import React, { useState, useEffect } from 'react';
import { colors } from '../styles/brandColors';

const ReleaseCard = ({ box, waxstatUrl = 'https://www.waxstat.com', containerWidth = 728 }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const price = parseFloat(box['waxstat-avg']) || 0;
  const slug = box.slug || box.id;
  const boxUrl = `${waxstatUrl}/boxes/${slug}`;

  if (!slug) {
    console.warn('ReleaseCard: Missing slug or id for box:', box);
  }

  // Responsive sizing based on container width
  const isVeryNarrow = containerWidth < 200;
  const isNarrow = containerWidth < 350;
  const showImage = containerWidth > 250; // Show images in medium and larger formats

  // Use image from box object if available
  useEffect(() => {
    if (box.image) {
      setImageUrl(box.image);
    }
  }, [box.image]);

  const capitalizeWords = (str) => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatSeasonDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // May-August (5-8) are part of next year's season
    // September-April (9-12, 1-4) are part of current year's season
    let seasonStart, seasonEnd;
    if (month >= 5 && month <= 8) {
      seasonStart = year;
      seasonEnd = year + 1;
    } else {
      seasonStart = year - 1;
      seasonEnd = year;
    }

    const startYY = String(seasonStart).slice(-2);
    const endYY = String(seasonEnd).slice(-2);
    return `${startYY}-${endYY}`;
  };

  const rowStyle = {
    borderBottom: `1px solid ${colors.lightGray}`,
    padding: isVeryNarrow ? '4px 6px' : isNarrow ? '6px 8px' : '12px 16px',
    display: isVeryNarrow ? 'flex' : 'grid',
    flexDirection: isVeryNarrow ? 'row' : undefined,
    gridTemplateColumns: isVeryNarrow ? undefined : '4fr 1fr 1fr',
    gap: isNarrow ? '4px' : isVeryNarrow ? '3px' : '16px',
    alignItems: 'center',
    transition: 'background-color 0.2s ease',
    fontSize: isVeryNarrow ? '9px' : isNarrow ? '10px' : '13px',
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
    flex: isVeryNarrow ? '0 0 auto' : 'auto',
  };

  const priceStyle = {
    fontSize: isVeryNarrow ? '8px' : isNarrow ? '9px' : '13px',
    fontWeight: '600',
    color: colors.teal,
    whiteSpace: 'nowrap',
    flex: isVeryNarrow ? '0 0 auto' : 'auto',
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
      <div style={cellStyle}>{formatSeasonDate(box.release_date)}</div>
      <div style={priceStyle}>${price > 0 ? price.toFixed(2) : '-'}</div>
    </a>
  );
};

export default ReleaseCard;
