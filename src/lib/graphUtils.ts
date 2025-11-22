import { UserProfile, MediaItem } from './firestoreUtils';
import { ARCHETYPES } from './psychologyUtils';

// Define graph node colors for legend (Neural Galaxy Theme)
export const GRAPH_COLORS = {
  USER: '#ffffff', // White Core
  TRAIT: '#94A3B8', // Slate for structure
  INSIGHT: '#8B5CF6',
  INSIGHT_SECONDARY: '#F472B6',
  INTENT: '#FCD34D',

  // Neon Trait Colors
  OPENNESS: '#00f0ff',       // Electric Blue
  NEUROTICISM: '#bf00ff',    // Neon Purple
  CONSCIENTIOUSNESS: '#00ff9d', // Emerald Green
  EXTRAVERSION: '#ff0055',   // Hot Pink
  AGREEABLENESS: '#ffaa00',  // Warm Gold

  MEDIA_DEFAULT: '#A5B4FC',
  MEDIA_YOUTUBE: '#FF8080',
  MEDIA_SPOTIFY: '#86EFAC'
};

export interface GraphNode {
  id: string;
  name: string;
  val: number;
  color?: string;
  group: string;
  // Add optional metadata for details panel
  metadata?: any;
}

export interface GraphLink {
  source: string;
  target: string;
  distance?: number;
}

export const transformToGraphData = (profile: UserProfile, mediaItems: MediaItem[]) => {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];

  if (!profile.archetype) return { nodes, links };

  // --- 1. Center Core: The User's Archetype ---
  const centerId = 'user-center';
  nodes.push({
    id: centerId,
    name: profile.archetype.name,
    val: 6,
    color: profile.archetype.color || GRAPH_COLORS.USER,
    group: 'user',
    metadata: { description: profile.archetype.description }
  });

  // --- 2. Personality Traits (OCEAN) ---
  // Connect directly to center, forming the "inner cell structure"
  if (profile.oceanScore) {
    Object.entries(profile.oceanScore).forEach(([trait, score]) => {
      const traitId = `trait-${trait}`;
      nodes.push({
        id: traitId,
        name: trait.charAt(0).toUpperCase() + trait.slice(1),
        val: 4,
        color: GRAPH_COLORS.TRAIT,
        group: 'trait',
        metadata: { score }
      });
      links.push({ source: centerId, target: traitId, distance: 80 });
    });
  }

  // --- 2.5 Deep Insights (MBTI, Motivations) ---
  if (profile.mbti) {
    const mbtiId = 'mbti-type';
    nodes.push({
      id: mbtiId,
      name: profile.mbti.type,
      val: 5,
      color: GRAPH_COLORS.INSIGHT, // Violet
      group: 'insight',
      metadata: { breakdown: profile.mbti.breakdown }
    });
    links.push({ source: centerId, target: mbtiId, distance: 90 });
  }

  if (profile.motivations) {
    Object.entries(profile.motivations).forEach(([mot, score]) => {
      // Only show strong motivations to avoid clutter
      if (score > 60) {
        const motId = `mot-${mot}`;
        nodes.push({
          id: motId,
          name: mot.charAt(0).toUpperCase() + mot.slice(1),
          val: 4,
          color: GRAPH_COLORS.INSIGHT_SECONDARY, // Pink
          group: 'insight',
          metadata: { score }
        });
        links.push({ source: centerId, target: motId, distance: 100 });
      }
    });
  }

  // --- 3. Psychological Intents (The "Why") ---
  const intents = new Set<string>();
  mediaItems.forEach(item => {
    if (item.intent && Array.isArray(item.intent)) {
      item.intent.forEach((i: string) => intents.add(i));
    }
  });

  intents.forEach(intent => {
    const intentId = `intent-${intent}`;
    nodes.push({
      id: intentId,
      name: intent.charAt(0).toUpperCase() + intent.slice(1),
      val: 3,
      color: GRAPH_COLORS.INTENT, // Amber
      group: 'intent'
    });

    links.push({ source: centerId, target: intentId, distance: 120 });

    // Smart Linking: Connect Intents to relevant Traits
    if (intent === 'learning') links.push({ source: intentId, target: 'trait-openness', distance: 40 });
    if (intent === 'social') links.push({ source: intentId, target: 'trait-extraversion', distance: 40 });
    if (intent === 'challenge') links.push({ source: intentId, target: 'trait-conscientiousness', distance: 40 });
    if (intent === 'escapism') links.push({ source: intentId, target: 'trait-neuroticism', distance: 40 });
    if (intent === 'inspiration') links.push({ source: intentId, target: 'trait-openness', distance: 40 });
  });

  // --- 4. Media Nodes (The "What") ---
  mediaItems.forEach(item => {
    const mediaId = `media-${item.id || item.title}`;

    // Semantic Coloring based on Primary Intent
    let mediaColor = GRAPH_COLORS.MEDIA_DEFAULT;

    if (item.intent && item.intent.length > 0) {
      const primaryIntent = item.intent[0].toLowerCase();

      // Map Intent -> Trait Color
      if (['learning', 'inspiration', 'curiosity', 'art'].some(k => primaryIntent.includes(k))) {
        mediaColor = GRAPH_COLORS.OPENNESS;
      } else if (['escapism', 'coping', 'drama', 'fear'].some(k => primaryIntent.includes(k))) {
        mediaColor = GRAPH_COLORS.NEUROTICISM;
      } else if (['productivity', 'work', 'challenge', 'growth'].some(k => primaryIntent.includes(k))) {
        mediaColor = GRAPH_COLORS.CONSCIENTIOUSNESS;
      } else if (['social', 'party', 'fun', 'energy'].some(k => primaryIntent.includes(k))) {
        mediaColor = GRAPH_COLORS.EXTRAVERSION;
      } else if (['family', 'romance', 'connection', 'peace'].some(k => primaryIntent.includes(k))) {
        mediaColor = GRAPH_COLORS.AGREEABLENESS;
      }
    }

    nodes.push({
      id: mediaId,
      name: item.title,
      val: 2,
      color: mediaColor,
      group: 'media',
      metadata: item // Pass full item as metadata
    });

    // Link Media -> Intent (Primary connection)
    if (item.intent && Array.isArray(item.intent) && item.intent.length > 0) {
      item.intent.forEach((i: string) => {
        links.push({ source: `intent-${i}`, target: mediaId, distance: 30 });
      });
    } else {
      // Fallback: Link to Center if no intent
      links.push({ source: centerId, target: mediaId, distance: 150 });
    }
  });

  return { nodes, links };
};

// Alias function for backward compatibility or new naming
export const generateGraphData = (profile: UserProfile, mediaItems: MediaItem[], moods: any[] = []) => {
    // Future: Use moods to weight edges or color nodes?
    return transformToGraphData(profile, mediaItems);
};