# Deployment Guide - Waxstat Web Widget

This guide walks through deploying the Waxstat Web Widget to production.

## Prerequisites

- Node.js and npm installed locally
- Git access to the repository
- Vercel account (or alternative hosting provider)
- Waxstat API credentials

## Deployment to Vercel

### Step 1: Build the Project

```bash
npm run build
```

Verify the build completes successfully without errors.

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
npm install -g vercel
vercel
```

Follow the prompts to connect your GitHub account and deploy.

**Option B: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import the GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### Step 3: Configure Environment Variables

In your Vercel project settings, add:

```
REACT_APP_API_BASE_URL=https://api.waxstat.com
REACT_APP_API_KEY=YOUR_API_KEY
REACT_APP_WAXSTAT_URL=https://waxstat.com
```

**Important**: Never expose the API key in client-side code. If needed, create a server-side proxy.

### Step 4: Update Embed Code

Once deployed, update the embed script URL in:
- `README.md`
- `AdminDashboard.js` (if you have a hardcoded URL)
- Documentation sent to 130point.com

Old:
```javascript
script.src = 'https://waxstat-web-widget.vercel.app/widget.js';
```

New:
```javascript
script.src = 'https://YOUR_DOMAIN.vercel.app/widget.js';
```

## Deployment to Other Hosts

### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=build
```

### AWS S3 + CloudFront

```bash
npm run build
aws s3 sync build s3://your-bucket-name
```

### Self-Hosted (Node.js)

```bash
npm run build
npm install -g serve
serve -s build -l 3000
```

## Post-Deployment Testing

1. **Test Admin Dashboard**
   - Navigate to your deployed URL
   - Verify the widget preview loads
   - Test the embed code copy functionality

2. **Test Live Embed**
   - Create a test HTML file
   - Paste the embed code
   - Verify the widget renders correctly
   - Test that product links work

3. **Test on 130point.com** (when ready)
   - Share embed code with site owner
   - Verify widget loads correctly in their environment
   - Test responsive design on mobile devices

## Monitoring & Maintenance

### Check Deployment Status

```bash
vercel list deployments
```

### View Logs

```bash
vercel logs
```

### Rollback to Previous Version

```bash
vercel rollback
```

### Update Code

```bash
git push origin main
# Vercel auto-deploys on push (if configured)
```

## Performance Optimization

### Bundle Size

Current production bundle:
- JavaScript: ~183 KB (gzipped)
- CSS: 264 B

To monitor:
```bash
npm run build
npm install -g bundlesize
bundlesize
```

### Caching

Vercel automatically handles cache headers. For custom configuration, create a `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/widget.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Widget Not Loading

1. Check browser console for errors
2. Verify API key is valid
3. Check CORS headers from API
4. Verify the embed script URL is correct

### API Errors

1. Verify `REACT_APP_API_KEY` is set correctly
2. Check API response in browser Network tab
3. Confirm API base URL is accessible
4. Check API rate limits

### Build Failures

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Support

For deployment issues, contact: allan@waxstat.com
