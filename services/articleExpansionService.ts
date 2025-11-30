const AI_ENDPOINT = "/api/aiHandler";

export interface ExpandedArticleResult {
  expandedContent: string;
  wordCount: number;
  readabilityScore: number;
  success: boolean;
  error?: string;
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

export const expandArticleWithSEO = async (
  title: string,
  originalContent: string,
  category: string
): Promise<ExpandedArticleResult> => {
  const prompt = `You are a senior content editor for "FutureTechJournal", a leading technology news publication.

TASK: Expand this article into comprehensive long-form content optimized for SEO and reader engagement.

INPUT:
- Title: ${title}
- Category: ${category}
- Original Content: ${originalContent.substring(0, 4000)}

STRICT REQUIREMENTS:

1. WORD COUNT: Generate 800-1500 words of substantive content.

2. STRUCTURE - Use these HTML elements:
   - <h2> for major section headings (every 2-3 paragraphs)
   - <h3> for subsections where needed
   - Include sections like: Introduction, Key Points, Background, Analysis, Implications, Conclusion

3. CONTENT ELEMENTS - Must include:
   - <ul> with <li> bullet points for key features/facts
   - <ol> with <li> numbered lists for steps/rankings
   - A "Key Takeaways" section with bullet points
   - Relevant quotes using <blockquote> (attribute to "industry experts" or "analysts")
   - Short paragraphs (2-3 sentences each) in <p> tags

4. READABILITY:
   - Target reading level: Grade 6-9 (simple, clear language)
   - Use short sentences
   - Avoid jargon - explain technical terms
   - Use active voice

5. ACCURACY:
   - Stay faithful to the original content
   - Do NOT invent specific statistics, dates, or quotes not in the source
   - Provide reasonable context and analysis without fabricating facts
   - Use phrases like "according to reports" or "experts suggest" for general statements

6. SEO OPTIMIZATION:
   - Include the primary keyword (from title) in first 150 characters
   - Use related keywords naturally throughout
   - Make headings descriptive and keyword-rich

OUTPUT FORMAT:
Return ONLY valid HTML content (no markdown, no code blocks, no explanations).
Start directly with <h2> or <p>, not with any preamble.

Example structure:
<p>Introduction paragraph with key hook...</p>
<h2>Background and Context</h2>
<p>Background content...</p>
<h2>Key Developments</h2>
<ul>
  <li>Point one...</li>
  <li>Point two...</li>
</ul>
<h2>Analysis and Implications</h2>
<p>Analysis content...</p>
<h3>What This Means for Users</h3>
<p>Impact explanation...</p>
<h2>Key Takeaways</h2>
<ul>
  <li>Takeaway one...</li>
  <li>Takeaway two...</li>
</ul>
<h2>Looking Ahead</h2>
<p>Conclusion and future outlook...</p>

Generate the expanded article now:`;

  try {
    const result = await callAi("generateContent", {
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    if (!result.text) {
      return {
        expandedContent: "",
        wordCount: 0,
        readabilityScore: 0,
        success: false,
        error: "No content generated"
      };
    }

    let content = result.text;
    
    content = content
      .replace(/```html\s*/gi, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*\n/gm, '')
      .trim();

    if (!content.startsWith('<')) {
      const firstTagIndex = content.indexOf('<');
      if (firstTagIndex > 0) {
        content = content.substring(firstTagIndex);
      }
    }

    const textContent = content.replace(/<[^>]+>/g, ' ');
    const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length;

    const hasH2 = /<h2[^>]*>/i.test(content);
    const hasList = /<(ul|ol)[^>]*>/i.test(content);
    const hasParagraphs = /<p[^>]*>/i.test(content);

    if (wordCount < 500 || !hasH2 || !hasParagraphs) {
      console.warn(`[ArticleExpansion] Content validation warning: words=${wordCount}, hasH2=${hasH2}, hasList=${hasList}`);
    }

    const sentences = textContent.split(/[.!?]+/).filter(s => s.trim());
    const avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 15;
    const readabilityScore = Math.max(6, Math.min(9, Math.round(12 - avgWordsPerSentence / 2)));

    return {
      expandedContent: content,
      wordCount,
      readabilityScore,
      success: true
    };
  } catch (error) {
    console.error("Article expansion failed:", error);
    return {
      expandedContent: "",
      wordCount: 0,
      readabilityScore: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};

export const getExpandedArticleFromDB = async (slug: string): Promise<string | null> => {
  try {
    const response = await fetch(`/api/expanded-article/${encodeURIComponent(slug)}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    const data = await response.json();
    return data.expandedContent || null;
  } catch (error) {
    console.error("Failed to get expanded article from DB:", error);
    return null;
  }
};

export const saveExpandedArticleToDB = async (
  slug: string,
  originalTitle: string,
  originalContent: string,
  expandedContent: string,
  category: string,
  wordCount: number,
  readabilityScore: number
): Promise<boolean> => {
  try {
    const response = await fetch('/api/expanded-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug,
        originalTitle,
        originalContent,
        expandedContent,
        category,
        wordCount,
        readabilityScore
      })
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to save expanded article to DB:", error);
    return false;
  }
};
