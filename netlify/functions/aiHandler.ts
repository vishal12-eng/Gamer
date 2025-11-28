
import { GoogleGenAI } from "@google/genai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export const handler = async (event: any, context: any) => {
  // 1. Handle Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "ok" };
  }

  // 2. Validate Method
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  // 3. Validate API Key
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("Server Error: Missing API_KEY");
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: "Server configuration error: Missing API Key" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { action, payload } = body;
    const ai = new GoogleGenAI({ apiKey });

    let result;

    console.log(`[AI Handler] Action: ${action} | Model: ${payload?.model}`);

    switch (action) {
      case "generateContent": {
        // Robust content generation for text, images (via content), and reasoning
        const modelName = payload.model || 'gemini-2.0-flash';
        const response = await ai.models.generateContent({
          model: modelName,
          contents: payload.contents,
          config: payload.config,
        });
        
        // Simplify response for frontend
        result = {
          text: response.text,
          candidates: response.candidates,
        };
        break;
      }

      case "chat": {
        const modelName = payload.model || 'gemini-2.0-flash';
        const chat = ai.chats.create({
          model: modelName,
          history: payload.history,
          config: payload.config,
        });
        const response = await chat.sendMessage({ message: payload.message });
        result = { text: response.text };
        break;
      }

      case "generateImages": {
        // Specific handler for Imagen models which behave differently
        const modelName = payload.model || 'imagen-3.0-generate-001';
        const response = await ai.models.generateImages({
          model: modelName,
          prompt: payload.prompt,
          config: payload.config
        });
        result = { generatedImages: response.generatedImages };
        break;
      }

      case "generateVideos": {
        // Start the operation and return the name immediately. 
        // We do NOT await the result here because it takes too long for a serverless function.
        const modelName = payload.model || 'veo-3.1-fast-generate-preview';
        const operation = await ai.models.generateVideos({
          model: modelName,
          prompt: payload.prompt,
          image: payload.image, 
          config: payload.config,
        });
        
        // The client must poll using `getVideosOperation`
        result = { operationName: operation.name };
        break;
      }

      case "getVideosOperation": {
        // Check status of a running operation
        // Note: @google/genai SDK usage for operations
        const operation = await ai.operations.getVideosOperation({
          name: payload.operationName
        });
        
        result = {
          done: operation.done,
          generatedVideos: operation.response?.generatedVideos,
          error: operation.error
        };
        break;
      }

      default:
        throw new Error(`Invalid action: ${action}`);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
      body: JSON.stringify(result),
    };

  } catch (error: any) {
    console.error("[AI Handler] Error:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: error.message || "Unknown AI Error",
        details: error.toString() 
      }),
    };
  }
};
