import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify API Key
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    // 2. Get Data
    const body = await req.json();
    const { profile, media } = body;

    if (!profile) {
      return NextResponse.json({ error: 'Missing profile data' }, { status: 400 });
    }

    // 3. Define Schema with Zod
    const personalitySchema = z.object({
      // Core fields requested
      narrative: z.string().describe("A 2-paragraph narrative explaining the user's personality, referencing specific media and moods."),
      dominantArchetype: z.enum(['The Explorer', 'The Sentinel', 'The Diplomat', 'The Analyst', 'The Creator']).describe("The user's dominant archetype based on their profile."),
      suggestedMedia: z.array(z.object({
        title: z.string(),
        reason: z.string(),
        type: z.enum(['Book', 'Movie', 'Podcast', 'Music', 'Article', 'Video'])
      })).describe("3 new media recommendations that fit their taste DNA."),
      uiTrigger: z.enum(['show-graph', 'show-goals', 'show-prescription']).describe("The best UI component to show the user right now based on their state."),

      // Backward compatibility fields for InsightsSection
      taste_dna: z.string().describe("A creative, 1-sentence summary of the user's psychological profile (e.g., 'The Contemplative Explorer')."),
      updated_scores: z.object({
        openness: z.number(),
        conscientiousness: z.number(),
        extraversion: z.number(),
        agreeableness: z.number(),
        neuroticism: z.number(),
      }).describe("Revised OCEAN scores (0-100) based on deep analysis of inputs."),
      growth_paths: z.array(z.object({
        title: z.string(),
        description: z.string()
      })).describe("3 actionable suggestions for personal growth."),
      confidence_score: z.number().describe("Confidence level in this analysis (0-100)."),
      narrative_summary: z.string().describe("A concise, running summary (max 3 sentences) of the user's evolving profile.")
    });

    // 4. Prompt Construction
    const prompt = `
      Act as an expert behavioral psychologist and data scientist.
      Analyze the following user profile, media consumption history, and mood logs.
      
      Goal: Generate a deep, personalized psychological insight and refine their personality scores based on the evidence.
      
      User Context:
      - Self-Reported Archetype: ${profile.archetype?.name}
      - Current OCEAN Scores: ${JSON.stringify(profile.oceanScore)}
      - MBTI: ${profile.mbti?.type}
      - Core Motivations: ${JSON.stringify(profile.motivations)}
      - Previous Narrative Summary: ${profile.narrative_summary || "None yet."}
      
      Media History (Last 10):
      ${media?.slice(0, 10).map((m: any) => `- ${m.title} (${m.category}) [Tags: ${m.intent?.join(', ')}]`).join('\n')}
      
      Task:
      1. Update the "Running Narrative Summary" (max 3 sentences).
      2. Infer a "Taste DNA" summary.
      3. Write a 2-paragraph empathetic narrative.
      4. RE-EVALUATE their OCEAN scores.
      5. Suggest 3 actionable growth paths.
      6. Provide a confidence score (0-100).
      7. Determine the "Dominant Archetype" from the list: 'The Explorer', 'The Sentinel', 'The Diplomat', 'The Analyst', 'The Creator'.
      8. Suggest 3 NEW media items they might like.
      9. Choose a "UI Trigger" to engage them:
         - 'show-graph': If their profile is complex, they are analytical, or they need to see connections (High Openness/Conscientiousness).
         - 'show-prescription': If they seem stressed, anxious, or need emotional regulation (High Neuroticism, Low Energy).
         - 'show-goals': If they are driven, ambitious, or need structure (High Conscientiousness/Extraversion).
      
      Generate the response matching the schema.
    `;

    // 5. Call Model with generateObject
    const { object } = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: personalitySchema,
      prompt: prompt,
    });

    // 6. Return Structured Data
    return NextResponse.json({
      insight: object.narrative, // Backward compatibility
      structured: object
    });

  } catch (error: any) {
    console.error("Gemini API Global Error:", error);
    return NextResponse.json({ error: error.message || 'Failed to generate insight' }, { status: 500 });
  }
}
