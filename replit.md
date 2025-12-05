# FutureTech Journal - Replit Setup

## Overview
FutureTech Journal is an ultra-modern, AI-powered news and blog website built with React, TypeScript, Vite, and Tailwind CSS. It leverages Google's Gemini API for advanced AI capabilities like content generation, summarization, and translation. The project aims to provide a rich, responsive, and SEO-optimized platform for dynamic content delivery, featuring an advanced article expansion system, robust ad management, and seamless user experience with modern UI/UX designs.

## User Preferences
- I prefer simple language and clear explanations.
- I want iterative development with frequent, small updates.
- Ask before making major architectural changes or introducing new libraries.
- I prefer detailed explanations for complex features or decisions.
- Do not make changes to the `netlify/functions` directory without explicit instruction.
- Do not modify the `vite.config.ts` or `netlify.toml` files unless absolutely necessary for core functionality or explicitly requested.

## System Architecture
The project is built with React 18, TypeScript, and Vite for a fast and type-safe frontend. Tailwind CSS 4.x with PostCSS is used for highly optimized and responsive styling, featuring Glassmorphism design, advanced animations (fadeIn, shimmer, pulse-glow), scroll reveal, and image blur-up loading. React Router v6 handles client-side routing.

AI capabilities are powered by the Google Gemini API, accessed securely via the backend Express server. Content is SEO-optimized with an automated article expansion system generating 800-1500+ word articles with hierarchical headings, meta tags, LSI keywords, and JSON-LD schema.

### Backend Architecture
The Express server (`server/index.cjs`) runs on port 3001 and provides:
- AI Handler API (Gemini integration)
- Pixabay Image API
- Mailchimp Newsletter API
- MongoDB-backed REST APIs for articles, categories, ads, and authentication
- Expanded articles storage (MongoDB with file-based fallback)

### Database Integration (MongoDB Atlas)
The project supports MongoDB Atlas as an optional database backend with automatic fallback to localStorage/file-based storage when not configured.

**Database Models** (`src/models/`):
- `Article.cjs` - Articles with SEO metadata, expanded content, and view tracking
- `Category.cjs` - Categories with article counts and metadata
- `Ad.cjs` - Ads with placement, status, and analytics tracking
- `User.cjs` - Users with authentication and role-based access

**API Endpoints**:
- `GET/POST/PUT/DELETE /api/articles` - Article CRUD operations
- `GET /api/articles/:slug` - Get single article with view tracking
- `GET/POST /api/categories` - Category operations
- `GET /api/categories/:slug` - Get category with articles
- `GET/POST/PUT/DELETE /api/ads` - Ad management
- `GET /api/ads/placement/:placement` - Get active ads for placement
- `POST /api/auth/login` - User authentication
- `GET /api/auth/verify` - Token verification
- `GET /api/db/status` - Database connection status

### Frontend State Management
- `context/AdsContext.tsx` - Ad management with MongoDB API + localStorage fallback
- `hooks/useArticles.tsx` - Article fetching from MongoDB → RSS feeds → mock data
- Automatic sync between MongoDB and localStorage for offline support

The system includes:
- **UI/UX**: Glassmorphism design, advanced animations (fadeIn, fadeInUp, scaleIn, shimmer, pulse-glow, float, gradient-shift), scroll reveal, enhanced header with shrinking and animated gradient, animated hero section, interactive article cards, skeleton loading, image blur-up, toast notifications, and micro-interactions.
- **Key Features**: AI-powered content (summarization, translation, text-to-speech, image generation), SEO Article Expansion System, article management, bookmarks, full-text search with AI recommendations, responsive design, dark mode, and comprehensive SEO optimization (sitemap, robots.txt, meta tags, JSON-LD).
- **Technical Implementations**: Custom React hooks, React Context for state management (e.g., AuthContext, AdsContext), utility functions, and serverless functions for backend logic. Performance is optimized through code splitting, lazy loading, optimized assets, Tailwind CSS tree-shaking, and lazy-loaded ad iframes. An `ErrorBoundary` component ensures robust error handling, and `useLayoutEffect` addresses hydration mismatches for theme consistency.
- **Dynamic Ads Manager**: An admin dashboard (at `/admin/ads`) allows managing unlimited SmartLinks from A-ADS with placement-based rotation, supporting various ad placements across the site (homepage, article pages, category pages, mobile sticky). Ads rotate every 10 seconds and pause on hover for improved UX.
- **SEO System**: Centralized configuration (`utils/seoConfig.ts`), SEO engine (`utils/seoEngine.ts`) for title generation, meta descriptions, keyword extraction, and schema building, SEO helpers (`utils/seoHelpers.ts`) for JSON-LD schema, and a universal `SEO` component (`components/SEO.tsx`) for meta tags, Open Graph, Twitter Cards, and JSON-LD. Sitemap.xml and robots.txt are auto-generated during the build process.

## Environment Variables

### Required for Full Functionality
```
GOOGLE_AI_API_KEY     - Google Gemini API key for AI features
PIXABAY_API_KEY       - Pixabay API key for article images
```

### Optional (Database)
```
MONGODB_URI           - MongoDB Atlas connection string
                        Format: mongodb+srv://user:password@cluster.mongodb.net/dbname
JWT_SECRET            - Secret for JWT token signing (defaults to fallback if not set)
```

### Optional (Other Services)
```
MAILCHIMP_API_KEY     - Mailchimp API key for newsletter
MAILCHIMP_LIST_ID     - Mailchimp audience list ID
```

### MongoDB Atlas Setup
1. Create a free cluster at https://cloud.mongodb.com
2. Create a database user with read/write permissions
3. Whitelist IP addresses (0.0.0.0/0 for development)
4. Get connection string and add to MONGODB_URI
5. The database will auto-create collections on first use

### Fallback Behavior
- Without MONGODB_URI: Uses localStorage for ads, RSS feeds for articles, file storage for expanded articles
- All existing functionality works without MongoDB
- MongoDB adds persistence, analytics, and admin features

## External Dependencies
- **AI API**: Google Gemini API (via Express backend)
- **Advertising**: A-ADS (Anonymous Ads)
- **Image Service**: Pixabay API (via Express backend)
- **Newsletter**: Mailchimp API (via Express backend)
- **Database**: MongoDB Atlas (optional, with automatic fallback)
- **Deployment**: Hostinger/Netlify compatible (static build with API proxy)

## Recent Changes
- **December 2025**: Added Article Auto-Cleanup System (48-hour expiry, 24-hour scheduler)
- **December 2025**: Added MongoDB Atlas integration with Mongoose models
- **December 2025**: Updated AdsContext and useArticles hooks for MongoDB support
- **December 2025**: Added authentication API with JWT tokens
- **December 2025**: Created comprehensive REST API for articles, categories, ads

## Article Auto-Cleanup System

### Overview
The system automatically deletes articles older than 48 hours to keep the database lightweight and prevent free-tier overflow issues.

### How It Works
- **Expiry Time**: 48 hours (48 * 60 * 60 * 1000 ms)
- **Scheduler**: Runs every 24 hours automatically
- **Delete Query**: `deleteMany({ createdAt: { $lt: new Date(Date.now() - 48*60*60*1000) } })`
- **Protected Collections**: Only Articles are deleted. Categories, Ads, Users, AI config, SEO metadata, sitemap cache, and logs are NOT touched.

### API Endpoints
- `GET /api/cron/cleanup` - Public endpoint for external schedulers (Hostinger, Netlify)
- `POST /api/cron/cleanup` - Admin-only endpoint with detailed response

### Hostinger Cron Job Setup
1. Go to Hostinger hPanel > Cron Jobs
2. Add new cron job:
   - Command: `curl -s https://yourdomain.com/api/cron/cleanup`
   - Schedule: Every 24 hours (0 0 * * *)

### Netlify Scheduled Function Setup
Create `netlify/functions/cleanup-scheduler.js`:
```javascript
const { schedule } = require('@netlify/functions');

module.exports.handler = schedule('0 0 * * *', async () => {
  await fetch('https://yourdomain.com/api/cron/cleanup');
  return { statusCode: 200 };
});
```

## Project Structure
```
/
├── server/
│   └── index.cjs           # Express backend with all APIs
├── src/
│   ├── lib/
│   │   └── db.cjs          # MongoDB connection utility
│   └── models/
│       ├── Article.cjs     # Article schema
│       ├── Category.cjs    # Category schema
│       ├── Ad.cjs          # Ad schema
│       ├── User.cjs        # User schema
│       └── index.cjs       # Model exports
├── context/
│   └── AdsContext.tsx      # Ad state management
├── hooks/
│   └── useArticles.tsx     # Article fetching hook
├── services/
│   └── articleExpansionService.ts  # AI article expansion
├── types.ts                # TypeScript type definitions
└── package.json
```
