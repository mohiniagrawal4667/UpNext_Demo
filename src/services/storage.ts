import type {
  PersistedState,
  PursuitItem,
  SavedOpportunity,
  StudentProfile,
  UserPreferences,
  PursuitStatus,
  Opportunity,
} from '../types';

// ─────────────────────────────────────────────
// LocalStorage persistence utilities for UPNEXT
// ─────────────────────────────────────────────

const STORAGE_KEY = 'upnext_v1';
const LEGACY_STORAGE_KEY = 'opportunity_radar_v1';

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  studyYear: '2nd_year',
  domains: ['technology_ai', 'open_domain'],
  skills: ['Python', 'Web Development', 'AI/ML', 'Problem Solving'],
  locationPreference: 'pan_india',
};

const DEFAULT_STATE: PersistedState = {
  pursuitPlan: [],
  profile: DEFAULT_STUDENT_PROFILE,
  customOpportunities: [],
};

function normalizePursuitItem(raw: any): PursuitItem {
  return {
    opportunityId: raw.opportunityId || raw.id,
    savedAt: raw.savedAt || new Date().toISOString(),
    status: raw.status || raw.applicationStatus || null,
    nextAction: raw.nextAction || '',
    nextActionDate: raw.nextActionDate || null,
    notes: raw.notes || '',
  };
}

function load(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);

    const itemsRaw = parsed.pursuitPlan || parsed.savedOpportunities || [];
    const pursuitPlan: PursuitItem[] = Array.isArray(itemsRaw)
      ? itemsRaw.map(normalizePursuitItem)
      : [];

    const profileRaw = parsed.profile || parsed.preferences || {};
    const profile: StudentProfile = {
      studyYear: profileRaw.studyYear || '2nd_year',
      domains: Array.isArray(profileRaw.domains)
        ? profileRaw.domains
        : ['technology_ai', 'open_domain'],
      skills: Array.isArray(profileRaw.skills) && profileRaw.skills.length > 0
        ? profileRaw.skills
        : ['Python', 'Web Development', 'AI/ML'],
      locationPreference: profileRaw.locationPreference || 'pan_india',
    };

    return {
      pursuitPlan,
      profile,
      customOpportunities: Array.isArray(parsed.customOpportunities)
        ? parsed.customOpportunities
        : [],
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function save(state: PersistedState): void {
  try {
    // Keep both pursuitPlan and savedOpportunities aliases for maximum compatibility
    const payload = {
      pursuitPlan: state.pursuitPlan,
      savedOpportunities: state.pursuitPlan.map((p) => ({
        ...p,
        applicationStatus: p.status,
      })),
      profile: state.profile,
      preferences: state.profile,
      customOpportunities: state.customOpportunities || [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Storage quota exceeded — fail gracefully
  }
}

// ── My Pursuit Plan (Bookmarks, Stages & Next Actions) ──

export function getPursuitPlan(): PursuitItem[] {
  return load().pursuitPlan;
}

// Backwards compatibility alias
export function getSavedOpportunities(): SavedOpportunity[] {
  return getPursuitPlan().map((p) => ({
    ...p,
    applicationStatus: p.status,
  }));
}

export function isOpportunitySaved(id: string): boolean {
  return load().pursuitPlan.some((s) => s.opportunityId === id);
}

export function savePursuitItem(id: string): void {
  const state = load();
  if (state.pursuitPlan.some((s) => s.opportunityId === id)) return;
  state.pursuitPlan.push({
    opportunityId: id,
    savedAt: new Date().toISOString(),
    status: 'interested', // Default stage when saved
    nextAction: '',
    nextActionDate: null,
  });
  save(state);
}

// Backwards compatibility alias
export function saveOpportunity(id: string): void {
  savePursuitItem(id);
}

export function unsavePursuitItem(id: string): void {
  const state = load();
  state.pursuitPlan = state.pursuitPlan.filter((s) => s.opportunityId !== id);
  save(state);
}

// Backwards compatibility alias
export function unsaveOpportunity(id: string): void {
  unsavePursuitItem(id);
}

export function setPursuitStatus(id: string, status: PursuitStatus | null): void {
  const state = load();
  const item = state.pursuitPlan.find((s) => s.opportunityId === id);
  if (item) {
    item.status = status;
  } else if (status !== null) {
    // If not saved yet, save it with this status
    state.pursuitPlan.push({
      opportunityId: id,
      savedAt: new Date().toISOString(),
      status,
      nextAction: '',
      nextActionDate: null,
    });
  }
  save(state);
}

// Backwards compatibility alias
export function setApplicationStatus(id: string, status: any): void {
  const normalized: PursuitStatus | null =
    status === 'closed' ? 'completed' : (status as PursuitStatus | null);
  setPursuitStatus(id, normalized);
}

export function getPursuitStatus(id: string): PursuitStatus | null {
  const item = load().pursuitPlan.find((s) => s.opportunityId === id);
  return item?.status ?? null;
}

// Backwards compatibility alias
export function getApplicationStatus(id: string): PursuitStatus | null {
  return getPursuitStatus(id);
}

export function updatePursuitNextAction(
  id: string,
  nextAction: string,
  nextActionDate: string | null
): void {
  const state = load();
  const item = state.pursuitPlan.find((s) => s.opportunityId === id);
  if (item) {
    item.nextAction = nextAction;
    item.nextActionDate = nextActionDate;
    save(state);
  }
}

// ── Student Profile ──

export function getStudentProfile(): StudentProfile {
  return load().profile;
}

export function saveStudentProfile(profile: StudentProfile): void {
  const state = load();
  state.profile = profile;
  save(state);
}

// Backwards compatibility alias
export function getPreferences(): UserPreferences {
  return getStudentProfile();
}

// Backwards compatibility alias
export function savePreferences(prefs: any): void {
  if (prefs) {
    const existing = getStudentProfile();
    const updated: StudentProfile = {
      studyYear: prefs.studyYear || existing.studyYear,
      domains: Array.isArray(prefs.domains) ? prefs.domains : existing.domains,
      skills: Array.isArray(prefs.skills) ? prefs.skills : existing.skills,
      locationPreference: prefs.locationPreference || existing.locationPreference,
    };
    saveStudentProfile(updated);
  }
}

// ── Custom Extracted Opportunities ──

export function getCustomOpportunities(): Opportunity[] {
  return load().customOpportunities || [];
}

export function addCustomOpportunity(opp: Opportunity): void {
  const state = load();
  if (!state.customOpportunities) {
    state.customOpportunities = [];
  }
  if (!state.customOpportunities.some((o) => o.id === opp.id)) {
    state.customOpportunities.unshift(opp);
    save(state);
  }
}

// ── Reset ──

export function clearAll(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Graceful failure
  }
}
