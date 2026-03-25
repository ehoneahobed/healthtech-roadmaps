import type { Roadmap } from '@content/schema';

// Dynamically import all roadmap JSON files
const roadmapModules = import.meta.glob<{ default: Roadmap }>(
  '../content/roadmaps/*.json',
  { import: 'default', eager: true }
);

/**
 * Get all published roadmaps, sorted by order field
 */
export function getAllRoadmaps(): Roadmap[] {
  const roadmaps = Object.values(roadmapModules)
    .filter((roadmap) => roadmap.meta.status === 'published')
    .sort((a, b) => a.meta.order - b.meta.order);

  return roadmaps;
}

/**
 * Get a single roadmap by its slug
 */
export function getRoadmapBySlug(slug: string): Roadmap | undefined {
  const roadmaps = getAllRoadmaps();
  return roadmaps.find((roadmap) => roadmap.meta.slug === slug);
}

/**
 * Get roadmap metadata only (for listing)
 */
export function getAllRoadmapMeta() {
  return getAllRoadmaps().map((roadmap) => roadmap.meta);
}
