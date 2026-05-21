# Quick Start Guide - Waxstat Web Widget

## 1️⃣ Local Development

```bash
# Navigate to project
cd /Users/allanscu/Projects/work/waxstat-web-widget

# Start development server
npm start
```

Visit `http://localhost:3000` to see the admin dashboard.

## 2️⃣ What You'll See

The admin dashboard shows:
- **Live Preview**: Interactive widget showing this week's top 5 releases
- **Embed Code**: Copy-paste HTML code for 130point.com owner
- **Feature List**: What the widget displays

## 3️⃣ For 130point.com Owner

Share this embed code:

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

They paste it anywhere on their website → widget automatically loads.

## 4️⃣ Build for Production

```bash
npm run build
```

Creates optimized production build in `build/` folder.

## 5️⃣ Deploy (Recommended: Vercel)

```bash
npm install -g vercel
vercel
```

Then update the embed code URL from `vercel.app` domain.

## 📋 Project Features

✓ Top 5 weekly releases  
✓ Product name, image, average price  
✓ 7-day price trend chart  
✓ Direct links to waxstat.com  
✓ Waxstat brand colors (Teal/Onyx/Ash White)  
✓ Mobile responsive  
✓ Admin dashboard with live preview  

## 📚 Full Documentation

- **README.md** - Complete user guide
- **DEPLOYMENT.md** - Production deployment steps
- **CONTRIBUTING.md** - For developers
- **PROJECT_SUMMARY.md** - Detailed overview

## ⚙️ Environment Setup

The `.env.local` file is already configured with:
- API Base URL: https://api.waxstat.com
- API Key: AKrhBf8aIFNtlwoC
- Waxstat URL: https://waxstat.com

(Never commit this file - it contains sensitive API keys)

## 🚀 Next Steps

1. **Test locally**: `npm start`
2. **Check production build**: `npm run build`
3. **Deploy to Vercel**: Follow DEPLOYMENT.md
4. **Share embed code** with 130point.com owner
5. **Monitor** widget performance once live

## ❓ Troubleshooting

**Widget not loading?**
- Check browser console for errors
- Verify API key in .env.local
- Confirm API is accessible

**Build failing?**
```bash
rm -rf node_modules
npm install
npm run build
```

## 📞 Support

Questions? Contact: allan@waxstat.com

---

**Status**: ✅ Ready for development and deployment
