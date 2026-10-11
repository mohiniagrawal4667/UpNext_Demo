# UPNEXT 🧭

> **Discover your next big opportunity. Make your move.**

A focused student opportunity discovery and action-planning platform designed for Indian college students. UPNEXT brings ambitious hackathons, fellowships, scholarships, student leadership roles, research internships, and learning programs into a single, truthful, actionable system.

Built with **React 19 + TypeScript + Vite 8 + Tailwind CSS v4**.

---

## 🎨 Editorial & Human-Centric Design System

UPNEXT preserves an editorial reading experience tailored for student focus:
- **Warm Ivory Canvas:** `#F8F6F0` background providing gentle warmth, high contrast, and zero screen glare.
- **Deep Navy Typography:** `#10294F` primary text with elegant Playfair Display serif editorial headings and crisp DM Sans body copy.
- **Restrained Pastel Opportunity Accents:**
  - 💼 **Internships & Research:** Pale Lavender / Sky (`#F5F9FD`)
  - ⚡ **Hackathons & Competitions:** Soft Purple (`#F9F7FD`)
  - 🎓 **Fellowships & Scholarships:** Soft Mint (`#F5FAF7`)
  - 👑 **Student Leadership / Ambassador:** Pale Amber (`#FFFBF5`)
  - 🎙️ **Events & Talks:** Warm Peach (`#FDF9F4`)
  - 📚 **Learning Programs:** Crisp Pale Slate (`#F7F7FB`)
- **Desktop Grid:** Exactly 3 cards per row on desktop with consistent card heights, thumbnail headers, and meta badges.
- **Zero Dead Ends:** Every visible button, navigation item, and modal has a working action, with responsive mobile navigation and functional drawers.

---

## 🧭 Taxonomy & Discovery Filters

UPNEXT categorizes every opportunity across 5 distinct, verifiable dimensions:

### 1. Opportunity Type
- **Hackathons & Competitions** (`hackathons_competitions`)
- **Fellowships & Scholarships** (`fellowships_scholarships`)
- **Student Leadership & Ambassador Programs** (`student_leadership`)
- **Internships & Research** (`internships_research`)
- **Events & Talks** (`events_talks`)
- **Learning Programs** (`learning_programs`)

### 2. Opportunity Reach
- **Local / Campus** (`local_campus`): Intra-college or city-level programs.
- **National** (`national`): Open pan-India across states and universities.
- **International** (`international`): Global programs accepting Indian applicants.
- **Unspecified** (`unspecified`): Reach not explicitly stated on public portal.

### 3. Opportunity Domain
- **Technology & AI** (`technology_ai`)
- **Business & Entrepreneurship** (`business`)
- **Research & Academia** (`research`)
- **Social Impact & Development** (`social_impact`)
- **Creative & Design** (`creative_design`)
- **Open Domain / Multi-Disciplinary** (`open_domain`)

### 4. Deadline Windows
- **Within 7 Days**: Critical urgency items closing in ≤ 7 days.
- **Within 30 Days**: Closing within the next month.
- **No Deadline Listed**: Rolling or TBA programs with no fixed closing date.
- **Any Deadline**: Shows all opportunities including ongoing and closed programs.

### 5. Profile-Compared Eligibility
- **Confirmed Eligible**: Student's current study year and criteria match the opportunity requirements.
- **Needs Verification**: Requirements are unspecified or host portal requires individual institutional verification.
- **Not Eligible**: Opportunity is restricted to a different study year or level.

All filters operate simultaneously using boolean conjunction (`AND`), with a quick **Clear All Filters** action and informative empty states when no programs match.

---

## 🎯 Student Profile & Plain-Language Fit Evaluation

UPNEXT replaces opaque "AI prestige scores" and fabricated acceptance percentages with transparent, rule-based reasoning:

- **Configurable Student Profile:**
  - **Study Year:** 1st Year, 2nd Year, 3rd Year, 4th / Final Year, Postgraduate (M.Tech/M.Sc/MBA/MS), PhD / Doctoral scholar.
  - **Domains & Interests:** Multi-select across Tech/AI, Business, Research, Social Impact, Creative, and Open Domain.
  - **Skills:** Tag-based technical and soft skill input (e.g. Python, React, Machine Learning, UI/UX, Public Speaking).
  - **Location Preference:** Remote / Online, Pan-India, Hybrid / Flexible, In-Person / Offline.
- **Deterministic Fit Evaluation:**
  - Evaluates student's exact study year against verified `eligibleStudyYears`.
  - Explains matched domain and skill alignments in plain language.
  - Highlights what remains unverified (e.g., minimum CGPA, specific institutional NOCs, departmental affiliations).
  - **Zero Fabricated Metrics:** No fake probabilities, no hallucinated ranking tiers.

---

## 📋 My Pursuit Plan

Save ambitious programs and convert them into concrete preparation:

- **4-Stage Pipeline:**
  1. **Interested:** Identified as an ambitious target to research further.
  2. **Preparing:** Drafting statement of purpose, assembling team, building project prototype.
  3. **Applied:** Official application or submission dispatched through host portal.
  4. **Completed:** Program attended, hackathon completed, or fellowship awarded.
- **Next Action & Deadline Tracking:**
  - Record the immediate next task (e.g., *"Submit SOP draft to SPOC"*, *"Confirm GitHub repo link with teammate"*).
  - Set a target date for the action.
- **Actions Due Soon Widget:**
  - Surfaced prominently on the Dashboard and in the Pursuit Plan board.
  - Highlights tasks due within 14 days or overdue with countdown days.
- **Persistence:**
  - Maintained under the modern `upnext_v1` LocalStorage schema with fallback to legacy keys.

---

## 🛡️ Truthful Data Model & Integrity Rules

Student opportunities on the web frequently expire without warning. UPNEXT enforces strict data integrity:

1. **Explicit Data Origins (`origin`):**
   - `Curated Demo`: Pre-seeded records provided for UI testing and layout demonstration.
   - `Live`: Fresh records extracted dynamically via web crawling or direct integration.
2. **Strict Expiration Enforcement (`status`):**
   - Past deadlines are strictly marked as **`Closed`** with `isOpen: false`.
   - Continuous self-paced programs without fixed dates are marked **`Unverified`** with rolling dates (`Rolling / Date TBA`).
   - The application **never fabricates open deadlines** or claims an expired program is currently open.
3. **Confirmed Open Counts:**
   - The dashboard dynamically counts open items from `isOpen: true`.
4. **Official Source URLs:**
   - Every opportunity card and detail drawer links directly to the verified official portal.

---

## 🤖 TinyFish Web Discovery Integration

UPNEXT includes a production-ready, server-side integration layer for **TinyFish AI Agent** automation (`https://agent.tinyfish.ai/v1/automation/run`):

- **Server-Side API Proxy:** Built directly into Vite development middleware (`server/tinyfishService.ts`). The frontend browser never touches or exposes the secret API key.
- **Header-Based Authentication:** Employs the official `X-API-Key` request header.
- **SSRF Defense:** Strict URL parser blocks loopback addresses (`127.0.0.1`, `localhost`), private LAN subnets (`10.x.x.x`, `192.168.x.x`, `172.16-31.x.x`), and unauthorized schemes (only `http:` and `https:` permitted).
- **Graceful Mock Fallback:** When `TINYFISH_API_KEY` is not configured, provides high-fidelity simulated extraction so testing proceeds smoothly without waiting for external API keys.

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation
```bash
git clone <repo-url>
cd "Opportunity Radar"
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### Production Build & Typecheck
```bash
npm run build
```
Generates an optimized production bundle in the `dist/` folder with complete TypeScript verification (`tsc -b`).

### Previewing the Production Build
```bash
npm run preview
```

---

## 📁 Repository Layout

```
UPNEXT/
├── server/
│   └── tinyfishService.ts        # Server-side TinyFish Agent client, mock provider & SSRF defense
├── src/
│   ├── components/
│   │   ├── Navbar.tsx            # Wordmark, Discover, My Pursuit Plan, Resources, Profile
│   │   ├── OpportunityDetail.tsx # Detailed opportunity view with rule-based fit breakdown & stages
│   │   ├── LiveDiscoveryModal.tsx# TinyFish web crawler UI with preset portals & status logs
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx     # UPNEXT headline, shortcuts, actions due soon & 3-card grid
│   │   │   ├── SavedPage.tsx     # Saved opportunities view
│   │   │   ├── Tracker.tsx       # My Pursuit Plan 4-stage pipeline with inline action editor
│   │   │   ├── PreferencesPage.tsx# Student Profile & Fit configuration
│   │   │   └── ResourcesPage.tsx # Curated student career & hackathon preparation guides
│   │   └── ui/
│   │       ├── Badge.tsx         # Opportunity type, reach, domain, fit, and pursuit badges
│   │       ├── BookmarkButton.tsx
│   │       ├── FilterPanel.tsx   # 5-dimensional filter sidebar & mobile modal
│   │       ├── OpportunityCard.tsx # 3-per-row card with fit evaluation & next action badge
│   │       ├── SearchBar.tsx
│   │       └── States.tsx        # Empty states, loading skeletons, error boundaries
│   ├── data/
│   │   └── opportunities.ts      # 14 curated demo records with verified taxonomy
│   ├── hooks/
│   │   └── index.ts              # usePursuitPlan, useStudentProfile, useOpportunities, useFilter
│   ├── services/
│   │   ├── discoveryService.ts   # Client-side discovery client with mock fallback
│   │   ├── opportunityService.ts # Plain-language fit evaluation, multi-filter engine, label maps
│   │   └── storage.ts            # LocalStorage persistence manager (upnext_v1)
│   ├── types/
│   │   └── index.ts              # Comprehensive TypeScript definitions
│   ├── App.tsx                   # Main application state & route coordinator
│   └── main.tsx                  # React DOM entrypoint
├── vite.config.ts                # Vite config with backend TinyFish API middleware
├── tsconfig.json                 # Project TypeScript configuration
└── package.json
```

---

## 📄 License
MIT License. Built for students across India.
