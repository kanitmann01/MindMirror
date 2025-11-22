import { UserProfile } from './firestoreUtils';

export interface OCEANScore {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface MBTIResult {
  type: string; // e.g., 'INTJ'
  breakdown: {
    E: number; I: number;
    N: number; S: number;
    T: number; F: number;
    J: number; P: number;
  };
}

export interface CognitiveStyle {
  analytical: number; // 0-100
  creative: number;   // 0-100
  fast: number;       // 0-100 (vs deliberative)
  deliberative: number; // 0-100
}

export interface Motivations {
  achievement: number;
  curiosity: number;
  sociality: number;
  security: number;
  novelty_seeking: number;
}

export interface Archetype {
  id: string;
  name: string;
  description: string;
  traits: string[];
  color: string;
}

export const ARCHETYPES: Record<string, Archetype> = {
  EXPLORER: {
    id: 'explorer',
    name: 'The Explorer',
    description: 'You seek novelty and intellectual challenges. Your mind is a playground of ideas.',
    traits: ['Curious', 'Inventive', 'Open-minded'],
    color: '#3B82F6', // Blue
  },
  SENTINEL: {
    id: 'sentinel',
    name: 'The Sentinel',
    description: 'You value structure, order, and reliability. You find comfort in clarity.',
    traits: ['Organized', 'Loyal', 'Consistent'],
    color: '#10B981', // Green
  },
  DIPLOMAT: {
    id: 'diplomat',
    name: 'The Diplomat',
    description: "You are tuned into others' emotions and seek harmony in your connections.",
    traits: ['Empathetic', 'Cooperative', 'Warm'],
    color: '#F59E0B', // Amber
  },
  ANALYST: {
    id: 'analyst',
    name: 'The Analyst',
    description: 'You approach the world with logic and a thirst for competence.',
    traits: ['Logical', 'Objective', 'Strategic'],
    color: '#8B5CF6', // Violet
  },
  CREATOR: {
    id: 'creator',
    name: 'The Creator',
    description: 'You are driven by expression and imagination, seeing possibilities everywhere.',
    traits: ['Creative', 'Expressive', 'Visionary'],
    color: '#EC4899', // Pink
  }
};

// --- Standardized Mood System ---
export interface MoodConstant {
  label: string;
  color: string; // Hex
  iconName?: string; // For reference if needed
}

export const MOOD_CONSTANTS: MoodConstant[] = [
  { label: 'Happy', color: '#FFD700' },   // Amber/Gold
  { label: 'Focused', color: '#00008B' }, // Deep Blue
  { label: 'Calm', color: '#50C878' },    // Emerald Green
  { label: 'Anxious', color: '#BF00FF' }, // Electric Purple
  { label: 'Tired', color: '#708090' },   // Slate/Grey
  { label: 'Sad', color: '#708090' },     // Slate/Grey (Shared color)
];

export interface Question {
  id: string;
  text: string;
  category: 'ocean' | 'mbti' | 'cognitive' | 'motivation';
  trait: string; // Specific trait within category (e.g. 'openness', 'EI', 'analytical')
  reverse?: boolean;
  options?: { label: string, value: number }[]; // Optional specific answers
  // Semantic labels for slider
  leftLabel?: string;
  rightLabel?: string;
}

export const QUESTIONS: Question[] = [
  // OCEAN (Big Five)
  { id: 'q1', text: 'I enjoy trying new and foreign foods.', category: 'ocean', trait: 'openness', leftLabel: 'Routine', rightLabel: 'Novelty' },
  { id: 'q2', text: 'I like to have a detailed plan.', category: 'ocean', trait: 'conscientiousness', leftLabel: 'Spontaneous', rightLabel: 'Planned' },
  { id: 'q3', text: 'I feel comfortable around people.', category: 'ocean', trait: 'extraversion', leftLabel: 'Solitary', rightLabel: 'Social' },
  { id: 'q4', text: "I sympathize with others' feelings.", category: 'ocean', trait: 'agreeableness', leftLabel: 'Detached', rightLabel: 'Empathetic' },
  { id: 'q5', text: 'I get stressed out easily.', category: 'ocean', trait: 'neuroticism', leftLabel: 'Resilient', rightLabel: 'Sensitive' },
  { id: 'q6', text: 'I have a vivid imagination.', category: 'ocean', trait: 'openness', leftLabel: 'Grounded', rightLabel: 'Imaginative' },
  { id: 'q7', text: 'I pay attention to details.', category: 'ocean', trait: 'conscientiousness', leftLabel: 'Big Picture', rightLabel: 'Detailed' },
  { id: 'q8', text: 'I keep in the background.', category: 'ocean', trait: 'extraversion', reverse: true, leftLabel: 'Center Stage', rightLabel: 'Background' },
  { id: 'q9', text: "I am not interested in other people's problems.", category: 'ocean', trait: 'agreeableness', reverse: true, leftLabel: 'Caring', rightLabel: 'Indifferent' },
  { id: 'q10', text: 'I am relaxed most of the time.', category: 'ocean', trait: 'neuroticism', reverse: true, leftLabel: 'Anxious', rightLabel: 'Relaxed' },

  // MBTI - Dichotomies
  { id: 'mbti1', text: 'At parties, I prefer to:', category: 'mbti', trait: 'EI', options: [{ label: 'Interact with many, including strangers', value: 5 }, { label: 'Interact with a few known people', value: 1 }] },
  { id: 'mbti2', text: 'I am more interested in:', category: 'mbti', trait: 'NS', options: [{ label: 'What is possible and inventive', value: 5 }, { label: 'What is actual and practical', value: 1 }] },
  { id: 'mbti3', text: 'When making decisions, I rely more on:', category: 'mbti', trait: 'TF', options: [{ label: 'Logic and consistency', value: 1 }, { label: 'Values and harmony', value: 5 }] }, // 1=T, 5=F
  { id: 'mbti4', text: 'I prefer to have things:', category: 'mbti', trait: 'JP', options: [{ label: 'Settled and decided', value: 1 }, { label: 'Open-ended and flexible', value: 5 }] }, // 1=J, 5=P

  // Cognitive Style
  { id: 'cog1', text: 'I prefer to solve problems by:', category: 'cognitive', trait: 'analytical_creative', options: [{ label: 'Analyzing data and logic', value: 1 }, { label: 'Brainstorming new possibilities', value: 5 }] }, // 1=Analytical, 5=Creative
  { id: 'cog2', text: 'When faced with a decision, I usually:', category: 'cognitive', trait: 'fast_deliberative', options: [{ label: 'Decide quickly on gut instinct', value: 1 }, { label: 'Take time to weigh all options', value: 5 }] }, // 1=Fast, 5=Deliberative

  // Motivations
  { id: 'mot1', text: 'It is very important to me to be successful and recognized.', category: 'motivation', trait: 'achievement', leftLabel: 'Modest', rightLabel: 'Ambitious' },
  { id: 'mot2', text: 'I constantly want to learn how things work.', category: 'motivation', trait: 'curiosity', leftLabel: 'Content', rightLabel: 'Inquisitive' },
  { id: 'mot3', text: 'I value deep connections with friends and family above all.', category: 'motivation', trait: 'sociality', leftLabel: 'Independent', rightLabel: 'Connected' },
  { id: 'mot4', text: 'I prefer a stable and predictable life.', category: 'motivation', trait: 'security', leftLabel: 'Dynamic', rightLabel: 'Stable' },
  { id: 'mot5', text: 'I am always looking for the next big adventure.', category: 'motivation', trait: 'novelty_seeking', leftLabel: 'Routine', rightLabel: 'Adventure' },
];

/**
 * Calculates the Big Five (OCEAN) scores from questionnaire answers.
 */
export const calculateOCEAN = (answers: Record<string, number>): OCEANScore => {
  const scores: OCEANScore = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };
  const counts: Record<keyof OCEANScore, number> = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 };

  QUESTIONS.filter(q => q.category === 'ocean').forEach((q) => {
    const val = answers[q.id];
    if (val !== undefined) {
      let score = val;
      if (q.reverse) score = 6 - val;
      scores[q.trait as keyof OCEANScore] += score;
      counts[q.trait as keyof OCEANScore] += 1;
    }
  });

  (Object.keys(scores) as Array<keyof OCEANScore>).forEach((key) => {
    if (counts[key] > 0) scores[key] = Math.round((scores[key] / counts[key]) * 20);
  });

  return scores;
};

/**
 * Calculates MBTI-style dichotomy scores.
 */
export const calculateMBTI = (answers: Record<string, number>): MBTIResult => {
  // Default mid-points
  let E = 50, I = 50, N = 50, S = 50, T = 50, F = 50, J = 50, P = 50;

  if (answers['mbti1']) {
    const val = answers['mbti1']; // 1(I) to 5(E)
    E = val * 20; I = 100 - E;
  }
  if (answers['mbti2']) {
    const val = answers['mbti2']; // 1(S) to 5(N)
    N = val * 20; S = 100 - N;
  }
  if (answers['mbti3']) {
    const val = answers['mbti3']; // 1(T) to 5(F)
    F = val * 20; T = 100 - F;
  }
  if (answers['mbti4']) {
    const val = answers['mbti4']; // 1(J) to 5(P)
    P = val * 20; J = 100 - P;
  }

  const type = (E > I ? 'E' : 'I') + (N > S ? 'N' : 'S') + (T > F ? 'T' : 'F') + (J > P ? 'J' : 'P');

  return {
    type,
    breakdown: { E, I, N, S, T, F, J, P }
  };
};

/**
 * Calculates cognitive style scores (Analytical vs Creative, Fast vs Deliberative).
 */
export const calculateCognitive = (answers: Record<string, number>): CognitiveStyle => {
  // 1=Analytical/Fast, 5=Creative/Deliberative
  let analytical = 50, creative = 50, fast = 50, deliberative = 50;

  if (answers['cog1']) { // 1=Analytic, 5=Creative
    creative = answers['cog1'] * 20;
    analytical = 100 - creative;
  }
  if (answers['cog2']) { // 1=Fast, 5=Delib
    deliberative = answers['cog2'] * 20;
    fast = 100 - deliberative;
  }

  return { analytical, creative, fast, deliberative };
};

/**
 * Calculates core motivation scores.
 */
export const calculateMotivations = (answers: Record<string, number>): Motivations => {
  const scores: Motivations = { achievement: 0, curiosity: 0, sociality: 0, security: 0, novelty_seeking: 0 };

  QUESTIONS.filter(q => q.category === 'motivation').forEach(q => {
    if (answers[q.id]) {
      scores[q.trait as keyof Motivations] = answers[q.id] * 20; // 1-5 -> 20-100
    }
  });

  return scores;
};

/**
 * Determines the user's archetype based on OCEAN scores using heuristic thresholds.
 */
export const determineArchetype = (scores: OCEANScore): Archetype => {
  const { openness, conscientiousness, agreeableness, extraversion, neuroticism } = scores;

  // Simple heuristic for prototype
  if (openness >= 70) return ARCHETYPES.EXPLORER;
  if (openness >= 60 && conscientiousness < 50) return ARCHETYPES.CREATOR;
  if (conscientiousness >= 70) return ARCHETYPES.SENTINEL;
  if (agreeableness >= 70) return ARCHETYPES.DIPLOMAT;
  if (extraversion < 40 && neuroticism < 40) return ARCHETYPES.ANALYST; // Calm, introverted

  // Default
  return ARCHETYPES.EXPLORER; // Bias towards growth
};

/**
 * Analyzes a title and description string to infer psychological mood and intent tags.
 */
export const analyzeMediaContent = (title: string, description: string = ''): { mood: string[], intent: string[] } => {
  const text = (title + ' ' + description).toLowerCase();
  const mood = new Set<string>();
  const intent = new Set<string>();

  // Tech/Science (Openness, Analytical)
  if (/(tech|code|software|science|physics|biology|space|nasa|engineering|developer|programming|linux|computer|math)/.test(text)) {
    intent.add('learning');
    mood.add('thought-provoking');
  }

  // Gaming (Escapism, Competition)
  if (/(gaming|gameplay|let's play|walkthrough|speedrun|fortnite|minecraft|roblox|ign|gamespot|nintendo|playstation|xbox|esports)/.test(text)) {
    intent.add('escapism');
    intent.add('challenge');
    mood.add('intense');
    mood.add('funny');
  }

  // Comedy/Entertainment (Extraversion, Escapism)
  if (/(comedy|funny|prank|standup|skit|vine|tiktok|meme|react|bloopers|fail)/.test(text)) {
    intent.add('escapism');
    mood.add('funny');
    mood.add('uplifting');
  }

  // Music/Art (Openness, Creative)
  if (/(music|official video|lyrics|cover|art|draw|paint|design|sketch|creative|tutorial|guitar|piano)/.test(text)) {
    intent.add('inspiration');
    intent.add('learning');
    mood.add('uplifting');
    mood.add('emotional');
  }

  // News/Politics (Conscientiousness, Analytical)
  if (/(news|politics|debate|daily|report|update|world|economy|market|finance|money|stock|crypto)/.test(text)) {
    intent.add('learning');
    intent.add('challenge');
    mood.add('thought-provoking');
    mood.add('intense');
  }

  // Lifestyle/Vlog (Extraversion, Agreeableness)
  if (/(vlog|daily|life|routine|grwm|family|couple|travel|food|cooking|kitchen|recipe|fitness|gym|workout)/.test(text)) {
    intent.add('inspiration');
    intent.add('social');
    mood.add('relaxing');
    mood.add('uplifting');
  }

  // Defaults if nothing found
  if (mood.size === 0) mood.add('uplifting');
  if (intent.size === 0) intent.add('escapism');

  return {
    mood: Array.from(mood),
    intent: Array.from(intent)
  };
};

/**
 * Calculates a time-decay weight based on how long ago an item was logged.
 * Uses a Half-Life formula: Weight = 0.5 ^ (DaysAgo / 90).
 * Items < 7 days old are ~1.0.
 * Items > 90 days old are ~0.5.
 * Clamped between 0.1 and 1.0.
 * Returns 1.0 (full weight) if date is missing or invalid.
 */
export const calculateTimeDecay = (dateLogged?: Date | string | null): number => {
  // Handle missing dates by assuming "today" (full weight)
  if (!dateLogged) return 1.0;

  const now = new Date();
  const logged = new Date(dateLogged);

  // Handle invalid dates
  if (isNaN(logged.getTime())) return 1.0;

  const diffTime = Math.abs(now.getTime() - logged.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If less than 7 days, treat as fresh (1.0)
  if (diffDays < 7) return 1.0;

  // Half-life formula: 90 days = 0.5 weight
  const weight = Math.pow(0.5, diffDays / 90);

  // Clamp between 0.1 and 1.0
  return Math.max(0.1, Math.min(1.0, weight));
};

/**
 * Update OCEAN scores based on new media items.
 * This creates a "living profile" that evolves with consumption habits.
 */
export const updateScoresWithMedia = (
  currentScores: OCEANScore,
  mediaItems: Array<{ intent?: string[]; mood?: string[]; category?: string; createdAt?: string | Date }>
): OCEANScore => {
  const updatedScores = { ...currentScores };

  // Base Weight: How much influence does 1 media item have?
  const BASE_WEIGHT = 0.5;

  mediaItems.forEach(item => {
    // Calculate time decay weight (handles missing dates internally)
    const timeWeight = calculateTimeDecay(item.createdAt);
    const effectiveWeight = BASE_WEIGHT * timeWeight;

    if (item.intent) {
      item.intent.forEach(intent => {
        switch (intent) {
          case 'learning':
            updatedScores.openness = Math.min(100, updatedScores.openness + effectiveWeight);
            break;
          case 'social':
            updatedScores.extraversion = Math.min(100, updatedScores.extraversion + effectiveWeight);
            break;
          case 'challenge':
            updatedScores.conscientiousness = Math.min(100, updatedScores.conscientiousness + effectiveWeight);
            break;
          case 'escapism':
            updatedScores.neuroticism = Math.min(100, updatedScores.neuroticism + effectiveWeight * 0.5);
            break;
          case 'inspiration':
            updatedScores.openness = Math.min(100, updatedScores.openness + effectiveWeight);
            updatedScores.agreeableness = Math.min(100, updatedScores.agreeableness + effectiveWeight * 0.5);
            break;
        }
      });
    }
    if (item.mood) {
      item.mood.forEach(mood => {
        switch (mood) {
          case 'uplifting':
            updatedScores.extraversion = Math.min(100, updatedScores.extraversion + effectiveWeight);
            break;
          case 'relaxing':
            updatedScores.neuroticism = Math.max(0, updatedScores.neuroticism - effectiveWeight);
            break;
          case 'thought-provoking':
            updatedScores.openness = Math.min(100, updatedScores.openness + effectiveWeight);
            break;
          case 'intense':
            updatedScores.extraversion = Math.min(100, updatedScores.extraversion + effectiveWeight * 0.5);
            break;
          case 'emotional':
            updatedScores.neuroticism = Math.min(100, updatedScores.neuroticism + effectiveWeight * 0.5);
            updatedScores.agreeableness = Math.min(100, updatedScores.agreeableness + effectiveWeight * 0.5);
            break;
        }
      });
    }
  });

  // Round to integers for cleaner display
  (Object.keys(updatedScores) as Array<keyof OCEANScore>).forEach((key) => {
    updatedScores[key] = Math.round(updatedScores[key]);
  });

  return updatedScores;
};

/**
 * Updates OCEAN scores based on a new mood entry.
 */
export const updateScoresWithMood = (
  currentScores: OCEANScore,
  moodEntry: { mood: string, intensity: number }
): OCEANScore => {
  const updatedScores = { ...currentScores };
  // Moods have a temporary but immediate impact
  const MOOD_WEIGHT = 1.0;

  switch (moodEntry.mood) {
    case 'Happy':
      updatedScores.extraversion = Math.min(100, updatedScores.extraversion + MOOD_WEIGHT);
      updatedScores.neuroticism = Math.max(0, updatedScores.neuroticism - MOOD_WEIGHT);
      break;
    case 'Anxious':
      updatedScores.neuroticism = Math.min(100, updatedScores.neuroticism + MOOD_WEIGHT);
      break;
    case 'Focused':
      updatedScores.conscientiousness = Math.min(100, updatedScores.conscientiousness + MOOD_WEIGHT);
      break;
    case 'Calm':
      updatedScores.neuroticism = Math.max(0, updatedScores.neuroticism - MOOD_WEIGHT);
      break;
    case 'Tired':
      updatedScores.conscientiousness = Math.max(0, updatedScores.conscientiousness - MOOD_WEIGHT);
      break;
    case 'Sad':
      updatedScores.neuroticism = Math.min(100, updatedScores.neuroticism + MOOD_WEIGHT);
      updatedScores.extraversion = Math.max(0, updatedScores.extraversion - MOOD_WEIGHT);
      break;
  }

  // Round to integers
  (Object.keys(updatedScores) as Array<keyof OCEANScore>).forEach((key) => {
    updatedScores[key] = Math.round(updatedScores[key]);
  });

  return updatedScores;
};

export const updateOCEANScoresFromMedia = (currentScores: OCEANScore, mediaItem: { intent?: string[], mood?: string[] }): OCEANScore => {
  return updateScoresWithMedia(currentScores, [mediaItem]);
}
