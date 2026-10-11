import type {
  Opportunity,
  FilterState,
  OpportunityType,
  OpportunityReach,
  OpportunityDomain,
  OpportunityFormat,
  OpportunityStatus,
  StudyYear,
  LocationPreference,
  StudentProfile,
  FitEvaluation,
  OpportunityCategory,
  EligibilityLevel,
} from '../types';
import { DEMO_OPPORTUNITIES } from '../data/opportunities';
import { getCustomOpportunities } from './storage';

// ─────────────────────────────────────────────
// Opportunity Service Interface & Implementation
// ─────────────────────────────────────────────

export interface OpportunityService {
  fetchOpportunities(): Promise<Opportunity[]>;
  fetchById(id: string): Promise<Opportunity | null>;
}

class LocalOpportunityService implements OpportunityService {
  private seedData: Opportunity[];

  constructor(seedData: Opportunity[]) {
    this.seedData = seedData;
  }

  async fetchOpportunities(): Promise<Opportunity[]> {
    const custom = getCustomOpportunities();
    const combined = [...custom, ...this.seedData];

    // Deduplicate by ID
    const seen = new Set<string>();
    const unique: Opportunity[] = [];
    for (const item of combined) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        unique.push(item);
      }
    }

    return Promise.resolve(unique);
  }

  async fetchById(id: string): Promise<Opportunity | null> {
    const list = await this.fetchOpportunities();
    return list.find((o) => o.id === id) ?? null;
  }
}

export const opportunityService: OpportunityService = new LocalOpportunityService(
  DEMO_OPPORTUNITIES,
);

// ─────────────────────────────────────────────
// UI Labels & Taxonomy Mappings
// ─────────────────────────────────────────────

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  hackathons_competitions: 'Hackathons & Competitions',
  fellowships_scholarships: 'Fellowships & Scholarships',
  student_leadership: 'Student Leadership & Ambassador',
  internships_research: 'Internships & Research',
  events_talks: 'Events & Talks',
  learning_programs: 'Learning Programs',
};

export const REACH_LABELS: Record<OpportunityReach, string> = {
  local_campus: 'Local / Campus',
  national: 'National',
  international: 'International',
  unspecified: 'Unspecified Scope',
};

export const DOMAIN_LABELS: Record<OpportunityDomain, string> = {
  technology_ai: 'Technology & AI',
  business: 'Business',
  research: 'Research',
  social_impact: 'Social Impact',
  creative_design: 'Creative & Design',
  open_domain: 'Open Domain',
};

export const STUDY_YEAR_LABELS: Record<StudyYear, string> = {
  '1st_year': '1st Year',
  '2nd_year': '2nd Year',
  '3rd_year': '3rd Year',
  '4th_year': '4th / Final Year',
  postgraduate: 'Postgraduate',
  phd: 'PhD / Doctoral',
  unspecified: 'Any / Unspecified',
};

export const LOCATION_PREF_LABELS: Record<LocationPreference, string> = {
  remote_online: 'Remote / Online',
  pan_india: 'Pan-India',
  campus_local: 'Campus / Local',
  international: 'International',
  any: 'Any Location',
};

export const FORMAT_LABELS: Record<OpportunityFormat, string> = {
  online: 'Remote',
  offline: 'In-person',
  hybrid: 'Hybrid',
};

export const ELIGIBILITY_LABELS: Record<EligibilityLevel, string> = {
  high_school: 'High School',
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate',
  any: 'All Students',
};

// Backwards compatibility category labels
export const CATEGORY_LABELS: Record<string, string> = {
  hackathon: 'Hackathons',
  internship: 'Internships',
  scholarship: 'Scholarships',
  fellowship: 'Fellowships',
  learning: 'Learning Programs',
};

// ─────────────────────────────────────────────
// Deadline & Status Evaluators
// ─────────────────────────────────────────────

export function daysUntilDeadline(isoDate: string | null): number | null {
  if (!isoDate) return null;
  const time = new Date(isoDate).getTime();
  if (isNaN(time)) return null;
  return Math.ceil((time - Date.now()) / 86_400_000);
}

export function deadlineLabel(isoDate: string | null): string {
  if (!isoDate) return 'No deadline listed';
  const days = daysUntilDeadline(isoDate);
  if (days === null) return 'No deadline listed';
  if (days < 0) return 'Closed';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 30) return `${days} days left`;
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function isDeadlineUrgent(isoDate: string | null): boolean {
  const days = daysUntilDeadline(isoDate);
  if (days === null) return false;
  return days >= 0 && days <= 14;
}

export function getOpportunityStatus(o: Opportunity): OpportunityStatus {
  if (o.status === 'Closed' || !o.isOpen) {
    return 'Closed';
  }

  const days = daysUntilDeadline(o.deadline);
  if (days !== null && days < 0) {
    return 'Closed';
  }

  if (!o.verifiedAt || o.origin === 'Curated Demo') {
    return 'Unverified';
  }

  if (days !== null && days <= 14) {
    return 'Closing Soon';
  }

  return 'Open';
}

// ─────────────────────────────────────────────
// Plain-Language Student Fit & Eligibility Evaluation
// (Strictly based on declared criteria — zero AI fabrication)
// ─────────────────────────────────────────────

export function evaluateFit(o: Opportunity, profile: StudentProfile): FitEvaluation {
  const matchingFactors: string[] = [];
  const unverifiedFactors: string[] = [];

  // 1. Study Year Criteria Check
  let yearMatches = false;
  let yearMismatch = false;

  if (Array.isArray(o.eligibleStudyYears) && o.eligibleStudyYears.length > 0) {
    if (o.eligibleStudyYears.includes(profile.studyYear)) {
      yearMatches = true;
      matchingFactors.push(`Open to ${STUDY_YEAR_LABELS[profile.studyYear]} students`);
    } else if (profile.studyYear !== 'unspecified') {
      yearMismatch = true;
    }
  } else {
    // Host has not published study year restriction
    unverifiedFactors.push('Study year requirements not restricted by host');
  }

  // 2. Domain & Interest Check
  if (profile.domains && profile.domains.includes(o.domain)) {
    matchingFactors.push(`Matches your interest in ${DOMAIN_LABELS[o.domain]}`);
  }

  // 3. Skills Overlap Check
  if (Array.isArray(profile.skills) && profile.skills.length > 0 && Array.isArray(o.tags)) {
    const matched = profile.skills.filter((sk) =>
      o.tags.some((t) => t.toLowerCase().includes(sk.toLowerCase()))
    );
    if (matched.length > 0) {
      matchingFactors.push(`Matches skill tags: ${matched.slice(0, 3).join(', ')}`);
    }
  }

  // 4. Location & Format Check
  if (profile.locationPreference === 'remote_online' && o.format === 'online') {
    matchingFactors.push('Matches remote/online delivery format');
  } else if (
    profile.locationPreference === 'pan_india' &&
    (o.reach === 'national' || o.location.toLowerCase().includes('india'))
  ) {
    matchingFactors.push('Matches Pan-India geographic scope');
  }

  // 5. Outcome determination
  if (yearMismatch) {
    const allowed = (o.eligibleStudyYears || []).map((y) => STUDY_YEAR_LABELS[y]).join(' or ');
    return {
      status: 'ineligible',
      badgeLabel: 'Not Eligible',
      badgeColor: '#B93825',
      explanation: `Restricted by host to ${allowed} students. Your profile is set to ${STUDY_YEAR_LABELS[profile.studyYear]}.`,
      matchingFactors,
      unverifiedFactors,
    };
  }

  if (yearMatches) {
    return {
      status: 'eligible',
      badgeLabel: 'Confirmed Eligible',
      badgeColor: '#1D6E42',
      explanation: `Confirmed fit for ${STUDY_YEAR_LABELS[profile.studyYear]} students${
        matchingFactors.length > 1 ? ` and aligns with your ${DOMAIN_LABELS[o.domain]} interests` : ''
      }.`,
      matchingFactors,
      unverifiedFactors,
    };
  }

  // If study year was not explicitly restricted or profile year is unspecified
  return {
    status: 'needs_verification',
    badgeLabel: 'Needs Verification',
    badgeColor: '#9A5B18',
    explanation:
      o.eligibilitySummary ||
      'Host has not published detailed academic restrictions. Confirm specific eligibility on the official portal before applying.',
    matchingFactors,
    unverifiedFactors,
  };
}

// ─────────────────────────────────────────────
// Filtering, Search & Sorting
// ─────────────────────────────────────────────

export function applyFilters(
  opportunities: Opportunity[],
  filter: FilterState,
  profile: StudentProfile
): Opportunity[] {
  let results = opportunities.slice();

  // 1. Full-text search
  if (filter.query && filter.query.trim()) {
    const q = filter.query.toLowerCase().trim();
    results = results.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        (o.benefits && o.benefits.toLowerCase().includes(q)) ||
        (o.tags && o.tags.some((t) => t.toLowerCase().includes(q))) ||
        DOMAIN_LABELS[o.domain].toLowerCase().includes(q) ||
        OPPORTUNITY_TYPE_LABELS[o.opportunityType].toLowerCase().includes(q)
    );
  }

  // 2. Opportunity Type filter
  if (filter.opportunityTypes && filter.opportunityTypes.length > 0) {
    results = results.filter((o) => filter.opportunityTypes.includes(o.opportunityType));
  }

  // 3. Reach filter
  if (filter.reach && filter.reach.length > 0) {
    results = results.filter((o) => filter.reach.includes(o.reach));
  }

  // 4. Domain filter
  if (filter.domains && filter.domains.length > 0) {
    results = results.filter((o) => filter.domains.includes(o.domain));
  }

  // 5. Deadline Window filter
  if (filter.deadlineWindow && filter.deadlineWindow !== 'any') {
    results = results.filter((o) => {
      const days = daysUntilDeadline(o.deadline);
      if (filter.deadlineWindow === 'within_7_days') {
        return days !== null && days >= 0 && days <= 7;
      }
      if (filter.deadlineWindow === 'within_30_days') {
        return days !== null && days >= 0 && days <= 30;
      }
      if (filter.deadlineWindow === 'no_deadline_listed') {
        return o.deadline === null;
      }
      return true;
    });
  }

  // 6. Eligibility / Fit filter
  if (filter.fitFilter && filter.fitFilter !== 'all') {
    results = results.filter((o) => {
      const fit = evaluateFit(o, profile);
      if (filter.fitFilter === 'confirmed_eligible') {
        return fit.status === 'eligible';
      }
      if (filter.fitFilter === 'needs_verification') {
        return fit.status === 'needs_verification';
      }
      return true;
    });
  }

  // 7. Backward compatible filters (Categories / Formats / Open Only)
  if (filter.categories && filter.categories.length > 0) {
    results = results.filter((o) => filter.categories.includes(o.category));
  }
  if (filter.formats && filter.formats.length > 0) {
    results = results.filter((o) => filter.formats.includes(o.format));
  }
  if (filter.onlyOpen) {
    results = results.filter((o) => {
      const status = getOpportunityStatus(o);
      return status === 'Open' || status === 'Closing Soon';
    });
  }

  // 8. Sorting
  if (filter.sortBy === 'deadline') {
    results.sort((a, b) => {
      const daysA = daysUntilDeadline(a.deadline);
      const daysB = daysUntilDeadline(b.deadline);

      const aUpcoming = daysA !== null && daysA >= 0;
      const bUpcoming = daysB !== null && daysB >= 0;
      if (aUpcoming && bUpcoming) return daysA! - daysB!;
      if (aUpcoming) return -1;
      if (bUpcoming) return 1;

      if (a.deadline === null && b.deadline !== null) return -1;
      if (a.deadline !== null && b.deadline === null) return 1;

      if (daysA !== null && daysB !== null) return daysB - daysA;
      return a.title.localeCompare(b.title);
    });
  } else if (filter.sortBy === 'title') {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // Default: Relevance scoring matching student profile
    const computeRelevance = (o: Opportunity): number => {
      let score = 0;
      const fit = evaluateFit(o, profile);
      if (fit.status === 'eligible') score += 10;
      if (fit.status === 'needs_verification') score += 4;
      if (profile.domains.includes(o.domain)) score += 6;

      const days = daysUntilDeadline(o.deadline);
      if (days !== null && days >= 0 && days <= 30) score += 3;
      if (o.origin === 'Live') score += 2;

      return score;
    };

    results.sort((a, b) => {
      const diff = computeRelevance(b) - computeRelevance(a);
      if (diff !== 0) return diff;
      return a.title.localeCompare(b.title);
    });
  }

  return results;
}

// ─────────────────────────────────────────────
// Dynamic Filter Counts
// ─────────────────────────────────────────────

export interface FilterCounts {
  opportunityTypes: Record<OpportunityType, number>;
  reach: Record<OpportunityReach, number>;
  domains: Record<OpportunityDomain, number>;
  deadlineWindow: {
    any: number;
    within_7_days: number;
    within_30_days: number;
    no_deadline_listed: number;
  };
  fitFilter: {
    all: number;
    confirmed_eligible: number;
    needs_verification: number;
  };
  // Backwards compatibility
  category: Record<OpportunityCategory, number>;
  format: Record<OpportunityFormat, number>;
}

export function computeFilterCounts(
  opportunities: Opportunity[],
  profile: StudentProfile
): FilterCounts {
  const counts: FilterCounts = {
    opportunityTypes: {
      hackathons_competitions: 0,
      fellowships_scholarships: 0,
      student_leadership: 0,
      internships_research: 0,
      events_talks: 0,
      learning_programs: 0,
    },
    reach: {
      local_campus: 0,
      national: 0,
      international: 0,
      unspecified: 0,
    },
    domains: {
      technology_ai: 0,
      business: 0,
      research: 0,
      social_impact: 0,
      creative_design: 0,
      open_domain: 0,
    },
    deadlineWindow: {
      any: opportunities.length,
      within_7_days: 0,
      within_30_days: 0,
      no_deadline_listed: 0,
    },
    fitFilter: {
      all: opportunities.length,
      confirmed_eligible: 0,
      needs_verification: 0,
    },
    category: {
      internship: 0,
      hackathon: 0,
      scholarship: 0,
      fellowship: 0,
      learning: 0,
    },
    format: {
      online: 0,
      hybrid: 0,
      offline: 0,
    },
  };

  opportunities.forEach((o) => {
    // Opportunity Type
    if (counts.opportunityTypes[o.opportunityType] !== undefined) {
      counts.opportunityTypes[o.opportunityType]++;
    }

    // Reach
    if (counts.reach[o.reach] !== undefined) {
      counts.reach[o.reach]++;
    }

    // Domain
    if (counts.domains[o.domain] !== undefined) {
      counts.domains[o.domain]++;
    }

    // Category & Format
    if (counts.category[o.category] !== undefined) {
      counts.category[o.category]++;
    }
    if (counts.format[o.format] !== undefined) {
      counts.format[o.format]++;
    }

    // Deadline Window
    if (o.deadline === null) {
      counts.deadlineWindow.no_deadline_listed++;
    } else {
      const days = daysUntilDeadline(o.deadline);
      if (days !== null && days >= 0 && days <= 7) counts.deadlineWindow.within_7_days++;
      if (days !== null && days >= 0 && days <= 30) counts.deadlineWindow.within_30_days++;
    }

    // Fit Filter
    const fit = evaluateFit(o, profile);
    if (fit.status === 'eligible') {
      counts.fitFilter.confirmed_eligible++;
    } else if (fit.status === 'needs_verification') {
      counts.fitFilter.needs_verification++;
    }
  });

  return counts;
}
