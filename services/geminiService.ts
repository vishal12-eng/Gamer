
// Service to interact with the Netlify AI Handler Function
const AI_ENDPOINT = "/.netlify/functions/aiHandler";

// --- HELPER TO CALL SERVERLESS FUNCTION ---
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
    console.error(`AI Service Error (${action}):`, error);
    throw error;
  }
};

// --- TYPES ---
export interface GroundingChunk {
  web?: { uri: string; title: string; snippet?: string; };
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// --- API FUNCTIONS ---

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const result = await callAi("generateContent", {
      model: 'gemini-2.0-flash',
      contents: `Summarize this in 3 sentences:\n\n${text}`,
    });
    return result.text || "Summary not available.";
  } catch (error) {
    return "Could not summarize.";
  }
};

export const translateText = async (text: string, targetLang: string): Promise<string> => {
  try {
    const result = await callAi("generateContent", {
      model: 'gemini-2.0-flash',
      contents: `Translate to ${targetLang}:\n\n${text}`,
    });
    return result.text || "Translation failed.";
  } catch (error) {
    return "Translation failed.";
  }
};

export const generateTextToSpeech = async (text: string): Promise<string | null> => {
  try {
    const result = await callAi("generateContent", {
      model: "gemini-2.0-flash", 
      contents: [{ parts: [{ text: `Read clearly: ${text}` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return result.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const chatWithBotStream = async (history: any[], newMessage: string) => {
  // We use the non-streaming backend but simulate a stream for UI consistency
  const result = await callAi("chat", {
    model: 'gemini-2.0-flash',
    history: history,
    message: newMessage,
  });

  async function* streamGenerator() {
    if (result.text) {
      const words = result.text.match(/\S+|\s+/g) || [];
      let lastWord = '';
      for (const word of words) {
        // Skip consecutive duplicate words to prevent duplication
        if (word !== lastWord) {
          yield { text: word };
          lastWord = word;
          await new Promise(r => setTimeout(r, 10));
        }
      }
    } else {
      yield { text: "I'm having trouble responding." };
    }
  }
  return streamGenerator();
};

export const groundedSearch = async (query: string): Promise<{ text: string, sources: GroundingChunk[] }> => {
  try {
    const result = await callAi("generateContent", {
      model: "gemini-2.0-flash", // Fallback to flash for speed/reliability
      contents: query,
      config: { tools: [{ googleSearch: {} }] },
    });
    const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: result.text || "No result found.", sources: chunks };
  } catch (error) {
    return { text: "Search unavailable.", sources: [] };
  }
};

// --- ARTICLE GENERATION ---

export const expandContentStream = async (title: string, content: string, category: string) => {
  try {
    const result = await callAi("generateContent", {
      model: 'gemini-2.0-flash',
      contents: `You are a senior editor. Rewrite and expand this article to 800+ words.
      Title: ${title}
      Original: ${content.substring(0, 3000)}
      Output: Return ONLY HTML body content. Use <h2> and <p>.`,
    });

    async function* streamGenerator() {
      if (result.text) {
        // Chunk the text to simulate streaming
        const chunks = result.text.match(/.{1,20}/g) || [];
        for (const chunk of chunks) {
          yield { text: chunk };
          await new Promise(r => setTimeout(r, 5));
        }
      } else {
        yield { text: "Expansion failed." };
      }
    }
    return streamGenerator();
  } catch (error) {
    console.error("Expand Error:", error);
    return (async function* () { yield { text: "Could not expand content." }; })();
  }
};

export const rewriteArticle = async (content: string, tone: string): Promise<string> => {
  try {
    const result = await callAi("generateContent", {
      model: 'gemini-2.0-flash',
      contents: `Rewrite this text in a ${tone} tone. Return JSON { "newTitle", "newSummary", "newContent", "newTags" }. Text: ${content.substring(0, 4000)}`,
      config: { responseMimeType: 'application/json' }
    });
    return result.text || JSON.stringify({});
  } catch (error) {
    return JSON.stringify({});
  }
};

export const generateBlogPost = async (topic: string): Promise<string> => {
  try {
    const result = await callAi("generateContent", {
      model: 'gemini-2.0-flash',
      contents: `Write a blog post about: ${topic}. Return JSON { "title", "content", "tags" }.`,
      config: { responseMimeType: 'application/json' }
    });
    return result.text || JSON.stringify({});
  } catch (error) {
    return JSON.stringify({});
  }
};

// --- IMAGES & VIDEO ---

export const generateImage = async (prompt: string, aspectRatio: string = "16:9", size: string = "1K"): Promise<string | null> => {
  try {
    // Using generateImages action for Imagen 3
    const result = await callAi("generateImages", {
      model: 'imagen-3.0-generate-001',
      prompt: prompt,
      config: { numberOfImages: 1, aspectRatio: aspectRatio }
    });
    // Imagen returns base64 directly in imageBytes
    return result.generatedImages?.[0]?.image?.imageBytes || null;
  } catch (error) {
    console.error("Image Gen Error:", error);
    return null;
  }
};

export const animateImage = async (imageFile: File, prompt: string): Promise<string | null> => {
  try {
    const base64Data = await fileToBase64(imageFile);
    
    // 1. START the operation (Fast)
    const startResponse = await callAi("generateVideos", {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: { imageBytes: base64Data, mimeType: imageFile.type },
    });

    if (!startResponse.operationName) throw new Error("Failed to start video generation");
    const operationName = startResponse.operationName;

    // 2. POLL for completion (Client-side to avoid server timeout)
    // Poll for up to 2 minutes (24 * 5s = 120s)
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 5000)); // Wait 5s
      const status = await callAi("getVideosOperation", { operationName });
      
      if (status.error) throw new Error(status.error.message);
      if (status.done) {
        return status.generatedVideos?.[0]?.video?.uri || null;
      }
    }
    throw new Error("Video generation timed out");
  } catch (error) {
    console.error("Video Gen Error:", error);
    return null;
  }
};

export const analyzeImage = async (prompt: string, imageFile: File): Promise<string> => {
  try {
    const base64Data = await fileToBase64(imageFile);
    const result = await callAi("generateContent", {
      model: 'gemini-2.0-flash',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: imageFile.type } },
          { text: prompt }
        ]
      },
    });
    return result.text || "Analysis failed.";
  } catch (error) {
    return "Failed to analyze.";
  }
};

export const analyzeReadability = async (text: string) => {
    try {
        const result = await callAi("generateContent", {
            model: 'gemini-2.0-flash',
            contents: `Analyze the readability of this text. Return JSON { "score": number (0-100), "interpretation": string }. Text: ${text.substring(0, 1000)}`,
            config: { responseMimeType: 'application/json' }
        });
        return result.text || JSON.stringify({ score: 70, interpretation: "Standard" });
    } catch (error) {
        return JSON.stringify({ score: 0, interpretation: "Analysis Unavailable" });
    }
};

export const suggestTags = async (title: string, content: string, existingTags: string[] = []) => {
    try {
        const result = await callAi("generateContent", {
            model: 'gemini-2.0-flash',
            contents: `Suggest 5-10 relevant tags for this article.
            Title: ${title}
            Content: ${content.substring(0, 2000)}
            Existing tags: ${existingTags.join(', ')}
            Return JSON { "tags": ["tag1", "tag2"] }`,
            config: { responseMimeType: 'application/json' }
        });
        return result.text || JSON.stringify({ tags: [] });
    } catch (error) {
        return JSON.stringify({ tags: [] });
    }
};

export const findRelevantArticles = async (query: string, articles: any[]) => {
    try {
        // Limit context size
        const contextArticles = articles.slice(0, 20).map(a => ({ slug: a.slug, title: a.title, summary: a.summary }));
        const result = await callAi("generateContent", {
            model: 'gemini-2.0-flash',
            contents: `Find the most relevant articles for the query: "${query}".
            Articles: ${JSON.stringify(contextArticles)}
            Return JSON array of slugs: ["slug1", "slug2"]`,
            config: { responseMimeType: 'application/json' }
        });
        if (result.text) {
             const parsed = JSON.parse(result.text);
             return Array.isArray(parsed) ? parsed : [];
        }
        return [];
    } catch (error) {
        return [];
    }
};
