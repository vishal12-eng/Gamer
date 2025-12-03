const AI_ENDPOINT = "/api/aiHandler";

export interface SEOArticleMetadata {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
}

export interface InternalLink {
  text: string;
  url: string;
  category: string;
}

export interface ExternalLink {
  text: string;
  url: string;
  source: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ExpandedArticleResult {
  expandedContent: string;
  wordCount: number;
  readabilityScore: number;
  success: boolean;
  error?: string;
  
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
  internalLinks: InternalLink[];
  externalLinks: ExternalLink[];
  imageAltTexts: string[];
  faq: FAQItem[];
}

const callAi = async (action: string, payload: any) => {
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMsg = `Server error: ${response.status}`;
      try {
        const json = JSON.parse(text);
        errorMsg = json.error || json.details || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error(`AI Expansion Error:`, error);
    throw error;
  }
};

const CATEGORY_ROUTES: Record<string, string> = {
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

export const expandArticleWithSEO = async (
  title: string,
  originalContent: string,
  category: string
): Promise<ExpandedArticleResult> => {
  const prompt = `You are an expert SEO content strategist and senior editor for "FutureTechJournal", a leading technology news publication.

TASK: Transform this article into comprehensive, SEO-optimized long-form content following STRICT SEO rules.

INPUT:
- Title: ${title}
- Category: ${category}
- Original Content: ${originalContent.substring(0, 5000)}

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

Structure pattern:
H2 = Main Section
  → Paragraph
  H3 = Sub-section
    → Paragraph
    H4 = Deep detail (only if truly needed)
      → Paragraph

====================================================
ON-PAGE SEO REQUIREMENTS
====================================================
For the JSON output, include:
- metaTitle: SEO-optimized title (50-60 chars, include focus keyword)
- metaDescription: Compelling description (150-160 chars, include focus keyword, call-to-action)
- focusKeyword: Primary keyword phrase (2-4 words)
- keywords: Array of 5-8 LSI/related keywords

Keyword placement in content:
- Focus keyword in first paragraph
- Focus keyword in at least one H2
- Focus keyword or variant in at least one H3

====================================================
CONTENT STRUCTURE & FLOW (MANDATORY)
====================================================
The article MUST follow this structure:

1. Introduction paragraph (hook reader, state value proposition, include focus keyword)

2. H2 Section (Background/Context)
   → Informative paragraph
   → H3 Sub-section (specific detail)
   → Paragraph with supporting information

3. H2 Section (Key Points/Main Content)
   → Paragraph introducing the points
   → H3 Sub-section with details
   → <ul> or <ol> with key bullet points

4. H2 Section (Analysis/Implications)
   → Analytical paragraph
   → H3 Sub-section (specific insight)
   → Paragraph with expert perspective

5. Key Points/Bullet List Section
   → Use <ul><li> format for scannable takeaways

6. Mini FAQ Section (2-4 Q&As)
   → Address common questions about the topic
   → Provide concise, helpful answers

7. Conclusion
   → Summary of key points
   → Forward-looking statement or call-to-action

====================================================
PREVENT SEO PROBLEMS (STRICTLY AVOID)
====================================================
- No duplicate sentences or paragraphs
- No keyword stuffing (max 2-3% keyword density)
- No AI-sounding generic phrases like "In today's fast-paced world"
- No filler text or padding
- No hallucinated facts, statistics, or quotes
- No over-optimized unnatural keyword placement
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
    {"text": "anchor text", "url": "/category/technology", "category": "Technology"},
    {"text": "anchor text", "url": "/category/ai", "category": "AI"}
  ],
  "externalLinks": [
    {"text": "anchor text", "url": "https://example.com/article", "source": "Source Name"}
  ],
  "imageAltTexts": ["SEO-optimized alt text describing the image with keywords"],
  "faq": [
    {"question": "Common question about the topic?", "answer": "Concise, helpful answer."},
    {"question": "Another relevant question?", "answer": "Clear answer with value."}
  ]
}

IMPORTANT NOTES FOR contentHtml:
- Start with <p> for introduction, NOT <h1>
- Use proper HTML tags: <h2>, <h3>, <h4>, <p>, <ul>, <ol>, <li>, <blockquote>, <strong>, <em>
- All content must be properly nested and valid HTML
- Include blockquote for expert quotes (attributed to "industry analysts" or "experts")
- Use <strong> for emphasis on key terms

IMPORTANT FOR LINKS:
- internalLinks: Suggest 2-3 links to related categories on the site
- externalLinks: Suggest 1-2 authoritative external sources (use placeholder URLs like https://example.com/topic)

Generate the SEO-optimized article now in valid JSON format:`;

  try {
    const result = await callAi("generateContent", {
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (!result.text) {
      return createErrorResult("No content generated");
    }

    let responseText = result.text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/g, '')
      .trim();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('[ArticleExpansion] Failed to find JSON in response');
      return createErrorResult("Invalid response format - no JSON found");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('[ArticleExpansion] JSON parse error:', parseError);
      return createErrorResult("Failed to parse AI response as JSON");
    }

    const contentHtml = parsedResult.contentHtml || '';
    
    if (!contentHtml || contentHtml.length < 500) {
      console.error('[ArticleExpansion] Content too short:', contentHtml.length);
      return createErrorResult("Generated content is too short");
    }

    const textContent = contentHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(/\s+/).filter((w: string) => w.length > 0).length;

    const hasH2 = /<h2[^>]*>/i.test(contentHtml);
    const hasH3 = /<h3[^>]*>/i.test(contentHtml);
    const hasParagraphs = /<p[^>]*>/i.test(contentHtml);
    const hasList = /<(ul|ol)[^>]*>/i.test(contentHtml);

    if (!hasH2 || !hasParagraphs) {
      console.warn(`[ArticleExpansion] Structure validation warning: hasH2=${hasH2}, hasH3=${hasH3}, hasList=${hasList}`);
    }

    const sentences = textContent.split(/[.!?]+/).filter((s: string) => s.trim());
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 15;
    const readabilityScore = Math.max(6, Math.min(9, Math.round(12 - avgWordsPerSentence / 2)));

    const internalLinks: InternalLink[] = (parsedResult.internalLinks || []).map((link: any) => ({
      text: link.text || '',
      url: link.url || CATEGORY_ROUTES[link.category] || '/category/technology',
      category: link.category || 'Technology'
    }));

    const externalLinks: ExternalLink[] = (parsedResult.externalLinks || []).map((link: any) => ({
      text: link.text || '',
      url: link.url || '#',
      source: link.source || 'External Source'
    }));

    const faq: FAQItem[] = (parsedResult.faq || []).map((item: any) => ({
      question: item.question || '',
      answer: item.answer || ''
    })).filter((item: FAQItem) => item.question && item.answer);

    const imageAltTexts = parsedResult.imageAltTexts || [
      `${parsedResult.focusKeyword || title} - ${category} article image`
    ];

    console.log(`[ArticleExpansion] Success: ${wordCount} words, readability: ${readabilityScore}, H2s: ${hasH2}, H3s: ${hasH3}`);

    return {
      expandedContent: contentHtml,
      wordCount,
      readabilityScore,
      success: true,
      metaTitle: parsedResult.metaTitle || generateFallbackMetaTitle(title),
      metaDescription: parsedResult.metaDescription || generateFallbackMetaDescription(title, category),
      focusKeyword: parsedResult.focusKeyword || extractFocusKeyword(title),
      keywords: parsedResult.keywords || extractKeywords(title, category),
      internalLinks,
      externalLinks,
      imageAltTexts,
      faq
    };
  } catch (error) {
    console.error("Article expansion failed:", error);
    return createErrorResult(error instanceof Error ? error.message : "Unknown error");
  }
};

function createErrorResult(errorMessage: string): ExpandedArticleResult {
  return {
    expandedContent: "",
    wordCount: 0,
    readabilityScore: 0,
    success: false,
    error: errorMessage,
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    keywords: [],
    internalLinks: [],
    externalLinks: [],
    imageAltTexts: [],
    faq: []
  };
}

function generateFallbackMetaTitle(title: string): string {
  const cleaned = title.slice(0, 55);
  return cleaned.length < title.length ? cleaned + '...' : cleaned;
}

function generateFallbackMetaDescription(title: string, category: string): string {
  return `Discover the latest ${category.toLowerCase()} news: ${title.slice(0, 100)}. Read more on FutureTechJournal.`;
}

function extractFocusKeyword(title: string): string {
  const words = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !['this', 'that', 'with', 'from', 'have', 'been', 'will', 'what', 'when', 'where', 'which', 'their', 'there', 'about', 'into', 'more', 'some'].includes(w));
  return words.slice(0, 3).join(' ');
}

function extractKeywords(title: string, category: string): string[] {
  const words = title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3);
  
  const keywords = [...new Set(words)].slice(0, 5);
  keywords.push(category.toLowerCase());
  return keywords;
}

export const getExpandedArticleFromDB = async (slug: string): Promise<ExpandedArticleResult | null> => {
  try {
    const response = await fetch(`/api/expanded-article/${encodeURIComponent(slug)}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    const data = await response.json();
    
    if (!data.expandedContent) return null;
    
    // Check if this is an older cached entry missing SEO fields
    // If so, return null to trigger regeneration with new SEO structure
    const hasRequiredSEOFields = data.metaTitle && data.metaDescription && data.focusKeyword;
    const hasMinimumWordCount = data.wordCount >= 800;
    
    if (!hasRequiredSEOFields || !hasMinimumWordCount) {
      console.log(`[ArticleExpansion] Cached entry for ${slug} is outdated (missing SEO fields or insufficient word count), triggering regeneration`);
      return null; // Will trigger new expansion with SEO structure
    }
    
    return {
      expandedContent: data.expandedContent,
      wordCount: data.wordCount || 0,
      readabilityScore: data.readabilityScore || 7,
      success: true,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      focusKeyword: data.focusKeyword,
      keywords: Array.isArray(data.keywords) ? data.keywords : [],
      internalLinks: Array.isArray(data.internalLinks) ? data.internalLinks : [],
      externalLinks: Array.isArray(data.externalLinks) ? data.externalLinks : [],
      imageAltTexts: Array.isArray(data.imageAltTexts) ? data.imageAltTexts : [],
      faq: Array.isArray(data.faq) ? data.faq : []
    };
  } catch (error) {
    console.error("Failed to get expanded article from DB:", error);
    return null;
  }
};

export const saveExpandedArticleToDB = async (
  slug: string,
  originalTitle: string,
  originalContent: string,
  result: ExpandedArticleResult,
  category: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/expanded-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        originalTitle,
        originalContent,
        expandedContent: result.expandedContent,
        category,
        wordCount: result.wordCount,
        readabilityScore: result.readabilityScore,
        metaTitle: result.metaTitle,
        metaDescription: result.metaDescription,
        focusKeyword: result.focusKeyword,
        keywords: result.keywords,
        internalLinks: result.internalLinks,
        externalLinks: result.externalLinks,
        imageAltTexts: result.imageAltTexts,
        faq: result.faq
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`[ArticleExpansion] Server validation failed for ${slug}:`, errorData.error);
      return { success: false, error: errorData.error };
    }
    
    console.log(`[ArticleExpansion] Successfully saved SEO article: ${slug}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to save expanded article to DB:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Network error' };
  }
};
