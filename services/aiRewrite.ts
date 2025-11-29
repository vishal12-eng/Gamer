// Service to rewrite articles using the AI Handler API

const AI_ENDPOINT = "/api/aiHandler";

interface RewrittenArticle {
  title: string;
  summary: string;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  lastModified: string;
}

const callAi = async (action: string, payload: any) => {
  try {
    const response = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, payload }),
    });

    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("AI Rewrite Service Error:", error);
    return null;
  }
};

export const rewriteArticleForSEO = async (input: { 
  title: string; 
  sourceText: string; 
  category: string;
}): Promise<RewrittenArticle | null> => {
  
  const prompt = `You are a senior news editor for "FutureTechJournal", an authoritative technology & business news site.
Task: Rewrite and expand the provided source content into a high-quality long-form news article optimized for SEO and Google News.
Inputs:
- TITLE: ${input.title}
- CATEGORY: ${input.category}
- SOURCE_TEXT: ${input.sourceText.substring(0, 5000)}

Requirements:
1) Output a JSON object ONLY (no explanations). Schema:
{
  "title": "SEO-optimized headline (<=70 chars)",
  "summary": "2-3 sentence concise lede (max 160 chars)",
  "bodyHtml": "<p>Full long-form article, 900-1500 words, with <h2> subheadings where suitable.</p>",
  "seoTitle": "short SEO title <= 60 chars",
  "seoDescription": "140-160 char meta description",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "lastModified": "ISO8601 UTC timestamp"
}

2) Style & content rules:
- Neutral, factual, professional; no clickbait.
- Do not invent verifiable facts (numbers, dates, quotes) not present in SOURCE_TEXT. Reasonable, commonly-known context ok.
- Add background, timeline, implications, expert-analysis style commentary (without fabricating sources).
- Use short paragraphs (2-3 sentences).
- Include relevant keywords naturally for the category.

3) SEO rules:
- Use the primary keyword (derived from title) in the first 150 characters.
- Provide an engaging lede within the first paragraph.
- Ensure bodyHtml includes at least two <h2> subsections.

4) JSON only: output valid JSON. If unsure, be conservative rather than invent facts.

Return the JSON object only.`;

  const result = await callAi("generateContent", {
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 32768 }, // Max thinking budget for detailed, high-quality rewrite
      responseSchema: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          summary: { type: 'STRING' },
          bodyHtml: { type: 'STRING' },
          seoTitle: { type: 'STRING' },
          seoDescription: { type: 'STRING' },
          tags: { type: 'ARRAY', items: { type: 'STRING' } },
          lastModified: { type: 'STRING' }
        }
      }
    }
  });

  if (result && result.text) {
    try {
      return JSON.parse(result.text) as RewrittenArticle;
    } catch (e) {
      console.error("Failed to parse rewrite result", e);
      return null;
    }
  }
  return null;
};