import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL_TEXT, TONE_PROMPTS } from '../constants';
import { Tone } from '../types';

// Initialize Gemini Client
// We assume process.env.API_KEY is available as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMessage = async (input: string, tone: Tone): Promise<string> => {
  if (!input.trim()) return "";

  try {
    const prompt = `${TONE_PROMPTS[tone]}\n\nInput Text: "${input}"\n\nOutput (just the message text, no quotes):`;
    
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
    });

    return response.text?.trim() || input;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate message. Please check your connection or API key.");
  }
};

export const suggestReply = async (context: string): Promise<string[]> => {
    if (!context.trim()) return [];

    try {
        const prompt = `Given the following received message context, suggest 3 short, distinct WhatsApp replies. Return the result as a JSON array of strings.`;
        
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL_TEXT,
            contents: prompt + `\n\nContext: "${context}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
            }
        });

        const text = response.text;
        if (!text) return [];
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini Suggestion Error:", error);
        return [];
    }
}