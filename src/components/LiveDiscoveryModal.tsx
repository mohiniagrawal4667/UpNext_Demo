import { useState, useEffect } from 'react';
import {
  X,
  Globe,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type { Opportunity, OpportunityCategory, DiscoveryResult } from '../types';
import { discoveryService, SUPPORTED_TARGET_PORTALS } from '../services/discoveryService';
import { CategoryHeaderBadge, OriginBadge, StatusBadge } from './ui/Badge';
import { getOpportunityStatus, deadlineLabel } from '../services/opportunityService';

interface LiveDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpportunityDiscovered: (opp: Opportunity) => void;
}

export function LiveDiscoveryModal({
  isOpen,
  onClose,
  onOpportunityDiscovered,
}: LiveDiscoveryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<OpportunityCategory>('internship');
  const [targetUrl, setTargetUrl] = useState('https://summerofcode.withgoogle.com');
  const [providerMode, setProviderMode] = useState<'live' | 'mock'>('mock');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [serverStatus, setServerStatus] = useState<{ isConfigured: boolean; message: string }>({
    isConfigured: false,
    message: 'Checking TinyFish credentials...',
  });

  // Check server configuration status on open
  useEffect(() => {
    if (isOpen) {
      discoveryService.checkServerStatus().then(setServerStatus);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePortalSelect = (portal: (typeof SUPPORTED_TARGET_PORTALS)[0]) => {
    setSelectedCategory(portal.category);
    setTargetUrl(portal.url);
  };

  const handleRunDiscovery = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await discoveryService.discover({
        category: selectedCategory,
        targetUrl,
        providerMode,
      });

      if (!res.success) {
        setError(res.error || 'Discovery task failed to extract opportunity.');
      } else {
        setResult(res);
      }
    } catch (err: any) {
      setError(`Unexpected discovery error: ${err.message || 'Check connection'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToRadar = (opp: Opportunity) => {
    onOpportunityDiscovered(opp);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Live Web Opportunity Discovery"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-[#EAE6DF] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#EAE6DF] bg-[#F8F6F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#10294F] text-white flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-[#10294F]">
                Upnext Live Discovery
              </h2>
              <p className="text-xs text-[#5E6E82]">
                Targeted student opportunity extraction powered by TinyFish AI web infrastructure
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#5E6E82] hover:text-[#10294F] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Close discovery modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Server Credentials Status Banner */}
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              serverStatus.isConfigured
                ? 'bg-[#EBF5F0] border-[#D2E8DC] text-[#1D6E42]'
                : 'bg-[#FDF3E7] border-[#F6E1C8] text-[#9A5B18]'
            }`}
          >
            {serverStatus.isConfigured ? (
              <CheckCircle2 size={16} className="text-[#1D6E42] flex-shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert size={16} className="text-[#A85A12] flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-[#10294F]">
                {serverStatus.isConfigured
                  ? 'TinyFish Server Credentials Active'
                  : 'TinyFish API Credentials Not Yet Configured'}
              </p>
              <p className="text-[#5E6E82] mt-0.5 leading-relaxed">
                {serverStatus.isConfigured
                  ? 'The server is connected to TinyFish agent infrastructure. Live agent crawling is operational.'
                  : 'You do not have TinyFish API credentials yet. Use the local Mock Provider below to test and demonstrate the full discovery, normalization, and saving workflow safely.'}
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#10294F] mb-2">
              Execution Provider Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setProviderMode('mock')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  providerMode === 'mock'
                    ? 'border-[#10294F] bg-[#F8F6F0] ring-1 ring-[#10294F]'
                    : 'border-[#EAE6DF] hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-[#10294F]">Mock Discovery Provider</span>
                  <span className="text-[10px] bg-[#EBF3FA] text-[#1E5B99] px-1.5 py-0.5 rounded font-medium">Ready</span>
                </div>
                <p className="text-[11px] text-[#5E6E82]">
                  Simulates TinyFish agent extraction locally without API credentials.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setProviderMode('live')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  providerMode === 'live'
                    ? 'border-[#10294F] bg-[#F8F6F0] ring-1 ring-[#10294F]'
                    : 'border-[#EAE6DF] hover:border-gray-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-[#10294F]">Live TinyFish Agent</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      serverStatus.isConfigured
                        ? 'bg-[#EBF5F0] text-[#1D6E42]'
                        : 'bg-[#FDF2F0] text-[#B93825]'
                    }`}
                  >
                    {serverStatus.isConfigured ? 'Connected' : 'Requires Key'}
                  </span>
                </div>
                <p className="text-[11px] text-[#5E6E82]">
                  Dispatches documented automation task to TinyFish agent endpoint.
                </p>
              </button>
            </div>
          </div>

          {/* Preset Portals */}
          <div>
            <label className="block text-xs font-semibold text-[#10294F] mb-1.5">
              Select Verified Public Portal
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SUPPORTED_TARGET_PORTALS.map((portal) => (
                <button
                  key={portal.url}
                  type="button"
                  onClick={() => handlePortalSelect(portal)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    targetUrl === portal.url
                      ? 'bg-[#10294F] text-white border-[#10294F]'
                      : 'bg-white text-[#5E6E82] border-[#EAE6DF] hover:border-[#10294F] hover:text-[#10294F]'
                  }`}
                >
                  {portal.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target URL Input */}
          <div>
            <label className="block text-xs font-semibold text-[#10294F] mb-1">
              Target Portal URL (Public webpage)
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://summerofcode.withgoogle.com"
              className="w-full px-3.5 py-2.5 text-xs border border-[#EAE6DF] rounded-xl bg-white text-[#10294F] focus:outline-none focus:border-[#10294F]"
            />
            <p className="text-[11px] text-[#8E9BAE] mt-1">
              Only public http/https domains are crawled. Private and internal IP ranges are strictly blocked.
            </p>
          </div>

          {/* Run Button */}
          <div>
            <button
              onClick={handleRunDiscovery}
              disabled={loading || !targetUrl.trim()}
              className="w-full py-3 bg-[#10294F] hover:bg-[#173766] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>
                    {providerMode === 'live'
                      ? 'Contacting TinyFish Agent & Crawling Portal...'
                      : 'Simulating TinyFish Extraction & Normalizing Schema...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>
                    Run {providerMode === 'live' ? 'Live TinyFish Discovery' : 'Mock Discovery Extraction'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-[#FDF2F0] border border-[#FBD6D0] text-xs text-[#B93825] flex items-start gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#10294F]">Discovery Extraction Notice</p>
                <p className="mt-0.5 leading-relaxed">{error}</p>
                {providerMode === 'live' && !serverStatus.isConfigured && (
                  <button
                    onClick={() => {
                      setProviderMode('mock');
                      setTimeout(handleRunDiscovery, 100);
                    }}
                    className="mt-2 inline-flex items-center gap-1 font-semibold underline text-[#10294F] hover:text-black cursor-pointer"
                  >
                    <span>Switch to Mock Provider and test immediately</span>
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Extracted Result Preview */}
          {result && result.opportunities.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-[#EAE6DF]">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-[#10294F]">
                  Discovered Opportunity Result
                </h3>
                <span className="text-[11px] text-[#5E6E82]">
                  {result.isMock ? 'Simulated Mock Output' : 'Live Verified Extraction'}
                </span>
              </div>

              {result.opportunities.map((opp) => {
                const oppStatus = getOpportunityStatus(opp);
                return (
                  <div
                    key={opp.id}
                    className="p-4 rounded-xl border border-[#EAE6DF] bg-[#F8F6F0]/70 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryHeaderBadge category={opp.category} />
                        <OriginBadge origin={opp.origin} />
                        <StatusBadge status={oppStatus} />
                      </div>
                      <a
                        href={opp.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#5E6E82] hover:text-[#10294F] flex items-center gap-1"
                      >
                        <span>Official Link</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div>
                      <h4 className="font-serif font-bold text-base text-[#10294F]">
                        {opp.title}
                      </h4>
                      <p className="text-xs text-[#5E6E82] font-medium">{opp.organization}</p>
                    </div>

                    <p className="text-xs text-[#5E6E82] leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-[#5E6E82] pt-1 border-t border-black/5">
                      <div>
                        <span className="text-[11px] text-[#8E9BAE]">Benefits:</span>
                        <p className="font-semibold text-[#10294F]">{opp.benefits}</p>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#8E9BAE]">Deadline:</span>
                        <p className="font-semibold text-[#10294F]">{deadlineLabel(opp.deadline)}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleSaveToRadar(opp)}
                        className="px-4 py-2 bg-[#10294F] text-white rounded-lg text-xs font-semibold hover:bg-[#173766] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 size={13} />
                        <span>Add to Upnext & Action Plan</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
