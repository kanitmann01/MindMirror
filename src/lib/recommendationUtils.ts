import { MediaItem } from './firestoreUtils';
import { calculateTimeDecay } from './psychologyUtils';

export interface Recommendation {
    item: MediaItem;
    score: number;
    reason: string;
}

// Hardcoded Starter Packs for users with little history
const STARTER_PACKS: Record<string, MediaItem[]> = {
    'Focus': [
        { id: 'sp-1', userId: 'system', title: 'Huberman Lab Podcast', category: 'Podcast', intent: ['learning', 'science'], mood: ['thought-provoking'], createdAt: new Date().toISOString(), rating: 5, tags: ['science', 'health'] },
        { id: 'sp-2', userId: 'system', title: 'Lofi Girl Radio', category: 'Music', intent: ['productivity'], mood: ['relaxing'], createdAt: new Date().toISOString(), rating: 5, tags: ['music', 'lofi'] },
    ],
    'Relax': [
        { id: 'sp-3', userId: 'system', title: 'Studio Ghibli Piano', category: 'Music', intent: ['escapism'], mood: ['relaxing'], createdAt: new Date().toISOString(), rating: 5, tags: ['music', 'anime'] },
        { id: 'sp-4', userId: 'system', title: 'Planet Earth II', category: 'Video', intent: ['inspiration'], mood: ['calm'], createdAt: new Date().toISOString(), rating: 5, tags: ['nature', 'documentary'] },
    ],
    'Inspired': [
        { id: 'sp-5', userId: 'system', title: 'TED Talks: Creativity', category: 'Video', intent: ['inspiration'], mood: ['uplifting'], createdAt: new Date().toISOString(), rating: 5, tags: ['talks', 'creativity'] },
        { id: 'sp-6', userId: 'system', title: 'Abstract: The Art of Design', category: 'TV', intent: ['learning', 'art'], mood: ['thought-provoking'], createdAt: new Date().toISOString(), rating: 5, tags: ['design', 'art'] },
    ],
    'Challenged': [
        { id: 'sp-7', userId: 'system', title: 'Hardcore History', category: 'Podcast', intent: ['learning', 'history'], mood: ['intense'], createdAt: new Date().toISOString(), rating: 5, tags: ['history', 'long-form'] },
        { id: 'sp-8', userId: 'system', title: 'Ex Machina', category: 'Movie', intent: ['thought-experiment'], mood: ['intense'], createdAt: new Date().toISOString(), rating: 5, tags: ['sci-fi', 'ai'] },
    ]
};

/**
 * Reverse Prescription Engine
 * 
 * Ranking Logic:
 * 1. Filter: Only consider items with Rating >= 4 (Positive Aftertaste).
 * 2. Match: Check if item tags match the Target Mood's associated traits.
 * 3. Score: (Rating * TimeDecay) + Bonus for Exact Tag Match.
 *    - We prioritize recent items (TimeDecay) because tastes change.
 *    - We prioritize high ratings because we want "proven" mood shifters.
 */
export const getRecommendationsForMood = (targetMood: string, userHistory: MediaItem[]): Recommendation[] => {
    // 1. Define Target Traits based on Mood
    const targetTraits: string[] = [];
    switch (targetMood) {
        case 'Focus':
            targetTraits.push('learning', 'productivity', 'science', 'conscientiousness', 'thought-provoking');
            break;
        case 'Relax':
            targetTraits.push('escapism', 'calm', 'relaxing', 'peace', 'nature');
            break;
        case 'Inspired':
            targetTraits.push('inspiration', 'art', 'creative', 'uplifting', 'openness');
            break;
        case 'Challenged':
            targetTraits.push('challenge', 'intense', 'growth', 'competition', 'fear');
            break;
    }

    // 2. Filter & Score History
    const candidates = userHistory.filter(item => {
        // Only positive items (if rating exists, must be >= 4. If no rating, assume neutral/skip or keep if recent?)
        // Let's be strict: Must have rating >= 4 OR be very recent (< 2 days)
        const rating = item.rating || 0;
        const isRecent = calculateTimeDecay(item.createdAt) > 0.9;
        return rating >= 4 || (rating === 0 && isRecent);
    });

    const scoredItems: Recommendation[] = candidates.map(item => {
        let matchScore = 0;
        let reason = '';

        // Check Intent Matches
        if (item.intent) {
            const matches = item.intent.filter(tag => targetTraits.includes(tag.toLowerCase()));
            matchScore += matches.length * 2;
            if (matches.length > 0) reason = `Matches ${matches[0]}`;
        }

        // Check Mood Matches
        if (item.mood) {
            const matches = item.mood.filter(tag => targetTraits.includes(tag.toLowerCase()));
            matchScore += matches.length * 2;
            if (matches.length > 0 && !reason) reason = `Matches ${matches[0]}`;
        }

        // Calculate Final Score
        // Base: Rating (0-5) * TimeDecay (0.1-1.0)
        // Bonus: MatchScore
        const rating = item.rating || 3; // Default to 3 if unrated but recent
        const decay = calculateTimeDecay(item.createdAt);
        const finalScore = (rating * decay) + matchScore;

        return { item, score: finalScore, reason };
    });

    // 3. Sort & Return
    const sorted = scoredItems
        .filter(r => r.score > 2) // Minimum quality threshold
        .sort((a, b) => b.score - a.score);

    // 4. Fallback to Starter Pack if no good matches
    if (sorted.length === 0) {
        const starters = STARTER_PACKS[targetMood] || [];
        return starters.map(item => ({
            item,
            score: 5, // Artificially high
            reason: 'Popular Choice'
        }));
    }

    return sorted;
};
