import { useState, useCallback } from 'react';
import { Navbar, type Page } from './components/Navbar';
import { Dashboard } from './components/pages/Dashboard';
import { SavedPage } from './components/pages/SavedPage';
import { Tracker } from './components/pages/Tracker';
import { PreferencesPage } from './components/pages/PreferencesPage';
import { ResourcesPage } from './components/pages/ResourcesPage';
import { OpportunityDetail } from './components/OpportunityDetail';
import { LiveDiscoveryModal } from './components/LiveDiscoveryModal';
import {
  useOpportunities,
  usePursuitPlan,
  useFilter,
  useStudentProfile,
} from './hooks';
import { addCustomOpportunity } from './services/storage';
import type { Opportunity } from './types';

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [discoveryModalOpen, setDiscoveryModalOpen] = useState(false);

  const { filter, updateFilter, resetFilter } = useFilter();
  const { profile, updateProfile } = useStudentProfile();
  const { all, filtered, loading, error } = useOpportunities(filter, profile);
  const {
    items: pursuitItems,
    savedIds,
    toggle: handleToggleSave,
    refresh: refreshPursuit,
  } = usePursuitPlan();

  // Build applicationStatuses map for rendering
  const applicationStatuses: Record<string, string | null> = {};
  pursuitItems.forEach((s) => {
    applicationStatuses[s.opportunityId] = s.status;
  });

  const handleOpportunityDiscovered = useCallback((opp: Opportunity) => {
    addCustomOpportunity(opp);
    refreshPursuit();
    setSelectedId(opp.id);
  }, [refreshPursuit]);

  const selectedOpportunity = selectedId
    ? all.find((o) => o.id === selectedId) ?? null
    : null;

  const navigate = useCallback((p: Page) => {
    setPage(p);
    setSelectedId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-[#10294F] flex flex-col font-sans selection:bg-[#EBF3FA] selection:text-[#10294F]">
      {/* Slim Light Navbar matching reference */}
      <Navbar
        currentPage={page}
        onNavigate={navigate}
        savedCount={savedIds.size}
        onOpenDiscovery={() => setDiscoveryModalOpen(true)}
      />

      <main id="main-content" className="flex-1">
        {page === 'dashboard' && (
          <Dashboard
            allOpportunities={all}
            filteredOpportunities={filtered}
            loading={loading}
            error={error}
            filter={filter}
            onUpdateFilter={updateFilter}
            onResetFilter={resetFilter}
            savedOpportunities={pursuitItems}
            savedIds={savedIds}
            applicationStatuses={applicationStatuses}
            onToggleSave={handleToggleSave}
            onOpenOpportunity={setSelectedId}
            onOpenDiscovery={() => setDiscoveryModalOpen(true)}
            onNavigate={navigate}
          />
        )}

        {page === 'tracker' && (
          <Tracker
            allOpportunities={all}
            savedOpportunities={pursuitItems}
            onOpenOpportunity={setSelectedId}
            onNavigate={() => navigate('dashboard')}
            onStatusChange={refreshPursuit}
          />
        )}

        {page === 'resources' && (
          <ResourcesPage onNavigate={navigate} />
        )}

        {page === 'preferences' && (
          <PreferencesPage
            preferences={profile}
            onSave={updateProfile}
          />
        )}

        {page === 'saved' && (
          <SavedPage
            allOpportunities={all}
            savedOpportunities={pursuitItems}
            applicationStatuses={applicationStatuses}
            onToggleSave={handleToggleSave}
            onOpenOpportunity={setSelectedId}
            onNavigate={navigate}
          />
        )}
      </main>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <OpportunityDetail
          opportunity={selectedOpportunity}
          saved={savedIds.has(selectedOpportunity.id)}
          onToggleSave={() => handleToggleSave(selectedOpportunity.id)}
          onClose={() => {
            setSelectedId(null);
            refreshPursuit();
          }}
        />
      )}

      {/* Live Discovery Modal (TinyFish Architecture & Mock Provider) */}
      <LiveDiscoveryModal
        isOpen={discoveryModalOpen}
        onClose={() => setDiscoveryModalOpen(false)}
        onOpportunityDiscovered={handleOpportunityDiscovered}
      />
    </div>
  );
}
