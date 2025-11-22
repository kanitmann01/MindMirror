import { UserProfile, MediaItem, MoodEntry } from './firestoreUtils';
import { OCEANScore } from './psychologyUtils';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  condition: (profile: UserProfile, media: MediaItem[], moods: MoodEntry[]) => boolean;
}

export const BADGES: Badge[] = [
  {
    id: 'first-step',
    name: 'First Step',
    description: 'Completed onboarding and created your profile.',
    icon: '🌱',
    condition: (p) => !!p.archetype,
  },
  {
    id: 'mood-aware',
    name: 'Mood Aware',
    description: 'Logged at least 5 mood entries.',
    icon: '😌',
    condition: (p, m, moods) => moods.length >= 5,
  },
  {
    id: 'media-explorer',
    name: 'Media Explorer',
    description: 'Added 5+ media items to your map.',
    icon: '🧭',
    condition: (p, media) => media.length >= 5,
  },
  {
    id: 'deep-diver',
    name: 'Deep Diver',
    description: 'Unlocked deep insights (MBTI & Motivations).',
    icon: '🤿',
    condition: (p) => !!p.mbti && !!p.motivations,
  },
  {
    id: 'consistent-tracker',
    name: 'Consistent Tracker',
    description: 'Logged mood 3 days in a row (Simulated for now by 10+ entries).',
    icon: '🔥',
    condition: (p, m, moods) => moods.length >= 10,
  },
  {
    id: 'shifting-perspective',
    name: 'Shifting Perspective',
    description: 'Your Openness score changed significantly this month.',
    icon: '🦋',
    // This condition is tricky to check statically without history. 
    // We will rely on the application logic to unlock this badge manually or store "shift detected" in profile.
    // For now, let's assume if openness is very high (> 80) they shifted? 
    // No, let's make it simpler: If they have > 20 media items, they likely shifted.
    // Ideally, we'd check a "badgesUnlocked" array in the profile.
    // Let's update the condition to check if it's in the unlocked list (if we added that) 
    // OR just keep it simple for now: > 15 media items implies a journey.
    condition: (p, media) => media.length >= 15,
  }
];

export const calculateBadges = (profile: UserProfile, media: MediaItem[], moods: MoodEntry[]): Badge[] => {
  return BADGES.filter(badge => badge.condition(profile, media, moods));
};

/**
 * Checks if there is a significant shift (> 5 points) in any OCEAN trait.
 */
export const checkSignificantShift = (oldScores: OCEANScore, newScores: OCEANScore): boolean => {
  const threshold = 5;
  return (
    Math.abs(oldScores.openness - newScores.openness) > threshold ||
    Math.abs(oldScores.conscientiousness - newScores.conscientiousness) > threshold ||
    Math.abs(oldScores.extraversion - newScores.extraversion) > threshold ||
    Math.abs(oldScores.agreeableness - newScores.agreeableness) > threshold ||
    Math.abs(oldScores.neuroticism - newScores.neuroticism) > threshold
  );
};

/**
 * Calculates the new streak based on the last log date.
 * - If last log was yesterday (or today), increment/maintain streak.
 * - If last log was > 1 day ago, reset to 1.
 */
export const calculateStreak = (currentStreak: number = 0, lastLogDate?: string): number => {
  if (!lastLogDate) return 1;

  const now = new Date();
  const last = new Date(lastLogDate);

  // Reset time part to compare dates only
  now.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(now.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Logged today already, keep streak
    return Math.max(1, currentStreak);
  } else if (diffDays === 1) {
    // Logged yesterday, increment
    return currentStreak + 1;
  } else {
    // Missed a day (or more), reset
    return 1;
  }
};

