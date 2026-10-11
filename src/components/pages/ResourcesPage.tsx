import { BookOpen, Trophy, GraduationCap, Code2, ArrowRight, ExternalLink } from 'lucide-react';
import type { Page } from '../Navbar';

interface ResourcesPageProps {
  onNavigate: (page: Page) => void;
}

export function ResourcesPage({ onNavigate }: ResourcesPageProps) {
  const guides = [
    {
      title: 'Smart India Hackathon (SIH) Playbook',
      category: 'Hackathons',
      icon: <Trophy size={18} className="text-[#5B3BA6]" />,
      bg: 'bg-[#F1EDF9]',
      border: 'border-[#E3DBF3]',
      summary: 'How to form a compliant 6-member college team, select government ministry problem statements, and build winning software prototypes.',
      points: [
        'Ensure SPOC college registration is completed early.',
        'At least one female teammate is mandatory for SIH team composition.',
        'Focus on working MVP over slides during preliminary rounds.',
      ],
      link: 'https://www.sih.gov.in',
    },
    {
      title: 'National Scholarship Portal (NSP) Guide',
      category: 'Scholarships',
      icon: <GraduationCap size={18} className="text-[#1D6E42]" />,
      bg: 'bg-[#EBF5F0]',
      border: 'border-[#D2E8DC]',
      summary: 'Essential documentation checklist for Central Sector Scheme, AICTE Swanath, and state merit scholarships.',
      points: [
        'Aadhaar-linked active bank account with NPCI mapper enabled.',
        'Income certificate valid for the current financial year (< ₹8 Lakh).',
        'Bonafide student certificate signed by institution head.',
      ],
      link: 'https://scholarships.gov.in',
    },
    {
      title: 'Google Summer of Code & Open Source Prep',
      category: 'Internships',
      icon: <Code2 size={18} className="text-[#1E5B99]" />,
      bg: 'bg-[#EBF3FA]',
      border: 'border-[#D5E4F2]',
      summary: 'Step-by-step roadmap for Indian undergraduate developers to make first pull requests and write accepted GSoC proposals.',
      points: [
        'Contribute to good-first-issues in selected mentoring orgs before applications open.',
        'Engage actively on mailing lists, Discord, or Slack channels.',
        'Draft project timeline with deliverable milestones and contingency buffers.',
      ],
      link: 'https://summerofcode.withgoogle.com',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#EAE6DF] pb-4">
        <h1 className="font-serif font-bold text-3xl text-[#10294F] mb-1">
          Student Resources & Playbooks
        </h1>
        <p className="text-sm text-[#5E6E82]">
          Curated guides, checklists, and documentation standards for Indian student opportunities.
        </p>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {guides.map((g, idx) => (
          <div
            key={idx}
            className={`rounded-2xl border p-6 ${g.bg} ${g.border} shadow-xs flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-2xs">
                  {g.icon}
                </div>
                <span className="text-[11px] font-semibold text-[#10294F] px-2 py-0.5 rounded-full bg-white/70">
                  {g.category}
                </span>
              </div>

              <h3 className="font-serif font-bold text-lg text-[#10294F] leading-snug mb-2">
                {g.title}
              </h3>
              <p className="text-xs text-[#5E6E82] leading-relaxed mb-4">
                {g.summary}
              </p>

              <div className="space-y-2 mb-6">
                <p className="text-[11px] font-semibold text-[#10294F]">Key requirements:</p>
                <ul className="space-y-1.5">
                  {g.points.map((pt, pidx) => (
                    <li key={pidx} className="text-xs text-[#5E6E82] flex items-start gap-1.5">
                      <span className="text-[#10294F]">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-black/5 flex items-center justify-between">
              <a
                href={g.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#10294F] hover:underline flex items-center gap-1"
              >
                <span>Official Portal</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Preferences Callout */}
      <div className="rounded-2xl border border-[#EAE6DF] bg-white p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F8F6F0] flex items-center justify-center text-[#10294F] flex-shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#10294F]">
              Personalize your opportunity recommendations
            </h3>
            <p className="text-xs text-[#5E6E82] mt-0.5">
              Set your college degree, technical interests, and skill tags to match with opportunities on Upnext.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('preferences')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#10294F] text-white text-xs font-semibold rounded-xl hover:bg-[#173766] transition-colors flex-shrink-0 shadow-xs cursor-pointer"
        >
          <span>Edit Preferences</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
