import { X, RotateCcw } from 'lucide-react';
import type {
  FilterState,
  OpportunityType,
  OpportunityReach,
  OpportunityDomain,
  DeadlineFilterOption,
  FitFilterOption,
} from '../../types';
import type { FilterCounts } from '../../services/opportunityService';
import {
  OPPORTUNITY_TYPE_LABELS,
  REACH_LABELS,
  DOMAIN_LABELS,
} from '../../services/opportunityService';

interface FilterPanelProps {
  filter: FilterState;
  onUpdate: (partial: Partial<FilterState>) => void;
  onReset: () => void;
  counts: FilterCounts;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

const OPPORTUNITY_TYPES: OpportunityType[] = [
  'hackathons_competitions',
  'fellowships_scholarships',
  'student_leadership',
  'internships_research',
  'events_talks',
  'learning_programs',
];

const REACH_OPTIONS: OpportunityReach[] = [
  'national',
  'international',
  'local_campus',
  'unspecified',
];

const DOMAINS: OpportunityDomain[] = [
  'technology_ai',
  'business',
  'research',
  'social_impact',
  'creative_design',
  'open_domain',
];

export function FilterSidebar({
  filter,
  onUpdate,
  onReset,
  counts,
  isMobileDrawer = false,
  onCloseMobileDrawer,
}: FilterPanelProps) {
  const hasActiveFilters =
    filter.opportunityTypes.length > 0 ||
    filter.reach.length > 0 ||
    filter.domains.length > 0 ||
    filter.deadlineWindow !== 'any' ||
    filter.fitFilter !== 'all' ||
    filter.categories.length > 0 ||
    filter.formats.length > 0 ||
    !!filter.query;

  const toggleType = (t: OpportunityType) => {
    const next = filter.opportunityTypes.includes(t)
      ? filter.opportunityTypes.filter((x) => x !== t)
      : [...filter.opportunityTypes, t];
    onUpdate({ opportunityTypes: next });
  };

  const toggleReach = (r: OpportunityReach) => {
    const next = filter.reach.includes(r)
      ? filter.reach.filter((x) => x !== r)
      : [...filter.reach, r];
    onUpdate({ reach: next });
  };

  const toggleDomain = (d: OpportunityDomain) => {
    const next = filter.domains.includes(d)
      ? filter.domains.filter((x) => x !== d)
      : [...filter.domains, d];
    onUpdate({ domains: next });
  };

  const setDeadline = (w: DeadlineFilterOption) => {
    onUpdate({ deadlineWindow: w });
  };

  const setFit = (f: FitFilterOption) => {
    onUpdate({ fitFilter: f });
  };

  return (
    <div className={`space-y-6 ${isMobileDrawer ? 'p-6 bg-white' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#EAE6DF]">
        <h3 className="font-serif font-bold text-base text-[#10294F]">
          Refine results
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-xs text-[#8E9BAE] hover:text-[#10294F] font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <RotateCcw size={11} />
              <span>Clear all</span>
            </button>
          )}
          {isMobileDrawer && onCloseMobileDrawer && (
            <button
              onClick={onCloseMobileDrawer}
              className="p-1 rounded-md text-[#5E6E82] hover:bg-gray-100"
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 1. Opportunity Type */}
      <div>
        <h4 className="text-xs font-semibold text-[#10294F] uppercase tracking-wider mb-2.5">
          Opportunity Type
        </h4>
        <div className="space-y-1.5">
          {OPPORTUNITY_TYPES.map((type) => {
            const count = counts.opportunityTypes[type] || 0;
            const checked = filter.opportunityTypes.includes(type);
            return (
              <label
                key={type}
                className="flex items-center justify-between text-xs text-[#5E6E82] hover:text-[#10294F] cursor-pointer group py-0.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleType(type)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#10294F] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#10294F]"
                  />
                  <span className={checked ? 'font-semibold text-[#10294F]' : ''}>
                    {OPPORTUNITY_TYPE_LABELS[type]}
                  </span>
                </div>
                <span className="text-[11px] text-[#8E9BAE] tabular-nums">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 2. Reach */}
      <div className="pt-2 border-t border-[#F0ECE1]">
        <h4 className="text-xs font-semibold text-[#10294F] uppercase tracking-wider mb-2.5">
          Reach
        </h4>
        <div className="space-y-1.5">
          {REACH_OPTIONS.map((reach) => {
            const count = counts.reach[reach] || 0;
            const checked = filter.reach.includes(reach);
            return (
              <label
                key={reach}
                className="flex items-center justify-between text-xs text-[#5E6E82] hover:text-[#10294F] cursor-pointer group py-0.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleReach(reach)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#10294F] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#10294F]"
                  />
                  <span className={checked ? 'font-semibold text-[#10294F]' : ''}>
                    {REACH_LABELS[reach]}
                  </span>
                </div>
                <span className="text-[11px] text-[#8E9BAE] tabular-nums">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 3. Domain */}
      <div className="pt-2 border-t border-[#F0ECE1]">
        <h4 className="text-xs font-semibold text-[#10294F] uppercase tracking-wider mb-2.5">
          Domain
        </h4>
        <div className="space-y-1.5">
          {DOMAINS.map((domain) => {
            const count = counts.domains[domain] || 0;
            const checked = filter.domains.includes(domain);
            return (
              <label
                key={domain}
                className="flex items-center justify-between text-xs text-[#5E6E82] hover:text-[#10294F] cursor-pointer group py-0.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDomain(domain)}
                    className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-[#10294F] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#10294F]"
                  />
                  <span className={checked ? 'font-semibold text-[#10294F]' : ''}>
                    {DOMAIN_LABELS[domain]}
                  </span>
                </div>
                <span className="text-[11px] text-[#8E9BAE] tabular-nums">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 4. Deadline Window */}
      <div className="pt-2 border-t border-[#F0ECE1]">
        <h4 className="text-xs font-semibold text-[#10294F] uppercase tracking-wider mb-2.5">
          Deadline
        </h4>
        <div className="space-y-1.5">
          {[
            { id: 'any', label: 'Any deadline', count: counts.deadlineWindow.any },
            { id: 'within_7_days', label: 'Within 7 days', count: counts.deadlineWindow.within_7_days },
            { id: 'within_30_days', label: 'Within 30 days', count: counts.deadlineWindow.within_30_days },
            { id: 'no_deadline_listed', label: 'No deadline listed', count: counts.deadlineWindow.no_deadline_listed },
          ].map((item) => {
            const isSelected = filter.deadlineWindow === item.id;
            return (
              <label
                key={item.id}
                className="flex items-center justify-between text-xs text-[#5E6E82] hover:text-[#10294F] cursor-pointer group py-0.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="deadlineWindow"
                    checked={isSelected}
                    onChange={() => setDeadline(item.id as DeadlineFilterOption)}
                    className="w-3.5 h-3.5 text-[#10294F] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#10294F]"
                  />
                  <span className={isSelected ? 'font-semibold text-[#10294F]' : ''}>
                    {item.label}
                  </span>
                </div>
                <span className="text-[11px] text-[#8E9BAE] tabular-nums">
                  {item.count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* 5. Eligibility & Profile Fit */}
      <div className="pt-2 border-t border-[#F0ECE1]">
        <h4 className="text-xs font-semibold text-[#10294F] uppercase tracking-wider mb-2.5">
          Profile Eligibility
        </h4>
        <div className="space-y-1.5">
          {[
            { id: 'all', label: 'All opportunities', count: counts.fitFilter.all },
            { id: 'confirmed_eligible', label: 'Confirmed Eligible', count: counts.fitFilter.confirmed_eligible },
            { id: 'needs_verification', label: 'Needs Verification', count: counts.fitFilter.needs_verification },
          ].map((item) => {
            const isSelected = filter.fitFilter === item.id;
            return (
              <label
                key={item.id}
                className="flex items-center justify-between text-xs text-[#5E6E82] hover:text-[#10294F] cursor-pointer group py-0.5"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="fitFilter"
                    checked={isSelected}
                    onChange={() => setFit(item.id as FitFilterOption)}
                    className="w-3.5 h-3.5 text-[#10294F] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#10294F]"
                  />
                  <span className={isSelected ? 'font-semibold text-[#10294F]' : ''}>
                    {item.label}
                  </span>
                </div>
                <span className="text-[11px] text-[#8E9BAE] tabular-nums">
                  {item.count}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function MobileFilterModal({
  isOpen,
  onClose,
  filter,
  onUpdate,
  onReset,
  counts,
}: {
  isOpen: boolean;
  onClose: () => void;
  filter: FilterState;
  onUpdate: (partial: Partial<FilterState>) => void;
  onReset: () => void;
  counts: FilterCounts;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in slide-in-from-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto flex-1">
          <FilterSidebar
            filter={filter}
            onUpdate={onUpdate}
            onReset={onReset}
            counts={counts}
            isMobileDrawer={true}
            onCloseMobileDrawer={onClose}
          />
        </div>
        <div className="p-4 border-t border-[#EAE6DF] bg-[#F8F6F0] flex gap-3">
          <button
            onClick={() => {
              onReset();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl border border-[#CBD5E1] text-xs font-semibold text-[#5E6E82] hover:bg-white"
          >
            Clear all
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#10294F] text-xs font-semibold text-white hover:bg-[#173766]"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}
