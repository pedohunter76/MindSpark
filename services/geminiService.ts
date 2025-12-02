import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Question, SearchGroundingResult, Difficulty } from "../types";
import { base64ToUint8Array, decodeAudioData } from "../utils/audio";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text Question Generation ---

export async function generateQuestion(category: string, history: string[] = [], difficulty: Difficulty = 'Medium'): Promise<Question> {
  try {
    let difficultyContext = "";
    switch (difficulty) {
      case 'Easy':
        difficultyContext = "Generate a simple, beginner-friendly question focusing on common knowledge or fundamental concepts.";
        break;
      case 'Hard':
        difficultyContext = "Generate a challenging, obscure, or complex question that requires specific detailed knowledge.";
        break;
      case 'Medium':
      default:
        difficultyContext = "Generate a standard difficulty question balancing common knowledge with some specific details.";
        break;
    }

    let promptText = `${difficultyContext} The topic is ${category}. The explanation should be educational and concise (2-3 sentences). Include a helpful hint that gives a subtle clue without revealing the answer directly.`;
    
    if (history.length > 0) {
      promptText += `\n\nTo ensure variety, do not use the following questions or exact topics again:\n- ${history.join('\n- ')}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questionText: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING, description: "Must be one of the options" },
            explanation: { type: Type.STRING },
            hint: { type: Type.STRING, description: "A subtle clue to help the user" },
          },
          required: ["questionText", "options", "correctAnswer", "explanation", "hint"],
        },
      },
    });

    if (!response.text) throw new Error("No text response");
    const data = JSON.parse(response.text);
    return {
      id: crypto.randomUUID(),
      category,
      difficulty,
      ...data
    };
  } catch (error) {
    console.error("Error generating question:", error);
    throw error;
  }
}

// --- Search Grounding for Deep Dives ---

export async function deepDiveTopic(topic: string): Promise<{ text: string, sources: SearchGroundingResult[] }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Explain "${topic}" in detail. Include fun facts or historical context.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "Could not retrieve info.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sources: SearchGroundingResult[] = chunks.map((chunk: any) => ({
      url: chunk.web?.uri || "",
      title: chunk.web?.title || "Source",
    })).filter(s => s.url);

    return { text, sources };
  } catch (error) {
    console.error("Deep dive error:", error);
    return { text: "Error fetching details.", sources: [] };
  }
}

// --- Text To Speech ---

export async function playTextToSpeech(text: string, voiceName: string = 'Kore'): Promise<void> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      base64ToUint8Array(base64Audio),
      audioContext,
      24000,
      1
    );

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.error("TTS Error:", error);
  }
}