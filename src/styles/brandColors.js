export const colors = {
  teal: '#71D8A7',
  onyx: '#231F20',
  ashWhite: '#EFEFEF',
  white: '#FFFFFF',
  darkGray: '#3a3a3a',
  lightGray: '#f5f5f5',
};

export const typography = {
  headline: 'Apotek Extended, Arial, sans-serif',
  body: 'ROC Grotesk, Arial, sans-serif',
  fallback: 'system-ui, -apple-system, sans-serif',
};

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${typography.body};
    color: ${colors.onyx};
    background-color: ${colors.white};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${typography.headline};
    color: ${colors.onyx};
  }
`;
