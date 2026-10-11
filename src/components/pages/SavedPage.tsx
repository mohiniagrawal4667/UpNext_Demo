import { Bookmark } from 'lucide-react';
import type { Opportunity, SavedOpportunity } from '../../types';
import { OpportunityCard } from '../ui/OpportunityCard';
import { EmptyState } from '../ui/States';
import type { Page } from '../Navbar';

interface SavedPageProps {
  allOpportunities: Opportunity[];
  savedOpportunities: SavedOpportunity[];
  applicationStatuses: Record<string, string | null>;
  onToggleSave: (id: string) => void;
  onOpenOpportunity: (id: string) => void;
  onNavigate: (page: Page) => void;
}

export function SavedPage({
  allOpportunities,
  savedOpportunities,
  applicationStatuses,
  onToggleSave,
  onOpenOpportunity,
  onNavigate,
}: SavedPageProps) {
  const savedOpps = savedOpportunities
    .map((s) => allOpportunities.find((o) => o.id === s.opportunityId))
    .filter(Boolean) as Opportunity[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-[#EAE6DF] pb-4">
        <h1 className="font-serif font-bold text-3xl text-[#10294F] mb-1">
          Saved Opportunities
        </h1>
        <p className="text-sm text-[#5E6E82]">
          {savedOpps.length === 0
            ? 'Bookmark ambitious opportunities across India to build your personal action plan.'
            : `${savedOpps.length} saved program${savedOpps.length === 1 ? '' : 's'} stored in local memory`}
        </p>
      </div>

      {savedOpps.length === 0 ? (
        <EmptyState
          title="No saved programs yet"
          description="Browse ambitious programs on Discover and click the bookmark icon on any card to save it to your action plan."
          icon={<Bookmark size={26} />}
          action={
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#10294F] rounded-xl hover:bg-[#173766] transition-colors cursor-pointer shadow-xs"
            >
              Browse opportunities
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedOpps.map((o) => {
            const pursuitItem = savedOpportunities.find((s) => s.opportunityId === o.id);
            return (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                saved
                applicationStatus={pursuitItem?.status ?? applicationStatuses[o.id] ?? null}
                pursuitItem={pursuitItem}
                onToggleSave={() => onToggleSave(o.id)}
                onOpen={() => onOpenOpportunity(o.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
