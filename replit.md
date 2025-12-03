# FutureTech Journal - Replit Setup

## Project Overview
FutureTech Journal is an ultra-modern, AI-powered news and blog website built with React, TypeScript, Vite, and Tailwind CSS. It features AI-powered content generation, summarization, translation, and more using Google's Gemini API.

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS 4.x with PostCSS build (production-optimized)
- **Routing**: React Router v6
- **AI Backend**: Google Gemini API (via Netlify Functions)
- **Styling**: Tailwind CSS with custom animations
- **Deployment**: Netlify (with serverless functions)
- **Ads**: A-ADS (Anonymous Ads) - Clean, Google-safe advertising
- **Database**: PostgreSQL with Drizzle ORM (optional, requires provisioning)

## Project Structure
```
├── components/          # React components (Header, Footer, Cards, etc.)
│   ├── ads/            # A-ADS ad components
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
- **VITE_AADS_AD_UNIT_ID**: Your A-ADS ad unit ID for displaying ads
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
- **SEO Article Expansion System**: Auto-expands articles with complete SEO optimization:
  - Minimum 800-1500+ words with hierarchical H1-H4 headings
  - Meta title (55 chars), meta description (155 chars), focus keyword
  - LSI keywords, internal/external links, image alt texts
  - FAQ section with 3-5 questions at end of article
  - Server-side validation ensures quality (word count, SEO fields, heading structure)
  - Client-side compatibility handling regenerates outdated cached entries
- **Article Management**: Admin dashboard for creating and editing articles
- **Bookmarks**: Save favorite articles locally
- **Search**: Full-text article search with AI recommendations
- **Responsive Design**: Works on all devices
- **Dark Mode**: Built-in dark mode support
- **SEO Optimized**: Sitemap, robots.txt, meta tags
- **Pixabay Integration**: Real images for articles (both cards and detail pages)
- **Mailchimp Integration**: Newsletter subscription with email validation
- **A-ADS Integration**: Clean, Google-safe banner ads with responsive design

## UI/UX Enhancements (December 2025)
- **Glassmorphism Design**: Modern glass-like effects with backdrop-blur throughout the UI
- **Advanced Animations**: fadeIn, fadeInUp, scaleIn, shimmer, pulse-glow, float, and gradient-shift keyframes
- **Scroll Reveal**: Staggered entrance animations for content sections using IntersectionObserver
- **Enhanced Header**: Shrinks on scroll with animated gradient border and glassmorphism
- **Hero Section**: Animated category badge, floating decorative elements, scroll indicator
- **Article Cards**: Hover effects (lift, glow, scale) with preserved text colors
- **Skeleton Loading**: Shimmer effect loading states for better perceived performance
- **Image Blur-Up**: Smooth image loading with blur-to-sharp transition
- **Toast Notifications**: Progress bar with requestAnimationFrame for smooth animation
- **Micro-Interactions**: Polished buttons, badges, and interactive elements

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

### A-ADS (Anonymous Ads) Integration
- **Location**: `components/ads/` directory
- **Ad Unit ID**: 2419015 (configured via `VITE_AADS_AD_UNIT_ID`)
- **Mode**: No-verification mode using direct iframe embedding
- **Components**:
  - `AAdsProvider` - Global ad context provider
  - `AAdsTopBanner` - Top banner (728x90 desktop / 320x50 mobile) for homepage and article pages
  - `StickyAAdsBanner` - Sticky bottom banner with close button and 24h localStorage persistence
  - `AAdsInArticle` - In-article ad (300x250) placement after 2nd paragraph
  - `AAdsSidebar` - Sidebar ad (160x600) for desktop only (screen >= 1024px)
  - `AAdsBanner` - Generic responsive banner component
  - `AAdsFeed` - Feed-style ad for homepage article grid
  - `AAdsBottom` - Bottom banner component
- **Features**:
  - 100% Google-safe - no adult content, popups, or redirects
  - No approval/verification required - loads instantly
  - Fully responsive design (auto-detects mobile/desktop)
  - Dark/Light theme compatibility
  - CLS-free (no layout shift) with skeleton loaders
  - Lazy-loaded iframes for performance
  - Close button on sticky banner with localStorage state
  - No render-blocking scripts
  - Works on Netlify, Vercel, Cloudflare, Replit
- **Placements**:
  - **Top Banner**: Homepage and article pages (728x90 / 320x50)
  - **Sticky Bottom**: All pages globally with close button (728x90 / 320x50)
  - **In-Article**: After 2nd paragraph in article content (300x250)
  - **Sidebar**: Desktop article pages only (160x600)
- **Configuration**:
  - `VITE_AADS_AD_UNIT_ID=2419015` - Set in environment variables

### Post-Monetization Optimization
- **Location**: `lib/ads/`, `hooks/useAdObserver.ts`, `components/ConsentBanner.tsx`
- **Analytics Dashboard**: `/admin/ads` - View impressions, clicks, CTR, revenue
- **Features**:
  - Viewability tracking (50% visible for 1+ second)
  - Safe ad refresh (max once per 30s)
  - GDPR/CCPA consent banner with preferences
  - A/B testing for placements, sizes, sticky behavior
  - Fallback content for slow/failed ads
  - Event batching (10 events or 30s)
  - Admin kill switch and debug mode
- **Smoke Test**: `node scripts/check-ads.js`
- **Full Documentation**: See `docs/ADS_OPTIMIZATION.md`

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

### Ads Not Showing
- Make sure `VITE_AADS_AD_UNIT_ID` is set in environment variables
- Get your ad unit ID from a-ads.com
- Ads are lazy-loaded, so scroll to see them appear

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
- Tailwind CSS 4.x with PostCSS build (migrated from CDN for production)
- SEO-optimized caching headers
- Lazy-loaded ad iframes
- Image lazy loading with `loading="lazy"` attribute
- Preload hints for critical fonts and resources
- Vite chunking configuration for vendor libraries
- React.lazy() for all page components

## Recent Updates (December 2025)
### Replit Environment Migration
- Migrated from Netlify dev to Replit environment
- Server renamed to CommonJS (.cjs) for ES module compatibility
- `"type": "module"` added to package.json for frontend code
- Vite configured to serve frontend on port 5000
- Backend server runs on port 3001 with API proxying

### Tailwind CSS Migration
- Migrated from CDN to proper PostCSS build using Tailwind 4.x
- Added `@tailwindcss/postcss` for production optimization
- CSS now properly bundled and tree-shaken

### Error Handling & Accessibility
- Added ErrorBoundary component wrapping main content
- Enhanced focus-visible states for accessibility
- Added reduced motion media query support
- Comprehensive loading skeletons for all pages

### Complete Automated SEO System (December 2025)
- **Centralized SEO Configuration** (`utils/seoConfig.ts`): Site-wide settings, canonical URL builders, page-type SEO data
- **SEO Engine** (`utils/seoEngine.ts`): Title generators, meta description sanitizers, keyword extraction, schema builders
- **SEO Helpers** (`utils/seoHelpers.ts`): Complete JSON-LD schema generators for all page types
- **SEO Component** (`components/SEO.tsx`): Universal React Helmet component for all meta tags, Open Graph, Twitter Cards, JSON-LD
- **Automated Build Pipeline**: `npm run build` generates sitemap.xml and robots.txt in dist folder
- **All Pages Covered**: HomePage, ArticlePage, CategoryPage, AboutPage, ContactPage, SearchPage, ForYouPage, BookmarksPage, AuthorPage, SitemapPage, legal pages
- **JSON-LD Structured Data**: NewsArticle, Organization, WebSite, BreadcrumbList, CollectionPage, ProfilePage, AboutPage, ContactPage
- **Production-Ready**: Works on Netlify/static hosting without manual per-page editing

### SEO Meta Tags in index.html
- Enhanced meta tags (theme-color, apple-mobile-web-app, color-scheme)
- Proper viewport with maximum-scale for accessibility
- Author and format-detection meta tags
- Robots meta with max-image-preview and max-snippet

### API Keys Required (User to Add)
- `PIXABAY_API_KEY` - For article images
- `MAILCHIMP_API_KEY` - For newsletter subscriptions
- `GOOGLE_AI_API_KEY` - For AI features (chatbot, content generation)

## Security Notes
- GEMINI_API_KEY is stored securely in Replit Secrets
- Never commit .env files to version control
- Serverless functions handle API key securely (backend only)
- A-ADS ad unit IDs are safe to expose (public identifiers)

## Next Steps
1. Start the dev server: `npm run dev`
2. View the website in Replit's preview
3. Explore pages like `/`, `/about`, `/ai-tools`
4. For full AI features, deploy to Netlify or run `npx netlify dev`
5. Get your A-ADS ad unit ID from a-ads.com and set `VITE_AADS_AD_UNIT_ID`
