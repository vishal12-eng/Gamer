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

// Helper function to extract keywords from title
const extractKeywords = (title: string): string[] => {
  try {
    // Remove special characters and split by spaces
    const cleaned = title
      .replace(/[^a-zA-Z0-9\s]/g, ' ') // Remove special chars
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(word => word && word.length > 2 && word.length < 15); // Keep words 3-14 chars
    
    // Remove common words
    const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'have', 'been', 'was', 'are', 'but', 'will', 'can', 'all', 'has', 'had', 'not', 'you', 'your', 'she', 'her', 'his', 'him', 'its', 'our', 'out', 'get', 'got', 'make', 'made', 'say', 'said', 'new', 'day', 'time', 'year', 'people']);
    
    const keywords = cleaned.filter(word => !stopWords.has(word)).slice(0, 2);
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
    const { searchQuery, category } = body;
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

    // Extract keywords from title to create cleaner search queries
    let keywords: string[] = [];
    try {
      keywords = extractKeywords(searchQuery);
    } catch (keywordError) {
      console.error('[Pixabay Handler] Error extracting keywords:', keywordError);
      keywords = ['technology'];
    }
    
    console.log(`[Pixabay Handler] Extracted keywords: ${keywords.join(", ")}`);

    // Build search queries: use extracted keywords, then category, then generic fallback
    const queries = [
      ...keywords, // Use individual keywords
      keywords.join(" "), // Try all keywords together
      category && category !== "All" ? category : "technology",
      "photo" // Final fallback
    ].filter((q, idx, arr) => q && q.trim() && arr.indexOf(q) === idx); // Remove duplicates and empty
    
    console.log(`[Pixabay Handler] Final search queries: ${queries.join(", ")}`);

    let imageUrl: string | null = null;

    // Try searches in order of specificity
    for (const query of queries) {
      if (imageUrl) break;

      try {
        const pixabayUrl = new URL("https://pixabay.com/api/");
        pixabayUrl.searchParams.append("key", apiKey);
        pixabayUrl.searchParams.append("q", query);
        pixabayUrl.searchParams.append("image_type", "photo");
        pixabayUrl.searchParams.append("order", "popular");
        pixabayUrl.searchParams.append("per_page", "1");
        pixabayUrl.searchParams.append("safesearch", "true");
        pixabayUrl.searchParams.append("editors_choice", "true");

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
          // Use largeImageURL for better quality, fallback to webformatURL
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
        // Continue to next query
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
