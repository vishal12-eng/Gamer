# FutureTechJournal - Design System Implementation Guide

## Project Overview
FutureTechJournal is a premium, AI-powered tech news platform with:
- RSS feed ingestion for multi-source news
- AI-powered content expansion using Google Gemini
- Admin dashboard for article management
- Ad management system
- Cookie consent & newsletter signup
- Dark/Light mode theme system

## Phase 1: Foundation ✅ COMPLETE
**Status:** Complete
- ✅ Dark/Light mode infrastructure (ThemeProvider, ThemeToggle, useTheme hook)
- ✅ Theme toggle in Header (instant switching, no page reload)
- ✅ Tailwind dark mode configured with CSS classes
- ✅ Color system defined:
  - **Light Mode:** Soft white (#f8f9fa), text #1a1a1a, accent blue
  - **Dark Mode:** Deep navy (#0f0f0f), text #f5f5f5, accent cyan
- ✅ Typography: Inter sans-serif with heading hierarchy
- ✅ Animations and transitions configured in Tailwind

**Key Files:**
- `/hooks/useTheme.tsx` - Theme context and provider
- `/components/ThemeToggle.tsx` - Theme toggle button
- `/components/Header.tsx` - Contains theme toggle
- `/tailwind.config.js` - Extended with color system

---

## Phase 2: Header & Navigation Redesign 🔄 PENDING
**Scope:**
- [ ] Sticky navbar with glass-morphism effect
- [ ] Logo + Brand on left
- [ ] Navigation categories (centered): Home, Technology, AI, Business, Global, Product, Entertainment, Science, India, US
- [ ] Right side: Search + Theme toggle + Login button
- [ ] Mobile menu: Slide-down animation, thumb-friendly
- [ ] Hover effects: Underline animation on nav items
- [ ] Active link highlighting with category colors
- [ ] Search dropdown with article suggestions

**Components to Update:**
- `Header.tsx` - Full redesign with new layout
- `ThemeToggle.tsx` - Polish styling to match design system

---

## Phase 3: Homepage Redesign 🔄 PENDING
**Sections:**
1. **Hero Section** - One large featured article card
   - Large image with gradient overlay
   - Category badge
   - Bold headline
   - Metadata (author, date, read time)

2. **Trending Ticker** - Horizontal scroll animation
   - Minimal cards, headline-only
   - FOMO-inducing animation

3. **Editor's Choice** - 2x2 Grid
   - Premium styled cards
   - Hover scale effect
   - "Trending" badges

4. **Popular This Week** - Vertical compact list
   - Read count + time indicator
   - Social proof styling

5. **Latest Feed** - Grid of article cards
   - Equal spacing
   - Pagination (controlled UX, no infinite scroll)
   - Clean card design with hover effects

**Components to Create/Update:**
- `pages/HomePage.tsx` - Full redesign
- `components/HeroCard.tsx` - Featured article component
- `components/ArticleCard.tsx` - Enhanced card with hover effects
- `components/TrendingTicker.tsx` - Horizontal scrolling ticker

---

## Phase 4: Article Page Redesign 🔄 PENDING
**Features:**
- [ ] Large readable title with proper hierarchy
- [ ] Meta info: Date, Category, Author, Read time
- [ ] Hero image with gradient
- [ ] Clean article body with proper spacing
- [ ] AI Article Expansion with typing animation (ChatGPT-style)
- [ ] Article Toolkit sidebar:
  - Summarize button
  - Readability score display
  - Text-to-speech button
- [ ] Related Articles at bottom (same category)
- [ ] Share buttons
- [ ] Bookmark functionality

**Components:**
- `pages/ArticlePage.tsx` - Full redesign
- `components/ArticleBody.tsx` - Article content renderer
- `components/RelatedArticles.tsx` - Related articles section
- `components/ArticleToolkit.tsx` - Sidebar tools

---

## Phase 5: Category Pages Redesign 🔄 PENDING
**Features:**
- [ ] Category title with icon
- [ ] Breadcrumb navigation
- [ ] Active category highlighted in header
- [ ] Grid layout of articles
- [ ] Pagination (not infinite scroll)
- [ ] Filter/sort options

**Components:**
- `pages/CategoryPage.tsx` - Redesign with category styling

---

## Phase 6: Ads System Styling 🔄 PENDING
**Philosophy:** Premium ads, not spam-looking
- [ ] Placement: Home (after hero, mid-sections), Articles (after para 3, 6, bottom)
- [ ] Mobile: Sticky bottom (closeable), non-intrusive
- [ ] Animations: Fade-in, hover lift, smooth rotation
- [ ] Ad-unit styling with subtle gradients
- [ ] Ads look like premium banners
- [ ] No popups, no redirects, no spam appearance

**Components:**
- `components/AdUnit.tsx` - Premium styled ad component
- Update ad placement in homepage and article pages

---

## Phase 7: Card Component Library 🔄 PENDING
**Standardized Cards:**
- [ ] ArticleCard - Base card with image, title, summary, meta
- [ ] MinimalCard - Headline-only for ticker
- [ ] HeroCard - Large featured article card
- [ ] TrendingCard - Compact trending badge style
- [ ] AdCard - Premium banner styling

**Design Details:**
- Hover: Scale 1.05 with shadow elevation
- All cards: Smooth transition (300ms)
- Borders: Subtle gradient borders in dark mode
- Images: Proper aspect ratios, lazy loading

---

## Phase 8: Mobile Responsiveness 🔄 PENDING
- [ ] Responsive navbar with hamburger menu
- [ ] Touch-friendly button sizing (min 44px)
- [ ] Mobile card layouts (single column)
- [ ] Sticky bottom navigation (optional)
- [ ] Optimized ads placement for mobile
- [ ] Test on iOS and Android

---

## Phase 9: Micro-interactions & Animations 🔄 PENDING
**Global Effects:**
- [ ] Card hover: Scale + shadow
- [ ] Button ripple effect
- [ ] Skeleton loaders (smooth shimmer)
- [ ] Page transitions (fade + slide)
- [ ] Smooth scroll behavior
- [ ] Theme toggle animation (rotate icon)

**Tailwind Animations Already Available:**
- fadeIn, fadeInUp, fadeInDown, fadeInLeft, fadeInRight
- scaleIn, slideUp, shimmer
- pulse-glow, float, ripple
- gradient-shift, border-glow

---

## Phase 10: Admin Dashboard Polish 🔄 PENDING
- [ ] Clean form layouts
- [ ] Toggle controls for settings
- [ ] Success/error message styling
- [ ] Loading states
- [ ] Confirmation dialogs

---

## Phase 11: Newsletter & Consent UI 🔄 PENDING
- [ ] Cookie consent banner (minimize spam look)
- [ ] Newsletter signup form (minimal, clean)
- [ ] Email summary styling (AI-written content)

---

## Phase 12: SEO & Performance UX 🔄 PENDING
- [ ] Meta tags for social sharing
- [ ] Structured data (Schema.org)
- [ ] Open Graph images
- [ ] Core Web Vitals optimization
- [ ] Image optimization with next-gen formats

---

## Current Architecture

**Backend (Node.js + Express):**
- Server: `server/index.cjs` (port 3001)
- Production server: `server/production.cjs`
- RSS Ingestion: `server/rssIngestionService.cjs`
- API endpoints:
  - `/api/aiHandler` - AI content generation
  - `/api/articles` - Article management
  - `/api/ads` - Ad management
  - `/api/newsletter` - Newsletter signup

**Frontend (React + Vite):**
- Main app: `App.tsx`
- Entry: `index.tsx`
- Pages: `pages/` directory
- Components: `components/` directory
- Hooks: `hooks/` directory (useTheme, useArticles, useAuth, etc)
- Context: `context/` directory (AuthContext, AdsContext)

**Styling:**
- Tailwind CSS for utility classes
- Dark mode with `darkMode: 'class'` in Tailwind config
- Custom animations and shadows already configured
- CSS files for global styles

---

## Deployment Settings

**Render Configuration:**
- Build: `npm install && npm run build`
- Start: `node server/production.cjs`
- Environment: Production
- Use CommonJS for Node files (`.cjs` extension)
- Set required env vars:
  - `GOOGLE_AI_API_KEY` - Google Gemini API key
  - `PIXABAY_API_KEY` - (optional) For image search
  - `MONGODB_URI` - (optional) MongoDB connection
  - `JWT_SECRET` - Secret for auth tokens

---

## Next Steps (When Switching to Autonomous Mode)

If you want faster implementation of all remaining phases, switch to Autonomous mode. This will allow:
- Full architecture review and optimization
- Comprehensive component redesign across entire site
- Automated testing of all design changes
- Mobile responsiveness testing
- Performance optimization
- Complete design system validation

**To proceed with next phase in Fast mode:**
1. Choose one phase (e.g., Phase 2: Header & Navigation)
2. Provide Phase 2 specific requirements if needed
3. Implementation will be done within turn limit

---

## Notes for Developers
- All color variables should respect dark/light mode via CSS classes
- Animations should be hardware-accelerated (use transform, opacity)
- Mobile-first approach for responsive design
- Performance: Prioritize Core Web Vitals
- Accessibility: ARIA labels, keyboard navigation
- No breaking changes to existing features

