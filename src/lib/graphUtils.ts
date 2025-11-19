import { UserProfile, MediaItem } from './firestoreUtils';
import { ARCHETYPES } from './psychologyUtils';

export interface GraphNode {
  id: string;
  name: string;
  val: number; 
  color?: string;
  group: string; 
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
    color: profile.archetype.color || '#818CF8',
    group: 'user'
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
        color: '#94A3B8', 
        group: 'trait'
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
      color: '#8B5CF6', // Violet
      group: 'insight'
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
           color: '#F472B6', // Pink
           group: 'insight'
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
      color: '#FCD34D', // Amber
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
    
    let mediaColor = '#A5B4FC'; 
    if (item.category === 'youtube') mediaColor = '#FF8080'; 
    if (item.category === 'spotify') mediaColor = '#86EFAC'; 

    nodes.push({
      id: mediaId,
      name: item.title,
      val: 2, 
      color: mediaColor, 
      group: 'media'
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
