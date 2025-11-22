import { GraphNode, GraphLink } from '@/lib/graphUtils';

export const DEMO_NODES: GraphNode[] = [
  { id: 'u1', name: 'You', group: 'user', val: 10, color: '#ffffff' },
  // Focus Cluster
  { id: 'm1', name: 'Deep Work', group: 'media', val: 5, color: '#3B82F6', metadata: { category: 'Book', intent: ['learning'] } },
  { id: 'm2', name: 'Huberman Lab', group: 'media', val: 4, color: '#3B82F6', metadata: { category: 'Podcast', intent: ['science'] } },
  { id: 'm3', name: 'Flow State', group: 'media', val: 3, color: '#3B82F6', metadata: { category: 'Concept', intent: ['productivity'] } },
  // Creative Cluster
  { id: 'm4', name: 'Studio Ghibli', group: 'media', val: 6, color: '#EC4899', metadata: { category: 'Movie', intent: ['inspiration'] } },
  { id: 'm5', name: 'Abstract: Art of Design', group: 'media', val: 4, color: '#EC4899', metadata: { category: 'TV', intent: ['design'] } },
  { id: 'm6', name: 'Rick Rubin', group: 'media', val: 3, color: '#EC4899', metadata: { category: 'Book', intent: ['creativity'] } },
  // Traits
  { id: 't1', name: 'Openness', group: 'trait', val: 8, color: '#EC4899' },
  { id: 't2', name: 'Conscientiousness', group: 'trait', val: 7, color: '#3B82F6' },
  { id: 't3', name: 'Extraversion', group: 'trait', val: 4, color: '#F59E0B' },
];

export const DEMO_LINKS: GraphLink[] = [
  { source: 'u1', target: 't1' },
  { source: 'u1', target: 't2' },
  { source: 'u1', target: 't3' },
  { source: 't2', target: 'm1' },
  { source: 't2', target: 'm2' },
  { source: 'm1', target: 'm3' },
  { source: 't1', target: 'm4' },
  { source: 't1', target: 'm5' },
  { source: 't1', target: 'm6' },
  { source: 'm4', target: 'm5' },
];

