import { Search, X, SlidersHorizontal } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onOpenFilters?: () => void;
  activeFilterCount?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search internships, hackathons, scholarships...',
  onOpenFilters,
  activeFilterCount = 0,
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="relative flex-1">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E9BAE] pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label="Search opportunities"
          className="
            w-full pl-11 pr-10 py-3 rounded-xl border border-[#EAE6DF] bg-white
            text-sm text-[#10294F] placeholder-[#8E9BAE] shadow-xs
            focus:outline-none focus:border-[#10294F] focus:ring-1 focus:ring-[#10294F]
            transition-all
          "
        />
        {value && (
          <button
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E9BAE] hover:text-[#10294F] p-1 cursor-pointer"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {onOpenFilters && (
        <button
          onClick={onOpenFilters}
          className="
            inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-[#EAE6DF] bg-white
            text-sm font-medium text-[#10294F] hover:border-[#10294F] hover:bg-[#F8F6F0]
            shadow-xs transition-colors cursor-pointer flex-shrink-0
          "
          aria-label="Open filter options"
        >
          <SlidersHorizontal size={16} className="text-[#5E6E82]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#10294F] text-white text-[11px] font-semibold px-1.5 py-0.2 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
