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

AI capabilities are powered by the Google Gemini API, accessed securely via Netlify Serverless Functions. Content is SEO-optimized with an automated article expansion system generating 800-1500+ word articles with hierarchical headings, meta tags, LSI keywords, and JSON-LD schema.

The system includes:
- **UI/UX**: Glassmorphism design, advanced animations (fadeIn, fadeInUp, scaleIn, shimmer, pulse-glow, float, gradient-shift), scroll reveal, enhanced header with shrinking and animated gradient, animated hero section, interactive article cards, skeleton loading, image blur-up, toast notifications, and micro-interactions.
- **Key Features**: AI-powered content (summarization, translation, text-to-speech, image generation), SEO Article Expansion System, article management, bookmarks, full-text search with AI recommendations, responsive design, dark mode, and comprehensive SEO optimization (sitemap, robots.txt, meta tags, JSON-LD).
- **Technical Implementations**: Custom React hooks, React Context for state management (e.g., AuthContext, AdsContext), utility functions, and serverless functions for backend logic. Performance is optimized through code splitting, lazy loading, optimized assets, Tailwind CSS tree-shaking, and lazy-loaded ad iframes. An `ErrorBoundary` component ensures robust error handling, and `useLayoutEffect` addresses hydration mismatches for theme consistency.
- **Dynamic Ads Manager**: An admin dashboard (at `/admin/ads`) allows managing unlimited SmartLinks from A-ADS with placement-based rotation, supporting various ad placements across the site (homepage, article pages, category pages, mobile sticky). Ads rotate every 10 seconds and pause on hover for improved UX.
- **SEO System**: Centralized configuration (`utils/seoConfig.ts`), SEO engine (`utils/seoEngine.ts`) for title generation, meta descriptions, keyword extraction, and schema building, SEO helpers (`utils/seoHelpers.ts`) for JSON-LD schema, and a universal `SEO` component (`components/SEO.tsx`) for meta tags, Open Graph, Twitter Cards, and JSON-LD. Sitemap.xml and robots.txt are auto-generated during the build process.

## External Dependencies
- **AI API**: Google Gemini API (via Netlify Functions)
- **Advertising**: A-ADS (Anonymous Ads)
- **Image Service**: Pixabay API (via Netlify Functions)
- **Newsletter**: Mailchimp API (via Netlify Functions)
- **Deployment**: Netlify (for hosting and serverless functions)
- **Database (Optional)**: PostgreSQL with Drizzle ORM (not actively integrated in provided setup)