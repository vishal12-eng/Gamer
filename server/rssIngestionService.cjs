const { GoogleGenAI } = require('@google/genai');

const RSS2JSON_API_URL = 'https://api.rss2json.com/v1/api.json?rss_url=';

const feedMap = {
  Technology: [
    'https://www.theverge.com/rss/index.xml',
    'https://techcrunch.com/feed/',
    'https://news.ycombinator.com/rss'
  ],
  AI: [
    'https://www.artificialintelligence-news.com/feed/',
    'https://openai.com/blog/rss.xml',
    'https://www.theverge.com/rss/index.xml'
  ],
  Product: [
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://feeds.macrumors.com/MacRumors-Front'
  ],
  Business: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://feeds.bloomberg.com/markets/fixed-income.rss'
  ],
  Global: [
    'https://www.aljazeera.com/xml/rss/all.xml',
    'http://feeds.bbci.co.uk/news/world/rss.xml'
  ],
  Entertainment: [
    'https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml',
    'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms'
  ],
  Science: [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://phys.org/rss-feed/'
  ],
  India: [
    'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
    'https://www.thehindu.com/news/national/feeder/default.rss'
  ],
  US: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://feeds.apnews.com/apnews/rss/news'
  ]
};

const CATEGORY_ROUTES = {
  'Technology': '/category/technology',
  'AI': '/category/ai',
  'Business': '/category/business',
  'Science': '/category/science',
  'Entertainment': '/category/entertainment',
  'Product': '/category/product',
  'Global': '/category/global',
  'India': '/category/india',
  'US': '/category/us'
};

async function fetchRssFeeds() {
  console.log('[RSS Ingestion] Starting RSS fetch...');
  const allArticles = [];
  const categoryStats = {};

  for (const [category, urls] of Object.entries(feedMap)) {
    categoryStats[category] = 0;

    for (const url of urls) {
      try {
        const response = await fetch(`${RSS2JSON_API_URL}${encodeURIComponent(url)}`);
        if (!response.ok) {
          console.warn(`[RSS Ingestion] ${category} feed (${url}): HTTP ${response.status}`);
          continue;
        }

        const data = await response.json();
        if (data.status !== 'ok' || !data.items) {
          console.warn(`[RSS Ingestion] ${category} feed (${url}): No items`);
          continue;
        }

        for (const item of data.items) {
          const slug = (item.title + (item.pubDate || ''))
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

          let imageUrl = '';
          if (item.thumbnail) imageUrl = item.thumbnail;
          if (!imageUrl && item.enclosure?.link && item.enclosure.type?.startsWith('image')) {
            imageUrl = item.enclosure.link;
          }
          if (!imageUrl) {
            imageUrl = `https://picsum.photos/seed/${encodeURIComponent(item.title.slice(0, 20))}/800/450`;
          }

          allArticles.push({
            slug,
            title: item.title || 'Untitled',
            summary: (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
            content: item.content || item.description || '',
            author: item.author || 'Editorial Team',
            date: item.pubDate || new Date().toISOString(),
            category,
            tags: [category, ...(item.categories || [])].filter((v, i, a) => a.indexOf(v) === i && v),
            imageUrl,
            sourceUrl: item.link || '',
            sourceName: data.feed?.title || 'RSS Feed'
          });

          categoryStats[category]++;
        }

        console.log(`[RSS Ingestion] ${category} feed (${url}): ${data.items.length} items`);
      } catch (error) {
        console.error(`[RSS Ingestion] Error fetching ${url}:`, error.message);
      }
    }
  }

  console.log(`[RSS Ingestion] Category Summary: ${Object.entries(categoryStats).map(([cat, count]) => `${cat}: ${count}`).join(', ')}`);
  console.log(`[RSS Ingestion] Total fetched: ${allArticles.length} articles`);

  return allArticles;
}

async function expandArticleWithAI(article, apiKey) {
  const prompt = `You are an expert SEO content strategist and senior editor for "FutureTechJournal", a leading technology news publication.

TASK: Transform this article into comprehensive, SEO-optimized long-form content following STRICT SEO rules.

INPUT:
- Title: ${article.title}
- Category: ${article.category}
- Original Content: ${article.content.substring(0, 5000)}

====================================================
ARTICLE OPTIMIZATION RULES (MANDATORY)
====================================================
1. Word Count: Generate 1000-1500+ words of substantive content
2. Keyword Intent: Include the primary keyword clearly in the FIRST 2 paragraphs
3. Derive 5-8 low-competition related keywords from the title and category
4. Use long-tail keywords and semantic phrases throughout naturally
5. Ensure readability stays natural - NO keyword stuffing

====================================================
HIERARCHICAL HEADING STRUCTURE (EXACT FORMAT)
====================================================
Generate content following this EXACT hierarchy:

- Title is H1 (provided separately, do NOT include in content)
- Use 2-4 H2 headings for major sections
- Each H2 MUST have at least 1 H3 subheading
- H4 only when needed for deeper explanation
- NEVER skip heading levels (no H4 before H3)
- NO decorative headings

====================================================
ON-PAGE SEO REQUIREMENTS
====================================================
For the JSON output, include:
- metaTitle: SEO-optimized title (50-60 chars, include focus keyword)
- metaDescription: Compelling description (150-160 chars, include focus keyword, call-to-action)
- focusKeyword: Primary keyword phrase (2-4 words)
- keywords: Array of 5-8 LSI/related keywords

====================================================
CONTENT STRUCTURE & FLOW (MANDATORY)
====================================================
The article MUST follow this structure:

1. Introduction paragraph (hook reader, state value proposition, include focus keyword)
2. H2 Section (Background/Context) with H3 Sub-sections
3. H2 Section (Key Points/Main Content) with bullet lists
4. H2 Section (Analysis/Implications) with expert perspective
5. Key Points/Bullet List Section
6. Mini FAQ Section (2-4 Q&As)
7. Conclusion

====================================================
PREVENT SEO PROBLEMS (STRICTLY AVOID)
====================================================
- No duplicate sentences or paragraphs
- No keyword stuffing (max 2-3% keyword density)
- No AI-sounding generic phrases like "In today's fast-paced world"
- No filler text or padding
- No hallucinated facts, statistics, or quotes
- Use phrases like "according to reports" or "industry analysts suggest" for context

====================================================
OUTPUT FORMAT (CRITICAL)
====================================================
Return a VALID JSON object with this EXACT structure:

{
  "title": "Original title unchanged",
  "metaTitle": "SEO title under 60 chars with focus keyword",
  "metaDescription": "Compelling meta description 150-160 chars with focus keyword and CTA",
  "focusKeyword": "primary keyword phrase",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "contentHtml": "<p>Introduction...</p><h2>Section...</h2><p>Content...</p><h3>Subsection...</h3>...",
  "internalLinks": [
    {"text": "anchor text", "url": "/category/technology", "category": "Technology"}
  ],
  "externalLinks": [
    {"text": "anchor text", "url": "https://example.com/article", "source": "Source Name"}
  ],
  "imageAltTexts": ["SEO-optimized alt text describing the image with keywords"],
  "faq": [
    {"question": "Common question about the topic?", "answer": "Concise, helpful answer."}
  ]
}

Generate the SEO-optimized article now in valid JSON format:`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (!response.text) {
      return { success: false, error: 'No content generated' };
    }

    let responseText = response.text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'Invalid response format - no JSON found' };
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const contentHtml = parsed.contentHtml || '';

    if (!contentHtml || contentHtml.length < 500) {
      return { success: false, error: 'Generated content is too short' };
    }

    const textContent = contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

    const hasH2 = /<h2[^>]*>/i.test(contentHtml);
    if (!hasH2) {
      return { success: false, error: 'Content missing required H2 structure' };
    }

    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim());
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 15;
    const readabilityScore = Math.max(6, Math.min(9, Math.round(12 - avgWordsPerSentence / 2)));

    return {
      success: true,
      expandedContent: contentHtml,
      wordCount,
      readabilityScore,
      metaTitle: parsed.metaTitle || article.title.slice(0, 55),
      metaDescription: parsed.metaDescription || `Discover the latest ${article.category.toLowerCase()} news: ${article.title.slice(0, 100)}. Read more on FutureTechJournal.`,
      focusKeyword: parsed.focusKeyword || article.title.toLowerCase().split(' ').slice(0, 3).join(' '),
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      internalLinks: (parsed.internalLinks || []).map(link => ({
        text: link.text || '',
        url: link.url || CATEGORY_ROUTES[link.category] || '/category/technology',
        category: link.category || 'Technology'
      })),
      externalLinks: (parsed.externalLinks || []).map(link => ({
        text: link.text || '',
        url: link.url || '#',
        source: link.source || 'External Source'
      })),
      imageAltTexts: parsed.imageAltTexts || [`${parsed.focusKeyword || article.title} - ${article.category} article image`],
      faq: (parsed.faq || []).filter(item => item.question && item.answer).slice(0, 5)
    };
  } catch (error) {
    console.error(`[RSS Ingestion] AI expansion error for ${article.slug}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function processAndSaveArticles(Article, expandedArticlesCache, saveExpandedArticles, options = {}) {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('[RSS Ingestion] ERROR: No AI API key configured');
    return { success: false, error: 'No AI API key', articlesProcessed: 0 };
  }

  const {
    maxArticles = 10,
    skipExisting = true,
    categories = null
  } = options;

  console.log('[RSS Ingestion] Fetching RSS feeds...');
  const rssArticles = await fetchRssFeeds();

  if (rssArticles.length === 0) {
    console.log('[RSS Ingestion] No articles fetched from RSS');
    return { success: true, articlesProcessed: 0, skipped: 0 };
  }

  let filteredArticles = rssArticles;
  if (categories && categories.length > 0) {
    filteredArticles = rssArticles.filter(a => categories.includes(a.category));
  }

  filteredArticles = filteredArticles.slice(0, maxArticles);
  console.log(`[RSS Ingestion] Processing ${filteredArticles.length} articles (max: ${maxArticles})`);

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const article of filteredArticles) {
    console.log(`[RSS Ingestion] Processing: "${article.title.substring(0, 50)}..."`);

    if (skipExisting) {
      let alreadyExpanded = false;

      if (Article) {
        try {
          const existing = await Article.findOne({ slug: article.slug }).select('isExpanded expandedContent').lean();
          if (existing && (existing.isExpanded || (existing.expandedContent && existing.expandedContent.length > 500))) {
            console.log(`[RSS Ingestion] SKIPPED (already expanded in DB): ${article.slug}`);
            alreadyExpanded = true;
          }
        } catch (e) {
          console.warn(`[RSS Ingestion] DB check failed for ${article.slug}:`, e.message);
        }
      }

      if (!alreadyExpanded && expandedArticlesCache && expandedArticlesCache[article.slug]) {
        const cached = expandedArticlesCache[article.slug];
        if (cached.isExpanded || (cached.expandedContent && cached.expandedContent.length > 500)) {
          console.log(`[RSS Ingestion] SKIPPED (already expanded in cache): ${article.slug}`);
          alreadyExpanded = true;
        }
      }

      if (alreadyExpanded) {
        skipped++;
        continue;
      }
    }

    console.log(`[RSS Ingestion] Expanding article: ${article.slug}`);
    const expansion = await expandArticleWithAI(article, apiKey);

    if (!expansion.success) {
      console.error(`[RSS Ingestion] FAILED to expand: ${article.slug} - ${expansion.error}`);
      failed++;
      continue;
    }

    console.log(`[RSS Ingestion] Expansion SUCCESS: ${article.slug} (${expansion.wordCount} words)`);

    const articleData = {
      slug: article.slug,
      title: article.title,
      summary: article.summary,
      content: article.content.substring(0, 1000),
      expandedContent: expansion.expandedContent,
      category: article.category,
      tags: article.tags,
      author: article.author,
      imageUrl: article.imageUrl,
      source: {
        url: article.sourceUrl,
        name: article.sourceName
      },
      metaTitle: expansion.metaTitle,
      metaDescription: expansion.metaDescription,
      focusKeyword: expansion.focusKeyword,
      keywords: expansion.keywords,
      internalLinks: expansion.internalLinks,
      externalLinks: expansion.externalLinks,
      imageAltTexts: expansion.imageAltTexts,
      faq: expansion.faq,
      wordCount: expansion.wordCount,
      readabilityScore: expansion.readabilityScore,
      isExpanded: true,
      isAutoGenerated: true,
      publishedAt: new Date(article.date),
      status: 'published'
    };

    if (Article) {
      try {
        await Article.findOneAndUpdate(
          { slug: article.slug },
          { $set: articleData },
          { upsert: true, new: true }
        );
        console.log(`[RSS Ingestion] Saved to MongoDB: ${article.slug}`);
      } catch (e) {
        console.error(`[RSS Ingestion] MongoDB save failed for ${article.slug}:`, e.message);
      }
    }

    if (expandedArticlesCache && typeof saveExpandedArticles === 'function') {
      expandedArticlesCache[article.slug] = {
        ...articleData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveExpandedArticles(expandedArticlesCache);
      console.log(`[RSS Ingestion] Saved to file cache: ${article.slug}`);
    }

    processed++;

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`[RSS Ingestion] COMPLETE: ${processed} processed, ${skipped} skipped, ${failed} failed`);

  return {
    success: true,
    articlesProcessed: processed,
    skipped,
    failed,
    total: filteredArticles.length
  };
}

module.exports = {
  fetchRssFeeds,
  expandArticleWithAI,
  processAndSaveArticles,
  feedMap
};
