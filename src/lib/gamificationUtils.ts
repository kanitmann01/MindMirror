import { UserProfile, MediaItem, MoodEntry } from './firestoreUtils';

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
];

export const calculateBadges = (profile: UserProfile, media: MediaItem[], moods: MoodEntry[]): Badge[] => {
  return BADGES.filter(badge => badge.condition(profile, media, moods));
};

