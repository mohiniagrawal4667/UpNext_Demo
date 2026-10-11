import { useState } from 'react';
import { Calendar, ExternalLink, ArrowRight, Gift, CheckCircle2 } from 'lucide-react';
import type { Opportunity, StudentProfile, PursuitItem } from '../../types';
import {
  OpportunityTypeBadge,
  DomainBadge,
  ReachBadge,
  FormatBadge,
  OriginBadge,
  StatusBadge,
  FitBadge,
  PursuitStatusBadge,
} from './Badge';
import { BookmarkButton } from './BookmarkButton';
import { deadlineLabel, getOpportunityStatus, evaluateFit } from '../../services/opportunityService';
import { useStudentProfile } from '../../hooks';

interface OpportunityCardProps {
  opportunity: Opportunity;
  saved: boolean;
  applicationStatus: string | null;
  pursuitItem?: PursuitItem;
  profile?: StudentProfile;
  onToggleSave: () => void;
  onOpen: () => void;
}

export function OpportunityCard({
  opportunity: o,
  saved,
  applicationStatus,
  pursuitItem,
  profile: propProfile,
  onToggleSave,
  onOpen,
}: OpportunityCardProps) {
  const [imgError, setImgError] = useState(false);
  const { profile: hookProfile } = useStudentProfile();
  const profile = propProfile || hookProfile;

  const status = getOpportunityStatus(o);
  const formattedDeadline = deadlineLabel(o.deadline);
  const fit = evaluateFit(o, profile);

  // Subtle pastel tinted card background based on domain/type
  const getCardTheme = () => {
    switch (o.opportunityType) {
      case 'internships_research':
        return 'bg-[#F5F9FD] border-[#E2EAF2] hover:border-[#CADCF0]';
      case 'hackathons_competitions':
        return 'bg-[#F9F7FD] border-[#EDE8F8] hover:border-[#DCCFF2]';
      case 'fellowships_scholarships':
        return 'bg-[#F5FAF7] border-[#E4F2EB] hover:border-[#C8E4D5]';
      case 'student_leadership':
        return 'bg-[#FFFBF5] border-[#F6EDE0] hover:border-[#EDDBBF]';
      case 'events_talks':
        return 'bg-[#FDF9F4] border-[#F6EDE0] hover:border-[#EDDBBF]';
      case 'learning_programs':
      default:
        return 'bg-[#F7F7FB] border-[#E9E9F5] hover:border-[#D6D6EC]';
    }
  };

  return (
    <article
      className={`
        rounded-2xl border transition-all duration-200 cursor-pointer group flex flex-col justify-between
        ${getCardTheme()} shadow-xs hover:shadow-md
      `}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      aria-label={`View details for ${o.title}`}
    >
      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Top bar: Opportunity Type Badge + Pursuit Stage + Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <OpportunityTypeBadge type={o.opportunityType} />
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {applicationStatus && <PursuitStatusBadge status={applicationStatus} />}
            <BookmarkButton saved={saved} onToggle={onToggleSave} size="sm" />
          </div>
        </div>

        {/* Thumbnail Image with Origin badge & Fit Badge */}
        <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-[#EAE6DF]">
          {o.imageUrl && !imgError ? (
            <img
              src={o.imageUrl}
              alt={o.title}
              onError={() => setImgError(true)}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-[#EAE6DF] to-[#D5CEBE] p-4 text-center">
              <span className="font-serif font-semibold text-[#10294F] text-sm">{o.organization}</span>
              <span className="text-[11px] text-[#5E6E82] mt-1">{o.title}</span>
            </div>
          )}

          {/* Floating Badges on Thumbnail */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
            <FitBadge status={fit.status} />
            <OriginBadge origin={o.origin} compact />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-serif font-bold text-[#10294F] text-lg leading-snug group-hover:text-[#173766] transition-colors mb-1">
          {o.title}
        </h3>

        {/* Organization */}
        <p className="text-xs text-[#5E6E82] font-medium mb-2 truncate">
          {o.organization}
        </p>

        {/* Short readable description */}
        <p className="text-xs text-[#5E6E82] line-clamp-2 leading-relaxed mb-3 flex-1">
          {o.description}
        </p>

        {/* Benefits snippet */}
        {(o.benefits || o.reward) && (
          <div className="flex items-center gap-1.5 text-xs text-[#1E5B99] mb-3 font-medium truncate">
            <Gift size={13} className="flex-shrink-0" />
            <span className="truncate">{o.benefits || o.reward}</span>
          </div>
        )}

        {/* Domain, Reach, Format Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <DomainBadge domain={o.domain} />
          <ReachBadge reach={o.reach} />
          <FormatBadge format={o.format} />
        </div>

        {/* Plain Language Fit Explanation */}
        <div className="mb-3 p-2 rounded-lg bg-black/[0.02] border border-black/5 text-[11px] text-[#5E6E82] flex items-start gap-1.5">
          <span className="font-semibold text-[#10294F] flex-shrink-0">Fit:</span>
          <span className="line-clamp-1">{fit.explanation}</span>
        </div>

        {/* Next Action in Pursuit Plan if recorded */}
        {pursuitItem?.nextAction && (
          <div className="mb-3 p-2 rounded-lg bg-[#EBF5F0] border border-[#D2E8DC] text-[11px] text-[#1D6E42] flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <CheckCircle2 size={12} className="flex-shrink-0 text-[#1D6E42]" />
              <span className="font-semibold truncate">Next: {pursuitItem.nextAction}</span>
            </div>
            {pursuitItem.nextActionDate && (
              <span className="text-[10px] text-[#5E6E82] ml-2 flex-shrink-0">
                Due {new Date(pursuitItem.nextActionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        )}

        {/* Deadline & Status section */}
        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#5E6E82]">
            <Calendar size={13} className="text-[#8E9BAE]" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] font-medium">Deadline:</span>
              <span className="font-semibold text-[#10294F]">
                {formattedDeadline === 'Closed' && o.deadline
                  ? new Date(o.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : formattedDeadline}
              </span>
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Card footer: Source & Next Action */}
      <div className="px-4 py-3 sm:px-5 border-t border-black/5 bg-black/[0.015] rounded-b-2xl flex items-center justify-between">
        <a
          href={o.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-xs text-[#5E6E82] hover:text-[#10294F] font-medium transition-colors"
          title={`Official portal: ${o.sourceUrl}`}
        >
          <span>Official source</span>
          <ExternalLink size={11} />
        </a>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#10294F] bg-white border border-[#D1D5DB] hover:border-[#10294F] hover:bg-[#F8F6F0] rounded-lg shadow-2xs transition-colors cursor-pointer"
          title="Review fit and plan next action"
        >
          <span>{applicationStatus ? 'Update plan' : 'Check fit & plan'}</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </article>
  );
}
