// ─────────────────────────────────────────────
// Core data model for UPNEXT — Student Opportunity Discovery & Action Platform
// ─────────────────────────────────────────────

export type OpportunityType =
  | 'hackathons_competitions'
  | 'fellowships_scholarships'
  | 'student_leadership'
  | 'internships_research'
  | 'events_talks'
  | 'learning_programs';

// Backward compatible category alias
export type OpportunityCategory =
  | 'hackathon'
  | 'internship'
  | 'scholarship'
  | 'fellowship'
  | 'learning';

export type OpportunityReach =
  | 'local_campus'
  | 'national'
  | 'international'
  | 'unspecified';

export type OpportunityDomain =
  | 'technology_ai'
  | 'business'
  | 'research'
  | 'social_impact'
  | 'creative_design'
  | 'open_domain';

export type OpportunityFormat = 'online' | 'offline' | 'hybrid';

export type EligibilityLevel =
  | 'high_school'
  | 'undergraduate'
  | 'postgraduate'
  | 'any';

export type StudyYear =
  | '1st_year'
  | '2nd_year'
  | '3rd_year'
  | '4th_year'
  | 'postgraduate'
  | 'phd'
  | 'unspecified';

export type LocationPreference =
  | 'remote_online'
  | 'pan_india'
  | 'campus_local'
  | 'international'
  | 'any';

export type PursuitStatus =
  | 'interested'
  | 'preparing'
  | 'applied'
  | 'completed';

// Alias for backwards compatibility
export type ApplicationStatus = PursuitStatus | 'closed';

export type OpportunityStatus =
  | 'Open'
  | 'Closing Soon'
  | 'Closed'
  | 'Unverified';

export type DataOrigin =
  | 'Curated Demo'
  | 'Live';

export interface EligibilityRequirement {
  label: string;
  met?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  opportunityType: OpportunityType;
  category: OpportunityCategory; // kept for backwards compatibility
  reach: OpportunityReach;
  domain: OpportunityDomain;
  format: OpportunityFormat;
  eligibility: EligibilityLevel[];
  eligibleStudyYears?: StudyYear[] | null; // null when host did not specify
  eligibilitySummary?: string; // plain language statement of criteria
  deadline: string | null; // ISO date string YYYY-MM-DD or null
  benefits: string; // stipend, cash award, or certificate
  reward: string; // alias for benefits
  location: string; // city / Pan-India / Remote
  description: string;
  eligibilityChecklist: EligibilityRequirement[];
  tags: string[];
  sourceUrl: string;
  status: OpportunityStatus;
  origin: DataOrigin;
  verifiedAt: string | null;
  lastChecked: string;
  isDemo: boolean;
  isOpen: boolean;
  imageColor: string;
  imageUrl?: string;
}

// ─────────────────────────────────────────────
// Student Profile & Fit Evaluation
// ─────────────────────────────────────────────

export interface StudentProfile {
  studyYear: StudyYear;
  domains: OpportunityDomain[];
  skills: string[];
  locationPreference: LocationPreference;
}

// Backward compatibility alias for UserPreferences
export interface UserPreferences extends StudentProfile {
  educationLevel?: EligibilityLevel | null;
  interests?: OpportunityCategory[];
}

export type FitStatus = 'eligible' | 'ineligible' | 'needs_verification';

export interface FitEvaluation {
  status: FitStatus;
  badgeLabel: 'Confirmed Eligible' | 'Not Eligible' | 'Needs Verification';
  badgeColor: string;
  explanation: string;
  matchingFactors: string[];
  unverifiedFactors: string[];
}

// ─────────────────────────────────────────────
// My Pursuit Plan (Persisted in LocalStorage)
// ─────────────────────────────────────────────

export interface PursuitItem {
  opportunityId: string;
  savedAt: string;
  status: PursuitStatus | null;
  nextAction?: string; // e.g. "Submit SOP draft to SPOC"
  nextActionDate?: string | null; // YYYY-MM-DD
  notes?: string;
}

// Alias for backwards compatibility
export type SavedOpportunity = PursuitItem & {
  applicationStatus?: ApplicationStatus | null;
};

export interface PersistedState {
  pursuitPlan: PursuitItem[];
  savedOpportunities?: SavedOpportunity[]; // fallback alias
  profile: StudentProfile;
  preferences?: UserPreferences; // fallback alias
  customOpportunities?: Opportunity[];
}

// ─────────────────────────────────────────────
// Filter State
// ─────────────────────────────────────────────

export type DeadlineFilterOption =
  | 'any'
  | 'within_7_days'
  | 'within_30_days'
  | 'no_deadline_listed';

export type FitFilterOption =
  | 'all'
  | 'confirmed_eligible'
  | 'needs_verification';

export interface FilterState {
  query: string;
  opportunityTypes: OpportunityType[];
  reach: OpportunityReach[];
  domains: OpportunityDomain[];
  deadlineWindow: DeadlineFilterOption;
  fitFilter: FitFilterOption;
  // Backwards compatibility fields
  categories: OpportunityCategory[];
  formats: OpportunityFormat[];
  eligibility: EligibilityLevel[];
  deadlineBefore?: string | null;
  deadlineRanges?: string[];
  onlyOpen: boolean;
  sortBy?: 'relevant' | 'deadline' | 'title';
}

export const defaultFilter: FilterState = {
  query: '',
  opportunityTypes: [],
  reach: [],
  domains: [],
  deadlineWindow: 'any',
  fitFilter: 'all',
  categories: [],
  formats: [],
  eligibility: [],
  deadlineRanges: [],
  onlyOpen: false,
  sortBy: 'relevant',
};

// ─────────────────────────────────────────────
// Opportunity Discovery Types (TinyFish Architecture)
// ─────────────────────────────────────────────

export interface DiscoveryRequest {
  category: OpportunityCategory;
  opportunityType?: OpportunityType;
  targetUrl?: string;
  providerMode: 'live' | 'mock';
  customInstructions?: string;
}

export interface DiscoveryResult {
  success: boolean;
  opportunities: Opportunity[];
  sourceUrl: string;
  isMock: boolean;
  origin: DataOrigin;
  providerNotice?: string;
  error?: string;
  missingCredentials?: boolean;
  rawResponseSummary?: string;
  executedAt: string;
}
