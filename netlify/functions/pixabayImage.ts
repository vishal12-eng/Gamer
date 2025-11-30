import { Handler } from "@netlify/functions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PixabayApiResponse {
  hits: Array<{
    largeImageURL: string;
    webformatURL: string;
    pageURL: string;
  }>;
}

interface ResponsePayload {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

// Category-to-search mapping for better results
const categorySearchMap: Record<string, string[]> = {
  'Entertainment': ['movie', 'celebrity', 'film', 'actor', 'actress'],
  'Technology': ['computer', 'software', 'tech', 'innovation', 'digital'],
  'Business': ['finance', 'business', 'corporate', 'office', 'economics'],
  'Science': ['science', 'research', 'laboratory', 'experiment', 'scientist'],
  'AI': ['artificial intelligence', 'robot', 'technology', 'future', 'tech'],
  'Sports': ['sports', 'athlete', 'game', 'championship', 'competition'],
  'Health': ['health', 'medical', 'fitness', 'wellness', 'doctor'],
  'Global': ['world', 'globe', 'international', 'news', 'global'],
  'India': ['india', 'delhi', 'mumbai', 'culture', 'indian'],
  'US': ['usa', 'america', 'united states', 'american', 'washington'],
  'Product': ['product', 'gadget', 'device', 'innovation', 'technology'],
};

// Helper function to generate AI-powered search queries using Gemini
const generateOptimizedQueries = async (title: string, summary: string, category: string): Promise<string[]> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return [];

    const prompt = `Generate 4 highly specific Pixabay search queries for this article that will find the most relevant, high-quality images. Return ONLY the queries as a JSON array of strings, nothing else.

Article Title: ${title}
Article Summary: ${summary.substring(0, 300)}
Category: ${category}

Focus on: specific terms, objects, people, scenes, or concepts mentioned in the title/summary. Avoid generic terms. Include variations.

Example output: ["quantum computing", "AI chip design", "processor technology", "innovation lab"]`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 150 },
      }),
    }).then(r => r.json());

    const content = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = content.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]).filter((q: string) => q && q.trim());
    }
  } catch (error) {
    console.error('[Pixabay] AI query generation error:', error);
  }
  return [];
};

// Helper function to extract keywords from title
const extractKeywords = (title: string): string[] => {
  try {
    // Remove special characters and split by spaces
    const cleaned = title
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(word => word && word.length > 2 && word.length < 15);
    
    // Remove common words
    const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'have', 'been', 'was', 'are', 'but', 'will', 'can', 'all', 'has', 'had', 'not', 'you', 'your', 'she', 'her', 'his', 'him', 'its', 'our', 'out', 'get', 'got', 'make', 'made', 'say', 'said', 'new', 'day', 'time', 'year', 'people']);
    
    const keywords = cleaned.filter(word => !stopWords.has(word)).slice(0, 3);
    return keywords.length > 0 ? keywords : ['technology'];
  } catch (error) {
    console.error('[Pixabay] Keyword extraction error:', error);
    return ['technology'];
  }
};

const handler: Handler = async (event) => {
  console.log("[Pixabay Handler] Request received");
  
  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    console.log("[Pixabay Handler] Preflight request");
    return { statusCode: 200, headers: corsHeaders, body: "ok" };
  }

  if (event.httpMethod !== "POST") {
    console.error(`[Pixabay Handler] Invalid method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const apiKey = process.env.PIXABAY_API_KEY;
    console.log(`[Pixabay Handler] API Key available: ${!!apiKey}`);
    
    if (!apiKey) {
      console.error("[Pixabay Handler] Missing PIXABAY_API_KEY environment variable");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Server configuration error: Missing API Key",
        } as ResponsePayload),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const { searchQuery, category, summary } = body;
    console.log(`[Pixabay Handler] Original Query: "${searchQuery}", Category: "${category}"`);

    if (!searchQuery) {
      console.error("[Pixabay Handler] Missing searchQuery parameter");
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Missing searchQuery parameter",
        } as ResponsePayload),
      };
    }

    // Build optimized search queries in priority order
    const queries: string[] = [];

    // 1. AI-generated queries from title + summary (most specific)
    if (summary) {
      const aiQueries = await generateOptimizedQueries(searchQuery, summary, category || "General");
      queries.push(...aiQueries);
    }

    // 2. Category-specific search terms
    if (category && categorySearchMap[category]) {
      queries.push(...categorySearchMap[category]);
    }

    // 3. Extracted keywords from title
    const keywords = extractKeywords(searchQuery);
    queries.push(...keywords);
    queries.push(keywords.join(" "));

    // 4. Category fallback
    if (category && category !== "All") {
      queries.push(category);
    }

    // 5. Generic fallbacks
    queries.push("photo", "image");

    // Remove duplicates and empty strings
    const uniqueQueries = Array.from(new Set(queries.filter(q => q && q.trim())));
    console.log(`[Pixabay Handler] Final search queries (${uniqueQueries.length}): ${uniqueQueries.slice(0, 5).join(", ")}...`);

    let imageUrl: string | null = null;

    // Try searches in order of specificity with better filters
    for (const query of uniqueQueries) {
      if (imageUrl) break;

      try {
        const pixabayUrl = new URL("https://pixabay.com/api/");
        pixabayUrl.searchParams.append("key", apiKey);
        pixabayUrl.searchParams.append("q", query);
        pixabayUrl.searchParams.append("image_type", "photo");
        pixabayUrl.searchParams.append("order", "popular");
        pixabayUrl.searchParams.append("per_page", "3"); // Get 3 to choose best
        pixabayUrl.searchParams.append("safesearch", "true");
        pixabayUrl.searchParams.append("editors_choice", "true");
        pixabayUrl.searchParams.append("min_width", "1000"); // Minimum 1000px width
        pixabayUrl.searchParams.append("min_height", "600");  // Minimum 600px height

        console.log(`[Pixabay Handler] Fetching from Pixabay with query: "${query}"`);
        const response = await fetch(pixabayUrl.toString());
        console.log(`[Pixabay Handler] Pixabay API response status: ${response.status}`);

        if (!response.ok) {
          console.warn(
            `[Pixabay Handler] Pixabay API responded with status ${response.status} for query: ${query}`
          );
          continue;
        }

        const data: PixabayApiResponse = await response.json();
        console.log(`[Pixabay Handler] Pixabay response hits: ${data.hits?.length || 0}`);

        if (data.hits && data.hits.length > 0) {
          // Use largeImageURL for better quality
          imageUrl = data.hits[0].largeImageURL || data.hits[0].webformatURL;
          console.log(
            `[Pixabay Handler] Success! Found image for query: "${query}"`
          );
          break;
        } else {
          console.log(`[Pixabay Handler] No hits for query: "${query}"`);
        }
      } catch (fetchError) {
        console.error(
          `[Pixabay Handler] Error fetching from Pixabay for query "${query}":`,
          fetchError instanceof Error ? fetchError.message : fetchError
        );
      }
    }

    if (imageUrl) {
      console.log(`[Pixabay Handler] Returning success with URL: ${imageUrl}`);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: true,
          imageUrl: imageUrl,
        } as ResponsePayload),
      };
    } else {
      console.warn(
        `[Pixabay Handler] No images found after all queries for "${searchQuery}"`
      );
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "No images found",
        } as ResponsePayload),
      };
    }
  } catch (error) {
    console.error(
      "[Pixabay Handler] Pixabay handler error:",
      error instanceof Error ? error.message : error
    );
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: "Internal server error",
      } as ResponsePayload),
    };
  }
};

export { handler };
