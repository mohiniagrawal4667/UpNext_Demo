import { useState } from 'react';
import {
  X,
  ExternalLink,
  Calendar,
  MapPin,
  Award,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ShieldCheck,
  Check,
  Clock,
  Sparkles,
} from 'lucide-react';
import type {
  Opportunity,
  PursuitStatus,
  EligibilityRequirement,
} from '../types';
import {
  OpportunityTypeBadge,
  DomainBadge,
  ReachBadge,
  FormatBadge,
  OriginBadge,
  StatusBadge,
  FitBadge,
} from './ui/Badge';
import { BookmarkButton } from './ui/BookmarkButton';
import {
  deadlineLabel,
  getOpportunityStatus,
  evaluateFit,
} from '../services/opportunityService';
import { useStudentProfile, usePursuitPlan } from '../hooks';

interface OpportunityDetailProps {
  opportunity: Opportunity;
  saved: boolean;
  onToggleSave: () => void;
  onClose: () => void;
}

const PURSUIT_STAGES: {
  value: PursuitStatus;
  label: string;
  bg: string;
  text: string;
  border: string;
}[] = [
  { value: 'interested', label: 'Interested', bg: 'bg-[#EBF3FA]', text: 'text-[#1E5B99]', border: 'border-[#D5E4F2]' },
  { value: 'preparing', label: 'Preparing', bg: 'bg-[#F1EDF9]', text: 'text-[#5B3BA6]', border: 'border-[#E3DBF3]' },
  { value: 'applied', label: 'Applied', bg: 'bg-[#EBF5F0]', text: 'text-[#1D6E42]', border: 'border-[#D2E8DC]' },
  { value: 'completed', label: 'Completed', bg: 'bg-[#F0FDF4]', text: 'text-[#15803D]', border: 'border-[#BBF7D0]' },
];

export function OpportunityDetail({
  opportunity: o,
  saved,
  onToggleSave,
  onClose,
}: OpportunityDetailProps) {
  const { profile } = useStudentProfile();
  const { items, setStatus, updateNextAction } = usePursuitPlan();

  const currentItem = items.find((i) => i.opportunityId === o.id);
  const pursuitStatus = currentItem?.status || null;

  const [nextActionInput, setNextActionInput] = useState(currentItem?.nextAction || '');
  const [nextActionDateInput, setNextActionDateInput] = useState(currentItem?.nextActionDate || '');
  const [actionSavedNotification, setActionSavedNotification] = useState(false);
  const [imgError, setImgError] = useState(false);

  const oppStatus = getOpportunityStatus(o);
  const formattedDeadline = deadlineLabel(o.deadline);
  const fit = evaluateFit(o, profile);

  const handleSaveAction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateNextAction(o.id, nextActionInput.trim(), nextActionDateInput || null);
    setActionSavedNotification(true);
    setTimeout(() => setActionSavedNotification(false), 2500);
  };

  const handleStageChange = (newStage: PursuitStatus | null) => {
    setStatus(o.id, newStage);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6 px-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${o.title}`}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl my-4 overflow-hidden border border-[#EAE6DF]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close detail view"
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 text-[#5E6E82] hover:text-[#10294F] hover:bg-white shadow-2xs transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Thumbnail Hero if available */}
        {o.imageUrl && !imgError && (
          <div className="relative w-full h-48 sm:h-56 bg-[#EAE6DF]">
            <img
              src={o.imageUrl}
              alt={o.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
              <span className="text-xs font-semibold tracking-wide uppercase bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-xs">
                {o.organization}
              </span>
              <OriginBadge origin={o.origin} compact />
            </div>
          </div>
        )}

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Row */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <OpportunityTypeBadge type={o.opportunityType} />
                <DomainBadge domain={o.domain} />
                <ReachBadge reach={o.reach} />
                <FormatBadge format={o.format} />
                <StatusBadge status={oppStatus} />
              </div>
              <BookmarkButton saved={saved} onToggle={onToggleSave} size="md" />
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#10294F] leading-tight mb-1">
              {o.title}
            </h2>
            <p className="text-sm text-[#5E6E82]">{o.organization}</p>
          </div>

          {/* Student Profile Fit Evaluation (Plain Language, Non-Fabricated) */}
          <div className="p-4 rounded-xl border border-[#EAE6DF] bg-[#F8F6F0]/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#10294F]" />
                <span className="font-serif font-bold text-sm text-[#10294F]">
                  Profile Fit Evaluation
                </span>
              </div>
              <FitBadge status={fit.status} />
            </div>

            <p className="text-xs text-[#5E6E82] leading-relaxed">
              {fit.explanation}
            </p>

            {fit.matchingFactors.length > 0 && (
              <div className="pt-2 border-t border-[#EAE6DF]/60 space-y-1">
                <p className="text-[11px] font-semibold text-[#1D6E42] uppercase tracking-wider">
                  Confirmed Matching Factors:
                </p>
                <ul className="space-y-1">
                  {fit.matchingFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-xs text-[#5E6E82]">
                      <CheckCircle2 size={13} className="text-[#1D6E42] flex-shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {fit.unverifiedFactors.length > 0 && (
              <div className="pt-2 border-t border-[#EAE6DF]/60 space-y-1">
                <p className="text-[11px] font-semibold text-[#9A5B18] uppercase tracking-wider">
                  Needs Verification on Host Portal:
                </p>
                <ul className="space-y-1">
                  {fit.unverifiedFactors.map((factor, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-xs text-[#5E6E82]">
                      <Clock size={13} className="text-[#9A5B18] flex-shrink-0" />
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Verification & Data Quality Banner */}
          {o.verifiedAt ? (
            <div className="flex items-start gap-2.5 p-3.5 bg-[#EBF5F0] border border-[#D2E8DC] rounded-xl text-xs text-[#1D6E42]">
              <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#10294F]">Retrieved via External Provider</p>
                <p className="text-[#5E6E82]">
                  Extracted and verified against host portal at {new Date(o.verifiedAt).toLocaleString('en-IN')}.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-3.5 bg-[#FDF3E7] border border-[#F6E1C8] rounded-xl text-xs text-[#9A5B18]">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5 text-[#A85A12]" />
              <div className="space-y-0.5">
                <p className="font-semibold text-[#10294F]">Curated Demo Record — Benchmark Cycle</p>
                <p className="text-[#5E6E82]">
                  Sample opportunity record for Indian students. Dates reflect previous program benchmarks. Always verify requirements directly on the official host portal.
                </p>
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Deadline */}
            <div className="p-3.5 rounded-xl border border-[#EAE6DF] bg-[#F8F6F0]">
              <div className="flex items-center gap-1.5 text-xs text-[#5E6E82] mb-1">
                <Calendar size={14} className="text-[#8E9BAE]" />
                <span className="font-semibold text-[#10294F]">Application Deadline</span>
              </div>
              <p className="text-sm font-bold text-[#10294F]">
                {formattedDeadline === 'Closed' && o.deadline
                  ? new Date(o.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                  : formattedDeadline}
              </p>
              <p className="text-[11px] text-[#8E9BAE]">
                {o.deadline ? `Recorded date: ${o.deadline}` : 'Open enrolment / Rolling'}
              </p>
            </div>

            {/* Location & Reach */}
            <div className="p-3.5 rounded-xl border border-[#EAE6DF] bg-[#F8F6F0]">
              <div className="flex items-center gap-1.5 text-xs text-[#5E6E82] mb-1">
                <MapPin size={14} className="text-[#8E9BAE]" />
                <span className="font-semibold text-[#10294F]">Location & Reach</span>
              </div>
              <p className="text-sm font-bold text-[#10294F]">{o.location}</p>
              <p className="text-[11px] text-[#8E9BAE]">
                Delivery: {o.format} • Reach: {o.reach}
              </p>
            </div>

            {/* Benefits */}
            <div className="p-3.5 rounded-xl border border-[#D5E4F2] bg-[#EBF3FA] sm:col-span-2">
              <div className="flex items-center gap-1.5 text-xs text-[#1E5B99] mb-1">
                <Award size={14} />
                <span className="font-semibold">Rewards & Benefits</span>
              </div>
              <p className="text-sm font-bold text-[#10294F]">{o.benefits || o.reward}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-serif font-bold text-base text-[#10294F] mb-2">
              Program Overview
            </h3>
            <p className="text-xs sm:text-sm text-[#5E6E82] leading-relaxed">
              {o.description}
            </p>
          </div>

          {/* Eligibility Checklist */}
          {o.eligibilityChecklist && o.eligibilityChecklist.length > 0 && (
            <div>
              <h3 className="font-serif font-bold text-base text-[#10294F] mb-2.5">
                Eligibility Checklist
              </h3>
              <ul className="space-y-2">
                {o.eligibilityChecklist.map((item: EligibilityRequirement, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[#5E6E82]">
                    {item.met === false ? (
                      <Circle size={15} className="text-[#CBD5E1] flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 size={15} className="text-[#1D6E42] flex-shrink-0 mt-0.5" />
                    )}
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ─────────────────────────────────────────────
              MY PURSUIT PLAN: Stage, Next Action & Deadline
             ───────────────────────────────────────────── */}
          <div className="p-5 rounded-2xl border border-[#D5E4F2] bg-[#F5F9FD] space-y-4">
            <div>
              <h3 className="font-serif font-bold text-sm text-[#10294F]">
                My Pursuit Plan
              </h3>
              <p className="text-xs text-[#5E6E82]">
                Track your progress and set an immediate action to make your move.
              </p>
            </div>

            {/* Stage Selector */}
            <div className="flex flex-wrap gap-2">
              {PURSUIT_STAGES.map((opt) => {
                const isSelected = pursuitStatus === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleStageChange(isSelected ? null : opt.value)}
                    aria-pressed={isSelected}
                    className={`
                      px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer
                      ${isSelected
                        ? `${opt.bg} ${opt.text} ${opt.border} ring-1 ring-current shadow-xs`
                        : 'bg-white text-[#5E6E82] border-[#EAE6DF] hover:border-[#10294F]'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                );
              })}
              {pursuitStatus && (
                <button
                  onClick={() => handleStageChange(null)}
                  className="px-3 py-1.5 text-xs text-[#8E9BAE] hover:text-[#B93825] cursor-pointer"
                >
                  Clear stage
                </button>
              )}
            </div>

            {/* Next Action & Action Deadline Input Form */}
            <form onSubmit={handleSaveAction} className="pt-3 border-t border-[#D5E4F2] space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label htmlFor="nextAction" className="block text-[11px] font-semibold text-[#10294F] mb-1">
                    Next Action to Take
                  </label>
                  <input
                    id="nextAction"
                    type="text"
                    value={nextActionInput}
                    onChange={(e) => setNextActionInput(e.target.value)}
                    placeholder="e.g., Draft resume & gather SPOC letter"
                    className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-[#CBD5E1] text-[#10294F] focus:outline-none focus:border-[#10294F]"
                  />
                </div>
                <div>
                  <label htmlFor="nextActionDate" className="block text-[11px] font-semibold text-[#10294F] mb-1">
                    Target Action Date
                  </label>
                  <input
                    id="nextActionDate"
                    type="date"
                    value={nextActionDateInput}
                    onChange={(e) => setNextActionDateInput(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white rounded-lg border border-[#CBD5E1] text-[#10294F] focus:outline-none focus:border-[#10294F]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#5E6E82]">
                  {actionSavedNotification ? (
                    <span className="text-[#1D6E42] font-semibold flex items-center gap-1">
                      <Check size={12} /> Action saved to Pursuit Plan
                    </span>
                  ) : (
                    'Set concrete deadlines to stay on track.'
                  )}
                </span>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#10294F] text-white rounded-lg text-xs font-semibold hover:bg-[#173766] transition-colors cursor-pointer shadow-2xs"
                >
                  Save Next Action
                </button>
              </div>
            </form>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[#EAE6DF] flex flex-col sm:flex-row gap-3">
            <a
              href={o.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#10294F] text-white text-xs font-semibold rounded-xl hover:bg-[#173766] transition-colors shadow-xs cursor-pointer"
            >
              <span>Visit official portal</span>
              <ExternalLink size={13} />
            </a>
            <button
              onClick={onClose}
              className="px-5 py-3 border border-[#EAE6DF] rounded-xl text-xs font-semibold text-[#5E6E82] hover:text-[#10294F] hover:bg-[#F8F6F0] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

          <p className="text-[11px] text-[#8E9BAE] text-center">
            Source checked: {new Date(o.lastChecked).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}
