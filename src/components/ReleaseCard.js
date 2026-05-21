import React, { useState, useEffect } from 'react';
import { colors } from '../styles/brandColors';

const ReleaseCard = ({ box, waxstatUrl = 'https://waxstat.com', containerWidth = 728 }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const price = parseFloat(box['waxstat-avg']) || 0;
  const boxUrl = `${waxstatUrl}/boxes/${box.slug}`;

  // Responsive sizing based on container width
  const isVeryNarrow = containerWidth < 200;
  const isNarrow = containerWidth < 350;
  const isMedium = containerWidth < 600;
  const showImage = containerWidth > 600; // Only show images in responsive/wide formats

  // Fetch product image only for wide formats
  useEffect(() => {
    if (!showImage) return;

    const fetchImage = async () => {
      try {
        const url = `${waxstatUrl}/boxes/${box.slug}`;
        const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching image:', error);
      }
    };

    fetchImage();
  }, [box.slug, waxstatUrl, showImage]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  const rowStyle = {
    borderBottom: `1px solid ${colors.lightGray}`,
    padding: isVeryNarrow ? '4px 6px' : isNarrow ? '6px 8px' : '12px 16px',
    display: isVeryNarrow ? 'flex' : 'grid',
    flexDirection: isVeryNarrow ? 'row' : undefined,
    gridTemplateColumns: isVeryNarrow ? undefined : '2fr 1fr 1fr',
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
    flex: isVeryNarrow ? '1' : 'auto',
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
        <div style={nameStyle}>{box.name}</div>
      </div>
      <div style={cellStyle}>{formatDate(box.release_date)}</div>
      <div style={priceStyle}>${price > 0 ? price.toFixed(2) : '-'}</div>
    </a>
  );
};

export default ReleaseCard;
