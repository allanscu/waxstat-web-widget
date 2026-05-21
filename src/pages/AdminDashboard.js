import React, { useState, useEffect } from 'react';
import WidgetContainer, { WIDGET_FORMATS } from '../components/WidgetContainer';
import { colors } from '../styles/brandColors';
import { VERSION } from '../version';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('responsive');
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('waxstat-widget-auth');
    if (authToken === 'authenticated') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'abc12345') {
      setIsAuthenticated(true);
      localStorage.setItem('waxstat-widget-auth', 'authenticated');
      setPassword('');
    } else {
      alert('Incorrect password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('waxstat-widget-auth');
  };

  const formatOptions = [
    { key: WIDGET_FORMATS.RESPONSIVE, label: 'Responsive (Full Width)', size: '100%' },
    { key: WIDGET_FORMATS.LEADERBOARD, label: 'Leaderboard', size: '728×90' },
    { key: WIDGET_FORMATS.LARGE_LEADERBOARD, label: 'Large Leaderboard', size: '970×90' },
    { key: WIDGET_FORMATS.HORIZONTAL_BANNER, label: 'Horizontal Banner', size: '600×100' },
    { key: WIDGET_FORMATS.MEDIUM_SQUARE, label: 'Medium Square', size: '300×300' },
    { key: WIDGET_FORMATS.SMALL_SQUARE, label: 'Small Square', size: '250×250' },
    { key: WIDGET_FORMATS.SKYSCRAPER, label: 'Skyscraper', size: '160×600' },
    { key: WIDGET_FORMATS.WIDE_SKYSCRAPER, label: 'Wide Skyscraper', size: '300×600' },
    { key: WIDGET_FORMATS.HALF_PAGE, label: 'Half Page', size: '300×600' },
  ];

  const embedScript = `<!-- Waxstat Web Widget -->
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://waxstat-web-widget.vercel.app/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>

<!-- Choose your format and paste below: -->
<div id="waxstat-releases-widget" data-format="${selectedFormat}"></div>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dashboardStyle = {
    minHeight: '100vh',
    backgroundColor: colors.ashWhite,
    padding: '40px 20px',
  };

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '48px',
  };

  const titleStyle = {
    fontSize: '40px',
    fontWeight: 'bold',
    color: colors.onyx,
    marginBottom: '12px',
  };

  const subtitleStyle = {
    fontSize: '18px',
    color: colors.darkGray,
    marginBottom: '24px',
  };

  const formatSelectorStyle = {
    marginBottom: '32px',
    backgroundColor: colors.white,
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  const formatGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  };

  const formatButtonStyle = (isSelected) => ({
    padding: '12px 16px',
    border: isSelected ? `2px solid ${colors.teal}` : `1px solid ${colors.lightGray}`,
    borderRadius: '4px',
    backgroundColor: isSelected ? colors.lightGray : colors.white,
    color: colors.onyx,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: isSelected ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
    textAlign: 'left',
  });

  const previewAreaStyle = {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '32px',
    marginTop: '32px',
  };

  const previewContainerStyle = {
    backgroundColor: colors.white,
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  const previewLabelStyle = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: colors.darkGray,
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const previewBoxStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    minHeight: '300px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    padding: '16px',
    border: `1px dashed ${colors.lightGray}`,
  };

  const codeBoxStyle = {
    backgroundColor: colors.darkGray,
    color: colors.white,
    padding: '16px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '12px',
    overflowX: 'auto',
    marginBottom: '16px',
    maxHeight: '300px',
    overflowY: 'auto',
  };

  const buttonStyle = {
    padding: '12px 24px',
    backgroundColor: colors.teal,
    color: colors.white,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginRight: '12px',
    transition: 'background-color 0.3s ease',
  };

  const sectionTitleStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: colors.onyx,
    marginBottom: '16px',
  };

  const settingsStyle = {
    backgroundColor: colors.white,
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  };

  const instructionsStyle = {
    backgroundColor: colors.lightGray,
    padding: '16px',
    borderRadius: '4px',
    marginTop: '24px',
    fontSize: '14px',
    lineHeight: '1.6',
  };

  const stepStyle = {
    marginBottom: '12px',
  };

  const strongStyle = {
    fontWeight: 'bold',
    color: colors.onyx,
  };

  const loginFormStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.ashWhite,
  };

  const loginContainerStyle = {
    backgroundColor: colors.white,
    padding: '48px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxWidth: '400px',
    width: '100%',
  };

  const loginLogoStyle = {
    fontSize: '64px',
    textAlign: 'center',
    marginBottom: '24px',
  };

  const loginTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: colors.onyx,
    textAlign: 'center',
    marginBottom: '32px',
  };

  const loginInputStyle = {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    border: `1px solid ${colors.lightGray}`,
    borderRadius: '4px',
    marginBottom: '16px',
    boxSizing: 'border-box',
  };

  const loginButtonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: colors.teal,
    color: colors.white,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.3s ease',
  };

  const versionStyle = {
    fontSize: '12px',
    color: colors.darkGray,
    textAlign: 'center',
    paddingTop: '24px',
    borderTop: `1px solid ${colors.lightGray}`,
  };

  const logoutButtonStyle = {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '8px 16px',
    backgroundColor: colors.teal,
    color: colors.white,
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
  };

  if (!isAuthenticated) {
    return (
      <div style={loginFormStyle}>
        <div style={loginContainerStyle}>
          <div style={loginLogoStyle}>📦</div>
          <h1 style={loginTitleStyle}>Waxstat Widget Admin</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={loginInputStyle}
              autoFocus
            />
            <button
              type="submit"
              style={loginButtonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5cc896'}
              onMouseLeave={(e) => e.target.style.backgroundColor = colors.teal}
            >
              Login
            </button>
          </form>
          <div style={versionStyle}>Version {VERSION}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={dashboardStyle}>
      <button
        onClick={handleLogout}
        style={logoutButtonStyle}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#5cc896'}
        onMouseLeave={(e) => e.target.style.backgroundColor = colors.teal}
      >
        Logout
      </button>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <img src="/waxstat-logo.svg" alt="Waxstat" style={{ height: '48px', marginBottom: '16px' }} />
          <h1 style={titleStyle}>Waxstat Web Widget</h1>
          <p style={subtitleStyle}>
            Choose your preferred ad format and get the embed code
          </p>
        </div>

        {/* Format Selector */}
        <div style={formatSelectorStyle}>
          <h2 style={sectionTitleStyle}>1. Select Your Format</h2>
          <div style={formatGridStyle}>
            {formatOptions.map((option) => (
              <button
                key={option.key}
                style={formatButtonStyle(selectedFormat === option.key)}
                onClick={() => {
                  setSelectedFormat(option.key);
                  setShowCode(false);
                }}
                onMouseEnter={(e) => {
                  if (selectedFormat !== option.key) {
                    e.target.style.borderColor = colors.teal;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFormat !== option.key) {
                    e.target.style.borderColor = colors.lightGray;
                  }
                }}
              >
                <div>{option.label}</div>
                <div style={{ fontSize: '12px', color: colors.darkGray, marginTop: '4px' }}>
                  {option.size}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview and Code */}
        <div style={previewAreaStyle}>
          {/* Preview */}
          <div style={previewContainerStyle}>
            <div style={previewLabelStyle}>Preview</div>
            <div style={previewBoxStyle}>
              <WidgetContainer format={selectedFormat} />
            </div>
          </div>

          {/* Code Section */}
          <div style={settingsStyle}>
            <h2 style={sectionTitleStyle}>2. Get Embed Code</h2>

            <button
              style={buttonStyle}
              onClick={() => setShowCode(!showCode)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5cc896';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.teal;
              }}
            >
              {showCode ? 'Hide Code' : 'Show Code'}
            </button>

            {showCode && (
              <>
                <div style={codeBoxStyle}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {embedScript}
                  </pre>
                </div>

                <button
                  style={buttonStyle}
                  onClick={handleCopyCode}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#5cc896';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.teal;
                  }}
                >
                  {copied ? '✓ Copied!' : 'Copy Code'}
                </button>
              </>
            )}

            <div style={instructionsStyle}>
              <strong style={strongStyle}>Setup Instructions:</strong>
              <ol style={{ marginTop: '12px', paddingLeft: '20px' }}>
                <li style={stepStyle}>
                  Select your preferred ad format above
                </li>
                <li style={stepStyle}>
                  Click <strong style={strongStyle}>"Show Code"</strong>
                </li>
                <li style={stepStyle}>
                  Click <strong style={strongStyle}>"Copy Code"</strong>
                </li>
                <li style={stepStyle}>
                  Paste into your website HTML
                </li>
              </ol>
            </div>

            <div style={{ ...instructionsStyle, marginTop: '16px' }}>
              <strong style={strongStyle}>Features:</strong>
              <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
                <li style={stepStyle}>Top 5 products by price</li>
                <li style={stepStyle}>7-day price trend charts</li>
                <li style={stepStyle}>Direct links to Waxstat</li>
                <li style={stepStyle}>Multiple size options</li>
                <li style={stepStyle}>Mobile responsive</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Version Footer */}
        <div style={{ ...versionStyle, marginTop: '48px', paddingTop: '32px', textAlign: 'right', borderTop: 'none' }}>
          Version {VERSION}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
