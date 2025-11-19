import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });

    const { recentMoods, archetype } = await req.json();

    const prompt = `
      User Context:
      - Archetype: ${archetype}
      - Recent Moods: ${recentMoods.map((m: any) => `${m.mood} (Intensity: ${m.intensity})`).join(', ')}
      
      Task: Generate a short, single-sentence, empathetic journaling prompt to help them reflect.
      Example: "You've been feeling anxious lately; what is one small thing you can control today?"
      
      Keep it under 20 words. Direct and warm.
    `;

    const ai = new GoogleGenAI({ apiKey });
    const response: any = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const text = typeof response.text === 'function' ? response.text() : (response.text || "What's on your mind today?");
    
    return NextResponse.json({ prompt: text.trim() });

  } catch (error: any) {
    console.error("Gemini Journaling Error:", error);
    // Fallback prompts
    const fallbacks = [
        "What is one thing you are grateful for right now?",
        "What's occupying your mind the most today?",
        "How can you be kind to yourself right now?",
    ];
    return NextResponse.json({ prompt: fallbacks[Math.floor(Math.random() * fallbacks.length)] });
  }
}

