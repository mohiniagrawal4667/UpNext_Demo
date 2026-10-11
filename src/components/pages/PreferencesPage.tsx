import { useState } from 'react';
import { Save, User, Check, Sparkles, MapPin, Code2, Info } from 'lucide-react';
import type {
  StudentProfile,
  StudyYear,
  OpportunityDomain,
  LocationPreference,
} from '../../types';
import {
  DOMAIN_LABELS,
  LOCATION_PREF_LABELS,
} from '../../services/opportunityService';

interface PreferencesPageProps {
  preferences: StudentProfile;
  onSave: (profile: StudentProfile) => void;
}

const STUDY_YEAR_OPTIONS: { value: StudyYear; label: string; description: string }[] = [
  { value: '1st_year', label: '1st Year', description: 'Freshman / First year undergraduate' },
  { value: '2nd_year', label: '2nd Year', description: 'Sophomore / Second year undergraduate' },
  { value: '3rd_year', label: '3rd Year', description: 'Pre-final year undergraduate' },
  { value: '4th_year', label: '4th / Final Year', description: 'Graduating undergraduate cohort' },
  { value: 'postgraduate', label: 'Postgraduate', description: 'M.Tech, M.Sc, MBA, MS students' },
  { value: 'phd', label: 'PhD / Doctoral', description: 'Doctoral research scholars' },
];

const DOMAIN_OPTIONS: OpportunityDomain[] = [
  'technology_ai',
  'business',
  'research',
  'social_impact',
  'creative_design',
  'open_domain',
];

const LOCATION_OPTIONS: LocationPreference[] = [
  'remote_online',
  'pan_india',
  'campus_local',
  'international',
  'any',
];

const SKILL_SUGGESTIONS = [
  'Python',
  'Web Development',
  'Machine Learning',
  'Data Science',
  'React',
  'UI/UX Design',
  'Cloud / AWS',
  'Academic Research',
  'Competitive Programming',
  'Product Management',
  'Public Speaking',
  'Financial Analysis',
];

export function PreferencesPage({ preferences, onSave }: PreferencesPageProps) {
  const [draft, setDraft] = useState<StudentProfile>({
    studyYear: preferences.studyYear || '2nd_year',
    domains: preferences.domains || ['technology_ai', 'open_domain'],
    skills: preferences.skills || ['Python', 'Web Development'],
    locationPreference: preferences.locationPreference || 'pan_india',
  });
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const setStudyYear = (year: StudyYear) =>
    setDraft((d) => ({ ...d, studyYear: year }));

  const toggleDomain = (domain: OpportunityDomain) =>
    setDraft((d) => ({
      ...d,
      domains: d.domains.includes(domain)
        ? d.domains.filter((x) => x !== domain)
        : [...d.domains, domain],
    }));

  const setLocation = (loc: LocationPreference) =>
    setDraft((d) => ({ ...d, locationPreference: loc }));

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (!s || draft.skills.includes(s)) return;
    setDraft((d) => ({ ...d, skills: [...d.skills, s] }));
    setSkillInput('');
  };

  const removeSkill = (skill: string) =>
    setDraft((d) => ({ ...d, skills: d.skills.filter((s) => s !== skill) }));

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#EAE6DF] pb-4">
        <h1 className="font-serif font-bold text-3xl text-[#10294F] mb-1">
          Student Profile & Matching Fit
        </h1>
        <p className="text-sm text-[#5E6E82]">
          Tailor how UPNEXT evaluates your eligibility and surfaces ambitious opportunities.
        </p>
      </div>

      {/* Plain Language Matching Notice */}
      <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#EAE6DF] flex items-start gap-3 text-xs text-[#5E6E82]">
        <Info size={16} className="text-[#10294F] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-[#10294F] mb-0.5">
            Transparent Matching — No Fabricated AI Scores
          </p>
          <p className="leading-relaxed">
            UPNEXT compares your study year, domains, and location preference against verified host criteria. We never generate artificial acceptance probabilities, black-box scores, or prestige tiers. When host criteria are not published, records are honestly flagged as <em>Needs Verification</em>.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 1. Study Year */}
        <section className="bg-white rounded-2xl border border-[#EAE6DF] p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <User size={18} className="text-[#10294F]" />
            <h2 className="font-serif font-bold text-lg text-[#10294F]">Study Year</h2>
          </div>
          <p className="text-xs text-[#5E6E82] mb-4">
            Used to determine whether you meet program cohort criteria.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {STUDY_YEAR_OPTIONS.map((opt) => {
              const selected = draft.studyYear === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setStudyYear(opt.value)}
                  aria-pressed={selected}
                  className={`
                    p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between
                    ${selected
                      ? 'border-[#10294F] bg-[#EBF5F0] ring-1 ring-[#10294F]'
                      : 'border-[#EAE6DF] bg-white hover:border-[#10294F] hover:bg-[#F8F6F0]'
                    }
                  `}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <p className="font-semibold text-xs text-[#10294F]">{opt.label}</p>
                    {selected && <Check size={14} className="text-[#1D6E42]" />}
                  </div>
                  <p className="text-[11px] text-[#5E6E82]">{opt.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 2. Domains of Interest */}
        <section className="bg-white rounded-2xl border border-[#EAE6DF] p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-[#10294F]" />
            <h2 className="font-serif font-bold text-lg text-[#10294F]">Domains of Interest</h2>
          </div>
          <p className="text-xs text-[#5E6E82] mb-4">
            Select the domains you want prioritized in your recommendations.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {DOMAIN_OPTIONS.map((domain) => {
              const active = draft.domains.includes(domain);
              return (
                <button
                  key={domain}
                  onClick={() => toggleDomain(domain)}
                  aria-pressed={active}
                  className={`
                    px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border
                    ${active
                      ? 'bg-[#10294F] text-white border-[#10294F] shadow-xs'
                      : 'bg-white text-[#5E6E82] border-[#EAE6DF] hover:border-[#10294F] hover:bg-[#F8F6F0]'
                    }
                  `}
                >
                  {DOMAIN_LABELS[domain]}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Location Preference */}
        <section className="bg-white rounded-2xl border border-[#EAE6DF] p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-[#10294F]" />
            <h2 className="font-serif font-bold text-lg text-[#10294F]">Location Preference</h2>
          </div>
          <p className="text-xs text-[#5E6E82] mb-4">
            Specify whether you prefer remote programs or regional Indian travel.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {LOCATION_OPTIONS.map((loc) => {
              const active = draft.locationPreference === loc;
              return (
                <button
                  key={loc}
                  onClick={() => setLocation(loc)}
                  aria-pressed={active}
                  className={`
                    px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border text-center
                    ${active
                      ? 'bg-[#10294F] text-white border-[#10294F] shadow-xs'
                      : 'bg-white text-[#5E6E82] border-[#EAE6DF] hover:border-[#10294F] hover:bg-[#F8F6F0]'
                    }
                  `}
                >
                  {LOCATION_PREF_LABELS[loc]}
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Skills & Topics */}
        <section className="bg-white rounded-2xl border border-[#EAE6DF] p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <Code2 size={18} className="text-[#10294F]" />
            <h2 className="font-serif font-bold text-lg text-[#10294F]">Skills & Focus Areas</h2>
          </div>
          <p className="text-xs text-[#5E6E82] mb-4">
            Add relevant technical or academic skills to match with opportunity tags.
          </p>

          {/* Active skills chips */}
          <div className="flex flex-wrap gap-2 mb-4 min-h-[32px]">
            {draft.skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EBF3FA] text-[#1E5B99] rounded-lg text-xs font-medium border border-[#D5E4F2]"
              >
                <span>{s}</span>
                <button
                  onClick={() => removeSkill(s)}
                  className="hover:text-[#B93825] cursor-pointer ml-0.5 text-sm leading-none"
                  aria-label={`Remove ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          {/* Input field */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill(skillInput);
                }
              }}
              placeholder="Add skill (e.g., Docker, Public Speaking, Rust)..."
              className="flex-1 text-xs px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-xl text-[#10294F] placeholder-[#8E9BAE] focus:outline-none focus:border-[#10294F]"
            />
            <button
              onClick={() => addSkill(skillInput)}
              className="px-4 py-2.5 bg-[#10294F] text-white text-xs font-semibold rounded-xl hover:bg-[#173766] transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Suggested skills */}
          <div>
            <p className="text-[11px] text-[#8E9BAE] font-medium mb-2 uppercase tracking-wider">
              Quick Suggestions:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter((s) => !draft.skills.includes(s)).map((s) => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="text-[11px] px-2.5 py-1 bg-[#F8F6F0] hover:bg-[#EAE6DF] text-[#5E6E82] rounded-md transition-colors cursor-pointer border border-[#EAE6DF]"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <div>
            {saved && (
              <span className="text-xs font-semibold text-[#1D6E42] flex items-center gap-1.5 animate-in fade-in">
                <Check size={14} /> Profile saved successfully
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#10294F] text-white text-xs font-semibold rounded-xl hover:bg-[#173766] transition-colors shadow-xs cursor-pointer"
          >
            <Save size={15} />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
