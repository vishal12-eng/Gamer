# FutureTechJournal - Complete AI Usage Audit Report
**Generated:** December 7, 2025

---

## Executive Summary
- **Total AI Service Functions:** 15 main functions
- **Total AI Endpoints:** 2 (/api/aiHandler, /api/newsletter/generate-summary)
- **Backend Models:** gemini-2.0-flash (main), gemini-2.5-pro (advanced), imagen-3.0, veo-3.1
- **Free Tier Issue:** Gemini API hitting daily quota limits
- **Biggest Quota Consumers:** Article expansion (SEO) on page load, newsletter generation

---

## PART 1: BACKEND AI ENDPOINTS

### 1. `/api/aiHandler` (server/index.cjs, lines 123-218)
**Purpose:** General-purpose AI handler supporting multiple actions
**Triggered by:** Frontend AI requests (text, images, videos)
**Models Used:** 
- gemini-2.0-flash (default text/chat)
- imagen-3.0-generate-001 (image generation)
- veo-3.1-fast-generate-preview (video generation)

**Actions & Token Impact:**
| Action | Model | Use Case | Estimated Tokens/Call | Frequency |
|--------|-------|----------|----------------------|-----------|
| `generateContent` | gemini-2.0-flash | Text generation, summarization | 2,000-4,000 | High |
| `chat` | gemini-2.0-flash | Chatbot responses | 3,000-5,000 | Medium |
| `generateImages` | imagen-3.0 | Image creation | 500 tokens approx | Low |
| `generateVideos` | veo-3.1 | Video animation (async) | 20,000+ | Very Low |
| `getVideosOperation` | (polling) | Check video status | 100 tokens | Very Low |

**Key Issues:**
- ⚠️ NO CACHING - every request hits API even for same prompts
- ⚠️ NO RATE LIMITING - multiple requests can be queued
- ✓ Good: Async video generation avoids timeouts

---

### 2. `/api/newsletter/generate-summary` (server/index.cjs, lines 436-502)
**Purpose:** Generate AI-crafted newsletter content from articles
**Triggered by:** User clicks "Generate Newsletter" button
**Model:** gemini-2.0-flash

**Token Impact:**
- **Per Call:** ~2,500-3,500 tokens (articles array input + HTML formatting)
- **Frequency:** Manual user action (1-2x per day)
- **Format:** JSON response (subject line + HTML content)

**Key Issues:**
- ⚠️ NOT CACHED - same articles could regenerate different content
- ⚠️ NO VALIDATION - could generate duplicate/similar content
- ✓ Acceptable frequency (user-driven)

---

### 3. `/api/newsletter/send` (server/index.cjs, lines 504-635)
**Purpose:** Send newsletter via Mailchimp
**Important:** Uses ZERO AI (Mailchimp API only)
**Triggered by:** Admin user

---

## PART 2: FRONTEND AI SERVICES (services/geminiService.ts)

### Function-by-Function Breakdown

**A. Text Processing (Lines 47-100)**

1. **`summarizeText(text)`** - Line 47
   - **Tokens:** ~2,000 per call
   - **Trigger:** User clicks "Summarize Article" (ArticlePage.tsx:422)
   - **Caching:** ❌ NO - fetches fresh every time
   - **Frequency:** On-demand user action

2. **`translateText(text, lang)`** - Line 73
   - **Tokens:** ~2,500 per call
   - **Trigger:** User clicks "Translate to Hindi/English" (ArticlePage.tsx:439)
   - **Caching:** ❌ NO - each translation is unique
   - **Frequency:** User-driven, medium impact

3. **`generateTextToSpeech(text)`** - Line 85
   - **Tokens:** ~1,500 per call
   - **Trigger:** User clicks "Read Aloud" (ArticlePage.tsx - uses Web Speech API instead)
   - **Status:** ⚠️ CODE EXISTS but NOT USED (browser's native TTS used instead)
   - **Frequency:** Low

**B. Chat & Search (Lines 102-141)**

4. **`chatWithBotStream(history, message)`** - Line 102
   - **Tokens:** ~3,000 per exchange
   - **Trigger:** Chat interface in AI Tools page
   - **Caching:** ❌ NO - stateless (only history sent)
   - **Frequency:** Low (advanced feature, few users)
   - **Note:** Returns simulated stream (not true streaming)

5. **`groundedSearch(query)`** - Line 129
   - **Tokens:** ~2,000 per search
   - **Trigger:** User searches with Google Search grounding (AiToolsPage.tsx:447)
   - **Caching:** ❌ NO
   - **Frequency:** Very Low (niche feature)

**C. Article Content (Lines 145-185)**

6. **`expandContentStream(title, content, category)`** - Line 145
   - **Tokens:** ~3,000 per call
   - **Trigger:** Article expansion on demand (AiToolsPage.tsx)
   - **Caching:** ❌ NO
   - **Frequency:** Low (admin/advanced users only)

7. **`rewriteArticle(content, tone)`** - Line 174
   - **Tokens:** ~3,500 per call
   - **Trigger:** Admin editor page (AdminArticleEditorPage.tsx:114)
   - **Caching:** ❌ NO
   - **Frequency:** Very Low (admin action)

8. **`generateBlogPost(topic)`** - Line 187
   - **Tokens:** ~3,000 per call
   - **Trigger:** Content creation tool (AiToolsPage.tsx:649)
   - **Caching:** ❌ NO
   - **Frequency:** Very Low (niche feature)

**D. Image & Video (Lines 202-248)**

9. **`generateImage(prompt, aspect, size)`** - Line 202
   - **Tokens:** ~500 per call (Imagen model)
   - **Trigger:** Image generation tool (AiToolsPage.tsx:136)
   - **Caching:** ❌ NO
   - **Frequency:** Very Low
   - **Note:** Uses Imagen, not Gemini

10. **`animateImage(imageFile, prompt)`** - Line 218
    - **Tokens:** ~20,000+ per call (Veo model, async operation)
    - **Trigger:** Video animation tool (AiToolsPage.tsx:267)
    - **Status:** ⚠️ POLLING - polls every 5 seconds for up to 2 minutes (max 24 polls)
    - **Frequency:** Extremely Low (advanced, few users)
    - **Issue:** Client-side polling adds network overhead

11. **`analyzeImage(prompt, imageFile)`** - Line 250
    - **Tokens:** ~2,000 per call
    - **Trigger:** Image analysis tool (AiToolsPage.tsx:388)
    - **Caching:** ❌ NO
    - **Frequency:** Very Low

**E. Content Quality (Lines 268-340)**

12. **`analyzeReadability(text)`** - Line 268
    - **Tokens:** ~1,500 per call
    - **Trigger:** Readability analysis (ArticlePage.tsx:563)
    - **Caching:** ❌ NO
    - **Frequency:** On-demand

13. **`improveReadability(text)`** - Line 281
    - **Tokens:** ~4,000 per call (large input text)
    - **Trigger:** User clicks "Improve Readability" (ArticlePage.tsx:559)
    - **Caching:** ❌ NO - MAJOR QUOTA CONSUMER
    - **Frequency:** Medium (popular feature)
    - **Issue:** Sends up to 6,000 chars - very token-intensive

14. **`suggestTags(title, content, existingTags)`** - Line 325
    - **Tokens:** ~2,000 per call
    - **Trigger:** User clicks "Suggest Tags" (ArticlePage.tsx:534)
    - **Caching:** ❌ NO
    - **Frequency:** On-demand

15. **`findRelevantArticles(query, articles)`** - Line 342
    - **Tokens:** ~2,500 per call (sends 20 article summaries)
    - **Trigger:** Search page uses for AI-powered search (SearchPage.tsx:75)
    - **Caching:** ❌ NO
    - **Frequency:** Every search (HIGH)
    - **Issue:** MAJOR QUOTA CONSUMER - called on EVERY search

---

## PART 3: SEO ARTICLE EXPANSION (services/articleExpansionService.ts)

### `expandArticleWithSEO(title, content, category)` - Line 81
**This is your BIGGEST quota consumer**

**Token Impact:**
- **Per Article:** ~5,000-8,000 tokens (massive prompt)
- **Prompt Size:** 219 lines of instructions + 5,000 chars of content
- **Response:** 1,000-1,500+ words of HTML + JSON metadata
- **Triggered by:** AUTOMATIC on every article page load (ArticlePage.tsx:282-296)
- **Frequency:** EVERY NEW ARTICLE VIEWED (HIGH)
- **Caching:** ✓ YES (to expanded_articles.json), but only if successfully saved to DB
- **Database Integration:** Saves to `/api/expanded-article` endpoint (MongoDB or file-based)

**Expansion Includes:**
- SEO meta titles/descriptions
- Focus keywords (5-8)
- Internal links (2-3)
- External links (1-2)
- Image alt texts
- Mini FAQ (2-4 Q&As)
- Hierarchical heading structure (H2-H4)

**Key Issues:**
- ⚠️ QUOTA KILLER - 8,000 tokens × articles viewed per day = massive usage
- ⚠️ AUTO-TRIGGERED - happens even for casual page views
- ⚠️ POOR CACHE VALIDATION - revalidates on every app restart
- ✓ GOOD: File-based fallback if MongoDB unavailable
- ⚠️ DB ENDPOINT: `/api/expanded-article/:slug` (GET) + `/api/expanded-article` (POST) - NO AUTH required

---

## PART 4: ADVANCED AI REWRITE SERVICE (services/aiRewrite.ts)

### `rewriteArticleForSEO(input)` - Line 33
**Alternative expansion method (less common)**

**Token Impact:**
- **Per Article:** ~6,000-9,000 tokens (uses gemini-2.5-pro with thinking)
- **Model:** gemini-2.5-pro (more expensive than flash)
- **Thinking Budget:** 32,768 tokens (max planning tokens)
- **Triggered by:** Admin editor button (AdminArticleEditorPage.tsx:141)
- **Frequency:** LOW (admin-only)
- **Caching:** ❌ NO

---

## PART 5: USAGE FREQUENCY ANALYSIS

### **DAILY QUOTA BREAKDOWN** (Estimated for 100 users, 500 article views)
| Feature | Calls/Day | Tokens/Call | Daily Total | % of Budget |
|---------|-----------|------------|------------|-----------|
| SEO Expansion (AUTO) | 500 | 7,000 | **3,500,000** | 87.5% ⚠️ |
| Search (AI) | 200 | 2,500 | 500,000 | 12.5% |
| Newsletter | 2 | 3,000 | 6,000 | 0.15% |
| Readability | 50 | 4,000 | 200,000 | 5% |
| Summarize | 30 | 2,000 | 60,000 | 1.5% |
| Translate | 10 | 2,500 | 25,000 | 0.6% |
| Tags | 20 | 2,000 | 40,000 | 1% |
| **TOTAL** | **812** | - | **~4,331,000** | **~108%** ⚠️ |

**Gemini Free Tier Limit:** 4,000,000 tokens/day (15 RPM, 500K tokens/min)
**Your Current Usage:** EXCEEDS QUOTA by ~8% (even before other users)

---

## PART 6: QUOTA OPTIMIZATION OPPORTUNITIES

### 🟠 HIGH PRIORITY (Implement First)

**1. Cache SEO Article Expansions (Save ~87% quota)**
- **Current:** Every page view triggers new 7,000-token expansion
- **Solution:** Implement smart caching strategy:
  - ✓ Already in code: File-based + DB caching
  - ❌ Problem: Cache validation is too strict (invalidates on missing SEO fields)
  - **Fix:** Trust cache more aggressively, only regenerate on content updates
- **Potential Savings:** 3,500,000 tokens/day → ~500,000 tokens/day
- **Effort:** LOW (config change)
- **Implementation:** In ArticlePage.tsx + articleExpansionService.ts

**2. Make AI Search Optional (Save ~12.5% quota)**
- **Current:** findRelevantArticles() runs on every search
- **Solution:** 
  - Offer two search modes: "Quick" (no AI) vs "AI-Powered" (with AI)
  - Default to quick search, opt-in for AI
  - Or run AI search only if results < 3
- **Potential Savings:** 500,000 tokens/day
- **Effort:** MEDIUM (UI + logic change)
- **Implementation:** SearchPage.tsx

### 🟡 MEDIUM PRIORITY

**3. Batch API Requests (Save ~10% quota)**
- **Current:** Each feature triggers separate API call
- **Solution:** Combine multiple requests in single payload
- **Example:** On article page load, batch: expansion + image search + tags suggestion
- **Effort:** MEDIUM
- **Implementation:** New batching service

**4. Remove Unused TTS Function (Save <1% quota)**
- **Current:** generateTextToSpeech() defined but never called (browser TTS used instead)
- **Solution:** Delete the function from code
- **Effort:** LOW
- **Implementation:** Delete 15 lines in geminiService.ts

**5. Implement Response Caching Layer (Save ~5% quota)**
- **Current:** NO caching for summarize, readability, tags
- **Solution:** Cache results by content hash:
  - Same article text = same summary (within 7 days)
  - Use localStorage + backend cache
- **Potential Savings:** 300,000 tokens/day
- **Effort:** MEDIUM-HIGH
- **Implementation:** New caching service + cache invalidation logic

### 🟢 LOW PRIORITY

**6. Use Cheaper Models for Simple Tasks (Save ~5% quota)**
- **Readability Analysis:** Use cheaper "gemini-2.0-flash-lite" (if available)
- **Tag Suggestion:** Pre-compute from title + category (no AI needed)
- **Effort:** LOW-MEDIUM

**7. Remove Polling Overhead for Videos (Save <1% quota)**
- **Current:** Video generation polls every 5 seconds × 24 times
- **Solution:** Use server-side polling or webhooks instead
- **Effort:** HIGH (architecture change)

**8. Improve Prompt Efficiency (Save ~3% quota)**
- **Current:** SEO expansion prompt is 219 lines (very verbose)
- **Solution:** Compress instructions, use examples instead of detailed rules
- **Potential Savings:** 200,000 tokens/day
- **Effort:** MEDIUM

---

## PART 7: RECOMMENDED IMMEDIATE ACTIONS

### **MUST DO (Today) - Fixes quota overrun:**

1. **DISABLE AUTO-EXPANSION FOR GUEST USERS**
   - File: ArticlePage.tsx, lines 282-296
   - Change: Only auto-expand for authenticated users OR logged-in users
   - Savings: 50-70% (removes casual traffic spike)

2. **MAKE SEARCH AI OPTIONAL (Add toggle)**
   - File: SearchPage.tsx
   - Add: "Use AI Search" checkbox
   - Default: OFF
   - Savings: 12.5% quota

3. **INCREASE CACHE TRUST**
   - File: articleExpansionService.ts, lines 375-381
   - Change: Cache validation from strict → lenient
   - Current: Revalidates if missing SEO fields
   - New: Trust any cache entry < 30 days old
   - Savings: 80% of expansion cache misses

### **SHOULD DO (This week) - Prevents future overruns:**

4. **Add Rate Limiting to AI Requests**
   - Prevent single user from hammering API
   - Implement: Max 5 AI requests per minute per IP

5. **Add Quota Monitoring Dashboard**
   - Track daily token usage
   - Alert if approaching 75% of daily limit
   - File: Create new admin endpoint `/api/admin/quota-usage`

6. **Move Heavy Processing to Background Jobs**
   - Newsletter generation: Already OK (manual trigger)
   - Article expansion: SHOULD be batch job, not on-demand

---

## PART 8: CODE LOCATIONS SUMMARY

| Feature | File | Lines | Type |
|---------|------|-------|------|
| AI Handler | server/index.cjs | 123-218 | Backend |
| Newsletter | server/index.cjs | 436-635 | Backend |
| All 15 AI Functions | services/geminiService.ts | 1-362 | Frontend |
| SEO Expansion | services/articleExpansionService.ts | 1-446 | Frontend |
| AI Rewrite | services/aiRewrite.ts | 1-104 | Frontend |
| Article Page (triggers) | pages/ArticlePage.tsx | 282-403 | Frontend |
| Search (triggers) | pages/SearchPage.tsx | 75 | Frontend |
| AI Tools (triggers) | pages/AiToolsPage.tsx | Multiple | Frontend |
| Admin (triggers) | pages/AdminArticleEditorPage.tsx | 114, 141, 171 | Frontend |

---

## PART 9: NO-CODE CHANGES NEEDED YET

**This is an audit only.** User will review and decide which optimizations to implement.

### Recommended Review Questions:
1. **How many daily users?** (Affects quota calculation)
2. **What's your SEO expansion usage?** (Is caching working properly?)
3. **Which features matter most to you?** (To prioritize fixes)
4. **Budget for AI?** (Upgrade plan vs free tier?)
5. **Performance requirements?** (Is response time more important than cost?)

---

## CONCLUSION

**Current Status:** ⚠️ **EXCEEDS QUOTA by ~8%**

**Root Cause:** Automatic SEO expansion on every article page view (87% of usage)

**Quick Fix:** Disable auto-expansion for guests OR enable aggressive caching

**Best Path Forward:** Combine caching improvements + optional AI search (could reduce usage to 50% of current)
