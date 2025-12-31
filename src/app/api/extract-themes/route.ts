import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    const { title, category } = await req.json();

    const schema = z.object({
      themes: z.array(z.string()).describe("3 distinct psychological themes related to the media content."),
    });

    const prompt = `Analyze the ${category} titled "${title}". Extract exactly 3 'Psychological Themes' (e.g., 'Existentialism', 'High Energy', 'Resilience') that represent the core mood or message.`;

    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: schema,
      prompt: prompt,
    });

    return NextResponse.json(object);

  } catch (error: any) {
    console.error("Gemini Theme Extraction Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to extract themes' }, { status: 500 });
  }
}

