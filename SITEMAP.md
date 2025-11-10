# 🎧 inRECORD — Full Site Map v1.0

> A decentralized, AI-powered label ecosystem connecting artists, fans, and technology through creativity, transparency, and governance.

## 🏠 ROOT LEVEL

```
/
├── Home (Landing Page)
├── Academy
├── Studio
├── AI Lab
├── DAO
├── Transparency
├── Digests
├── Dashboard
└── Legal / System Pages
```

## 1. HOME / ROOT

**Path:** `/`  
**Purpose:** Brand entry point — "Where Independence Sounds Infinite"

**Sections:**
- Hero (brand tagline + CTA: "Enter Label")
- Vision & Philosophy  
- Ecosystem Overview (Academy / Studio / AI Lab / DAO)
- Featured Artist or Release
- CTA Buttons → "Explore Artists", "Listen Now", "Join DAO"

**Planned Extensions:**
- `/about` — brand story + manifesto
- `/press` — media resources, partners
- `/contact` — general contact form

---

## 2. ACADEMY

**Path:** `/academy`  
**Purpose:** Artist education, mentorship, and community training

**Subpages:**
```
/academy
 ├── /academy/courses          → list of artist development modules
 ├── /academy/instructors      → mentor & producer profiles
 ├── /academy/apply            → join or audition form
 └── /academy/resources        → downloadable materials, PDFs, videos
```

**Integrations:**
- Supabase content table for courses
- Future DAO-linked scholarships & grants

---

## 3. STUDIO

**Path:** `/studio`  
**Purpose:** Showcase and operational page for IN Studio Montréal HQ

**Subpages:**
```
/studio
 ├── /book-session          → booking flow (Supabase + email confirmation)
 ├── /confirm/[token]       → verification link for bookings
 ├── /admin/sessions        → admin dashboard for studio managers
 ├── /studio/sessions       → user's personal bookings (planned)
 └── /studio/gallery        → media/photos of the rooms (planned)
```

**Rooms Highlighted:**
- Control Room
- Sound Lab
- AI Suite
- Immersive Listening Room

**Integrations:**
- Aurora PMS scheduling logic
- DAO Funding Trigger → `/dao/propose?session={id}`

---

## 4. AI LAB

**Path:** `/ai-lab`  
**Purpose:** Experimental hub for generative sound, adaptive mastering, and R&D

**Sections:**
- AI Research Projects (Generative Soundscapes, Neural Mixes)
- Tools Showcase (Audio models, plugins, collaborations)
- "Fund R&D via DAO" button

**Planned Subpages:**
```
/ai-lab/projects
/ai-lab/tools
/ai-lab/papers
```

---

## 5. DAO (Governance Hub)

**Path:** `/dao`  
**Purpose:** Decentralized fan-powered label governance & funding

**Subpages:**
```
/dao
 ├── /dao/proposals        → list of active & funded proposals
 ├── /dao/propose          → proposal creation form (from session or manual)
 ├── /dao/dashboard        → DAO member view (stats, wallet, votes)
 ├── /dao/constitution     → DAO charter & rules (to be published)
 └── /dao/votes            → full ledger of votes (planned)
```

**Functional Areas:**
- Governance explanation (Vision, Token Utility, Membership tiers)
- Curation, Project Funding, Innovation Grants
- Tiered Membership: Listener / Supporter / Curator / Producer
- Voting System (weighted by tier / on-chain balance)
- Proposal lifecycle: *draft → submitted → approved/rejected → funded*

---

## 6. TREASURY & ANALYTICS

**Path:** `/dashboard`  
**Purpose:** Member dashboard + treasury visualization

**Subpages/Components:**
```
/dashboard
 ├── FundingTracker          → DAO inflows, growth rate, top contributors
 ├── DAOAnalyticsWidget      → aggregate view of funds, voters, projects
 ├── DAOGovernancePanel      → active proposals & votes
 ├── DAOMembershipCard       → NFT-style card (downloadable, holographic)
 ├── DAOTransparencyWidget   → global summary tile (read-only metrics)
 └── dashboard/digests       → admin view of AI-generated summaries
```

**Data Source:** Supabase views:
- `dao_treasury`
- `dao_analytics`
- `dao_proposals`
- `dao_votes`

---

## 7. TRANSPARENCY (Public Portal)

**Path:** `/transparency`  
**Purpose:** Public, read-only investor-style DAO report

**Sections:**
- Treasury overview (total ETH, contributors)
- Funding distribution chart (Chart.js)
- Proposal status donut (funded vs active)
- Recently funded projects
- Live refresh (60s)
- Digest feed (last 3 AI summaries)

**Subpages:**
```
/transparency
 └── /api/embed/transparency    → embeddable widget (planned)
```

**Access:** Public, no login required

---

## 8. DIGEST SYSTEM

**Path:** `/digests`  
**Purpose:** AI-generated transparency archive with multilingual summaries and voice narration

**Subpages:**
```
/digests
 ├── /digests/[slug]        → individual digest (share link)
 ├── /api/dao/digest        → AI agent for weekly generation
 └── /api/rss/digests       → RSS or podcast feed (planned)
```

**Features:**
- Weekly AI summary from DAO stats
- FR & PT translations
- Sentiment analysis
- Audio narration (Play.ht / Suno AI)
- Discord + Email distribution
- Public archive with filters and search

---

## 9. VOTING & GOVERNANCE RECORDS

**(Planned / Ongoing)**

```
/dao/votes
 ├── Active Votes
 ├── Completed Votes
 └── Ledger View (Vote receipts + weights)
```

- Tier-weighted voting system
- Vote receipts stored for audit
- Sentiment tracking by participation

---

## 10. AI & AUTOMATION AGENTS

| Agent | Function | Endpoint |
|-------|----------|----------|
| **AI Digest Agent** | Weekly DAO digest summary | `/api/dao/digest` |
| **AI Scheduler** | Suggests best studio times | `/api/studio/ai-suggest` *(planned)* |
| **AI Summarizer** | Generates one-line proposal digests | `/api/dao/summarize` |
| **AI Translator** | Produces FR + PT versions of summaries | internal function |
| **AI Sentiment Classifier** | Labels DAO mood as Optimistic / Stable / Critical | integrated in digest function |

---

## 11. COMMUNICATION SYSTEM

```
/notifications
 ├── Discord webhooks (proposals, bookings, digests)
 ├── Email confirmations (bookings)
 ├── Digest newsletter (Mailchimp / Resend)
 ├── Press subscription form (planned)
```

---

## 12. LEGAL & DOCUMENTATION

```
/terms
/privacy
/cookies
/dao/constitution      (DAO charter & legal framework)
```

---

## 13. ECOSYSTEM DATA FLOW

```
Studio Booking
   ↓
DAO Proposal (auto-generated)
   ↓
DAO Voting → Funded
   ↓
Treasury Update (Supabase trigger)
   ↓
Analytics View / Transparency Page
   ↓
AI Digest Agent Summary (weekly)
   ↓
Transparency Feed / Archive / Discord
```

---

## 14. SUMMARY

**inRECORD** is an integrated creative DAO network with:
- **Operational backbone** (Studio + Academy)
- **Governance infrastructure** (DAO + Treasury + Voting)
- **Transparency system** (Analytics + Digest + Archive)
- **AI intelligence layer** (Automation + Summaries + Voice)
- **Public accountability** (Transparency Portal + Digest Feed)
