import { useMemo } from 'react';
import type { Opportunity, FilterState } from '../../types';
import { OpportunityCard } from '../ui/OpportunityCard';
import { SearchBar } from '../ui/SearchBar';
import { FilterSidebar } from '../ui/FilterPanel';
import { EmptyState, LoadingState, ErrorState } from '../ui/States';
import { computeFilterCounts } from '../../services/opportunityService';
import { useStudentProfile } from '../../hooks';
import { Search } from 'lucide-react';

interface ExploreProps {
  opportunities: Opportunity[];
  allOpportunities: Opportunity[];
  loading: boolean;
  error: string | null;
  filter: FilterState;
  onUpdateFilter: (partial: Partial<FilterState>) => void;
  onResetFilter: () => void;
  savedIds: Set<string>;
  applicationStatuses: Record<string, string | null>;
  onToggleSave: (id: string) => void;
  onOpenOpportunity: (id: string) => void;
}

export function Explore({
  opportunities,
  allOpportunities,
  loading,
  error,
  filter,
  onUpdateFilter,
  onResetFilter,
  savedIds,
  applicationStatuses,
  onToggleSave,
  onOpenOpportunity,
}: ExploreProps) {
  const { profile } = useStudentProfile();
  const counts = useMemo(
    () => computeFilterCounts(allOpportunities, profile),
    [allOpportunities, profile]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-[#EAE6DF] pb-4">
        <h1 className="font-serif font-bold text-3xl text-[#10294F] mb-1">
          Explore Opportunities
        </h1>
        <p className="text-sm text-[#5E6E82]">
          Discover hackathons, internships, scholarships and learning programs across India.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <SearchBar
          value={filter.query}
          onChange={(q) => onUpdateFilter({ query: q })}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <aside className="lg:col-span-3 bg-white/40 p-5 rounded-2xl border border-[#EAE6DF]">
          <FilterSidebar
            filter={filter}
            onUpdate={onUpdateFilter}
            onReset={onResetFilter}
            counts={counts}
          />
        </aside>

        {/* Results */}
        <div className="lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#5E6E82] pb-2 border-b border-[#EAE6DF]">
            <span>Showing {opportunities.length} of {allOpportunities.length} opportunities</span>
            {filter.query && <span>Filter active for: "{filter.query}"</span>}
          </div>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : opportunities.length === 0 ? (
            <EmptyState
              title="No opportunities found"
              description="No programs match your current filter settings. Try clearing filters or searching for other terms."
              icon={<Search size={26} />}
              action={
                <button
                  onClick={onResetFilter}
                  className="px-4 py-2 text-xs font-semibold text-[#10294F] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F8F6F0] transition-colors"
                >
                  Clear all filters
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {opportunities.map((o) => (
                <OpportunityCard
                  key={o.id}
                  opportunity={o}
                  saved={savedIds.has(o.id)}
                  applicationStatus={applicationStatuses[o.id] ?? null}
                  onToggleSave={() => onToggleSave(o.id)}
                  onOpen={() => onOpenOpportunity(o.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
