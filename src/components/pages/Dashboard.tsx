import { useState, useMemo } from 'react';
import {
  ChevronRight,
  Briefcase,
  Trophy,
  GraduationCap,
  Users,
  Info,
  CalendarClock,
  Sparkles,
  Clock,
} from 'lucide-react';
import type {
  Opportunity,
  FilterState,
  PursuitItem,
  OpportunityType,
} from '../../types';
import { OpportunityCard } from '../ui/OpportunityCard';
import { SearchBar } from '../ui/SearchBar';
import { FilterSidebar, MobileFilterModal } from '../ui/FilterPanel';
import { EmptyState, LoadingState, ErrorState } from '../ui/States';
import {
  computeFilterCounts,
  getOpportunityStatus,
} from '../../services/opportunityService';
import { useStudentProfile } from '../../hooks';
import type { Page } from '../Navbar';

interface DashboardProps {
  allOpportunities: Opportunity[];
  filteredOpportunities: Opportunity[];
  loading: boolean;
  error: string | null;
  filter: FilterState;
  onUpdateFilter: (partial: Partial<FilterState>) => void;
  onResetFilter: () => void;
  savedOpportunities: PursuitItem[];
  savedIds: Set<string>;
  applicationStatuses: Record<string, string | null>;
  onToggleSave: (id: string) => void;
  onOpenOpportunity: (id: string) => void;
  onOpenDiscovery: () => void;
  onNavigate: (page: Page) => void;
}

export function Dashboard({
  allOpportunities,
  filteredOpportunities,
  loading,
  error,
  filter,
  onUpdateFilter,
  onResetFilter,
  savedOpportunities,
  savedIds,
  applicationStatuses,
  onToggleSave,
  onOpenOpportunity,
  onOpenDiscovery,
  onNavigate,
}: DashboardProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { profile } = useStudentProfile();

  // Compute dynamic counts for the filter sidebar
  const counts = useMemo(
    () => computeFilterCounts(allOpportunities, profile),
    [allOpportunities, profile]
  );

  // Actions due soon from Pursuit Plan
  const actionsDueSoon = useMemo(() => {
    return savedOpportunities
      .filter((item) => item.nextAction && item.nextActionDate)
      .map((item) => {
        const opp = allOpportunities.find((o) => o.id === item.opportunityId);
        const days = Math.ceil(
          (new Date(item.nextActionDate!).getTime() - Date.now()) / 86_400_000
        );
        return { item, opp, days };
      })
      .filter((x) => x.opp !== undefined && x.days <= 30)
      .sort((a, b) => a.days - b.days)
      .slice(0, 3);
  }, [savedOpportunities, allOpportunities]);

  // Verified open opportunity count
  const confirmedOpenCount = useMemo(() => {
    return allOpportunities.filter((o) => {
      const s = getOpportunityStatus(o);
      return s === 'Open' || s === 'Closing Soon';
    }).length;
  }, [allOpportunities]);

  const activeFilterCount =
    filter.opportunityTypes.length +
    filter.reach.length +
    filter.domains.length +
    (filter.deadlineWindow !== 'any' ? 1 : 0) +
    (filter.fitFilter !== 'all' ? 1 : 0);

  const handleTypeShortcut = (type: OpportunityType) => {
    if (filter.opportunityTypes.includes(type) && filter.opportunityTypes.length === 1) {
      onUpdateFilter({ opportunityTypes: [] });
    } else {
      onUpdateFilter({ opportunityTypes: [type] });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ─────────────────────────────────────────────
          TOP SECTION: Hero, Search, Categories & "Actions Due Soon"
         ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-start">
        {/* Left Column (8 cols): Headline + Search + Categories */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          {/* Tagline & Headline */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FA] text-[#1E5B99] text-xs font-semibold mb-3 border border-[#D5E4F2]">
              <Sparkles size={13} />
              <span>Discover your next big opportunity. Make your move.</span>
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl text-[#10294F] tracking-tight leading-[1.15] mb-2">
              Discover ambitious opportunities.
              <br className="hidden sm:inline" /> Turn them into an action plan.
            </h1>
            <p className="text-sm sm:text-base text-[#5E6E82] max-w-2xl font-normal leading-relaxed">
              UPNEXT connects Indian college students with verified fellowships, hackathons, and internships. Understand your fit in plain language and make your move with a concrete pursuit plan.
            </p>
          </div>

          {/* Search bar + Live Discovery Action + Filters button */}
          <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1">
              <SearchBar
                value={filter.query}
                onChange={(q) => onUpdateFilter({ query: q })}
                placeholder="Search internships, hackathons, fellowships, domains..."
                onOpenFilters={() => setMobileFilterOpen(true)}
                activeFilterCount={activeFilterCount}
              />
            </div>

            <button
              onClick={onOpenDiscovery}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#10294F] hover:bg-[#173766] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex-shrink-0"
              title="Launch opportunity discovery extraction"
            >
              <Sparkles size={15} />
              <span>Web Discovery</span>
            </button>
          </div>

          {/* 4 Compact Pastel Category Shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* 1. Internships & Research */}
            <button
              onClick={() => handleTypeShortcut('internships_research')}
              aria-pressed={filter.opportunityTypes.includes('internships_research')}
              className={`
                p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-24
                ${filter.opportunityTypes.includes('internships_research')
                  ? 'bg-[#EBF3FA] border-[#1E5B99] ring-1 ring-[#1E5B99]'
                  : 'bg-[#EBF3FA] border-[#D5E4F2] hover:border-[#CADCF0] hover:shadow-xs'
                }
              `}
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center text-[#1E5B99]">
                  <Briefcase size={16} />
                </div>
                <ChevronRight size={14} className="text-[#8E9BAE] group-hover:text-[#10294F] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-[#10294F]">Internships & Research</p>
                <p className="text-[10px] text-[#5E6E82] truncate">Gain high-impact experience.</p>
              </div>
            </button>

            {/* 2. Hackathons & Competitions */}
            <button
              onClick={() => handleTypeShortcut('hackathons_competitions')}
              aria-pressed={filter.opportunityTypes.includes('hackathons_competitions')}
              className={`
                p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-24
                ${filter.opportunityTypes.includes('hackathons_competitions')
                  ? 'bg-[#F1EDF9] border-[#5B3BA6] ring-1 ring-[#5B3BA6]'
                  : 'bg-[#F1EDF9] border-[#E3DBF3] hover:border-[#DCCFF2] hover:shadow-xs'
                }
              `}
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center text-[#5B3BA6]">
                  <Trophy size={16} />
                </div>
                <ChevronRight size={14} className="text-[#8E9BAE] group-hover:text-[#10294F] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-[#10294F]">Hackathons & Contests</p>
                <p className="text-[10px] text-[#5E6E82] truncate">Build. Compete. Win.</p>
              </div>
            </button>

            {/* 3. Fellowships & Scholarships */}
            <button
              onClick={() => handleTypeShortcut('fellowships_scholarships')}
              aria-pressed={filter.opportunityTypes.includes('fellowships_scholarships')}
              className={`
                p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-24
                ${filter.opportunityTypes.includes('fellowships_scholarships')
                  ? 'bg-[#EBF5F0] border-[#1D6E42] ring-1 ring-[#1D6E42]'
                  : 'bg-[#EBF5F0] border-[#D2E8DC] hover:border-[#C8E4D5] hover:shadow-xs'
                }
              `}
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center text-[#1D6E42]">
                  <GraduationCap size={16} />
                </div>
                <ChevronRight size={14} className="text-[#8E9BAE] group-hover:text-[#10294F] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-[#10294F]">Fellowships & Aid</p>
                <p className="text-[10px] text-[#5E6E82] truncate">Grants & academic cohorts.</p>
              </div>
            </button>

            {/* 4. Student Leadership */}
            <button
              onClick={() => handleTypeShortcut('student_leadership')}
              aria-pressed={filter.opportunityTypes.includes('student_leadership')}
              className={`
                p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex flex-col justify-between h-24
                ${filter.opportunityTypes.includes('student_leadership')
                  ? 'bg-[#FDF3E7] border-[#A85A12] ring-1 ring-[#A85A12]'
                  : 'bg-[#FDF3E7] border-[#F6E1C8] hover:border-[#EDDBBF] hover:shadow-xs'
                }
              `}
            >
              <div className="flex items-center justify-between w-full">
                <div className="w-7 h-7 rounded-lg bg-white/70 flex items-center justify-center text-[#A85A12]">
                  <Users size={16} />
                </div>
                <ChevronRight size={14} className="text-[#8E9BAE] group-hover:text-[#10294F] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-[#10294F]">Student Leadership</p>
                <p className="text-[10px] text-[#5E6E82] truncate">Campus expert & ambassador.</p>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): "Actions Due Soon & Deadlines" widget */}
        <div className="lg:col-span-4 w-full">
          <div className="bg-white rounded-2xl border border-[#E8E4DC] p-5 shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1] mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#F8F6F0] flex items-center justify-center text-[#10294F]">
                  <Clock size={15} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[#10294F]">Actions Due Soon</h3>
                  <p className="text-[11px] text-[#5E6E82]">
                    {actionsDueSoon.length > 0
                      ? `${actionsDueSoon.length} action item${actionsDueSoon.length > 1 ? 's' : ''} on your radar`
                      : 'My Pursuit Plan milestones'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('tracker')}
                className="text-[#8E9BAE] hover:text-[#10294F] transition-colors p-1 cursor-pointer"
                aria-label="View My Pursuit Plan"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* List or Empty State */}
            {actionsDueSoon.length > 0 ? (
              <div className="space-y-2.5">
                {actionsDueSoon.map(({ item, opp, days }) => (
                  <button
                    key={item.opportunityId}
                    onClick={() => onOpenOpportunity(opp!.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[#F8F6F0] transition-colors text-left group cursor-pointer"
                  >
                    <div className="w-10 h-11 rounded-lg bg-[#EBF3FA] border border-[#D5E4F2] flex flex-col items-center justify-center flex-shrink-0 text-[#1E5B99]">
                      <span className="font-bold text-xs leading-none">
                        {days < 0 ? '!' : days}
                      </span>
                      <span className="text-[8px] uppercase font-semibold leading-tight">
                        {days < 0 ? 'Overdue' : 'Days'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-[#10294F] truncate group-hover:text-[#173766]">
                        {opp!.title}
                      </p>
                      <p className="text-[11px] text-[#5E6E82] truncate">
                        Action: {item.nextAction}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center px-2">
                <div className="w-8 h-8 rounded-full bg-[#F8F6F0] mx-auto flex items-center justify-center text-[#8E9BAE] mb-2">
                  <CalendarClock size={16} />
                </div>
                <p className="text-xs font-semibold text-[#10294F] mb-1">
                  No pending actions due soon
                </p>
                <p className="text-[11px] text-[#5E6E82] leading-relaxed mb-3">
                  Record next actions and deadlines on any opportunity in your Pursuit Plan to keep tabs on your progress.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => onNavigate('tracker')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10294F] hover:underline cursor-pointer"
                  >
                    <span>Open Pursuit Plan</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          MAIN CONTENT AREA: Filter Sidebar + Opportunities Grid
         ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (3 cols on desktop): Refine results sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 bg-white/40 p-5 rounded-2xl border border-[#EAE6DF]/80">
          <FilterSidebar
            filter={filter}
            onUpdate={onUpdateFilter}
            onReset={onResetFilter}
            counts={counts}
          />
        </aside>

        {/* Right Column (9 cols on desktop): Header + 3 Cards per row Grid */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header Row: "Picked for you" + Result Count + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE6DF]">
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="font-serif font-bold text-2xl text-[#10294F]">
                Picked for you
              </h2>
              <span className="text-xs text-[#5E6E82]">
                Showing {filteredOpportunities.length} of {allOpportunities.length} opportunities
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#FDF3E7] text-[#9A5B18] border border-[#F6E1C8] font-medium">
                {confirmedOpenCount > 0 ? `${confirmedOpenCount} Confirmed Open` : 'Curated Demo Catalog'}
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs text-[#5E6E82]">
                Sort by:
              </label>
              <select
                id="sort-select"
                value={filter.sortBy || 'relevant'}
                onChange={(e) =>
                  onUpdateFilter({
                    sortBy: e.target.value as 'relevant' | 'deadline' | 'title',
                  })
                }
                className="text-xs font-semibold text-[#10294F] bg-white border border-[#EAE6DF] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#10294F] cursor-pointer shadow-2xs"
              >
                <option value="relevant">Most relevant (Fit score)</option>
                <option value="deadline">Deadline: Soonest</option>
                <option value="title">Alphabetical (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Cards Content */}
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : filteredOpportunities.length === 0 ? (
            <EmptyState
              title="No opportunities match your selected criteria"
              description={
                filter.query
                  ? `No matches for "${filter.query}". Try searching for keywords like "hackathon", "google", or "fellowship".`
                  : 'Try clearing some filters or switching reach/domain criteria to see more programs.'
              }
              action={
                <button
                  onClick={onResetFilter}
                  className="px-4 py-2 text-xs font-semibold text-[#10294F] bg-white border border-[#D1D5DB] rounded-lg hover:bg-[#F8F6F0] transition-colors shadow-2xs cursor-pointer"
                >
                  Clear all filters
                </button>
              }
            />
          ) : (
            /* Exactly 3 cards per row on desktop */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredOpportunities.map((o) => {
                const item = savedOpportunities.find((s) => s.opportunityId === o.id);
                return (
                  <OpportunityCard
                    key={o.id}
                    opportunity={o}
                    saved={savedIds.has(o.id)}
                    applicationStatus={applicationStatuses[o.id] ?? null}
                    pursuitItem={item}
                    profile={profile}
                    onToggleSave={() => onToggleSave(o.id)}
                    onOpen={() => onOpenOpportunity(o.id)}
                  />
                );
              })}
            </div>
          )}

          {/* Bottom Disclaimer Banner */}
          <div className="mt-10 p-3.5 bg-[#EDF2F7]/50 border border-[#E2E8F0] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#5E6E82]">
            <div className="flex items-center gap-2">
              <Info size={15} className="text-[#8E9BAE] flex-shrink-0" />
              <span>Program eligibility criteria should always be verified on the official host website.</span>
            </div>
            <span className="font-serif italic text-[#C2935D] text-xs font-medium">
              Discover your next big opportunity. Make your move.
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        filter={filter}
        onUpdate={onUpdateFilter}
        onReset={onResetFilter}
        counts={counts}
      />
    </div>
  );
}
