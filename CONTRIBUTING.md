# Contributing to Waxstat Web Widget

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. **Clone the repository** (or get access to the project)

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the project root with:
   ```
   REACT_APP_API_BASE_URL=https://api.waxstat.com
   REACT_APP_API_KEY=YOUR_API_KEY_HERE
   REACT_APP_WAXSTAT_URL=https://waxstat.com
   ```
   
   **Note**: Get the API key from Allan (allan@waxstat.com) - it should never be committed to the repository.

4. **Start the development server**:
   ```bash
   npm start
   ```
   
   The app will open at `http://localhost:3000`

## Project Structure

- **src/components** - Reusable React components
  - `ReleasesWidget.js` - Main widget container
  - `ReleaseCard.js` - Individual product card
  - `PriceChart.js` - 7-day price chart component

- **src/services** - API and external service integrations
  - `waxstatApi.js` - Waxstat API wrapper

- **src/pages** - Full page components
  - `AdminDashboard.js` - Admin preview and embed code interface

- **src/styles** - Global styles and brand constants
  - `brandColors.js` - Color palette and typography constants

## Making Changes

### Before Starting

1. Make sure you're on the latest `main` branch
2. Create a feature branch: `git checkout -b feature/your-feature-name`

### During Development

- Keep components focused and single-responsibility
- Use the brand colors from `src/styles/brandColors.js`
- Test on both desktop and mobile viewports
- Follow existing code style and naming conventions

### Testing

Run tests with:
```bash
npm test
```

### Building for Production

Test the production build locally:
```bash
npm run build
npm install -g serve
serve -s build
```

## Brand Kit Guidelines

Always use the official Waxstat colors and typography:

- **Teal** (#71D8A7) - Primary accent color
- **Onyx** (#231F20) - Text and dark elements
- **Ash White** (#EFEFEF) - Light backgrounds
- **ROC Grotesk** - Body text font
- **Apotek Extended Bold** - Headline font

See [WAXSTAT BRAND KIT](../Dropbox/waxstat/brand-kit/_official-waxstat-brand-kit/) for complete guidelines.

## Committing Changes

Write clear, descriptive commit messages:
```
Add: 7-day price chart to release cards
Fix: Mobile responsive grid layout
Update: Brand colors to match kit v2
```

## Deploying

1. Build the project: `npm run build`
2. Deploy to Vercel, Netlify, or your hosting service
3. Update embed script URLs if hosting location changes
4. Test the embed code on 130point.com

## Questions or Issues?

Contact Allan at allan@waxstat.com for:
- API key issues
- Brand kit questions
- Deployment questions
- Feature requests
