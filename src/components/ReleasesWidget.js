import React, { useState, useEffect, useRef } from 'react';
import ReleaseCard from './ReleaseCard';
import { getWeekReleases } from '../services/waxstatApi';
import { colors } from '../styles/brandColors';
import { widgetUrl } from '../lib/widgetBase';

const ReleasesWidget = ({
  title = "Recent Releases",
  limit = 5,
  hideTitle = false,
  hideNav = false,
  hideHeader = false,
  logoOnly = false,
  itemStyle = {}
}) => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(728);
  const [weekOffset, setWeekOffset] = useState(0);
  const containerRef = useRef(null);

  // Calculate week start date based on offset
  const getWeekStart = (offset) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (offset * 7));
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  };

  const formatWeekRange = (weekStart) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startMonth} - ${endMonth}`;
  };

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        setLoading(true);
        const weekStart = getWeekStart(weekOffset);
        const data = await getWeekReleases(weekStart, limit);
        setReleases(data);
      } catch (err) {
        setError('Failed to load releases');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, [limit, weekOffset]);

  // Measure container width for responsive sizing
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver(() => {
      if (element.offsetWidth > 0) {
        setContainerWidth(element.offsetWidth);
      }
    });

    resizeObserver.observe(element);
    if (element.offsetWidth > 0) {
      setContainerWidth(element.offsetWidth);
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Responsive sizing based on container width
  const isVeryNarrow = containerWidth < 200; // Skyscraper
  const isNarrow = containerWidth < 350;     // Banners

  const containerStyle = {
    fontFamily: '"ROC Grotesk", system-ui, sans-serif',
    backgroundColor: colors.white,
    borderRadius: '4px',
    border: `1px solid ${colors.lightGray}`,
    overflow: 'hidden',
  };

  const headerStyle = {
    display: (hideHeader || isVeryNarrow) ? 'none' : 'grid',
    gridTemplateColumns: '4fr 1fr 1fr',
    gap: isNarrow ? '8px' : '16px',
    padding: isVeryNarrow ? '4px 8px' : isNarrow ? '6px 8px' : '12px 16px',
    backgroundColor: colors.ashWhite,
    borderBottom: `1px solid ${colors.lightGray}`,
    fontSize: isVeryNarrow ? '9px' : isNarrow ? '10px' : '12px',
    fontWeight: '600',
    color: colors.darkGray,
    textTransform: 'uppercase',
    letterSpacing: isVeryNarrow ? '0px' : '0.5px',
  };

  const listStyle = {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: containerWidth < 100 ? '400px' : 'auto',
    overflowY: containerWidth < 100 ? 'auto' : 'visible',
  };

  const loadingStyle = {
    textAlign: 'center',
    padding: isVeryNarrow ? '20px 10px' : isNarrow ? '30px 15px' : '40px 20px',
    color: colors.darkGray,
    fontSize: isNarrow ? '11px' : '13px',
  };

  const errorStyle = {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: isNarrow ? '8px' : '16px',
    margin: isNarrow ? '8px' : '16px',
    borderRadius: '4px',
    fontSize: isNarrow ? '11px' : '13px',
  };

  const navigationStyle = {
    display: hideNav ? 'none' : 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isNarrow ? '8px 12px' : '12px 16px',
    borderBottom: `2px solid ${colors.teal}`,
    gap: isNarrow ? '8px' : '16px',
    backgroundColor: colors.white,
  };

  const logoStyle = {
    height: isNarrow ? '18px' : '24px',
    flexShrink: 0,
  };

  const weekDisplayStyle = {
    fontSize: isNarrow ? '10px' : '12px',
    fontWeight: '500',
    color: colors.darkGray,
    flexShrink: 0,
  };

  const buttonStyle = {
    padding: isNarrow ? '4px 8px' : '6px 12px',
    fontSize: isNarrow ? '10px' : '12px',
    backgroundColor: colors.teal,
    color: colors.white,
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={loadingStyle}>Loading releases...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorStyle}>{error}</div>
      </div>
    );
  }

  const weekStart = getWeekStart(weekOffset);

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={navigationStyle}>
        <img
          src={widgetUrl('waxstat-logo.svg')}
          alt="Waxstat Release Calendar"
          style={logoStyle}
        />
        {!logoOnly && (
          <>
            <div style={weekDisplayStyle}>{formatWeekRange(weekStart)}</div>
            <button
              style={buttonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5cc896'}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.teal}
              onClick={() => setWeekOffset(weekOffset - 1)}
            >
              ← Previous
            </button>
            <button
              style={buttonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5cc896'}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.teal}
              onClick={() => setWeekOffset(weekOffset + 1)}
            >
              Next →
            </button>
          </>
        )}
      </div>
      <div style={headerStyle}>
        <div>Product</div>
        <div>Release Date</div>
        <div>Avg Price</div>
      </div>
      <div style={listStyle}>
        {releases.map((box) => (
          <ReleaseCard
            key={box.slug}
            box={box}
            containerWidth={containerWidth}
            waxstatUrl="https://www.waxstat.com"
          />
        ))}
      </div>
      {releases.length === 0 && (
        <div style={loadingStyle}>No releases found</div>
      )}
    </div>
  );
};

export default ReleasesWidget;
