import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { GeminiResponseSchema } from "../types";

// Initialize Gemini Client
// NOTE: API Key must be provided in environment variables for security in production
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Define the expected JSON Schema for the response
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    active_agent_id: {
      type: Type.STRING,
      enum: ["NAVIGATOR", "APPOINTMENT", "PATIENT_INFO", "BILLING", "MEDICAL_RECORDS"],
      description: "The ID of the agent handling the request based on intent."
    },
    response_text: {
      type: Type.STRING,
      description: "The conversation response from the selected agent."
    }
  },
  required: ["active_agent_id", "response_text"]
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[]
): Promise<GeminiResponseSchema> => {
  try {
    const modelId = "gemini-2.5-flash"; // Optimized for speed and instruction following

    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result = await chat.sendMessage({ message });
    
    // The SDK with responseMimeType='application/json' returns the text as a JSON string
    const jsonText = result.text;
    
    if (!jsonText) {
      throw new Error("Empty response from AI");
    }

    try {
      const parsed = JSON.parse(jsonText) as GeminiResponseSchema;
      return parsed;
    } catch (e) {
      console.error("Failed to parse JSON response", jsonText);
      // Fallback in case of parsing error, defaulting to Navigator
      return {
        active_agent_id: "NAVIGATOR",
        response_text: "Maaf, terjadi kesalahan teknis dalam memproses permintaan Anda. Mohon coba lagi."
      };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};