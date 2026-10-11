import { useState } from 'react';
import {
  ClipboardList,
  ArrowRight,
  X,
  BookmarkCheck,
  CheckCircle2,
  Clock,
  Edit2,
} from 'lucide-react';
import type { Opportunity, PursuitStatus, PursuitItem } from '../../types';
import { OpportunityTypeBadge, StatusBadge, DomainBadge } from '../ui/Badge';
import { EmptyState } from '../ui/States';
import { deadlineLabel, getOpportunityStatus } from '../../services/opportunityService';
import { usePursuitPlan } from '../../hooks';

interface TrackerProps {
  allOpportunities: Opportunity[];
  savedOpportunities: PursuitItem[];
  onOpenOpportunity: (id: string) => void;
  onNavigate: (page: 'dashboard') => void;
  onStatusChange: () => void;
}

const PURSUIT_COLUMNS: {
  id: PursuitStatus;
  label: string;
  bg: string;
  border: string;
  headerColor: string;
}[] = [
  { id: 'interested', label: 'Interested', bg: 'bg-[#EBF3FA]/70', border: 'border-[#D5E4F2]', headerColor: 'text-[#1E5B99]' },
  { id: 'preparing', label: 'Preparing', bg: 'bg-[#F1EDF9]/70', border: 'border-[#E3DBF3]', headerColor: 'text-[#5B3BA6]' },
  { id: 'applied', label: 'Applied', bg: 'bg-[#EBF5F0]/70', border: 'border-[#D2E8DC]', headerColor: 'text-[#1D6E42]' },
  { id: 'completed', label: 'Completed', bg: 'bg-[#F0FDF4]/70', border: 'border-[#BBF7D0]', headerColor: 'text-[#15803D]' },
];

const STAGE_NEXT: Record<PursuitStatus, PursuitStatus | null> = {
  interested: 'preparing',
  preparing: 'applied',
  applied: 'completed',
  completed: null,
};

export function Tracker({
  allOpportunities,
  onOpenOpportunity,
  onNavigate,
  onStatusChange,
}: TrackerProps) {
  const { items, setStatus, updateNextAction } = usePursuitPlan();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAction, setDraftAction] = useState('');
  const [draftDate, setDraftDate] = useState('');

  const withStatus = items.filter((s) => s.status !== null);
  const untrackedSaved = items.filter((s) => s.status === null);

  const getOppsByStage = (stage: PursuitStatus) =>
    withStatus
      .filter((s) => s.status === stage)
      .map((s) => ({
        item: s,
        opp: allOpportunities.find((o) => o.id === s.opportunityId),
      }))
      .filter((x) => x.opp !== undefined) as { item: PursuitItem; opp: Opportunity }[];

  const handleStageTransition = (id: string, nextStage: PursuitStatus | null) => {
    setStatus(id, nextStage);
    onStatusChange();
  };

  const startEditingAction = (item: PursuitItem) => {
    setEditingId(item.opportunityId);
    setDraftAction(item.nextAction || '');
    setDraftDate(item.nextActionDate || '');
  };

  const saveAction = (id: string) => {
    updateNextAction(id, draftAction.trim(), draftDate || null);
    setEditingId(null);
    onStatusChange();
  };

  // Compute actions due soon (within 14 days or overdue)
  const actionsDueSoon = items
    .filter((item) => item.nextAction && item.nextActionDate)
    .map((item) => {
      const opp = allOpportunities.find((o) => o.id === item.opportunityId);
      const days = Math.ceil(
        (new Date(item.nextActionDate!).getTime() - Date.now()) / 86_400_000
      );
      return { item, opp, days };
    })
    .filter((x) => x.opp !== undefined && x.days <= 14)
    .sort((a, b) => a.days - b.days);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="font-serif font-bold text-3xl text-[#10294F] mb-1">
            My Pursuit Plan
          </h1>
          <p className="text-sm text-[#5E6E82]">
            Discover your next big opportunity. Make your move.
          </p>
        </div>
        <EmptyState
          title="No opportunities in your pursuit plan yet"
          description="Save opportunities from Discover or set a stage to organize your preparation, record next actions, and keep tabs on deadlines."
          icon={<ClipboardList size={26} />}
          action={
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#10294F] rounded-xl hover:bg-[#173766] transition-colors cursor-pointer shadow-xs"
            >
              Discover opportunities
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif font-bold text-3xl text-[#10294F] mb-1">
          My Pursuit Plan
        </h1>
        <p className="text-sm text-[#5E6E82]">
          Discover your next big opportunity. Make your move • {withStatus.length} active opportunities tracked
        </p>
      </div>

      {/* Actions Due Soon Banner */}
      {actionsDueSoon.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FFFBF0] border border-[#FBEAC6] space-y-3">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#B45309]" />
            <h2 className="font-serif font-bold text-sm text-[#92400E]">
              Actions Due Soon & Deadlines
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {actionsDueSoon.map(({ item, opp, days }) => (
              <div
                key={item.opportunityId}
                className="p-3 rounded-xl bg-white border border-[#FDE68A] shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-semibold text-[#10294F] truncate max-w-[150px]">
                      {opp?.title}
                    </span>
                    <span
                      className={`font-semibold px-1.5 py-0.2 rounded-md ${
                        days < 0
                          ? 'bg-[#FEE2E2] text-[#991B1B]'
                          : days <= 3
                          ? 'bg-[#FEF3C7] text-[#92400E]'
                          : 'bg-[#F0FDF4] text-[#166534]'
                      }`}
                    >
                      {days < 0 ? 'Overdue' : days === 0 ? 'Due Today' : `In ${days}d`}
                    </span>
                  </div>
                  <p className="text-xs text-[#5E6E82] line-clamp-2">
                    Action: <span className="font-medium text-[#10294F]">{item.nextAction}</span>
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px]">
                  <span className="text-[#8E9BAE]">Target: {item.nextActionDate}</span>
                  <button
                    onClick={() => onOpenOpportunity(opp!.id)}
                    className="font-semibold text-[#1E5B99] hover:underline cursor-pointer"
                  >
                    View details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Untracked Bookmarks Section if any */}
      {untrackedSaved.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EAE6DF] p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <BookmarkCheck size={18} className="text-[#10294F]" />
            <h2 className="font-serif font-semibold text-sm text-[#10294F]">
              Unassigned Opportunities ({untrackedSaved.length})
            </h2>
            <span className="text-xs text-[#8E9BAE]">Add to pursuit stages to plan next actions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {untrackedSaved.map((s) => {
              const opp = allOpportunities.find((o) => o.id === s.opportunityId);
              if (!opp) return null;
              return (
                <div
                  key={opp.id}
                  className="p-3 rounded-xl border border-[#EAE6DF] bg-[#F8F6F0]/60 flex items-center justify-between gap-2"
                >
                  <button
                    onClick={() => onOpenOpportunity(opp.id)}
                    className="text-left flex-1 min-w-0"
                  >
                    <p className="font-medium text-xs text-[#10294F] truncate hover:underline">
                      {opp.title}
                    </p>
                    <p className="text-[11px] text-[#5E6E82] truncate">{opp.organization}</p>
                  </button>
                  <button
                    onClick={() => handleStageTransition(opp.id, 'interested')}
                    className="text-[11px] font-semibold text-[#1E5B99] hover:underline flex-shrink-0 cursor-pointer"
                  >
                    + Interested
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Kanban Board: 4 Stages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {PURSUIT_COLUMNS.map((col) => {
          const stageItems = getOppsByStage(col.id);
          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-4 ${col.bg} ${col.border} flex flex-col min-h-[460px]`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-black/5 mb-3">
                <h2 className={`font-semibold text-xs tracking-wide uppercase ${col.headerColor}`}>
                  {col.label}
                </h2>
                <span className="text-xs bg-white/80 rounded-full px-2 py-0.5 text-[#5E6E82] font-semibold border border-black/5">
                  {stageItems.length}
                </span>
              </div>

              {/* Items List */}
              {stageItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs text-[#8E9BAE] italic">No programs in {col.label.toLowerCase()}</p>
                </div>
              ) : (
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {stageItems.map(({ item, opp }) => {
                    const nextStage = STAGE_NEXT[col.id];
                    const oppStatus = getOpportunityStatus(opp);
                    const isEditing = editingId === opp.id;

                    return (
                      <div
                        key={opp.id}
                        className="bg-white rounded-xl border border-[#EAE6DF] p-3.5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <OpportunityTypeBadge type={opp.opportunityType} />
                            <StatusBadge status={oppStatus} />
                          </div>

                          <button
                            onClick={() => onOpenOpportunity(opp.id)}
                            className="w-full text-left font-serif font-bold text-xs text-[#10294F] hover:text-[#173766] transition-colors leading-snug mb-1"
                          >
                            {opp.title}
                          </button>
                          <p className="text-[11px] text-[#5E6E82] truncate mb-2">
                            {opp.organization}
                          </p>

                          <div className="flex items-center gap-1.5 mb-2.5">
                            <DomainBadge domain={opp.domain} />
                          </div>

                          <p className="text-[11px] text-[#8E9BAE] mb-2.5">
                            Deadline: {deadlineLabel(opp.deadline)}
                          </p>

                          {/* Next Action Box / Inline Editor */}
                          <div className="p-2.5 rounded-lg bg-[#F8F6F0] border border-[#EAE6DF] text-xs mb-2">
                            {isEditing ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={draftAction}
                                  onChange={(e) => setDraftAction(e.target.value)}
                                  placeholder="Next action..."
                                  className="w-full text-xs px-2 py-1 bg-white rounded border border-[#CBD5E1] text-[#10294F]"
                                />
                                <input
                                  type="date"
                                  value={draftDate}
                                  onChange={(e) => setDraftDate(e.target.value)}
                                  className="w-full text-xs px-2 py-1 bg-white rounded border border-[#CBD5E1] text-[#10294F]"
                                />
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="px-2 py-0.5 text-[11px] text-[#5E6E82]"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => saveAction(opp.id)}
                                    className="px-2 py-0.5 text-[11px] bg-[#10294F] text-white rounded font-medium"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex-1 min-w-0">
                                  <p className="text-[10px] font-semibold text-[#8E9BAE] uppercase">
                                    Next Action:
                                  </p>
                                  <p className="text-xs font-medium text-[#10294F] truncate">
                                    {item.nextAction || 'No action defined yet'}
                                  </p>
                                  {item.nextActionDate && (
                                    <p className="text-[10px] text-[#5E6E82] mt-0.5">
                                      Due: {new Date(item.nextActionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </p>
                                  )}
                                </div>
                                <button
                                  onClick={() => startEditingAction(item)}
                                  className="p-1 text-[#8E9BAE] hover:text-[#10294F] transition-colors"
                                  title="Edit next action and deadline"
                                >
                                  <Edit2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Progression Actions */}
                        <div className="pt-2.5 mt-2 border-t border-[#F0ECE1] flex items-center justify-between text-xs">
                          {nextStage ? (
                            <button
                              onClick={() => handleStageTransition(opp.id, nextStage)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#10294F] hover:text-[#C2935D] transition-colors cursor-pointer"
                            >
                              <span>Move to {nextStage}</span>
                              <ArrowRight size={11} />
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#1D6E42] font-semibold flex items-center gap-1">
                              <CheckCircle2 size={12} /> Completed
                            </span>
                          )}

                          <button
                            onClick={() => handleStageTransition(opp.id, null)}
                            className="p-1 text-[#8E9BAE] hover:text-[#B93825] transition-colors cursor-pointer"
                            title="Remove from pursuit plan"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
