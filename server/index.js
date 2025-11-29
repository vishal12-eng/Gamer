const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

app.post('/api/aiHandler', async (req, res) => {
  try {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
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
const requestQueue = [];
let isRequestPending = false;

// Add delay between requests to respect rate limits
const delayBetweenRequests = async () => {
  return new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay between requests
};

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

    // Category to generic search term mapping
    const categorySearchMap = {
      'Technology': 'technology innovation',
      'AI': 'artificial intelligence robot',
      'Business': 'business corporate finance',
      'Science': 'science research discovery',
      'Entertainment': 'entertainment movie celebrity',
      'Product': 'technology gadget product',
      'Global': 'world global news',
      'India': 'india flag culture',
      'US': 'america usa city',
      'All': 'news article'
    };

    const keywords = extractKeywords(searchQuery);
    console.log(`[Pixabay Handler] Extracted keywords: ${keywords.join(', ')}`);

    // Build search queries with priority
    const categoryQuery = categorySearchMap[category] || categorySearchMap['All'];
    const queries = [
      // Primary: Category-based + first keyword
      keywords.length > 0 ? `${categoryQuery} ${keywords[0]}` : categoryQuery,
      // Secondary: Category alone
      categoryQuery,
      // Tertiary: Individual keywords
      ...keywords,
      // Fallback: Combined keywords
      keywords.slice(0, 2).join(' '),
      // Final fallback: Generic
      'article news'
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
        pixabayUrl.searchParams.append('per_page', '1');
        pixabayUrl.searchParams.append('safesearch', 'true');
        pixabayUrl.searchParams.append('editors_choice', 'true');

        console.log(`[Pixabay Handler] Fetching from Pixabay with query: "${query}"`);
        
        // Add delay to respect rate limits
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
          imageUrl = data.hits[0].largeImageURL || data.hits[0].webformatURL;
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
      pixabayCache[cacheKey] = result; // Cache successful result
      res.json(result);
    } else {
      console.warn(`[Pixabay Handler] No images found after all queries for "${searchQuery}"`);
      const result = { success: false, error: 'No images found' };
      pixabayCache[cacheKey] = result; // Cache failed result too to avoid repeated attempts
      res.json(result);
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Backend Server] Running on http://0.0.0.0:${PORT}`);
  console.log(`[Backend Server] API Key available: ${!!(process.env.API_KEY || process.env.GEMINI_API_KEY)}`);
  console.log(`[Backend Server] Pixabay Key available: ${!!process.env.PIXABAY_API_KEY}`);
  console.log(`[Backend Server] Mailchimp Key available: ${!!process.env.MAILCHIMP_API_KEY}`);
});