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

const handler: Handler = async (event, context) => {
  // Handle preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "ok" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
      console.error("Missing PIXABAY_API_KEY environment variable");
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Server configuration error",
        } as ResponsePayload),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const { searchQuery, category } = body;

    if (!searchQuery) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          success: false,
          error: "Missing searchQuery parameter",
        } as ResponsePayload),
      };
    }

    // Build search query: prioritize article title, supplement with category
    const queries = [searchQuery];
    if (category && category !== "All") {
      queries.push(category);
    }
    queries.push("technology"); // Always include as final fallback

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

        const response = await fetch(pixabayUrl.toString());

        if (!response.ok) {
          console.warn(
            `Pixabay API responded with status ${response.status} for query: ${query}`
          );
          continue;
        }

        const data: PixabayApiResponse = await response.json();

        if (data.hits && data.hits.length > 0) {
          // Use largeImageURL for better quality, fallback to webformatURL
          imageUrl = data.hits[0].largeImageURL || data.hits[0].webformatURL;
          console.log(
            `[Pixabay] Found image for query: "${query}" (${searchQuery})`
          );
          break;
        }
      } catch (fetchError) {
        console.error(
          `Error fetching from Pixabay for query "${query}":`,
          fetchError instanceof Error ? fetchError.message : fetchError
        );
        // Continue to next query
      }
    }

    if (imageUrl) {
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
        `[Pixabay] No images found for "${searchQuery}" (category: ${category})`
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
      "Pixabay handler error:",
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
