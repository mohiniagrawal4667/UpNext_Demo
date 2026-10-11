import type { DiscoveryRequest, DiscoveryResult, OpportunityCategory, Opportunity } from '../types';

export interface OpportunityDiscoveryService {
  discover(request: DiscoveryRequest): Promise<DiscoveryResult>;
  checkServerStatus(): Promise<{ isConfigured: boolean; message: string; endpoint?: string }>;
}

export const SUPPORTED_TARGET_PORTALS: { label: string; url: string; category: OpportunityCategory; org: string }[] = [
  {
    label: 'Google Summer of Code Portal',
    url: 'https://summerofcode.withgoogle.com',
    category: 'internship',
    org: 'Google Open Source',
  },
  {
    label: 'Smart India Hackathon Official Portal',
    url: 'https://www.sih.gov.in',
    category: 'hackathon',
    org: 'Ministry of Education, Govt. of India',
  },
  {
    label: 'National Scholarship Portal (NSP)',
    url: 'https://scholarships.gov.in',
    category: 'scholarship',
    org: 'Ministry of Electronics & IT',
  },
  {
    label: 'AWS Academy Student Program',
    url: 'https://aws.amazon.com/training/awsacademy',
    category: 'learning',
    org: 'Amazon Web Services',
  },
  {
    label: 'AICTE Institutional Scholarships',
    url: 'https://www.aicte-india.org/bureaus/scholarship',
    category: 'scholarship',
    org: 'AICTE India',
  },
];

class DiscoveryServiceImpl implements OpportunityDiscoveryService {
  async checkServerStatus(): Promise<{ isConfigured: boolean; message: string; endpoint?: string }> {
    try {
      const response = await fetch('/api/tinyfish-status');
      if (!response.ok) {
        return {
          isConfigured: false,
          message: 'Server status check responded with error. Mock provider available.',
        };
      }
      return await response.json();
    } catch {
      return {
        isConfigured: false,
        message: 'Local server status endpoint offline. Mock provider active for offline testing.',
      };
    }
  }

  async discover(request: DiscoveryRequest): Promise<DiscoveryResult> {
    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        return {
          success: false,
          opportunities: [],
          sourceUrl: request.targetUrl || '',
          isMock: false,
          origin: 'Live',
          error: `Discovery service returned error HTTP ${response.status}: ${errorText.slice(0, 150)}`,
          executedAt: new Date().toISOString(),
        };
      }

      const result: DiscoveryResult = await response.json();
      return result;
    } catch (err: any) {
      // Fallback for static browser preview without backend server
      if (request.providerMode === 'mock') {
        return this.clientMockDiscovery(request);
      }

      return {
        success: false,
        opportunities: [],
        sourceUrl: request.targetUrl || '',
        isMock: false,
        origin: 'Live',
        error: `Could not connect to discovery backend (${err.message || 'Network failure'}). You can test with Mock Provider mode.`,
        executedAt: new Date().toISOString(),
      };
    }
  }

  private clientMockDiscovery(request: DiscoveryRequest): DiscoveryResult {
    const url = request.targetUrl || 'https://summerofcode.withgoogle.com';
    const cat = request.category;

    const sampleMock: Opportunity = {
      id: `mock-${Date.now()}`,
      title: `Client-Simulated ${cat.toUpperCase()} Opportunity 2026`,
      organization: 'Verified Public Host',
      category: cat,
      opportunityType:
        cat === 'internship'
          ? 'internships_research'
          : cat === 'hackathon'
          ? 'hackathons_competitions'
          : cat === 'scholarship' || cat === 'fellowship'
          ? 'fellowships_scholarships'
          : 'learning_programs',
      reach: 'national',
      domain: 'technology_ai',
      format: 'online',
      eligibility: ['undergraduate', 'postgraduate'],
      eligibleStudyYears: ['1st_year', '2nd_year', '3rd_year', '4th_year', 'postgraduate'],
      eligibilitySummary: 'Enrolled undergraduate or postgraduate student in an accredited Indian institution',
      deadline: '2026-12-31',
      benefits: 'Financial grant & verified digital certificate',
      reward: 'Financial grant & verified digital certificate',
      location: 'Remote',
      description: `Targeted discovery extraction simulated for category ${cat} from portal ${url}. Verified schema output.`,
      eligibilityChecklist: [
        { label: 'Enrolled in an accredited institution' },
        { label: 'Submit before final deadline' },
      ],
      tags: [cat, 'discovery-test', 'india'],
      sourceUrl: url,
      status: 'Unverified',
      origin: 'Curated Demo',
      verifiedAt: null,
      lastChecked: new Date().toISOString().substring(0, 10),
      isDemo: true,
      isOpen: false,
      imageColor: '#1E5B99',
      imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    };

    return {
      success: true,
      opportunities: [sampleMock],
      sourceUrl: url,
      isMock: true,
      origin: 'Curated Demo',
      providerNotice: 'Generated by Client Mock Provider for offline local demonstration.',
      rawResponseSummary: `Simulated offline extraction completed for ${url}.`,
      executedAt: new Date().toISOString(),
    };
  }
}

export const discoveryService: OpportunityDiscoveryService = new DiscoveryServiceImpl();
