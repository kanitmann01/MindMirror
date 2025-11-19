import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { GEMINI_INSIGHT_SCHEMA } from '@/lib/geminiService';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify API Key
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
    }

    // 2. Get Data
    const body = await req.json();
    const { profile, media } = body;

    if (!profile) {
      return NextResponse.json({ error: 'Missing profile data' }, { status: 400 });
    }

    // 3. Prompt Construction
    const prompt = `
      Act as an expert behavioral psychologist and data scientist.
      Analyze the following user profile, media consumption history, and mood logs.
      
      Goal: Generate a deep, personalized psychological insight and refine their personality scores based on the evidence.
      
      User Context:
      - Self-Reported Archetype: ${profile.archetype?.name}
      - Current OCEAN Scores: ${JSON.stringify(profile.oceanScore)}
      - MBTI: ${profile.mbti?.type}
      - Core Motivations: ${JSON.stringify(profile.motivations)}
      
      Media History (Last 10):
      ${media?.slice(0, 10).map((m: any) => `- ${m.title} (${m.category}) [Tags: ${m.intent?.join(', ')}]`).join('\n')}
      
      Task:
      1. infer a "Taste DNA" summary.
      2. write a 2-paragraph empathetic narrative explaining *why* they consume this content and what it says about their cognition.
      3. RE-EVALUATE their OCEAN scores based on the media evidence. (e.g., high complexity media -> higher Openness).
      4. suggest 3 actionable growth paths.
      5. provide a confidence score (0-100).
      
      Output strict JSON matching the provided schema.
    `;

    // 4. Initialize Client
    const ai = new GoogleGenAI({ apiKey });
    
    // 5. Call Model with JSON Mode
    const response: any = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: GEMINI_INSIGHT_SCHEMA,
      }
    });

    // 6. Parse & Return
    // Explicitly cast to any for safety across SDK versions
    const text = typeof response.text === 'function' ? response.text() : (response.text || "{}");
    const data = JSON.parse(text);

    return NextResponse.json({ 
        insight: data.narrative, // Backward compatibility
        structured: data 
    });

  } catch (error: any) {
    console.error("Gemini API Global Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate insight' }, { status: 500 });
  }
}
