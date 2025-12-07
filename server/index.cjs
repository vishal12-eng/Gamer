const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');
const { processAndSaveArticles, fetchRssFeeds, feedMap } = require('./rssIngestionService.cjs');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// MongoDB Connection (optional - gracefully handle if not configured)
let dbConnection = null;
let Article, Category, Ad, User;
let Analytics, AIUsage, Log;
let jwt, bcrypt;

async function initializeMongoDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      console.log('[MongoDB] MONGODB_URI not set - using file-based storage');
      return false;
    }

    const mongoose = require('mongoose');
    
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    dbConnection = mongoose.connection;
    console.log('[MongoDB] Connected successfully');

    // Load models
    Article = require('../src/models/Article.cjs');
    Category = require('../src/models/Category.cjs');
    Ad = require('../src/models/Ad.cjs');
    User = require('../src/models/User.cjs');
    
    // Load analytics models
    Analytics = require('../src/models/Analytics.cjs');
    AIUsage = require('../src/models/AIUsage.cjs');
    Log = require('../src/models/Log.cjs');

    // Load JWT and bcrypt
    jwt = require('jsonwebtoken');
    bcrypt = require('bcryptjs');

    return true;
  } catch (error) {
    console.warn('[MongoDB] Connection failed:', error.message);
    console.log('[MongoDB] Falling back to file-based storage');
    return false;
  }
}

const isMongoConnected = () => dbConnection && dbConnection.readyState === 1;

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  
  try {
    if (jwt) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } else {
      // Fallback: simple token check if JWT not available
      if (token === 'admin-token') {
        req.user = { role: 'admin' };
        next();
      } else {
        return res.status(403).json({ error: 'Invalid token' });
      }
    }
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'editor')) {
    next();
  } else {
    return res.status(403).json({ error: 'Admin access required' });
  }
};

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[Server] Shutting down...');
  if (typeof stopCleanupScheduler === 'function') {
    stopCleanupScheduler();
  }
  if (dbConnection) {
    dbConnection.close();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[Server] Shutting down...');
  if (typeof stopCleanupScheduler === 'function') {
    stopCleanupScheduler();
  }
  if (dbConnection) {
    dbConnection.close();
  }
  process.exit(0);
});

// =============================================
// AI HANDLER (Existing - Unchanged)
// =============================================
app.post('/api/aiHandler', async (req, res) => {
  try {
    let apiKey = process.env.GOOGLE_AI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Server Error: Missing API_KEY');
      return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    // Sanitize API key by removing invisible Unicode characters (zero-width, BOM, directional marks, etc.)
    apiKey = apiKey.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g, '').trim();

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

    logActivity('ai_gen', `${action} - ${payload?.model || 'default'}`);
    res.json(result);
  } catch (error) {
    console.error('[AI Handler] Error:', error);
    res.status(500).json({ 
      error: error.message || 'Unknown AI Error',
      details: error.toString() 
    });
  }
});

// =============================================
// PIXABAY HANDLER (Existing - Unchanged)
// =============================================
const pixabayCache = {};
let usedImageUrls = new Set();

const delayBetweenRequests = async () => {
  return new Promise(resolve => setTimeout(resolve, 100));
};

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

    const categoryQueries = Array.isArray(categorySearchMap[category]) 
      ? categorySearchMap[category] 
      : [categorySearchMap['All']];
    
    const queries = [
      ...categoryQueries.map(cat => `${cat} ${keywords[0] || ''}`).filter(q => q.trim()),
      ...categoryQueries,
      ...keywords,
      keywords.length > 1 ? keywords.slice(0, 2).join(' ') : '',
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

// =============================================
// MAILCHIMP HANDLER (Existing - Unchanged)
// =============================================
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

// =============================================
// NEWSLETTER HANDLERS
// =============================================

app.post('/api/newsletter/generate-summary', async (req, res) => {
  try {
    let apiKey = process.env.GOOGLE_AI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Server configuration error: Missing AI API Key' });
    }

    apiKey = apiKey.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2064\uFEFF]/g, '').trim();

    const { articles } = req.body;

    if (!articles || !Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: 'Articles array is required' });
    }

    const ai = new GoogleGenAI({ apiKey });

    const articlesList = articles.map((article, index) => 
      `${index + 1}. "${article.title}" - ${article.summary}`
    ).join('\n');

    const prompt = `You are a tech newsletter writer for FutureTechJournal. Create an engaging email newsletter digest based on these articles:

${articlesList}

Generate:
1. A catchy email subject line (max 60 characters) that will get people to open the email
2. Newsletter content in HTML format that:
   - Has a brief greeting
   - Summarizes each article engagingly (2-3 sentences each)
   - Includes a call-to-action to read more on the website
   - Has a friendly sign-off
   - Uses simple inline styles for formatting (colors: #06b6d4 for cyan accents)

Respond in this exact JSON format:
{
  "subject": "your subject line here",
  "content": "your HTML content here"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    let responseText = response.text || '';
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('[Newsletter] AI summary generated successfully');
      return res.json({
        subject: parsed.subject,
        content: parsed.content,
      });
    }

    return res.status(500).json({ error: 'Failed to parse AI response' });
  } catch (error) {
    console.error('[Newsletter] Generate summary error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate newsletter summary' });
  }
});

app.post('/api/newsletter/send', authenticateToken, async (req, res) => {
  try {
    const { subject, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ success: false, message: 'Subject and content are required' });
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;

    if (!apiKey || !listId) {
      console.error('[Newsletter] Missing Mailchimp configuration');
      return res.status(500).json({ success: false, message: 'Server configuration error: Missing Mailchimp credentials' });
    }

    const apiServer = apiKey.split('-')[1];
    const baseUrl = `https://${apiServer}.api.mailchimp.com/3.0`;
    const authHeader = `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`;

    const campaignResponse = await fetch(`${baseUrl}/campaigns`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'regular',
        recipients: {
          list_id: listId,
        },
        settings: {
          subject_line: subject,
          title: `Newsletter - ${new Date().toLocaleDateString()}`,
          from_name: 'FutureTechJournal',
          reply_to: process.env.MAILCHIMP_REPLY_TO || 'newsletter@futuretechjournal.com',
        },
      }),
    });

    const campaignData = await campaignResponse.json();

    if (!campaignResponse.ok) {
      console.error('[Newsletter] Failed to create campaign:', campaignData);
      return res.status(campaignResponse.status).json({ 
        success: false, 
        message: campaignData.detail || 'Failed to create campaign' 
      });
    }

    const campaignId = campaignData.id;
    console.log(`[Newsletter] Campaign created: ${campaignId}`);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #1f2937; color: #e5e7eb;">
    <div style="padding: 32px; text-align: center; background: linear-gradient(135deg, #0e7490, #7c3aed);">
      <h1 style="margin: 0; color: white; font-size: 28px;">FutureTechJournal</h1>
      <p style="margin: 8px 0 0; color: #e0f2fe; font-size: 14px;">Your Weekly Tech Digest</p>
    </div>
    <div style="padding: 32px;">
      ${content}
    </div>
    <div style="padding: 24px; text-align: center; border-top: 1px solid #374151;">
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} FutureTechJournal. All rights reserved.
      </p>
      <p style="margin: 8px 0 0; color: #6b7280; font-size: 11px;">
        <a href="*|UNSUB|*" style="color: #06b6d4;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`;

    const contentResponse = await fetch(`${baseUrl}/campaigns/${campaignId}/content`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html: htmlContent,
      }),
    });

    if (!contentResponse.ok) {
      const contentError = await contentResponse.json();
      console.error('[Newsletter] Failed to set content:', contentError);
      return res.status(contentResponse.status).json({ 
        success: false, 
        message: contentError.detail || 'Failed to set campaign content' 
      });
    }

    console.log(`[Newsletter] Campaign content set for: ${campaignId}`);

    const sendResponse = await fetch(`${baseUrl}/campaigns/${campaignId}/actions/send`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!sendResponse.ok) {
      const sendError = await sendResponse.json();
      console.error('[Newsletter] Failed to send campaign:', sendError);
      return res.status(sendResponse.status).json({ 
        success: false, 
        message: sendError.detail || 'Failed to send campaign' 
      });
    }

    console.log(`[Newsletter] Campaign sent successfully: ${campaignId}`);
    res.json({ 
      success: true, 
      message: 'Newsletter sent successfully!',
      campaignId 
    });

  } catch (error) {
    console.error('[Newsletter] Send error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to send newsletter' });
  }
});

// =============================================
// EXPANDED ARTICLES (File-based fallback + MongoDB)
// =============================================
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

app.get('/api/expanded-article/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Try MongoDB first if connected
    if (isMongoConnected() && Article) {
      const article = await Article.findOne({ slug }).lean();
      if (article && article.expandedContent) {
        console.log(`[Expanded Articles] Retrieved from MongoDB: ${slug}`);
        return res.json(article);
      }
    }
    
    // Fallback to file cache
    const article = expandedArticlesCache[slug];
    
    if (!article) {
      return res.status(404).json({ error: 'Expanded article not found' });
    }
    
    console.log(`[Expanded Articles] Retrieved from cache: ${slug}`);
    res.json(article);
  } catch (error) {
    console.error('[Expanded Articles] Get error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/expanded-article', async (req, res) => {
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
    
    if (!slug || !expandedContent) {
      return res.status(400).json({ error: 'Missing required fields: slug and expandedContent are required' });
    }
    
    if (!wordCount || wordCount < 800) {
      console.warn(`[Expanded Articles] Rejected article ${slug}: Word count too low (${wordCount || 0})`);
      return res.status(400).json({ error: `Word count too low: ${wordCount || 0}. Minimum 800 words required.` });
    }
    
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
    
    const hasH2 = /<h2[^>]*>/i.test(expandedContent);
    if (!hasH2) {
      console.warn(`[Expanded Articles] Rejected article ${slug}: Missing H2 structure`);
      return res.status(400).json({ error: 'Article must contain H2 headings for proper structure' });
    }
    
    const articleData = {
      slug,
      title: originalTitle,
      content: originalContent?.substring(0, 1000),
      expandedContent,
      category,
      wordCount,
      readabilityScore,
      metaTitle,
      metaDescription,
      focusKeyword,
      keywords: Array.isArray(keywords) ? keywords : [],
      internalLinks: Array.isArray(internalLinks) ? internalLinks : [],
      externalLinks: Array.isArray(externalLinks) ? externalLinks : [],
      imageAltTexts: Array.isArray(imageAltTexts) ? imageAltTexts : [],
      faq: Array.isArray(faq) ? faq : [],
      isExpanded: true,
      updatedAt: new Date()
    };

    // Try MongoDB first if connected
    if (isMongoConnected() && Article) {
      await Article.findOneAndUpdate(
        { slug },
        { $set: articleData },
        { upsert: true, new: true }
      );
      console.log(`[Expanded Articles] Saved to MongoDB: ${slug}`);
    }
    
    // Also save to file cache as backup
    expandedArticlesCache[slug] = {
      ...articleData,
      originalTitle,
      originalContent: originalContent?.substring(0, 1000),
      createdAt: expandedArticlesCache[slug]?.createdAt || new Date().toISOString(),
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

app.get('/api/expanded-articles/stats', async (req, res) => {
  try {
    let totalArticles = 0;
    let avgWordCount = 0;
    let articles = [];

    if (isMongoConnected() && Article) {
      totalArticles = await Article.countDocuments({ isExpanded: true });
      const stats = await Article.aggregate([
        { $match: { isExpanded: true } },
        { $group: { _id: null, avgWordCount: { $avg: '$wordCount' } } }
      ]);
      avgWordCount = stats[0]?.avgWordCount || 0;
      articles = await Article.find({ isExpanded: true })
        .select('slug wordCount createdAt')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
    } else {
      const slugs = Object.keys(expandedArticlesCache);
      totalArticles = slugs.length;
      avgWordCount = totalArticles > 0 
        ? Math.round(slugs.reduce((sum, slug) => sum + (expandedArticlesCache[slug].wordCount || 0), 0) / totalArticles)
        : 0;
      articles = slugs.slice(0, 20).map(slug => ({
        slug,
        wordCount: expandedArticlesCache[slug].wordCount,
        createdAt: expandedArticlesCache[slug].createdAt
      }));
    }
    
    res.json({ totalArticles, avgWordCount: Math.round(avgWordCount), articles });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// ARTICLES API (MongoDB-backed)
// =============================================
app.get('/api/articles', async (req, res) => {
  try {
    const { category, status, page = 1, limit = 20, search } = req.query;
    
    if (!isMongoConnected() || !Article) {
      return res.json({ 
        articles: [], 
        total: 0, 
        page: 1, 
        pages: 0,
        message: 'Database not connected - using client-side data'
      });
    }

    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [articles, total] = await Promise.all([
      Article.find(query)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Article.countDocuments(query)
    ]);

    res.json({
      articles,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('[Articles API] Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/articles/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    if (!isMongoConnected() || !Article) {
      return res.status(404).json({ error: 'Article not found - database not connected' });
    }

    const article = await Article.findOne({ slug }).lean();
    
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Increment view count
    await Article.updateOne({ slug }, { $inc: { viewCount: 1 } });

    res.json(article);
  } catch (error) {
    console.error('[Articles API] Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// FAQ API
// =============================================
app.get('/api/articles/:slug/faqs', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`[FAQ API] Getting FAQs for article: ${slug}`);
    
    if (!isMongoConnected() || !Article) {
      console.log('[FAQ API] MongoDB not connected, returning empty array');
      return res.json({ faqs: [], success: true });
    }

    const article = await Article.findOne({ slug }).select('faq').lean();
    
    if (!article) {
      console.log(`[FAQ API] Article not found: ${slug}`);
      return res.json({ faqs: [], success: true });
    }

    const faqs = Array.isArray(article.faq) ? article.faq : [];
    console.log(`[FAQ API] Found ${faqs.length} FAQs for: ${slug}`);
    res.json({ faqs, success: true });
  } catch (error) {
    console.error('[FAQ API] Error getting FAQs:', error.message);
    res.status(500).json({ error: 'Internal server error', success: false });
  }
});

app.post('/api/articles/:slug/faqs/refresh', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`[FAQ API] Refreshing FAQs for article: ${slug}`);
    
    if (!isMongoConnected() || !Article) {
      console.log('[FAQ API] MongoDB not connected');
      return res.status(503).json({ error: 'Database not available', success: false });
    }

    const article = await Article.findOne({ slug }).lean();
    
    if (!article) {
      console.log(`[FAQ API] Article not found: ${slug}`);
      return res.status(404).json({ error: 'Article not found', success: false });
    }

    const articleTitle = article.title || article.metaTitle || 'Article';
    const articleContent = article.expandedContent || article.content || '';
    
    const prompt = `Based on the following article, generate 3-5 frequently asked questions (FAQs) with detailed answers. Return ONLY a valid JSON array of objects with "question" and "answer" fields.

Article Title: ${articleTitle}

Article Content:
${articleContent.substring(0, 3000)}

Return format (JSON array only, no markdown):
[{"question": "...", "answer": "..."}]`;

    console.log(`[FAQ API] Calling AI to generate FAQs for: ${slug}`);
    
    const { GoogleGenAI } = require('@google/genai');
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('[FAQ API] AI API key not configured');
      return res.status(500).json({ error: 'AI API key not configured', success: false });
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    });

    let faqs = [];
    try {
      const responseText = aiResponse.text || '';
      let jsonStr = responseText;
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      jsonStr = jsonStr.trim();
      faqs = JSON.parse(jsonStr);
      
      if (!Array.isArray(faqs)) {
        throw new Error('AI response is not an array');
      }
      
      faqs = faqs.filter(faq => faq.question && faq.answer).slice(0, 5);
    } catch (parseError) {
      console.error('[FAQ API] Failed to parse AI response:', parseError.message);
      return res.status(500).json({ error: 'Failed to parse AI response', success: false });
    }

    await Article.findOneAndUpdate(
      { slug },
      { $set: { faq: faqs, updatedAt: new Date() } }
    );

    logActivity('faq_gen', slug);
    console.log(`[FAQ API] Generated ${faqs.length} FAQs for: ${slug}`);
    res.json({ faqs, success: true });
  } catch (error) {
    console.error('[FAQ API] Error refreshing FAQs:', error.message);
    res.status(500).json({ error: 'Internal server error', success: false });
  }
});

app.post('/api/articles', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!isMongoConnected() || !Article) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const articleData = req.body;
    
    if (!articleData.slug) {
      articleData.slug = articleData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const article = new Article(articleData);
    await article.save();

    logActivity('article_gen', article.slug);
    console.log(`[Articles API] Created article: ${article.slug}`);
    res.status(201).json(article);
  } catch (error) {
    console.error('[Articles API] Create error:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Article with this slug already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/articles/:slug', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!isMongoConnected() || !Article) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { slug } = req.params;
    const updates = req.body;
    
    const article = await Article.findOneAndUpdate(
      { slug },
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    );

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    console.log(`[Articles API] Updated article: ${slug}`);
    res.json(article);
  } catch (error) {
    console.error('[Articles API] Update error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/articles/:slug', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!isMongoConnected() || !Article) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { slug } = req.params;
    
    const result = await Article.findOneAndDelete({ slug });

    if (!result) {
      return res.status(404).json({ error: 'Article not found' });
    }

    console.log(`[Articles API] Deleted article: ${slug}`);
    res.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    console.error('[Articles API] Delete error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// CATEGORIES API (MongoDB-backed)
// =============================================
app.get('/api/categories', async (req, res) => {
  try {
    if (!isMongoConnected() || !Category) {
      // Return default categories if MongoDB not connected
      return res.json({
        categories: [
          { name: 'Technology', slug: 'technology', articleCount: 0 },
          { name: 'AI', slug: 'ai', articleCount: 0 },
          { name: 'Business', slug: 'business', articleCount: 0 },
          { name: 'Science', slug: 'science', articleCount: 0 },
          { name: 'Entertainment', slug: 'entertainment', articleCount: 0 },
          { name: 'Product', slug: 'product', articleCount: 0 },
          { name: 'Global', slug: 'global', articleCount: 0 },
          { name: 'India', slug: 'india', articleCount: 0 },
          { name: 'US', slug: 'us', articleCount: 0 }
        ]
      });
    }

    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();

    res.json({ categories });
  } catch (error) {
    console.error('[Categories API] Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/categories/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;

    if (!isMongoConnected() || !Article) {
      return res.json({ 
        category: { name: slug, slug }, 
        articles: [], 
        total: 0,
        page: 1,
        pages: 0
      });
    }

    // Find articles for this category
    const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [articles, total] = await Promise.all([
      Article.find({ 
        category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
        status: 'published' 
      })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Article.countDocuments({ 
        category: { $regex: new RegExp(`^${categoryName}$`, 'i') },
        status: 'published' 
      })
    ]);

    res.json({
      category: { name: categoryName, slug },
      articles,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('[Categories API] Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/categories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!isMongoConnected() || !Category) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const categoryData = req.body;
    
    if (!categoryData.slug) {
      categoryData.slug = categoryData.name.toLowerCase().replace(/\s+/g, '-');
    }

    const category = new Category(categoryData);
    await category.save();

    console.log(`[Categories API] Created category: ${category.name}`);
    res.status(201).json(category);
  } catch (error) {
    console.error('[Categories API] Create error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// ADS API (MongoDB-backed)
// =============================================
app.get('/api/ads', async (req, res) => {
  try {
    const { placement, status } = req.query;

    if (!isMongoConnected() || !Ad) {
      return res.json({ ads: [], message: 'Database not connected' });
    }

    const query = {};
    if (placement) query.placement = placement;
    if (status) query.status = status;

    const ads = await Ad.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    res.json({ ads });
  } catch (error) {
    console.error('[Ads API] Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/ads/placement/:placement', async (req, res) => {
  try {
    const { placement } = req.params;

    if (!isMongoConnected() || !Ad) {
      return res.json({ ads: [] });
    }

    const ads = await Ad.getActiveAdsByPlacement(placement);
    res.json({ ads });
  } catch (error) {
    console.error('[Ads API] Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ads', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!isMongoConnected() || !Ad) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const adData = req.body;
    const ad = new Ad(adData);
    await ad.save();

    console.log(`[Ads API] Created ad: ${ad.title}`);
    res.status(201).json(ad);
  } catch (error) {
    console.error('[Ads API] Create error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/ads/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!isMongoConnected() || !Ad) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const updates = req.body;

    const ad = await Ad.findByIdAndUpdate(
      id,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    console.log(`[Ads API] Updated ad: ${ad.title}`);
    res.json(ad);
  } catch (error) {
    console.error('[Ads API] Update error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/ads/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!isMongoConnected() || !Ad) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { id } = req.params;
    const result = await Ad.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    console.log(`[Ads API] Deleted ad: ${result.title}`);
    res.json({ success: true, message: 'Ad deleted' });
  } catch (error) {
    console.error('[Ads API] Delete error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/ads/:id/impression', async (req, res) => {
  try {
    if (!isMongoConnected() || !Ad) {
      return res.json({ success: true });
    }

    const { id } = req.params;
    await Ad.findByIdAndUpdate(id, { $inc: { impressions: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: true }); // Don't fail on tracking errors
  }
});

app.post('/api/ads/:id/click', async (req, res) => {
  try {
    if (!isMongoConnected() || !Ad) {
      return res.json({ success: true });
    }

    const { id } = req.params;
    await Ad.findByIdAndUpdate(id, { $inc: { clicks: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.json({ success: true }); // Don't fail on tracking errors
  }
});

// =============================================
// AUTHENTICATION API
// =============================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Simple fallback auth if MongoDB not connected
    if (!isMongoConnected() || !User) {
      // Fallback: hardcoded admin for development
      if (email === 'admin@futuretechjournal.com' && password === 'admin123') {
        logActivity('login', 'Admin (fallback)');
        return res.json({
          token: 'admin-token',
          user: {
            email: 'admin@futuretechjournal.com',
            name: 'Admin',
            role: 'admin'
          }
        });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = await User.findByEmail(email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await user.comparePassword(password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logActivity('login', user.email);
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('[Auth API] Login error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

app.post('/api/auth/register', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!isMongoConnected() || !User) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { email, password, name, role = 'user' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const user = new User({ email, password, name, role });
    await user.save();

    console.log(`[Auth API] Created user: ${email}`);
    res.status(201).json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('[Auth API] Register error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// DATABASE STATUS
// =============================================
app.get('/api/db/status', (req, res) => {
  res.json({
    connected: isMongoConnected(),
    status: dbConnection ? dbConnection.readyState : 0,
    statusText: dbConnection ? 
      ['disconnected', 'connected', 'connecting', 'disconnecting'][dbConnection.readyState] : 
      'not initialized'
  });
});

// =============================================
// ARTICLE AUTO-CLEANUP SYSTEM
// =============================================
// 48 hours in milliseconds
const ARTICLE_EXPIRY_MS = 48 * 60 * 60 * 1000;

/**
 * Cleanup function to delete articles older than 48 hours
 * Only affects the Articles collection - does NOT touch:
 * - Categories
 * - Ads
 * - Users/Admin
 * - AI config
 * - SEO metadata
 * - Sitemap cache
 * - Logs
 */
async function cleanupOldArticles() {
  try {
    if (!isMongoConnected() || !Article) {
      console.log('[Article Cleanup] MongoDB not connected - skipping cleanup');
      return { success: false, message: 'Database not connected', deletedCount: 0 };
    }

    const cutoffDate = new Date(Date.now() - ARTICLE_EXPIRY_MS);
    
    console.log(`[Article Cleanup] Running cleanup for articles older than: ${cutoffDate.toISOString()}`);
    
    // Delete only articles where createdAt is older than 48 hours
    const result = await Article.deleteMany({ 
      createdAt: { $lt: cutoffDate } 
    });

    const deletedCount = result.deletedCount || 0;
    
    if (deletedCount > 0) {
      console.log(`[Article Cleanup] Successfully deleted ${deletedCount} old articles`);
    } else {
      console.log('[Article Cleanup] No articles older than 48 hours found');
    }

    return { 
      success: true, 
      message: `Cleanup completed successfully`,
      deletedCount,
      cutoffDate: cutoffDate.toISOString()
    };
  } catch (error) {
    console.error('[Article Cleanup] Error during cleanup:', error.message);
    return { 
      success: false, 
      message: 'Cleanup failed', 
      error: error.message,
      deletedCount: 0 
    };
  }
}

// Cron cleanup endpoint - can be called by external schedulers (Hostinger, Netlify, etc.)
app.get('/api/cron/cleanup', async (req, res) => {
  try {
    console.log('[Article Cleanup] Cron endpoint triggered');
    
    const result = await cleanupOldArticles();
    
    // Return simple success response without exposing sensitive details
    res.json({
      success: result.success,
      message: result.success ? 'Cleanup completed' : 'Cleanup skipped',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Article Cleanup] Cron endpoint error:', error.message);
    // Return success even on error to prevent external schedulers from retrying
    res.json({ 
      success: false, 
      message: 'Cleanup encountered an issue',
      timestamp: new Date().toISOString()
    });
  }
});

// POST endpoint for manual cleanup (admin only)
app.post('/api/cron/cleanup', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('[Article Cleanup] Manual cleanup triggered by admin');
    
    const result = await cleanupOldArticles();
    
    res.json({
      success: result.success,
      message: result.message,
      deletedCount: result.deletedCount,
      cutoffDate: result.cutoffDate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Article Cleanup] Manual cleanup error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Cleanup failed',
      error: error.message 
    });
  }
});

// Automatic cleanup scheduler - runs every 24 hours
let cleanupInterval = null;
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

function startCleanupScheduler() {
  // Run initial cleanup after 1 minute of server start (give time for DB connection)
  setTimeout(async () => {
    console.log('[Article Cleanup] Running initial cleanup check...');
    await cleanupOldArticles();
  }, 60 * 1000);

  // Schedule recurring cleanup every 24 hours
  cleanupInterval = setInterval(async () => {
    console.log('[Article Cleanup] Scheduled cleanup running...');
    await cleanupOldArticles();
  }, CLEANUP_INTERVAL_MS);

  console.log('[Article Cleanup] Scheduler started - will run every 24 hours');
}

// Stop cleanup scheduler on shutdown
function stopCleanupScheduler() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('[Article Cleanup] Scheduler stopped');
  }
}

// =============================================
// ADMIN RSS INGESTION API (Backend AI Expansion)
// =============================================
let rssIngestionStatus = {
  isRunning: false,
  lastRun: null,
  lastResult: null
};

app.post('/api/admin/rss-ingest', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (rssIngestionStatus.isRunning) {
      return res.status(409).json({ 
        error: 'RSS ingestion already in progress', 
        status: rssIngestionStatus 
      });
    }

    const { maxArticles = 10, categories = null, skipExisting = true } = req.body;

    console.log(`[RSS Ingest API] Starting ingestion: maxArticles=${maxArticles}, categories=${categories ? categories.join(',') : 'all'}`);
    
    rssIngestionStatus.isRunning = true;
    rssIngestionStatus.lastRun = new Date().toISOString();

    const result = await processAndSaveArticles(Article, expandedArticlesCache, saveExpandedArticles, {
      maxArticles,
      categories,
      skipExisting
    });

    rssIngestionStatus.isRunning = false;
    rssIngestionStatus.lastResult = result;

    console.log(`[RSS Ingest API] Completed: ${result.articlesProcessed} processed, ${result.skipped} skipped, ${result.failed} failed`);

    res.json({
      success: result.success,
      message: `Processed ${result.articlesProcessed} articles`,
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    rssIngestionStatus.isRunning = false;
    rssIngestionStatus.lastResult = { success: false, error: error.message };
    console.error('[RSS Ingest API] Error:', error.message);
    res.status(500).json({ error: error.message, success: false });
  }
});

app.get('/api/admin/rss-ingest/status', authenticateToken, async (req, res) => {
  try {
    res.json({
      ...rssIngestionStatus,
      availableCategories: Object.keys(feedMap),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/rss-preview', authenticateToken, async (req, res) => {
  try {
    console.log('[RSS Preview API] Fetching RSS feeds for preview...');
    const articles = await fetchRssFeeds();
    
    const preview = articles.slice(0, 50).map(a => ({
      slug: a.slug,
      title: a.title.substring(0, 100),
      category: a.category,
      date: a.date
    }));

    res.json({
      success: true,
      totalFetched: articles.length,
      preview,
      categories: Object.keys(feedMap)
    });
  } catch (error) {
    console.error('[RSS Preview API] Error:', error.message);
    res.status(500).json({ error: error.message, success: false });
  }
});

// =============================================
// ADMIN DASHBOARD ANALYTICS API
// =============================================

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let articlesToday = 0;
    let totalReads = 0;
    let aiCreditsUsed = 0;
    let pendingReviews = 0;
    
    if (isMongoConnected() && Analytics && AIUsage && Article) {
      // Get today's analytics from MongoDB
      const analytics = await Analytics.findOne({ date: today }).lean();
      if (analytics) {
        articlesToday = analytics.articlesToday || 0;
        totalReads = analytics.totalReads || 0;
        aiCreditsUsed = analytics.aiCreditsUsed || 0;
        pendingReviews = analytics.pendingReviews || 0;
      }
      
      // If no analytics record, count articles created today
      if (!analytics && Article) {
        articlesToday = await Article.countDocuments({
          createdAt: { $gte: today }
        });
      }
      
      // Get AI credits used in last 24h
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const aiUsageData = await AIUsage.aggregate([
        { $match: { timestamp: { $gte: yesterday } } },
        { $group: { _id: null, total: { $sum: '$tokensUsed' } } }
      ]);
      if (aiUsageData.length > 0) {
        aiCreditsUsed = Math.round(aiUsageData[0].total / 1000);
      }
    }
    
    res.json({
      stats: [
        { label: 'Articles Today', value: String(articlesToday), trend: 'today', color: 'text-cyan-400', border: 'border-cyan-500/30' },
        { label: 'AI Credits Used', value: `${aiCreditsUsed}K`, trend: '24h', color: 'text-purple-400', border: 'border-purple-500/30' },
        { label: 'Total Reads', value: String(totalReads), trend: 'all time', color: 'text-green-400', border: 'border-green-500/30' },
        { label: 'Pending Reviews', value: String(pendingReviews), trend: 'queue', color: 'text-yellow-400', border: 'border-yellow-500/30' },
      ],
      systemStatus: {
        api: 'Operational',
        db: isMongoConnected() ? 'Connected' : 'File Storage',
        latency: Math.floor(Math.random() * 50) + 20
      }
    });
  } catch (error) {
    console.error('[Admin Stats] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/ai-usage', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const chartData = [40, 65, 45, 80, 55, 90, 75];
    
    if (isMongoConnected() && AIUsage) {
      const now = new Date();
      
      for (let i = 0; i < 7; i++) {
        const targetDate = new Date(now);
        targetDate.setDate(now.getDate() - (6 - i));
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(targetDate.getDate() + 1);
        
        const usage = await AIUsage.aggregate([
          { $match: { timestamp: { $gte: targetDate, $lt: nextDay } } },
          { $group: { _id: null, total: { $sum: '$tokensUsed' } } }
        ]);
        
        if (usage.length > 0) {
          chartData[i] = Math.min(Math.round(usage[0].total / 10000), 100);
        } else {
          chartData[i] = Math.floor(Math.random() * 30) + 10;
        }
      }
    }
    
    res.json({ chartData });
  } catch (error) {
    console.error('[Admin AI Usage] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    let logs = [];
    
    if (isMongoConnected() && Log) {
      const rawLogs = await Log.find()
        .sort({ timestamp: -1 })
        .limit(20)
        .lean();
      
      logs = rawLogs.map(log => {
        const now = new Date();
        const diff = now - new Date(log.timestamp);
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        
        let timeAgo;
        if (days > 0) timeAgo = `${days}d`;
        else if (hours > 0) timeAgo = `${hours}h`;
        else if (mins > 0) timeAgo = `${mins}m`;
        else timeAgo = 'now';
        
        const colorMap = {
          article_gen: 'green',
          seo_update: 'blue',
          ai_gen: 'purple',
          login: 'yellow',
          expand: 'cyan',
          faq_gen: 'pink'
        };
        
        const labelMap = {
          article_gen: 'Article Gen',
          seo_update: 'SEO Update',
          ai_gen: 'AI Gen',
          login: 'Login',
          expand: 'Expand',
          faq_gen: 'FAQ Gen'
        };
        
        return {
          type: log.type,
          label: labelMap[log.type] || log.type,
          color: colorMap[log.type] || 'gray',
          timeAgo,
          details: log.details
        };
      });
    }
    
    if (logs.length === 0) {
      logs = [
        { type: 'article_gen', label: 'Article Gen', color: 'green', timeAgo: '2m', details: '' },
        { type: 'seo_update', label: 'SEO Update', color: 'blue', timeAgo: '1h', details: '' },
        { type: 'ai_gen', label: 'AI Gen', color: 'purple', timeAgo: '3h', details: '' },
        { type: 'login', label: 'Login (Admin)', color: 'yellow', timeAgo: '5h', details: '' },
      ];
    }
    
    res.json({ logs });
  } catch (error) {
    console.error('[Admin Logs] Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

async function logActivity(type, details = '') {
  try {
    if (isMongoConnected() && Log) {
      await Log.create({
        type,
        details,
        timestamp: new Date()
      });
    }
  } catch (error) {
    console.error('[Log Activity] Error:', error.message);
  }
}

// =============================================
// SERVER STARTUP
// =============================================
async function startServer() {
  // Initialize MongoDB connection
  await initializeMongoDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Backend Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Backend Server] API Key available: ${!!(process.env.GOOGLE_AI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY)}`);
    console.log(`[Backend Server] Pixabay Key available: ${!!process.env.PIXABAY_API_KEY}`);
    console.log(`[Backend Server] Mailchimp Key available: ${!!process.env.MAILCHIMP_API_KEY}`);
    console.log(`[Backend Server] MongoDB connected: ${isMongoConnected()}`);
    console.log(`[Backend Server] Expanded articles cached: ${Object.keys(expandedArticlesCache).length}`);
    
    // Start the article cleanup scheduler
    startCleanupScheduler();
  });
}

startServer().catch(error => {
  console.error('[Server] Failed to start:', error);
  process.exit(1);
});
