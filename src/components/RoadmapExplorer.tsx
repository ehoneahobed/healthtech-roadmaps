import { useState, useMemo, useCallback } from 'react';
import type { RoadmapMeta } from '@content/schema';
import { parseTimelineMinMonths } from '../lib/roadmaps';

interface RoadmapExplorerProps {
  roadmaps: RoadmapMeta[];
}

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'data-analytics', label: 'Data & Analytics' },
  { value: 'systems-implementation', label: 'Systems & Implementation' },
  { value: 'strategy-leadership', label: 'Strategy & Leadership' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'regulatory', label: 'Regulatory' },
] as const;

const DIFFICULTIES = [
  { value: 'low', label: 'Low', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', activeColor: 'bg-emerald-500 text-white border-emerald-500' },
  { value: 'moderate', label: 'Moderate', color: 'bg-amber-100 text-amber-700 border-amber-300', activeColor: 'bg-amber-500 text-white border-amber-500' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700 border-orange-300', activeColor: 'bg-orange-500 text-white border-orange-500' },
  { value: 'very-high', label: 'Very High', color: 'bg-red-100 text-red-700 border-red-300', activeColor: 'bg-red-500 text-white border-red-500' },
] as const;

const TIMELINES = [
  { label: 'Under 3 months', maxMonths: 3 },
  { label: '3\u20136 months', minMonths: 3, maxMonths: 6 },
  { label: '6\u201312 months', minMonths: 6, maxMonths: 12 },
  { label: '12+ months', minMonths: 12 },
] as const;

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'quickest', label: 'Quickest First' },
  { value: 'hardest', label: 'Most Challenging' },
] as const;

const DIFFICULTY_RANK: Record<string, number> = {
  low: 1, moderate: 2, high: 3, 'very-high': 4,
};

const DIFFICULTY_BADGE: Record<string, { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-emerald-100 text-emerald-700' },
  moderate: { label: 'Moderate', color: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
  'very-high': { label: 'Very High', color: 'bg-red-100 text-red-700' },
};

export default function RoadmapExplorer({ roadmaps }: RoadmapExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeDifficulties, setActiveDifficulties] = useState<Set<string>>(new Set());
  const [activeTimelines, setActiveTimelines] = useState<Set<number>>(new Set());
  const [sortBy, setSortBy] = useState('recommended');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    const timer = setTimeout(() => setDebouncedQuery(value), 150);
    setDebounceTimer(timer);
  }, [debounceTimer]);

  const toggleDifficulty = useCallback((diff: string) => {
    setActiveDifficulties(prev => {
      const next = new Set(prev);
      if (next.has(diff)) next.delete(diff);
      else next.add(diff);
      return next;
    });
  }, []);

  const toggleTimeline = useCallback((index: number) => {
    setActiveTimelines(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, []);

  const hasActiveFilters = activeCategory !== 'all' || activeDifficulties.size > 0 || activeTimelines.size > 0 || debouncedQuery.length > 0;

  const activeFilterCount = (activeCategory !== 'all' ? 1 : 0) + activeDifficulties.size + activeTimelines.size + (debouncedQuery.length > 0 ? 1 : 0);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setActiveCategory('all');
    setActiveDifficulties(new Set());
    setActiveTimelines(new Set());
    setSortBy('recommended');
  }, []);

  const filtered = useMemo(() => {
    let results = [...roadmaps];

    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      results = results.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.shortDescription.toLowerCase().includes(q) ||
        r.bestFor.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (activeCategory !== 'all') {
      results = results.filter(r => r.category === activeCategory);
    }

    if (activeDifficulties.size > 0) {
      results = results.filter(r => activeDifficulties.has(r.difficulty));
    }

    if (activeTimelines.size > 0) {
      results = results.filter(r => {
        const minMonths = parseTimelineMinMonths(r.timeline);
        return Array.from(activeTimelines).some(idx => {
          const tl = TIMELINES[idx];
          if ('minMonths' in tl && 'maxMonths' in tl) {
            return minMonths >= tl.minMonths && minMonths < tl.maxMonths;
          }
          if ('maxMonths' in tl) {
            return minMonths < tl.maxMonths;
          }
          if ('minMonths' in tl) {
            return minMonths >= tl.minMonths;
          }
          return false;
        });
      });
    }

    if (sortBy === 'quickest') {
      results.sort((a, b) => parseTimelineMinMonths(a.timeline) - parseTimelineMinMonths(b.timeline));
    } else if (sortBy === 'hardest') {
      results.sort((a, b) => (DIFFICULTY_RANK[b.difficulty] || 0) - (DIFFICULTY_RANK[a.difficulty] || 0));
    } else {
      results.sort((a, b) => a.order - b.order);
    }

    return results;
  }, [roadmaps, debouncedQuery, activeCategory, activeDifficulties, activeTimelines, sortBy]);

  const filterPanel = (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-surface-900 mb-2">Search</label>
        <input
          type="text"
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Title, skill, keyword..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 bg-white text-surface-900 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-semibold text-surface-900 mb-2">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(activeCategory === cat.value ? 'all' : cat.value)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer ${
                activeCategory === cat.value
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                  : 'border-surface-200 text-surface-600 hover:border-surface-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-semibold text-surface-900 mb-2">Difficulty</label>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTIES.map(diff => (
            <button
              key={diff.value}
              onClick={() => toggleDifficulty(diff.value)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer ${
                activeDifficulties.has(diff.value) ? diff.activeColor : diff.color
              }`}
            >
              {diff.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <label className="block text-sm font-semibold text-surface-900 mb-2">Timeline</label>
        <div className="flex flex-wrap gap-1.5">
          {TIMELINES.map((tl, idx) => (
            <button
              key={idx}
              onClick={() => toggleTimeline(idx)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors cursor-pointer ${
                activeTimelines.has(idx)
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                  : 'border-surface-200 text-surface-600 hover:border-surface-300'
              }`}
            >
              {tl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label htmlFor="sort-select" className="block text-sm font-semibold text-surface-900 mb-2">Sort by</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 bg-white text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="w-full text-sm text-brand-600 hover:text-brand-700 underline underline-offset-2 cursor-pointer py-1"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-8 rounded-xl border border-surface-200 bg-white p-6">
          {filterPanel}
        </div>
      </aside>

      {/* Mobile filter toggle + panel */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-surface-200 bg-white text-surface-700 cursor-pointer"
        >
          <span className="text-sm font-medium">
            Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {mobileFiltersOpen && (
          <div className="mt-3 rounded-xl border border-surface-200 bg-white p-5">
            {filterPanel}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Results summary */}
        <div className="flex items-center gap-3 text-sm text-surface-600 mb-5">
          <span>
            Showing <strong className="text-surface-900">{filtered.length}</strong> of{' '}
            <strong className="text-surface-900">{roadmaps.length}</strong> roadmaps
          </span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-brand-600 hover:text-brand-700 underline underline-offset-2 cursor-pointer hidden lg:inline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Card Grid or Empty State */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(roadmap => {
              const badge = DIFFICULTY_BADGE[roadmap.difficulty];
              return (
                <a
                  key={roadmap.slug}
                  href={`/r/${roadmap.slug}`}
                  className="group block p-6 border border-surface-200 rounded-lg hover:shadow-lg hover:border-brand-200 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-3xl">{roadmap.icon}</div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-surface-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {roadmap.title}
                  </h2>

                  <p className="text-sm text-surface-600 mb-3">
                    {roadmap.bestFor}
                  </p>

                  <p className="text-sm text-surface-700 mb-5 leading-relaxed line-clamp-3">
                    {roadmap.shortDescription}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-surface-100">
                    <span className="text-sm font-medium text-surface-600">
                      <span className="text-brand-600">&#9201;</span> {roadmap.timeline}
                    </span>
                    <span className="text-sm font-medium text-brand-600 group-hover:translate-x-1 transition-transform">
                      View Roadmap &rarr;
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 px-6">
            <div className="text-4xl mb-4">&#128269;</div>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">No roadmaps match your filters</h3>
            <p className="text-surface-600 mb-6">Try adjusting your search or filter criteria.</p>
            <button
              onClick={clearAllFilters}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
