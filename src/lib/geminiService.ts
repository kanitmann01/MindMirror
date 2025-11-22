
// --- JSON Schema for Gemini Output ---
export const GEMINI_INSIGHT_SCHEMA = {
  type: 'object',
  properties: {
    taste_dna: {
      type: 'string',
      description: 'A creative, 1-sentence summary of the user\'s psychological profile (e.g., "The Contemplative Explorer").',
    },
    narrative: {
      type: 'string',
      description: 'A 2-paragraph narrative explaining the user\'s personality, referencing specific media and moods.',
    },
    updated_scores: {
      type: 'object',
      properties: {
        openness: { type: 'integer' },
        conscientiousness: { type: 'integer' },
        extraversion: { type: 'integer' },
        agreeableness: { type: 'integer' },
        neuroticism: { type: 'integer' },
      },
      description: 'Revised OCEAN scores (0-100) based on deep analysis of inputs.',
    },
    growth_paths: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' }
        }
      },
      description: '3 actionable suggestions for personal growth.',
    },
    confidence_score: {
      type: 'integer',
      description: 'Confidence level in this analysis (0-100) based on data quantity and consistency.',
    },
    narrative_summary: {
      type: 'string',
      description: 'A concise, running summary (max 3 sentences) of the user\'s evolving profile, updated with new data.',
    }
  },
  required: ['taste_dna', 'narrative', 'updated_scores', 'growth_paths', 'confidence_score', 'narrative_summary'],
};

