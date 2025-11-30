# FutureTech Journal - Replit Setup

## Project Overview
FutureTech Journal is an ultra-modern, AI-powered news and blog website built with React, TypeScript, Vite, and Tailwind CSS. It features AI-powered content generation, summarization, translation, and more using Google's Gemini API.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS (via CDN for dev)
- **Routing**: React Router v6
- **AI Backend**: Google Gemini API (via Netlify Functions)
- **Styling**: Tailwind CSS with custom animations
- **Deployment**: Netlify (with serverless functions)

## Project Structure
```
├── components/          # React components (Header, Footer, Cards, etc.)
│   └── icons/          # Icon components
├── pages/              # Page components (HomePage, ArticlePage, etc.)
├── services/           # API services (geminiService, authService)
├── context/            # React Context (AuthContext)
├── hooks/              # Custom React hooks (useArticles, useTheme, etc.)
├── utils/              # Utility functions (slug generation, SEO)
├── netlify/functions/  # Serverless functions (AI Handler)
├── scripts/            # Build scripts (sitemap, robots.txt generation)
├── vite.config.ts      # Vite configuration
├── netlify.toml        # Netlify deployment config
└── index.html          # HTML entry point
```

## Setup Instructions

### 1. Dependencies Already Installed
- Node.js 20 is installed
- All npm packages are installed (React, Vite, TypeScript, etc.)

### 2. Environment Configuration
- **GEMINI_API_KEY**: Already configured in Replit Secrets
- This enables all AI features (chatbot, content generation, image generation, etc.)

### 3. Running the Development Server
```bash
npm run dev
```
This starts the Vite dev server on port 5000 with hot module replacement enabled.

**Important**: The dev server serves the frontend only. For AI features to work:
- **Option 1** (Recommended for dev): Run `npx netlify dev` to also start the serverless functions
- **Option 2** (For production): Deploy to Netlify to get both frontend + functions working

### 4. Building for Production
```bash
npm run build
```
Generates production builds with:
- Minified JavaScript/CSS
- Sitemap generation (SEO)
- Robots.txt generation

## Key Features
- **AI-Powered Content**: Summarization, translation, text-to-speech, image generation
- **Article Management**: Admin dashboard for creating and editing articles
- **Bookmarks**: Save favorite articles locally
- **Search**: Full-text article search with AI recommendations
- **Responsive Design**: Works on all devices
- **Dark Mode**: Built-in dark mode support
- **SEO Optimized**: Sitemap, robots.txt, meta tags
- **Pixabay Integration**: Real images for articles (both cards and detail pages)
- **Mailchimp Integration**: Newsletter subscription with email validation
- **Adsterra SmartLink Ads**: Affiliate banner ads with auto-rotation and responsive design

## Important Configuration Notes

### Vite Configuration (`vite.config.ts`)
- `allowedHosts: true` - Allows requests from Replit's proxy (required for preview to work)
- `host: 0.0.0.0` - Listens on all interfaces
- `port: 5000` - Fixed port for Replit compatibility
- HMR configured for Replit's HTTPS proxy setup

### Netlify Configuration (`netlify.toml`)
- **Build Command**: `npm cache clean --force && npm ci && npm run build`
- **Publish Directory**: `dist/`
- **Redirect Rules**: SPA routing configured (/* → /index.html)
- **Caching**: Optimized cache headers for performance

## Deployment

### To Netlify (Recommended)
1. Push code to GitHub
2. Connect GitHub repo to Netlify
3. Netlify will automatically:
   - Build the frontend
   - Deploy serverless functions
   - Set up HTTPS
   - Handle environment variables

### Using Replit Deploy
When ready, use Replit's publish feature to create a live URL.

## Image & Newsletter Features

### Pixabay Image Integration
- **Location**: `services/pixabayService.ts` and `netlify/functions/pixabayImage.ts`
- **Features**: 
  - Fetches real Pixabay images for each article
  - Works on article cards (category pages) and article detail pages
  - Smart caching to avoid repeated API calls
  - Auto-clears cache every 15 minutes for fresh content
  - Multiple search query variations for better results
- **Performance**: Images cached in-memory, fallback to original URL on error

### Mailchimp Newsletter Integration
- **Location**: `components/Footer.tsx` and `netlify/functions/mailchimpSubscribe.ts`
- **Features**:
  - Email validation
  - Subscribed emails added to Mailchimp list
  - Newsletter form in footer with success/error messages
  - API key managed via Replit Secrets

### Adsterra SmartLink Ad Integration
- **Location**: `components/ads/` directory
- **Components**:
  - `SmartAd` - Reusable rotating banner component with 10 auto-rotating banners
  - `ArticleInlineAd` - In-article ad placement (after 2nd paragraph)
  - `StickyAd` - Sticky sidebar ad for desktop (doesn't overlap footer)
  - `FeedAd` - Feed-style ad on homepage (after every 4 articles)
  - `AdsterraProvider` - Global SmartLink script loader with `applySmartLinkToAllOutgoingLinks()`
- **Features**:
  - 10 auto-rotating banners (5-6 second intervals)
  - Smooth fade/slide animations
  - Rounded corners with drop shadows
  - Hover zoom effects
  - Dark mode adaptation (shadows/glow match theme)
  - Mobile carousel with swipe support
  - Lazy-loaded images for performance
  - Image preloading for next/previous slides
  - No layout shift (content-visibility optimization)
  - No render blocking scripts (async/defer loading)
  - Fail-safe: Falls back to placeholder banners if script fails
  - SPA-compatible navigation (MutationObserver for dynamic content)
- **Configuration**:
  - Set `VITE_ADSTERRA_SMARTLINK_ID` environment variable with your Adsterra SmartLink ID
  - Custom banners can be passed via `bannerList` prop
- **Placements**:
  - **Placement A**: Inside article (after 2nd paragraph) - centered and responsive
  - **Placement B**: Desktop sidebar (sticky, doesn't overlap footer)
  - **Placement C**: Homepage feed (after every 4 articles)

## Troubleshooting

### "Blocked request" Error
If you see "Blocked request. This host is not allowed":
- This is normal for dev server
- The vite.config.ts is already configured with `allowedHosts: true`
- Just refresh the page in preview

### AI Features Not Working in Dev
- Frontend works on `npm run dev`
- AI functions require either:
  - Running `npx netlify dev` (handles both frontend + functions)
  - Or deploying to Netlify for production

### Images Not Loading
- Pixabay images load on article cards and article detail pages
- Cache automatically clears every 15 minutes
- Falls back to original image URL if Pixabay API fails
- Check backend logs for Pixabay API errors

### Hot Module Replacement (HMR) Issues
- HMR is configured for Replit's HTTPS proxy
- Should work automatically with the current vite.config.ts

## Available Scripts

```bash
# Development server (frontend only)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Generate SEO files (sitemap, robots.txt)
npm run seo:generate
```

## Authentication
- Admin dashboard is protected with simple authentication
- Login page at `/admin/login`
- Protected routes in ProtectedRoute component

## Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- CSS Grid and Flexbox support

## Performance Optimizations
- Code splitting with lazy loading (lazy pages)
- Optimized images and assets
- Tailwind CSS purging (in production)
- SEO-optimized caching headers

## Security Notes
- GEMINI_API_KEY is stored securely in Replit Secrets
- Never commit .env files to version control
- Serverless functions handle API key securely (backend only)

## Next Steps
1. Start the dev server: `npm run dev`
2. View the website in Replit's preview
3. Explore pages like `/`, `/about`, `/ai-tools`
4. For full AI features, deploy to Netlify or run `npx netlify dev`
