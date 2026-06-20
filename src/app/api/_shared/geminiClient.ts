import { GoogleGenAI } from '@google/genai';

/**
 * Initializes the GoogleGenAI SDK client with the provided API key override
 * or the environment variable key.
 *
 * @param apiKeyOverride - Optional custom user API key override.
 * @returns Configured GoogleGenAI client instance or null if no key is found.
 */
export function getGeminiClient(apiKeyOverride?: string): GoogleGenAI | null {
  const apiKey = apiKeyOverride || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}
