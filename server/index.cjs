const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[Server] Shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[Server] Shutting down...');
  process.exit(0);
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

app.post('/api/aiHandler', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Server Error: Missing API_KEY');
      return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    const { action, payload } = req.body;
    const ai = new GoogleGenAI({ apiKey });

    let result;

    console.log(`[AI Handler] Action: ${action} | Model: ${payload?.model}`);

    switch (action) {
      case 'generateContent': {
        const modelName = payload.model || 'gemini-2.0-flash';
        const response = await ai.models.generateContent({
          model: modelName,
          contents: payload.contents,
          config: payload.config,
        });
        
        result = {
          text: response.text,
          candidates: response.candidates,
        };
        break;
      }

      case 'chat': {
        const modelName = payload.model || 'gemini-2.0-flash';
        const chat = ai.chats.create({
          model: modelName,
          history: payload.history,
          config: payload.config,
        });
        const response = await chat.sendMessage({ message: payload.message });
        result = { text: response.text };
        break;
      }

      case 'generateImages': {
        const modelName = payload.model || 'imagen-3.0-generate-001';
        const response = await ai.models.generateImages({
          model: modelName,
          prompt: payload.prompt,
          config: payload.config
        });
        result = { generatedImages: response.generatedImages };
        break;
      }

      case 'generateVideos': {
        const modelName = payload.model || 'veo-3.1-fast-generate-preview';
        const operation = await ai.models.generateVideos({
          model: modelName,
          prompt: payload.prompt,
          image: payload.image, 
          config: payload.config,
        });
        
        result = { operationName: operation.name };
        break;
      }

      case 'getVideosOperation': {
        const operation = await ai.operations.getVideosOperation({
          name: payload.operationName
        });
        
        result = {
          done: operation.done,
          generatedVideos: operation.response?.generatedVideos,
          error: operation.error
        };
        break;
      }

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    res.json(result);
  } catch (error) {
    console.error('[AI Handler] Error:', error);
    res.status(500).json({ 
      error: error.message || 'Unknown AI Error',
      details: error.toString() 
    });
  }
});

// Cache for Pixabay images to reduce API calls
const pixabayCache = {};
let usedImageUrls = new Set();

// Add delay between requests to respect rate limits
const delayBetweenRequests = async () => {
  return new Promise(resolve => setTimeout(resolve, 100));
};

// Clear cache every 15 minutes to allow fresh searches
setInterval(() => {
  console.log('[Pixabay Handler] Clearing cache to allow fresh searches');
  Object.keys(pixabayCache).forEach(key => delete pixabayCache[key]);
  usedImageUrls.clear();
}, 15 * 60 * 1000);

console.log('[Pixabay Handler] Cache cleared on server start');

app.post('/api/pixabayImage', async (req, res) => {
  try {
    const apiKey = process.env.PIXABAY_API_KEY;
    const { searchQuery, category } = req.body;

    // Check cache first
    const cacheKey = `${searchQuery}_${category}`;
    if (pixabayCache[cacheKey]) {
      console.log(`[Pixabay Handler] Cache hit for: "${searchQuery}"`);
      return res.json(pixabayCache[cacheKey]);
    }

    if (!apiKey) {
      console.error('[Pixabay Handler] Missing PIXABAY_API_KEY environment variable');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error: Missing API Key',
      });
    }

    console.log(`[Pixabay Handler] Original Query: "${searchQuery}", Category: "${category}"`);

    if (!searchQuery) {
      return res.status(400).json({
        success: false,
        error: 'Missing searchQuery parameter',
      });
    }

    const extractKeywords = (title) => {
      try {
        const cleaned = title
          .replace(/[^a-zA-Z0-9\s]/g, ' ')
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .filter(word => word && word.length > 2 && word.length < 15);
        
        const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'have', 'been', 'was', 'are', 'but', 'will', 'can', 'all', 'has', 'had', 'not', 'you', 'your', 'she', 'her', 'his', 'him', 'its', 'our', 'out', 'get', 'got', 'make', 'made', 'say', 'said', 'new', 'day', 'time', 'year', 'people', 'big', 'small', 'good', 'bad', 'old', 'young']);
        
        const keywords = cleaned.filter(word => !stopWords.has(word)).slice(0, 3);
        return keywords.length > 0 ? keywords : ['technology'];
      } catch (error) {
        return ['technology'];
      }
    };

    // Category to generic search term mapping with broader fallbacks
    const categorySearchMap = {
      'Technology': ['technology', 'innovation', 'computer', 'digital'],
      'AI': ['artificial intelligence', 'robot', 'automation', 'technology'],
      'Business': ['business', 'corporate', 'finance', 'economy'],
      'Science': ['science', 'research', 'discovery', 'laboratory'],
      'Entertainment': ['entertainment', 'movie', 'celebrity', 'media'],
      'Product': ['product', 'technology', 'gadget', 'device'],
      'Global': ['world', 'globe', 'international', 'news'],
      'India': ['india', 'delhi', 'mumbai', 'culture'],
      'US': ['america', 'usa', 'new york', 'city'],
      'All': ['news', 'article', 'photo', 'image']
    };

    const keywords = extractKeywords(searchQuery);
    console.log(`[Pixabay Handler] Extracted keywords: ${keywords.join(', ')}`);

    // Build search queries with priority - expanded for better coverage
    const categoryQueries = Array.isArray(categorySearchMap[category]) 
      ? categorySearchMap[category] 
      : [categorySearchMap['All']];
    
    const queries = [
      // Primary: Category + keywords combined
      ...categoryQueries.map(cat => `${cat} ${keywords[0] || ''}`).filter(q => q.trim()),
      // Secondary: Category alone
      ...categoryQueries,
      // Tertiary: Individual keywords
      ...keywords,
      // Fallback: Combined keywords
      keywords.length > 1 ? keywords.slice(0, 2).join(' ') : '',
      // Final fallback: Generic
      'photo',
      'image',
      'news'
    ].filter((q, idx, arr) => q && q.trim() && arr.indexOf(q) === idx);
    
    console.log(`[Pixabay Handler] Final search queries: ${queries.join(', ')}`);

    let imageUrl = null;

    for (const query of queries) {
      if (imageUrl) break;

      try {
        const pixabayUrl = new URL('https://pixabay.com/api/');
        pixabayUrl.searchParams.append('key', apiKey);
        pixabayUrl.searchParams.append('q', query);
        pixabayUrl.searchParams.append('image_type', 'photo');
        pixabayUrl.searchParams.append('order', 'popular');
        pixabayUrl.searchParams.append('per_page', '10');
        pixabayUrl.searchParams.append('safesearch', 'true');

        console.log(`[Pixabay Handler] Fetching from Pixabay with query: "${query}"`);
        
        await delayBetweenRequests();
        
        const response = await fetch(pixabayUrl.toString());
        console.log(`[Pixabay Handler] Pixabay API response status: ${response.status}`);

        if (!response.ok) {
          console.warn(`[Pixabay Handler] Pixabay API responded with status ${response.status} for query: ${query}`);
          continue;
        }

        const data = await response.json();
        console.log(`[Pixabay Handler] Pixabay response hits: ${data.hits?.length || 0}`);

        if (data.hits && data.hits.length > 0) {
          const availableHits = data.hits.filter(hit => {
            const url = hit.largeImageURL || hit.webformatURL;
            return !usedImageUrls.has(url);
          });
          
          const selectedHit = availableHits.length > 0 
            ? availableHits[Math.floor(Math.random() * Math.min(availableHits.length, 5))]
            : data.hits[Math.floor(Math.random() * Math.min(data.hits.length, 5))];
          
          imageUrl = selectedHit.largeImageURL || selectedHit.webformatURL;
          usedImageUrls.add(imageUrl);
          console.log(`[Pixabay Handler] Success! Found image for query: "${query}"`);
          break;
        }
      } catch (fetchError) {
        console.error(`[Pixabay Handler] Error fetching from Pixabay for query "${query}":`, fetchError.message);
      }
    }

    if (imageUrl) {
      console.log(`[Pixabay Handler] Returning success with URL: ${imageUrl}`);
      const result = { success: true, imageUrl };
      pixabayCache[cacheKey] = result;
      res.json(result);
    } else {
      console.warn(`[Pixabay Handler] No images found after all queries for "${searchQuery}"`);
      res.json({ success: false, error: 'No images found' });
    }
  } catch (error) {
    console.error('[Pixabay Handler] Error:', error.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/mailchimpSubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;

    if (!apiKey || !listId) {
      console.error('Missing Mailchimp configuration');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const apiServer = apiKey.split('-')[1];
    const url = `https://${apiServer}.api.mailchimp.com/3.0/lists/${listId}/members`;

    const subscriberData = {
      email_address: email,
      status: 'subscribed',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriberData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.title === 'Member Exists') {
        return res.json({ message: 'Email already subscribed', success: true });
      }
      return res.status(response.status).json({ error: data.detail || 'Subscription failed' });
    }

    res.json({ message: 'Successfully subscribed!', success: true });
  } catch (error) {
    console.error('Mailchimp error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === EXPANDED ARTICLES STORAGE ===
const EXPANDED_ARTICLES_FILE = path.join(__dirname, 'expanded_articles.json');

function loadExpandedArticles() {
  try {
    if (fs.existsSync(EXPANDED_ARTICLES_FILE)) {
      return JSON.parse(fs.readFileSync(EXPANDED_ARTICLES_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('[Expanded Articles] Failed to load:', e.message);
  }
  return {};
}

function saveExpandedArticles(articles) {
  try {
    fs.writeFileSync(EXPANDED_ARTICLES_FILE, JSON.stringify(articles, null, 2));
  } catch (e) {
    console.error('[Expanded Articles] Failed to save:', e.message);
  }
}

let expandedArticlesCache = loadExpandedArticles();

app.get('/api/expanded-article/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const article = expandedArticlesCache[slug];
    
    if (!article) {
      return res.status(404).json({ error: 'Expanded article not found' });
    }
    
    console.log(`[Expanded Articles] Retrieved article: ${slug}`);
    res.json(article);
  } catch (error) {
    console.error('[Expanded Articles] Get error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/expanded-article', (req, res) => {
  try {
    const { 
      slug, 
      originalTitle, 
      originalContent, 
      expandedContent, 
      category, 
      wordCount, 
      readabilityScore,
      metaTitle,
      metaDescription,
      focusKeyword,
      keywords,
      internalLinks,
      externalLinks,
      imageAltTexts,
      faq
    } = req.body;
    
    // Required field validation
    if (!slug || !expandedContent) {
      return res.status(400).json({ error: 'Missing required fields: slug and expandedContent are required' });
    }
    
    // Minimum word count validation (must be at least 800 words)
    if (!wordCount || wordCount < 800) {
      console.warn(`[Expanded Articles] Rejected article ${slug}: Word count too low (${wordCount || 0})`);
      return res.status(400).json({ error: `Word count too low: ${wordCount || 0}. Minimum 800 words required.` });
    }
    
    // SEO fields validation
    if (!metaTitle || metaTitle.length < 10) {
      console.warn(`[Expanded Articles] Rejected article ${slug}: Missing or too short metaTitle`);
      return res.status(400).json({ error: 'Missing or invalid metaTitle (minimum 10 characters)' });
    }
    
    if (!metaDescription || metaDescription.length < 50) {
      console.warn(`[Expanded Articles] Rejected article ${slug}: Missing or too short metaDescription`);
      return res.status(400).json({ error: 'Missing or invalid metaDescription (minimum 50 characters)' });
    }
    
    if (!focusKeyword || focusKeyword.length < 3) {
      console.warn(`[Expanded Articles] Rejected article ${slug}: Missing focusKeyword`);
      return res.status(400).json({ error: 'Missing or invalid focusKeyword' });
    }
    
    // Structure validation - check for H2 headings
    const hasH2 = /<h2[^>]*>/i.test(expandedContent);
    if (!hasH2) {
      console.warn(`[Expanded Articles] Rejected article ${slug}: Missing H2 structure`);
      return res.status(400).json({ error: 'Article must contain H2 headings for proper structure' });
    }
    
    expandedArticlesCache[slug] = {
      slug,
      originalTitle,
      originalContent: originalContent?.substring(0, 1000),
      expandedContent,
      category,
      wordCount,
      readabilityScore,
      metaTitle: metaTitle,
      metaDescription: metaDescription,
      focusKeyword: focusKeyword,
      keywords: Array.isArray(keywords) ? keywords : [],
      internalLinks: Array.isArray(internalLinks) ? internalLinks : [],
      externalLinks: Array.isArray(externalLinks) ? externalLinks : [],
      imageAltTexts: Array.isArray(imageAltTexts) ? imageAltTexts : [],
      faq: Array.isArray(faq) ? faq : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    saveExpandedArticles(expandedArticlesCache);
    
    console.log(`[Expanded Articles] Saved SEO article: ${slug} (${wordCount} words, focus: ${focusKeyword})`);
    res.json({ success: true, slug });
  } catch (error) {
    console.error('[Expanded Articles] Save error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/expanded-articles/stats', (req, res) => {
  try {
    const slugs = Object.keys(expandedArticlesCache);
    const totalArticles = slugs.length;
    const avgWordCount = totalArticles > 0 
      ? Math.round(slugs.reduce((sum, slug) => sum + (expandedArticlesCache[slug].wordCount || 0), 0) / totalArticles)
      : 0;
    
    res.json({
      totalArticles,
      avgWordCount,
      articles: slugs.slice(0, 20).map(slug => ({
        slug,
        wordCount: expandedArticlesCache[slug].wordCount,
        createdAt: expandedArticlesCache[slug].createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend Server] Running on http://0.0.0.0:${PORT}`);
  console.log(`[Backend Server] API Key available: ${!!(process.env.GOOGLE_AI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY)}`);
  console.log(`[Backend Server] Pixabay Key available: ${!!process.env.PIXABAY_API_KEY}`);
  console.log(`[Backend Server] Mailchimp Key available: ${!!process.env.MAILCHIMP_API_KEY}`);
  console.log(`[Backend Server] Expanded articles cached: ${Object.keys(expandedArticlesCache).length}`);
});