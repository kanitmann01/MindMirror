import { GameResult, DualNBackResult, StroopTestResult } from '../types/brainGym';

export interface TraitDistribution {
  mean: number; // 0-100
  variance: number;
}

export interface OCEANScore {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  distributions?: {
    openness: TraitDistribution;
    conscientiousness: TraitDistribution;
    extraversion: TraitDistribution;
    agreeableness: TraitDistribution;
    neuroticism: TraitDistribution;
  };
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
 * Updates a trait distribution using Bayesian inference with a Gaussian prior and observation.
 * @param prior The current belief about the trait (mean and variance).
 * @param observation The new data point (0-100 scale).
 * @param uncertainty The variance/uncertainty of the observation (e.g., 200).
 */
export const updateTrait = (prior: TraitDistribution, observation: number, uncertainty: number): TraitDistribution => {
  const newVariance = 1 / (1 / prior.variance + 1 / uncertainty);
  const newMean = newVariance * (prior.mean / prior.variance + observation / uncertainty);
  
  return {
    mean: Math.max(0, Math.min(100, newMean)), // Clamp between 0 and 100
    variance: newVariance
  };
};

/**
 * Calculates the Big Five (OCEAN) scores from questionnaire answers using Bayesian inference.
 */
export const calculateOCEAN = (answers: Record<string, number>): OCEANScore => {
  // Initialize priors with high uncertainty (uninformed prior)
  // Mean 50 (neutral), Variance 500 (broad spread)
  const distributions: Record<keyof OCEANScore, TraitDistribution> = {
    openness: { mean: 50, variance: 500 },
    conscientiousness: { mean: 50, variance: 500 },
    extraversion: { mean: 50, variance: 500 },
    agreeableness: { mean: 50, variance: 500 },
    neuroticism: { mean: 50, variance: 500 }
  } as any;

  const scores: OCEANScore = { 
    openness: 50, 
    conscientiousness: 50, 
    extraversion: 50, 
    agreeableness: 50, 
    neuroticism: 50 
  };
  
  const counts: Record<keyof OCEANScore, number> = { openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0 } as any;

  QUESTIONS.filter(q => q.category === 'ocean').forEach((q) => {
    const val = answers[q.id];
    if (val !== undefined) {
      let score = val; // 1-5 scale usually
      if (q.reverse) score = 6 - val;
      
      // Convert 1-5 scale to 0-100 observation
      const observation = (score - 1) * 25; 
      
      const traitKey = q.trait as keyof OCEANScore;
      
      // Update distribution
      // Uncertainty 200 reflects moderate confidence in a single quiz answer
      distributions[traitKey] = updateTrait(distributions[traitKey], observation, 200);
      counts[traitKey] += 1;
    }
  });

  // Map distributions back to scalar scores for compatibility
  const traitKeys: Array<'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'> = 
    ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

  traitKeys.forEach((key) => {
    // If we have actual data, use the updated mean, otherwise keep default 50
    if (counts[key] > 0) {
        const dists = distributions as unknown as Record<typeof key, TraitDistribution>;
        scores[key] = Math.round(dists[key].mean);
    }
  });

  // Attach the full distributions to the result
  scores.distributions = distributions as any;

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
 * Update OCEAN scores based on new media items using Bayesian Inference.
 * This creates a "living profile" that evolves with consumption habits.
 */
export const updateScoresWithMedia = (
  currentScores: OCEANScore,
  mediaItems: Array<{ 
    intent?: string[]; 
    mood?: string[]; 
    category?: string; 
    createdAt?: string | Date;
    consumptionStyle?: 'deep_dive' | 'binge' | 'background';
  }>
): OCEANScore => {
  const updatedScores = { ...currentScores };
  
  // Ensure distributions exist; if not, create them from scalar scores with default variance
  if (!updatedScores.distributions) {
    updatedScores.distributions = {
        openness: { mean: updatedScores.openness, variance: 500 },
        conscientiousness: { mean: updatedScores.conscientiousness, variance: 500 },
        extraversion: { mean: updatedScores.extraversion, variance: 500 },
        agreeableness: { mean: updatedScores.agreeableness, variance: 500 },
        neuroticism: { mean: updatedScores.neuroticism, variance: 500 },
    };
  }

  const BASE_OBSERVATION_STRENGTH = 10; // How much a media item "observes" a trait shift
  const BASE_UNCERTAINTY = 400; // Fairly high uncertainty for a single media item

  mediaItems.forEach(item => {
    // Calculate time decay weight (handles missing dates internally)
    const timeWeight = calculateTimeDecay(item.createdAt);
    // Effective uncertainty decreases as item is fresher? Or observation is stronger?
    // Let's model it as: observation strength is scaled by timeWeight. 
    // Actually, Bayesian update is about observation value and variance. 
    // Let's say older items have HIGHER uncertainty.
    
    const effectiveUncertainty = BASE_UNCERTAINTY / timeWeight; 

    // Helper to update a specific trait
    const applyUpdate = (trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism', direction: 'increase' | 'decrease') => {
       if (!updatedScores.distributions) return;
       
       const dists = updatedScores.distributions as unknown as Record<typeof trait, TraitDistribution>;
       const currentDist = dists[trait];
       // If increasing, we "observe" a 100. If decreasing, we "observe" a 0.
       // But that's too strong. Let's observe a "nudge" relative to current, or a fixed high/low point.
       // Standard approach: observe 100 for positive trait evidence, 0 for negative.
       const observation = direction === 'increase' ? 100 : 0;
       
       dists[trait] = updateTrait(currentDist, observation, effectiveUncertainty);
    };

    if (item.intent) {
      item.intent.forEach(intent => {
        switch (intent) {
          case 'learning':
            applyUpdate('openness', 'increase');
            break;
          case 'social':
            applyUpdate('extraversion', 'increase');
            break;
          case 'challenge':
            applyUpdate('conscientiousness', 'increase');
            break;
          case 'escapism':
            applyUpdate('neuroticism', 'increase'); // Escapism correlates with N
            break;
          case 'inspiration':
            applyUpdate('openness', 'increase');
            applyUpdate('agreeableness', 'increase');
            break;
        }
      });
    }

    if (item.consumptionStyle) {
      switch (item.consumptionStyle) {
        case 'deep_dive':
          // Active Learning -> High Conscientiousness, High Openness
          applyUpdate('conscientiousness', 'increase');
          applyUpdate('openness', 'increase');
          break;
        case 'binge':
          // Passive Consumption -> Low Conscientiousness, potentially High Neuroticism (escapism)
          applyUpdate('conscientiousness', 'decrease');
          applyUpdate('neuroticism', 'increase');
          break;
        case 'background':
          // Multitasking -> Low Conscientiousness
          applyUpdate('conscientiousness', 'decrease');
          // Maybe Extraversion increase?
          applyUpdate('extraversion', 'increase');
          break;
      }
    }
    if (item.mood) {
      item.mood.forEach(mood => {
        switch (mood) {
          case 'uplifting':
            applyUpdate('extraversion', 'increase');
            break;
          case 'relaxing':
            applyUpdate('neuroticism', 'decrease');
            break;
          case 'thought-provoking':
            applyUpdate('openness', 'increase');
            break;
          case 'intense':
            // Mixed signal?
            applyUpdate('extraversion', 'increase');
            break;
          case 'emotional':
             // High agreeableness, potentially high neuroticism
            applyUpdate('agreeableness', 'increase');
            applyUpdate('neuroticism', 'increase');
            break;
        }
      });
    }
  });

  // Sync scalar scores with new means
  const traits: Array<'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'> = 
    ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];

  traits.forEach((key) => {
    // Check if key is a valid trait (distributions has exact keys)
    const dists = updatedScores.distributions as unknown as Record<typeof key, TraitDistribution>;
    if (dists && dists[key]) {
        updatedScores[key] = Math.round(dists[key].mean);
    }
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
  
  // Ensure distributions exist
  if (!updatedScores.distributions) {
    updatedScores.distributions = {
        openness: { mean: updatedScores.openness, variance: 500 },
        conscientiousness: { mean: updatedScores.conscientiousness, variance: 500 },
        extraversion: { mean: updatedScores.extraversion, variance: 500 },
        agreeableness: { mean: updatedScores.agreeableness, variance: 500 },
        neuroticism: { mean: updatedScores.neuroticism, variance: 500 },
    };
  }
  
  const MOOD_UNCERTAINTY = 300; // Moods are strong but fleeting indicators

  const applyUpdate = (trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism', direction: 'increase' | 'decrease') => {
       if (!updatedScores.distributions) return;
       const dists = updatedScores.distributions as unknown as Record<typeof trait, TraitDistribution>;
       const currentDist = dists[trait];
       const observation = direction === 'increase' ? 100 : 0;
       dists[trait] = updateTrait(currentDist, observation, MOOD_UNCERTAINTY);
  };

  switch (moodEntry.mood) {
    case 'Happy':
      applyUpdate('extraversion', 'increase');
      applyUpdate('neuroticism', 'decrease');
      break;
    case 'Anxious':
      applyUpdate('neuroticism', 'increase');
      break;
    case 'Focused':
      applyUpdate('conscientiousness', 'increase');
      break;
    case 'Calm':
      applyUpdate('neuroticism', 'decrease');
      break;
    case 'Tired':
      applyUpdate('conscientiousness', 'decrease');
      break;
    case 'Sad':
      applyUpdate('neuroticism', 'increase');
      applyUpdate('extraversion', 'decrease');
      break;
  }

  // Sync scalars explicitly to avoid type gymnastics
  const traits: Array<'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'> = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  
  traits.forEach((key) => {
    // Check if key is a valid trait (distributions has exact keys)
    const dists = updatedScores.distributions as unknown as Record<keyof OCEANScore, TraitDistribution>;
    if (dists && dists[key]) {
        updatedScores[key] = Math.round(dists[key].mean);
    }
 });

  return updatedScores;
};

export const updateOCEANScoresFromMedia = (currentScores: OCEANScore, mediaItem: { intent?: string[], mood?: string[] }): OCEANScore => {
  return updateScoresWithMedia(currentScores, [mediaItem]);
}

// --- Digital Phenotyping ---

export interface BehavioralMetrics {
  avgScrollSpeed: number; // pixels per second
  avgClickHesitation: number; // ms pause before click
  uniqueRoutesVisited: number; // count
}

export interface BehavioralObservation {
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism';
  observation: number; // 0-100
  uncertainty: number;
}

/**
 * Maps raw behavioral metrics to trait observations with uncertainty.
 */
export const mapBehaviorToTraitUpdate = (metrics: BehavioralMetrics): BehavioralObservation[] => {
  const observations: BehavioralObservation[] = [];

  // 1. Scroll Speed (Impulsivity vs Calm)
  // Very fast scrolling may indicate skimming (Low Conscientiousness) or Anxiety (High Neuroticism)
  if (metrics.avgScrollSpeed > 1500) {
     // Fast scrolling
     observations.push({ trait: 'conscientiousness', observation: 30, uncertainty: 400 });
     observations.push({ trait: 'neuroticism', observation: 70, uncertainty: 450 });
  } else if (metrics.avgScrollSpeed < 300 && metrics.avgScrollSpeed > 0) {
     // Slow, deliberate reading?
     observations.push({ trait: 'conscientiousness', observation: 70, uncertainty: 400 });
  }

  // 2. Click Hesitation (Deliberation)
  // Long pause before clicking implies thinking/deliberating (High Conscientiousness)
  if (metrics.avgClickHesitation > 800) {
    observations.push({ trait: 'conscientiousness', observation: 80, uncertainty: 300 });
  } else if (metrics.avgClickHesitation < 200) {
    // Impulse clicking
    observations.push({ trait: 'conscientiousness', observation: 20, uncertainty: 350 });
  }

  // 3. Feature Exploration (Openness)
  // Visiting many different pages implies curiosity
  if (metrics.uniqueRoutesVisited >= 5) {
     observations.push({ trait: 'openness', observation: 85, uncertainty: 350 });
  } else if (metrics.uniqueRoutesVisited <= 2) {
     // Low exploration (could just be focused, so high uncertainty)
     observations.push({ trait: 'openness', observation: 40, uncertainty: 600 });
  }

  return observations;
};

/**
 * Updates OCEAN scores based on behavioral observations.
 */
export const updateScoresWithBehavior = (
  currentScores: OCEANScore,
  observations: BehavioralObservation[]
): OCEANScore => {
  const updatedScores = { ...currentScores };

  // Ensure distributions exist
  if (!updatedScores.distributions) {
    updatedScores.distributions = {
        openness: { mean: updatedScores.openness, variance: 500 },
        conscientiousness: { mean: updatedScores.conscientiousness, variance: 500 },
        extraversion: { mean: updatedScores.extraversion, variance: 500 },
        agreeableness: { mean: updatedScores.agreeableness, variance: 500 },
        neuroticism: { mean: updatedScores.neuroticism, variance: 500 },
    };
  }

  observations.forEach(obs => {
    if (updatedScores.distributions && updatedScores.distributions[obs.trait]) {
      const currentDist = updatedScores.distributions[obs.trait];
      updatedScores.distributions[obs.trait] = updateTrait(currentDist, obs.observation, obs.uncertainty);
    }
  });

  // Sync scalars explicitly to avoid type gymnastics
  const traits: Array<'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'> = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  
  traits.forEach((key) => {
    // Check if key is a valid trait (distributions has exact keys)
    const dists = updatedScores.distributions as unknown as Record<keyof OCEANScore, TraitDistribution>;
    if (dists && dists[key]) {
        updatedScores[key] = Math.round(dists[key].mean);
    }
 });

  return updatedScores;
};


// --- Neuroplasticity & Recommendation Engine ---

export interface NeuroplasticityPlan {
  type: 'consolidation' | 'remodeling' | 'maintenance';
  reasoning: string;
  focusTrait: string;
  mediaQuery: {
    category?: string;
    tags?: string[];
    intent?: string[];
    minRating?: number;
  };
}

/**
 * Suggests an adaptive plasticity plan based on trait variance.
 * High Variance (>300) -> Unstable -> Consolidation (LTP)
 * Low Variance (<100) -> Rigid -> Remodeling (Dendritic Growth)
 */
export const suggestNeuroplasticityPath = (traitProfile: OCEANScore): NeuroplasticityPlan => {
  // If no distributions, return default maintenance
  if (!traitProfile.distributions) {
    return {
      type: 'maintenance',
      reasoning: 'Profile is not yet calibrated enough for deep plasticity analysis.',
      focusTrait: 'general',
      mediaQuery: { intent: ['learning', 'inspiration'] }
    };
  }

  let selectedPlan: NeuroplasticityPlan | null = null;
  let maxVariance = -1;
  let minVariance = 9999;

  // Iterate to find extremes
  const entries = Object.entries(traitProfile.distributions);
  
  // 1. Check for High Variance (Unstable) - Priority
  for (const [trait, dist] of entries) {
    if (dist.variance > 300) {
      if (dist.variance > maxVariance) {
        maxVariance = dist.variance;
        // Construct Consolidation Plan
        selectedPlan = {
          type: 'consolidation',
          focusTrait: trait,
          reasoning: `Your ${trait} levels are fluctuating (high variance). Synaptic consolidation is required to stabilize this trait. We recommend repeating a familiar, positive habit to trigger Long-Term Potentiation (LTP).`,
          mediaQuery: {
            // Suggest comforting/familiar content or specific stabilizing intents
            intent: ['inspiration', 'relaxing'], // General stabilizers
            tags: [trait, 'comfort'],
            minRating: 4 // Only high quality stuff
          }
        };
      }
    }
  }

  if (selectedPlan) return selectedPlan;

  // 2. Check for Low Variance (Rigid) - Secondary Priority
  for (const [trait, dist] of entries) {
    if (dist.variance < 100) {
      if (dist.variance < minVariance) {
        minVariance = dist.variance;
        // Construct Remodeling Plan
        selectedPlan = {
          type: 'remodeling',
          focusTrait: trait,
          reasoning: `Your ${trait} levels are very rigid (low variance). To foster growth, we need to trigger dendritic branching through novelty injection. A 'Cognitive Flexibility' task is recommended.`,
          mediaQuery: {
             // Suggest novel/challenging content
             intent: ['learning', 'challenge', 'thought-provoking'],
             category: 'documentary' // Example of expanding horizons
          }
        };
      }
    }
  }

  if (selectedPlan) return selectedPlan;

  // 3. Default / Maintenance
  return {
    type: 'maintenance',
    focusTrait: 'balanced',
    reasoning: 'Your personality profile is currently balanced. Continue exploring diverse content to maintain healthy synaptic plasticity.',
    mediaQuery: {
      intent: ['inspiration', 'social']
    }
  };
};

/**
 * Updates OCEAN scores based on Brain Gym game results.
 */
export const updateScoresWithGameResult = (
  currentScores: OCEANScore,
  result: GameResult
): OCEANScore => {
  const updatedScores = { ...currentScores };

  // Ensure distributions exist
  if (!updatedScores.distributions) {
    updatedScores.distributions = {
        openness: { mean: updatedScores.openness, variance: 500 },
        conscientiousness: { mean: updatedScores.conscientiousness, variance: 500 },
        extraversion: { mean: updatedScores.extraversion, variance: 500 },
        agreeableness: { mean: updatedScores.agreeableness, variance: 500 },
        neuroticism: { mean: updatedScores.neuroticism, variance: 500 },
    };
  }

  const applyUpdate = (trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism', observation: number, uncertainty: number) => {
    if (updatedScores.distributions) {
        const dists = updatedScores.distributions as unknown as Record<typeof trait, TraitDistribution>;
        if (dists[trait]) {
            const currentDist = dists[trait];
            dists[trait] = updateTrait(currentDist, observation, uncertainty);
        }
    }
  };

  if (result.gameId === 'dual-n-back') {
    const dnbResult = result as DualNBackResult;
    // High nLevel = High Conscientiousness
    // nLevel 1 is baseline. nLevel 2 is good. nLevel 3+ is excellent.
    // Observation: 85 (high C), Uncertainty: 10 (very confident if high level reached)
    
    let obs = 60;
    let unc = 100;

    if (dnbResult.nLevel >= 3) {
      obs = 90;
      unc = 20;
    } else if (dnbResult.nLevel === 2) {
      obs = 75;
      unc = 50;
    }

    applyUpdate('conscientiousness', obs, unc);

  } else if (result.gameId === 'stroop-test') {
    const stroopResult = result as StroopTestResult;
    // High Error Rate = Low Inhibition (High Impulsivity/Neuroticism)
    // Low Error Rate (< 5%) = High Conscientiousness / Low Neuroticism
    // Slow Reaction Time (> 1.5s) = Low Processing Speed (maybe correlated with low Openness/C?)

    // 1. Error Rate Impact on Neuroticism/Conscientiousness
    if (stroopResult.errorRate > 10) {
        // > 10% errors -> High Neuroticism (anxiety/impulsivity)
        applyUpdate('neuroticism', 80, 100);
        applyUpdate('conscientiousness', 30, 150);
    } else if (stroopResult.errorRate < 5) {
        // < 5% errors -> Low Neuroticism, High Conscientiousness
        applyUpdate('neuroticism', 30, 100);
        applyUpdate('conscientiousness', 80, 100);
    }
  }

  // Sync scalars explicitly to avoid type gymnastics
  const traits: Array<'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'neuroticism'> = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  
  traits.forEach((key) => {
    // Check if key is a valid trait (distributions has exact keys)
    const dists = updatedScores.distributions as unknown as Record<keyof OCEANScore, TraitDistribution>;
    if (dists && dists[key]) {
        updatedScores[key] = Math.round(dists[key].mean);
    }
 });

  return updatedScores;
};
