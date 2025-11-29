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
  // Check cache first
  const cacheKey = `${articleTitle}_${category}`;
  if (imageCache[cacheKey]) {
    return imageCache[cacheKey];
  }

  try {
    const response = await fetch(PIXABAY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchQuery: articleTitle,
        category: category,
      }),
    });

    if (!response.ok) {
      console.warn(
        `Pixabay API error (${response.status}): Using fallback image`
      );
      return fallbackUrl;
    }

    const data: PixabayResponse = await response.json();

    if (data.success && data.imageUrl) {
      // Cache the result
      imageCache[cacheKey] = data.imageUrl;
      return data.imageUrl;
    } else {
      console.warn(
        `Pixabay search failed for "${articleTitle}": Using fallback`
      );
      return fallbackUrl;
    }
  } catch (error) {
    console.error(
      "Error fetching Pixabay image:",
      error instanceof Error ? error.message : error
    );
    // Always fall back gracefully
    return fallbackUrl;
  }
};
