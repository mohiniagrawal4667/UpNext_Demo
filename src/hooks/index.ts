import { useState, useEffect, useCallback } from 'react';
import type {
  Opportunity,
  FilterState,
  StudentProfile,
  UserPreferences,
  PursuitItem,
  PursuitStatus,
} from '../types';
import { opportunityService, applyFilters } from '../services/opportunityService';
import {
  getPursuitPlan,
  savePursuitItem,
  unsavePursuitItem,
  isOpportunitySaved,
  setPursuitStatus,
  getPursuitStatus,
  updatePursuitNextAction,
  getStudentProfile,
  saveStudentProfile,
} from '../services/storage';
import { defaultFilter } from '../types';

// ─────────────────────────────────────────────
// useOpportunities — main data hook
// ─────────────────────────────────────────────

export function useOpportunities(filter: FilterState, profileOverride?: StudentProfile) {
  const [all, setAll] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useStudentProfile();

  const activeProfile = profileOverride || profile;

  useEffect(() => {
    setLoading(true);
    opportunityService
      .fetchOpportunities()
      .then(setAll)
      .catch(() => setError('Failed to load opportunities. Please refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = applyFilters(all, filter, activeProfile);

  return { all, filtered, loading, error };
}

// ─────────────────────────────────────────────
// usePursuitPlan — My Pursuit Plan hook
// ─────────────────────────────────────────────

export function usePursuitPlan() {
  const [items, setItems] = useState<PursuitItem[]>(getPursuitPlan);
  const [savedIds, setSavedIds] = useState<Set<string>>(
    () => new Set(getPursuitPlan().map((s) => s.opportunityId))
  );

  const refresh = useCallback(() => {
    const list = getPursuitPlan();
    setItems(list);
    setSavedIds(new Set(list.map((s) => s.opportunityId)));
  }, []);

  const toggle = useCallback((id: string) => {
    if (isOpportunitySaved(id)) {
      unsavePursuitItem(id);
    } else {
      savePursuitItem(id);
    }
    const updated = getPursuitPlan();
    setItems(updated);
    setSavedIds(new Set(updated.map((s) => s.opportunityId)));
  }, []);

  const setStatus = useCallback((id: string, status: PursuitStatus | null) => {
    setPursuitStatus(id, status);
    const updated = getPursuitPlan();
    setItems(updated);
    setSavedIds(new Set(updated.map((s) => s.opportunityId)));
  }, []);

  const updateNextAction = useCallback(
    (id: string, nextAction: string, nextActionDate: string | null) => {
      updatePursuitNextAction(id, nextAction, nextActionDate);
      const updated = getPursuitPlan();
      setItems(updated);
    },
    []
  );

  return {
    items,
    savedIds,
    toggle,
    setStatus,
    updateNextAction,
    refresh,
  };
}

// Backwards compatibility alias
export function useBookmarks() {
  const { savedIds, toggle } = usePursuitPlan();
  return { savedIds, toggle };
}

// Backwards compatibility alias
export function useApplicationStatus(opportunityId: string) {
  const [status, setStatusState] = useState<PursuitStatus | null>(() =>
    getPursuitStatus(opportunityId)
  );

  const setStatus = useCallback(
    (s: PursuitStatus | null) => {
      setPursuitStatus(opportunityId, s);
      setStatusState(s);
    },
    [opportunityId]
  );

  return { status, setStatus };
}

// ─────────────────────────────────────────────
// useStudentProfile & usePreferences
// ─────────────────────────────────────────────

export function useStudentProfile() {
  const [profile, setProfileState] = useState<StudentProfile>(getStudentProfile);

  const updateProfile = useCallback((newProfile: StudentProfile) => {
    saveStudentProfile(newProfile);
    setProfileState(newProfile);
  }, []);

  return { profile, updateProfile };
}

// Backwards compatibility alias
export function usePreferences() {
  const { profile, updateProfile } = useStudentProfile();
  return {
    preferences: profile as UserPreferences,
    updatePreferences: updateProfile,
  };
}

// ─────────────────────────────────────────────
// useFilter
// ─────────────────────────────────────────────

export function useFilter() {
  const [filter, setFilter] = useState<FilterState>(defaultFilter);

  const updateFilter = useCallback((partial: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilter = useCallback(() => setFilter(defaultFilter), []);

  return { filter, updateFilter, resetFilter };
}
