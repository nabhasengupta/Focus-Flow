import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Task, ChatMessage } from "../types";

// Helper to convert blob to base64
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g. "data:audio/wav;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseVoiceCommand = async (audioBlob: Blob): Promise<Partial<Task>> => {
  const ai = getAI();
  const base64Audio = await blobToBase64(audioBlob);

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: audioBlob.type || 'audio/webm',
            data: base64Audio
          }
        },
        {
          text: `You are an ADHD-friendly task assistant. Extract task details from the audio.
          
          Context Info:
          - Current Local Time: ${new Date().toLocaleString()}
          - Timezone Offset: ${new Date().getTimezoneOffset()} minutes
          
          Rules:
          1. Infer a specific ISO date/time if mentioned (e.g. "tomorrow at 5pm"). 
             IMPORTANT: Calculate the date relative to the 'Current Local Time' provided above.
             Return the 'dueDate' in ISO 8601 format.
          2. If a meeting is implied (e.g. "schedule a call", "meeting with"), set hasMeeting to true.
          3. Extract any extra context into the 'context' field.
          `
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          dueDate: { type: Type.STRING, description: "ISO 8601 format or null" },
          context: { type: Type.STRING, description: "Notes or context found in the audio" },
          hasMeeting: { type: Type.BOOLEAN },
        },
        required: ["title", "hasMeeting"]
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text);
  }
  throw new Error("Failed to parse audio");
};

export const getCoachResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  const ai = getAI();
  
  // Convert history to Gemini format
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are a supportive, non-judgmental ADHD coach. Keep answers short, encouraging, and action-oriented. Help the user break down tasks or overcome distraction/paralysis. Do not be overly verbose.",
    },
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "I'm having trouble connecting. Try again?";
};

export const speakText = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Failed to generate speech");
  }
  return base64Audio;
};