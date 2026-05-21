import React, { useEffect } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import { colors } from './styles/brandColors';

function App() {
  useEffect(() => {
    // Apply global styles
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html, body, #root {
        width: 100%;
        height: 100%;
      }

      body {
        font-family: 'ROC Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: ${colors.onyx};
        background-color: ${colors.white};
      }

      h1, h2, h3, h4, h5, h6 {
        font-family: 'Apotek Extended', 'Inter', sans-serif;
        color: ${colors.onyx};
      }

      a {
        color: ${colors.teal};
        text-decoration: none;
      }

      button {
        font-family: inherit;
      }
    `;
    document.head.appendChild(style);
  }, []);

  return <AdminDashboard />;
}

export default App;
