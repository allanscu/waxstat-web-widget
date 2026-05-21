# Waxstat Web Widget

A React-based embeddable widget that displays the top 5 product releases for the current week, fetched from the Waxstat API. Perfect for embedding on partner websites like 130point.com.

## Features

- **Top 5 Releases**: Displays the top 5 products released this week, sorted by average price
- **Product Details**: Shows product name, average price, and 7-day price trend chart
- **Brand Kit Compliant**: Uses official Waxstat colors (Teal, Onyx, Ash White) and typography
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Direct Links**: Each product links back to the corresponding Waxstat product page
- **Admin Dashboard**: Preview the widget and get embed code

## Project Structure

```
src/
├── components/
│   ├── ReleasesWidget.js      # Main widget component
│   ├── ReleaseCard.js         # Individual product card
│   └── PriceChart.js          # 7-day price chart
├── pages/
│   └── AdminDashboard.js      # Admin preview & embed code
├── services/
│   └── waxstatApi.js          # API integration
├── styles/
│   └── brandColors.js         # Brand colors & typography
└── App.js                      # Main app component
```

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Add environment variables** in `.env.local`:
   ```
   REACT_APP_API_BASE_URL=https://api.waxstat.com
   REACT_APP_API_KEY=YOUR_API_KEY
   REACT_APP_WAXSTAT_URL=https://waxstat.com
   ```

3. **Start development server**:
   ```bash
   npm start
   ```

## Embedding on Third-Party Sites

### Simple Embed Code

Add this HTML snippet anywhere on your website:

```html
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://waxstat-web-widget.vercel.app/widget.js';
    script.async = true;
    document.head.appendChild(script);
  })();
</script>

<div id="waxstat-releases-widget"></div>
```

The widget will automatically:
- Load required dependencies
- Fetch the latest releases
- Render a responsive grid of products
- Link to Waxstat product pages

## Customization

### Widget Props (for internal use)

```jsx
<ReleasesWidget 
  title="Custom Title"
  limit={5}
/>
```

- `title` (string): Custom widget title
- `limit` (number): Number of releases to display

## API Integration

The widget uses the Waxstat API to fetch:

- **Endpoint**: `/v1/boxes/search/{term}`
- **Method**: GET
- **Authentication**: API-KEY header
- **Response**: Array of box objects with name, slug, price, image, and release_date

## Deployment

### Build for Production

```bash
npm run build
```

The widget is designed to be deployed to Vercel or any static hosting service.

### Deployment Steps

1. Deploy to Vercel, Netlify, or your hosting provider
2. Update the embed code URL to point to your hosted domain
3. Share the embed code with 130point.com owner
4. Owner pastes the code into their HTML

## Brand Kit Compliance

This widget adheres to the official Waxstat brand kit:

- **Primary Color**: Teal (#71D8A7)
- **Text Color**: Onyx (#231F20)
- **Background**: Ash White (#EFEFEF)
- **Typography**: ROC Grotesk (body), Apotek Extended (headlines)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - Waxstat

## Contact

For questions or support, contact: allan@waxstat.com
