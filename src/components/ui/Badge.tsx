import type {
  OpportunityType,
  OpportunityReach,
  OpportunityDomain,
  OpportunityCategory,
  OpportunityFormat,
  EligibilityLevel,
  OpportunityStatus,
  DataOrigin,
  PursuitStatus,
  FitStatus,
} from '../../types';
import {
  OPPORTUNITY_TYPE_LABELS,
  REACH_LABELS,
  DOMAIN_LABELS,
  FORMAT_LABELS,
  ELIGIBILITY_LABELS,
} from '../../services/opportunityService';
import {
  Briefcase,
  Trophy,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  Globe,
  FileCode2,
  Users,
  Calendar,
  Sparkles,
  HelpCircle,
  XCircle,
  MapPin,
} from 'lucide-react';

export function OpportunityTypeBadge({ type }: { type: OpportunityType }) {
  const getIcon = () => {
    switch (type) {
      case 'hackathons_competitions':
        return <Trophy size={13} className="text-[#5B3BA6]" />;
      case 'fellowships_scholarships':
        return <GraduationCap size={13} className="text-[#1D6E42]" />;
      case 'student_leadership':
        return <Users size={13} className="text-[#A85A12]" />;
      case 'internships_research':
        return <Briefcase size={13} className="text-[#1E5B99]" />;
      case 'events_talks':
        return <Calendar size={13} className="text-[#D97706]" />;
      case 'learning_programs':
      default:
        return <BookOpen size={13} className="text-[#0284C7]" />;
    }
  };

  const label = OPPORTUNITY_TYPE_LABELS[type] || type;

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10294F]">
      {getIcon()}
      <span className="truncate">{label}</span>
    </div>
  );
}

// Backwards compatibility alias
export function CategoryHeaderBadge({ category }: { category: OpportunityCategory }) {
  const typeMap: Record<OpportunityCategory, OpportunityType> = {
    hackathon: 'hackathons_competitions',
    internship: 'internships_research',
    scholarship: 'fellowships_scholarships',
    fellowship: 'fellowships_scholarships',
    learning: 'learning_programs',
  };
  return <OpportunityTypeBadge type={typeMap[category] || 'learning_programs'} />;
}

export function PillTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/80 text-[#475569] border border-[#E2E8F0] shadow-2xs">
      {label}
    </span>
  );
}

export function ReachBadge({ reach }: { reach: OpportunityReach }) {
  const styles: Record<OpportunityReach, string> = {
    local_campus: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
    national: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
    international: 'bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]',
    unspecified: 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
        styles[reach] || styles.unspecified
      }`}
    >
      <MapPin size={10} />
      <span>{REACH_LABELS[reach] || reach}</span>
    </span>
  );
}

export function DomainBadge({ domain }: { domain: OpportunityDomain }) {
  const styles: Record<OpportunityDomain, string> = {
    technology_ai: 'bg-[#EBF3FA] text-[#1E5B99] border-[#D5E4F2]',
    business: 'bg-[#F5FAF7] text-[#1D6E42] border-[#D2E8DC]',
    research: 'bg-[#F1EDF9] text-[#5B3BA6] border-[#E3DBF3]',
    social_impact: 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]',
    creative_design: 'bg-[#FDF2F8] text-[#9D174D] border-[#FCE7F3]',
    open_domain: 'bg-[#F8F9FA] text-[#475569] border-[#E2E8F0]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
        styles[domain] || styles.open_domain
      }`}
    >
      <Sparkles size={10} />
      <span>{DOMAIN_LABELS[domain] || domain}</span>
    </span>
  );
}

export function FitBadge({ status }: { status: FitStatus }) {
  if (status === 'eligible') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EBF5F0] text-[#1D6E42] border border-[#D2E8DC]">
        <CheckCircle2 size={11} />
        <span>Confirmed Eligible</span>
      </span>
    );
  }

  if (status === 'ineligible') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#FDF2F0] text-[#B93825] border border-[#FBD6D0]">
        <XCircle size={11} />
        <span>Not Eligible</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#FDF3E7] text-[#9A5B18] border border-[#F6E1C8]">
      <HelpCircle size={11} />
      <span>Needs Verification</span>
    </span>
  );
}

export function FormatBadge({ format }: { format: OpportunityFormat }) {
  return <PillTag label={FORMAT_LABELS[format]} />;
}

export function EligibilityBadge({ level }: { level: EligibilityLevel }) {
  return <PillTag label={ELIGIBILITY_LABELS[level]} />;
}

export function OriginBadge({ origin, compact = false }: { origin: DataOrigin; compact?: boolean }) {
  if (origin === 'Live') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EBF5F0] text-[#1D6E42] border border-[#D2E8DC]">
        <Globe size={11} />
        <span>{compact ? 'Retrieved' : 'External Provider'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#FDF3E7] text-[#9A5B18] border border-[#F6E1C8]">
      <FileCode2 size={11} />
      <span>{compact ? 'Demo' : 'Curated Demo'}</span>
    </span>
  );
}

export function StatusBadge({ status }: { status: OpportunityStatus }) {
  switch (status) {
    case 'Open':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#EBF5F0] text-[#1D6E42] border border-[#D2E8DC]">
          <CheckCircle2 size={11} />
          <span>Open</span>
        </span>
      );
    case 'Closing Soon':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#FDF2F0] text-[#B93825] border border-[#FBD6D0]">
          Closing Soon
        </span>
      );
    case 'Closed':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F1F3F5] text-[#5E6E82] border border-[#E2E6EA]">
          Closed
        </span>
      );
    case 'Unverified':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#F8F9FA] text-[#6C757D] border border-[#E9ECEF]">
          Unverified
        </span>
      );
  }
}

export function PursuitStatusBadge({ status }: { status: PursuitStatus | string | null }) {
  if (!status) return null;
  const labels: Record<string, string> = {
    interested: 'Interested',
    preparing: 'Preparing',
    applied: 'Applied',
    completed: 'Completed',
    closed: 'Completed',
  };
  const colors: Record<string, string> = {
    interested: 'bg-[#EBF3FA] text-[#1E5B99] border-[#D5E4F2]',
    preparing: 'bg-[#F1EDF9] text-[#5B3BA6] border-[#E3DBF3]',
    applied: 'bg-[#EBF5F0] text-[#1D6E42] border-[#D2E8DC]',
    completed: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
    closed: 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${
        colors[status] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// Backwards compatibility alias
export const ApplicationTrackerBadge = PursuitStatusBadge;
