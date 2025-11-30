# A-ADS Post-Monetization Optimization

This document describes the post-monetization optimization features implemented for A-ADS integration.

## Overview

The optimization includes:
- Viewability tracking and safe ad refresh
- GDPR/CCPA consent management
- Analytics and event tracking
- A/B testing harness
- Fallback content for slow/failed ads
- Admin dashboard for monitoring
- Smoke testing and rollback procedures

## Architecture

```
lib/ads/
├── viewability.ts    # Viewability tracking with IntersectionObserver
├── abtest.ts         # A/B testing with deterministic user assignment
├── analytics.ts      # Event batching and tracking
└── index.ts          # Re-exports

hooks/
└── useAdObserver.ts  # React hook for lazy loading and viewability

components/
├── ConsentBanner.tsx # GDPR/CCPA consent management
└── ads/
    ├── AdFallback.tsx    # Fallback content component
    ├── AAdsTopBanner.tsx # Updated with analytics
    └── StickyAAdsBanner.tsx # Updated with analytics
```

## Features

### 1. Viewability Tracking

Location: `lib/ads/viewability.ts`

- Tracks when 50%+ of ad is visible for 1+ second
- Safe refresh policy: max once per 30 seconds
- Respects user's "closed" state

```typescript
import { observeAd, refreshAd, canRefreshAd } from './lib/ads/viewability';

// Observe an ad element
const cleanup = observeAd(element, (isViewable, duration) => {
  console.log(`Ad viewable: ${isViewable}, duration: ${duration}ms`);
});

// Refresh if allowed
if (canRefreshAd(element)) {
  refreshAd(element);
}
```

### 2. Consent Management

Location: `components/ConsentBanner.tsx`

- Shows on first visit
- Three options: Accept All, Reject Non-Essential, Manage Preferences
- Stores preferences in localStorage
- Footer link to re-open preferences

Keys used:
- `ads_consent`: Consent state and preferences
- `ads_preferences`: User preferences

### 3. Analytics

Location: `lib/ads/analytics.ts`

Events tracked:
- `ad_impression`: When ad loads
- `ad_click`: When ad is clicked
- `ad_viewable`: When 50%+ visible for 1+ second
- `ad_close`: When user closes sticky banner
- `ad_refresh`: When ad is refreshed
- `ad_fallback`: When fallback content is shown
- `consent_change`: When user changes consent

Events are batched (10 events or 30 seconds) and sent to `/api/ads/event`.

### 4. A/B Testing

Location: `lib/ads/abtest.ts`

Active experiments:
- `placementTest`: top, in-article, both
- `sizeTest`: 728x90, 970x90, 468x60
- `stickyTest`: bottom, none, delayed
- `refreshTest`: enabled, disabled

```typescript
import { getVariant, isVariant } from './lib/ads/abtest';

const variant = getVariant('stickyTest');
if (isVariant('stickyTest', 'delayed')) {
  // Show delayed sticky banner
}
```

### 5. Fallback Content

Location: `components/ads/AdFallback.tsx`

Shows when:
- Ad fails to load within 5 seconds
- Network error occurs
- User on slow connection (Save-Data mode)

Types:
- `newsletter`: Promotes newsletter subscription
- `article`: Promotes browsing more articles
- `generic`: Simple placeholder

### 6. Admin Dashboard

URL: `/admin/ads`

Features:
- Real-time impressions, clicks, CTR, estimated revenue
- Daily performance chart (last 7 days)
- Placement breakdown
- A/B test variant performance
- Recent events log (last 100)
- Configuration toggles:
  - Global kill switch
  - Verification mode
  - Auto-refresh toggle
  - Debug mode

### 7. Server Endpoints

```
POST /api/ads/event     - Receive batched events
GET  /api/ads/stats     - Get analytics stats
GET  /api/ads/config    - Get current config
POST /api/ads/config    - Update config
GET  /api/ads/events    - Get recent events
POST /api/ads/save      - Force save events to disk
```

## Smoke Testing

Run the smoke test to verify ad integration:

```bash
# Test against local server
node scripts/check-ads.js

# Test against specific URL
node scripts/check-ads.js https://your-site.com
```

The script checks:
- Page accessibility (HTTP 200)
- Presence of A-ADS iframe markers
- Ad unit ID in HTML
- Consent banner components
- Analytics components

## Rollback Procedure

### Quick Rollback

If issues are detected:

1. **Disable all ads immediately** via Admin Dashboard:
   - Go to `/admin/ads`
   - Toggle "Ads Enabled" off

2. **Or via API**:
   ```bash
   curl -X POST /api/ads/config -d '{"enabled": false}'
   ```

### Full Rollback

If code needs to be reverted:

```bash
# Find the commit before optimization
git log --oneline

# Revert to previous commit
git revert HEAD

# Or revert to specific commit
git revert <commit-hash>

# Redeploy
npm run build && npm run deploy
```

### Rollback Checklist

1. [ ] Disable ads via admin dashboard
2. [ ] Check if site loads without errors
3. [ ] If needed, revert commit
4. [ ] Clear localStorage in browser: `localStorage.clear()`
5. [ ] Verify consent banner shows again
6. [ ] Re-enable ads gradually

## Monitoring

### Alerts

The system monitors for:
- Impressions drop > 80% vs baseline → Warning in dashboard
- CTR anomalies

### Setting Baseline

1. Go to `/admin/ads`
2. Click "Update Baseline"
3. Current 24h stats become the baseline

### Log Files

Events are stored in:
- `server/ads_events.json` - Event log (7 days retention)
- `server/ads_config.json` - Configuration

## Environment Variables

```
VITE_AADS_AD_UNIT_ID=2419015    # A-ADS unit ID
```

## Performance Notes

- All ad iframes use `loading="lazy"`
- IntersectionObserver triggers loading at 200px from viewport
- Events are batched to minimize network calls
- Fallback timeout is 5 seconds
- Consent preferences are cached locally

## Privacy Compliance

- A-ADS is privacy-friendly (no tracking cookies)
- GDPR/CCPA consent banner included
- Users can reject advertising
- Preferences link in footer
- No personal data collected without consent

## Files Modified

### New Files
- `lib/ads/viewability.ts`
- `lib/ads/abtest.ts`
- `lib/ads/analytics.ts`
- `lib/ads/index.ts`
- `hooks/useAdObserver.ts`
- `components/ConsentBanner.tsx`
- `components/ads/AdFallback.tsx`
- `pages/AdminAdsPage.tsx`
- `scripts/check-ads.js`
- `docs/ADS_OPTIMIZATION.md`

### Modified Files
- `server/index.js` - Added analytics endpoints
- `components/ads/AAdsTopBanner.tsx` - Added tracking
- `components/ads/StickyAAdsBanner.tsx` - Added tracking
- `components/ads/index.ts` - Added exports
- `components/Footer.tsx` - Added Ad Preferences link
- `App.tsx` - Added routes and ConsentBanner
