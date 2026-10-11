/**
 * ─────────────────────────────────────────────────────────────
 * TinyFish Backend Integration Module
 *
 * Server-side implementation for AI-native opportunity discovery.
 * DOCUMENTED SPECS:
 * - API Endpoint: https://agent.tinyfish.ai/v1/automation/run
 * - Alternative Fetch API: https://api.fetch.tinyfish.ai
 * - Authentication Header: X-API-Key
 * - Content-Type: application/json
 *
 * SECURITY:
 * - Reads TINYFISH_API_KEY strictly from server process.env.
 * - Never exposes API keys to client code, browser, or logs.
 * - Enforces URL protocol and private IP blocklist to prevent SSRF.
 * ─────────────────────────────────────────────────────────────
 */

import type {
  Opportunity,
  OpportunityCategory,
  OpportunityType,
  OpportunityReach,
  OpportunityDomain,
  DiscoveryResult,
} from '../src/types/index.ts';

export interface TinyFishRunParams {
  url: string;
  category: OpportunityCategory;
  mode?: 'live' | 'mock';
  customInstructions?: string;
}

/**
 * Validates URLs and blocks loopback/private/internal IP ranges (SSRF defense).
 */
export function validateTargetUrl(rawUrl: string): { valid: boolean; error?: string; cleanUrl?: string } {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only http and https protocols are supported.' };
    }

    const host = parsed.hostname.toLowerCase();
    const disallowedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (disallowedHosts.includes(host)) {
      return { valid: false, error: 'Localhost and loopback addresses cannot be crawled.' };
    }

    // Block private RFC 1918 IPv4 ranges
    if (
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return { valid: false, error: 'Private and internal network destinations are blocked.' };
    }

    return { valid: true, cleanUrl: parsed.toString() };
  } catch {
    return { valid: false, error: 'Malformed URL provided. Please provide a complete URL starting with https://' };
  }
}

/**
 * Checks TinyFish configuration status on the server.
 */
export function getTinyFishServerStatus(): {
  isConfigured: boolean;
  endpoint: string;
  authMethod: string;
  message: string;
} {
  const hasKey = Boolean(process.env.TINYFISH_API_KEY && process.env.TINYFISH_API_KEY.trim().length > 0);
  return {
    isConfigured: hasKey,
    endpoint: 'https://agent.tinyfish.ai/v1/automation/run',
    authMethod: 'X-API-Key header (Server Environment)',
    message: hasKey
      ? 'TinyFish credentials detected on server. Ready for live web discovery.'
      : 'TINYFISH_API_KEY environment variable is not set on the server. Mock provider available for development.',
  };
}

/**
 * Normalizes an extracted raw object from TinyFish into a typed Opportunity record.
 */
export function normalizeExtractedOpportunity(
  raw: any,
  fallbackCategory: OpportunityCategory,
  sourceUrl: string,
  isLive: boolean
): Opportunity {
  const id = `live-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const title = (raw?.title || 'Discovered Student Opportunity').trim();
  const organization = (raw?.organization || 'Verified Program Host').trim();
  const category = (['hackathon', 'internship', 'scholarship', 'fellowship', 'learning'].includes(raw?.category)
    ? raw.category
    : fallbackCategory) as OpportunityCategory;

  const benefits = (raw?.benefits || raw?.reward || 'Program benefits & participation certificate').trim();
  const format = (['online', 'offline', 'hybrid'].includes(raw?.format) ? raw.format : 'online') as any;
  const deadline = typeof raw?.deadline === 'string' && raw.deadline.match(/^\d{4}-\d{2}-\d{2}/)
    ? raw.deadline.substring(0, 10)
    : null;

  const opportunityType: OpportunityType = raw?.opportunityType || (
    category === 'internship'
      ? 'internships_research'
      : category === 'hackathon'
      ? 'hackathons_competitions'
      : category === 'scholarship' || category === 'fellowship'
      ? 'fellowships_scholarships'
      : 'learning_programs'
  );
  const reach: OpportunityReach = ['local_campus', 'national', 'international', 'unspecified'].includes(raw?.reach)
    ? raw.reach
    : 'national';
  const domain: OpportunityDomain = ['technology_ai', 'business', 'research', 'social_impact', 'creative_design', 'open_domain'].includes(raw?.domain)
    ? raw.domain
    : 'technology_ai';

  return {
    id,
    title,
    organization,
    category,
    opportunityType,
    reach,
    domain,
    format,
    eligibility: Array.isArray(raw?.eligibility) && raw.eligibility.length > 0 ? raw.eligibility : ['undergraduate'],
    eligibleStudyYears: Array.isArray(raw?.eligibleStudyYears) && raw.eligibleStudyYears.length > 0
      ? raw.eligibleStudyYears
      : ['1st_year', '2nd_year', '3rd_year', '4th_year', 'postgraduate'],
    eligibilitySummary: (raw?.eligibilitySummary || 'Review requirements on official host portal.').trim(),
    deadline,
    benefits,
    reward: benefits,
    location: (raw?.location || (format === 'online' ? 'Remote' : 'India')).trim(),
    description: (raw?.description || 'Opportunity extracted from official public portal. Review terms before applying.').trim(),
    eligibilityChecklist: Array.isArray(raw?.eligibilityChecklist) && raw.eligibilityChecklist.length > 0
      ? raw.eligibilityChecklist
      : [{ label: 'Verify criteria on host portal' }, { label: 'Submit before final deadline' }],
    tags: Array.isArray(raw?.tags) && raw.tags.length > 0
      ? raw.tags.map((t: string) => String(t).toLowerCase().replace(/[^a-z0-9-]/g, ''))
      : [category, 'live-discovery', 'india'],
    sourceUrl: raw?.sourceUrl || sourceUrl,
    status: isLive ? (deadline ? 'Open' : 'Open') : 'Unverified',
    origin: isLive ? 'Live' : 'Curated Demo',
    verifiedAt: isLive ? new Date().toISOString() : null,
    lastChecked: new Date().toISOString().substring(0, 10),
    isDemo: !isLive,
    isOpen: isLive,
    imageColor: '#1E5B99',
    imageUrl: raw?.imageUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  };
}

/**
 * Executes a simulated TinyFish extraction for offline/local development without API credentials.
 */
export function runMockDiscovery(params: TinyFishRunParams): DiscoveryResult {
  const urlValidation = validateTargetUrl(params.url || 'https://summerofcode.withgoogle.com');
  if (!urlValidation.valid || !urlValidation.cleanUrl) {
    return {
      success: false,
      opportunities: [],
      sourceUrl: params.url,
      isMock: true,
      origin: 'Curated Demo',
      error: urlValidation.error || 'Invalid target URL.',
      executedAt: new Date().toISOString(),
    };
  }

  const url = urlValidation.cleanUrl;
  const category = params.category || 'internship';

  const sampleMockData: Record<OpportunityCategory, any> = {
    hackathon: {
      title: 'Global Student AI Sprint 2026',
      organization: 'Open Source Community India',
      category: 'hackathon',
      format: 'online',
      eligibility: ['undergraduate', 'postgraduate'],
      deadline: '2026-11-30',
      benefits: '₹2,50,000 Prize Pool + Cloud Credits',
      location: 'Remote (Pan-India)',
      description: 'Nationwide hackathon focused on building open-source AI agents for student productivity and accessibility.',
      sourceUrl: url,
    },
    internship: {
      title: 'Summer Open Source Fellowship 2026',
      organization: 'Tech Foundation India',
      category: 'internship',
      format: 'online',
      eligibility: ['undergraduate'],
      deadline: '2026-12-15',
      benefits: 'Stipend ₹35,000/month + 1:1 Senior Engineering Mentorship',
      location: 'Remote',
      description: 'Mentored 10-week summer software engineering fellowship contributing to high-impact open source tools.',
      sourceUrl: url,
    },
    scholarship: {
      title: 'EmpowerTech Undergraduate Merit Grant',
      organization: 'India Digital Education Alliance',
      category: 'scholarship',
      format: 'online',
      eligibility: ['high_school', 'undergraduate'],
      deadline: '2026-11-20',
      benefits: '₹60,000 Annual Academic Tuition Support',
      location: 'Pan-India',
      description: 'Merit-cum-means scholarship grant for promising STEM undergraduates with demonstrated leadership aptitude.',
      sourceUrl: url,
    },
    fellowship: {
      title: 'National Emerging Tech Research Fellowship',
      organization: 'Premier Science Council',
      category: 'fellowship',
      format: 'hybrid',
      eligibility: ['postgraduate'],
      deadline: '2026-12-01',
      benefits: 'Fellowship ₹55,000/month + ₹1,00,000 research contingency grant',
      location: 'Pan-India',
      description: 'Doctoral and postgraduate research fellowship focused on high-performance computing and materials science.',
      sourceUrl: url,
    },
    learning: {
      title: 'Full-Stack Distributed Systems Bootcamp',
      organization: 'Developer Education Network',
      category: 'learning',
      format: 'online',
      eligibility: ['undergraduate', 'postgraduate', 'any'],
      deadline: null, // Rolling admission
      benefits: 'Free curriculum access + Capstone portfolio project review',
      location: 'Remote (Self-paced)',
      description: 'Open curriculum covering containerization, real-time message queues, and cloud backend microservices.',
      sourceUrl: url,
    },
  };

  const selectedSample = sampleMockData[category] || sampleMockData.internship;
  const opp = normalizeExtractedOpportunity(selectedSample, category, url, false);

  return {
    success: true,
    opportunities: [opp],
    sourceUrl: url,
    isMock: true,
    origin: 'Curated Demo',
    providerNotice:
      'SIMULATED EXTRACTION: Generated by Local Mock Provider. Real TinyFish credentials are not active.',
    rawResponseSummary: `Mock extraction completed for category "${category}" from portal "${url}". Output normalized to Opportunity schema.`,
    executedAt: new Date().toISOString(),
  };
}

/**
 * Executes a documented request to TinyFish Agent API when credentials become available.
 */
export async function runTinyFishAgentDiscovery(params: TinyFishRunParams): Promise<DiscoveryResult> {
  const urlValidation = validateTargetUrl(params.url);
  if (!urlValidation.valid || !urlValidation.cleanUrl) {
    return {
      success: false,
      opportunities: [],
      sourceUrl: params.url,
      isMock: false,
      origin: 'Live',
      error: urlValidation.error || 'Invalid target URL.',
      executedAt: new Date().toISOString(),
    };
  }

  const targetUrl = urlValidation.cleanUrl;
  const apiKey = process.env.TINYFISH_API_KEY;

  if (!apiKey || apiKey.trim().length === 0) {
    return {
      success: false,
      opportunities: [],
      sourceUrl: targetUrl,
      isMock: false,
      origin: 'Live',
      missingCredentials: true,
      error:
        'TinyFish API credentials not detected. Please configure TINYFISH_API_KEY in your server environment to run live agent crawls.',
      executedAt: new Date().toISOString(),
    };
  }
  const endpoint = 'https://agent.tinyfish.ai/v1/automation/run';

  const goal = `Navigate to ${targetUrl} and extract student opportunity announcements for category ${params.category}. Identify program title, host organization, eligibility criteria, benefits/stipend/prize, application deadline (format YYYY-MM-DD if available), format (online/offline/hybrid), and official application/info link.`;

  const outputSchema = {
    type: 'object',
    properties: {
      title: { type: 'string' },
      organization: { type: 'string' },
      category: {
        type: 'string',
        enum: ['hackathon', 'internship', 'scholarship', 'fellowship', 'learning'],
      },
      description: { type: 'string' },
      benefits: { type: 'string' },
      format: { type: 'string', enum: ['online', 'offline', 'hybrid'] },
      eligibility: { type: 'array', items: { type: 'string' } },
      deadline: { type: 'string' },
      sourceUrl: { type: 'string' },
    },
    required: ['title', 'organization', 'description'],
  };

  const payload = {
    url: targetUrl,
    goal,
    output_schema: outputSchema,
    browser_profile: 'lite',
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          opportunities: [],
          sourceUrl: targetUrl,
          isMock: false,
          origin: 'Live',
          error: `Authentication failed (HTTP ${response.status}). Verify that your TINYFISH_API_KEY is active and valid.`,
          executedAt: new Date().toISOString(),
        };
      }
      return {
        success: false,
        opportunities: [],
        sourceUrl: targetUrl,
        isMock: false,
        origin: 'Live',
        error: `TinyFish API returned HTTP ${response.status}: ${errText.slice(0, 150)}`,
        executedAt: new Date().toISOString(),
      };
    }

    const data: any = await response.json();
    const resultObj = data.result || data.data || data;
    const normalized = normalizeExtractedOpportunity(resultObj, params.category, targetUrl, true);

    return {
      success: true,
      opportunities: [normalized],
      sourceUrl: targetUrl,
      isMock: false,
      origin: 'Live',
      rawResponseSummary: `Live TinyFish extraction successful for ${normalized.title}. Status: Open.`,
      executedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      return {
        success: false,
        opportunities: [],
        sourceUrl: targetUrl,
        isMock: false,
        origin: 'Live',
        error: 'TinyFish request timed out after 35 seconds. The target website may be slow or unresponsive.',
        executedAt: new Date().toISOString(),
      };
    }

    return {
      success: false,
      opportunities: [],
      sourceUrl: targetUrl,
      isMock: false,
      origin: 'Live',
      error: `Network error connecting to TinyFish API: ${err.message || 'Check internet connection'}`,
      executedAt: new Date().toISOString(),
    };
  }
}
