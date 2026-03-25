/**
 * Health Tech Career Roadmap JSON Schema
 *
 * Each roadmap is a single JSON file in src/content/roadmaps/.
 * Drop a new JSON file here, push to GitHub, and Vercel auto-deploys.
 */

export interface RoadmapMeta {
  slug: string;
  title: string;
  icon: string;
  difficulty: 'low' | 'moderate' | 'high' | 'very-high';
  timeline: string;
  lastUpdated: string;
  status: 'published' | 'draft';
  shortDescription: string;
  bestFor: string;
  order: number;
  category: 'data-analytics' | 'systems-implementation' | 'strategy-leadership' | 'engineering' | 'regulatory';
  tags: string[];
}

export interface SkillTranslation {
  clinical: string;
  tech: string;
  explanation: string;
}

export interface LearningPhase {
  name: string;
  weeks: string;
  hours: string;
  topics: string[];
  resources: Resource[];
  checkpoint: string;
}

export interface Resource {
  name: string;
  url: string;
  free: boolean;
  description?: string;
}

export interface Certification {
  name: string;
  signal: 'high' | 'helpful' | 'skip';
  frequency: string;
  cost: string;
  timeline: string;
  notes: string;
}

export interface PortfolioProject {
  title: string;
  description: string;
  timeEstimate: string;
  dataset?: string;
  datasetUrl?: string;
  tools: string[];
  clinicalAdvantage: string;
}

export interface TransitionStory {
  name: string;
  previousRole: string;
  currentTitle: string;
  company: string;
  summary: string;
  sourceUrl: string;
}

export interface Move {
  title: string;
  timeEstimate: string;
  description: string;
  specifics: string[];
}

export interface RoadmapSection {
  id: string;
  title: string;
  gated: boolean; // if true, shown as preview with email CTA
}

export interface Roadmap {
  meta: RoadmapMeta;
  sections: {
    roleSnapshot: {
      oneLiner: string;
      bestSuitedFor: string;
      workSetting: string;
      demandSignal: string;
      keyDifferentiator: string;
      whereTheyWork: string[];
      clinicalAdvantage: string[];
    };
    whatYouAlreadyHave: {
      nurses: SkillTranslation[];
      pharmacists: SkillTranslation[];
      otherClinicians: SkillTranslation[];
    };
    learningPath: {
      totalTimeline: string;
      phases: LearningPhase[];
    };
    certifications: {
      realityCheck: string;
      items: Certification[];
      recommendation: string;
    };
    portfolioProjects: PortfolioProject[];
    transitionStories: {
      verified: TransitionStory[];
      note: string;
      crowdsourceUrl?: string;
    };
    firstThreeMoves: Move[];
  };
  sources: string[];
}

// Section metadata for navigation and gating
export const SECTION_CONFIG: RoadmapSection[] = [
  { id: 'roleSnapshot', title: 'Role Snapshot', gated: false },
  { id: 'whatYouAlreadyHave', title: 'What You Already Have', gated: false },
  { id: 'learningPath', title: 'The Learning Path', gated: false },
  { id: 'certifications', title: 'Certifications', gated: false },
  { id: 'portfolioProjects', title: 'Portfolio Projects', gated: false },
  { id: 'transitionStories', title: 'Real Transition Stories', gated: false },
  { id: 'firstThreeMoves', title: 'First Three Moves', gated: false },
];
