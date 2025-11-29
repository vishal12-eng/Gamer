// Service to fetch images from Pixabay API
const PIXABAY_ENDPOINT = "/.netlify/functions/pixabayImage";

// In-memory cache to avoid repeated API calls (reset on page refresh)
const imageCache: Record<string, string> = {};

interface PixabayResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export const fetchPixabayImage = async (
  articleTitle: string,
  category: string,
  fallbackUrl: string
): Promise<string> => {
  console.log(`[Pixabay Service] Starting fetch for: "${articleTitle}" (${category})`);
  
  // Check cache first
  const cacheKey = `${articleTitle}_${category}`;
  if (imageCache[cacheKey]) {
    console.log(`[Pixabay Service] Cache hit for: "${articleTitle}"`);
    return imageCache[cacheKey];
  }

  try {
    console.log(`[Pixabay Service] Calling backend endpoint: ${PIXABAY_ENDPOINT}`);
    
    const response = await fetch(PIXABAY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchQuery: articleTitle,
        category: category,
      }),
    });

    console.log(`[Pixabay Service] Response status: ${response.status}`);

    if (!response.ok) {
      console.warn(
        `[Pixabay Service] Backend error (${response.status}): Using fallback image`
      );
      return fallbackUrl;
    }

    const data: PixabayResponse = await response.json();
    console.log(`[Pixabay Service] Response data:`, data);

    if (data.success && data.imageUrl) {
      console.log(`[Pixabay Service] Success! Image URL: ${data.imageUrl}`);
      // Cache the result
      imageCache[cacheKey] = data.imageUrl;
      return data.imageUrl;
    } else {
      console.warn(
        `[Pixabay Service] API returned success=false for "${articleTitle}": Using fallback`
      );
      return fallbackUrl;
    }
  } catch (error) {
    console.error(
      `[Pixabay Service] Error fetching Pixabay image:`,
      error instanceof Error ? error.message : error
    );
    console.error(`[Pixabay Service] Full error:`, error);
    // Always fall back gracefully
    return fallbackUrl;
  }
};
