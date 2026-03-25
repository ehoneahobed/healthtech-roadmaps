import type { Roadmap, TransitionStory } from '@content/schema';

// Dynamically import all roadmap JSON files
const roadmapModules = import.meta.glob<Roadmap>(
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

/**
 * Enriched story with parent roadmap context
 */
export interface StoryWithContext extends TransitionStory {
  roadmapSlug: string;
  roadmapTitle: string;
  roadmapIcon: string;
}

/**
 * Get all verified transition stories across all roadmaps
 */
export function getAllStories(): StoryWithContext[] {
  const roadmaps = getAllRoadmaps();
  const stories: StoryWithContext[] = [];

  for (const roadmap of roadmaps) {
    for (const story of roadmap.sections.transitionStories.verified) {
      stories.push({
        ...story,
        roadmapSlug: roadmap.meta.slug,
        roadmapTitle: roadmap.meta.title,
        roadmapIcon: roadmap.meta.icon,
      });
    }
  }

  return stories;
}

/**
 * Get a single story by its slug
 */
export function getStoryBySlug(slug: string): StoryWithContext | undefined {
  return getAllStories().find((story) => story.slug === slug);
}

/**
 * Parse the minimum number of months from a timeline string like "3 to 6 months"
 */
export function parseTimelineMinMonths(timeline: string): number {
  const match = timeline.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
