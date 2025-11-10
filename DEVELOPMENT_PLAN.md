# inRECORD Development Plan - Feature Branch Strategy

## Branching Model

```
main (production-ready)
├── develop (integration branch)
│   ├── feature/studio-booking-system
│   ├── feature/dao-governance
│   ├── feature/treasury-analytics
│   ├── feature/ai-digest-system
│   ├── feature/transparency-portal
│   └── feature/member-dashboard
```

## Development Workflow

1. **Create feature branch** from `develop`
2. **Develop & test** feature in isolation
3. **Code review** via Pull Request
4. **Merge to develop** after passing tests
5. **Deploy to staging** for integration testing
6. **Merge to main** for production release

## Phase 1: Studio System (Priority 1)

### Feature: Studio Booking System
**Branch:** `feature/studio-booking-system`
**Estimated Time:** 2-3 weeks

#### Sub-tasks:
- [ ] Create Supabase schema for sessions
- [ ] Build booking UI with date/time picker
- [ ] Implement availability checker
- [ ] Add email confirmation flow
- [ ] Create admin dashboard for session management
- [ ] Integrate DAO funding trigger button

#### Database Schema:
```sql
-- studio_sessions table
CREATE TABLE studio_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  user_wallet TEXT,
  room_type TEXT NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  total_cost DECIMAL(10,2),
  dao_funded BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Files to Create:
- `app/book-session/page.tsx` - Booking form UI
- `app/api/bookings/route.ts` - API endpoints
- `components/BookingForm.tsx` - Form component
- `lib/supabase/bookings.ts` - DB operations
- `lib/email/booking-confirmation.ts` - Email service

---

## Phase 2: DAO Governance (Priority 2)

### Feature: DAO Voting System
**Branch:** `feature/dao-governance`
**Estimated Time:** 3-4 weeks

#### Sub-tasks:
- [ ] Create proposals schema
- [ ] Build proposal creation flow
- [ ] Implement voting mechanism
- [ ] Add weighted voting by tier
- [ ] Create proposal dashboard
- [ ] Build vote history ledger
- [ ] Add Discord notifications

#### Database Schema:
```sql
-- dao_proposals table
CREATE TABLE dao_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  proposal_type TEXT NOT NULL,
  funding_goal DECIMAL(10,2),
  current_funding DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  voting_ends_at TIMESTAMP
);

-- dao_votes table
CREATE TABLE dao_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES dao_proposals(id),
  voter_wallet TEXT NOT NULL,
  vote_weight INTEGER DEFAULT 1,
  vote_type TEXT NOT NULL,
  voted_at TIMESTAMP DEFAULT NOW()
);
```

#### Files to Create:
- `app/dao/propose/page.tsx` - Proposal creation
- `app/dao/proposals/page.tsx` - Proposals list
- `app/dao/proposals/[id]/page.tsx` - Proposal detail & voting
- `components/VotingCard.tsx` - Voting UI
- `lib/supabase/dao.ts` - DAO operations
- `lib/discord/notifications.ts` - Discord webhooks

---

## Phase 3: Treasury & Analytics (Priority 3)

### Feature: Treasury Dashboard
**Branch:** `feature/treasury-analytics`
**Estimated Time:** 2 weeks

#### Sub-tasks:
- [ ] Create treasury schema
- [ ] Build analytics views in Supabase
- [ ] Create real-time dashboard
- [ ] Add Chart.js visualizations
- [ ] Implement auto-sync triggers
- [ ] Add funding tracker

#### Database Schema:
```sql
-- dao_treasury table
CREATE TABLE dao_treasury (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  proposal_id UUID REFERENCES dao_proposals(id),
  contributor_wallet TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW dao_analytics AS
SELECT 
  COUNT(DISTINCT id) as total_proposals,
  SUM(CASE WHEN status = 'funded' THEN 1 ELSE 0 END) as funded_count,
  SUM(current_funding) as total_raised
FROM dao_proposals;
```

#### Files to Create:
- `app/treasury/page.tsx` - Treasury dashboard
- `components/TreasuryChart.tsx` - Chart components
- `lib/supabase/treasury.ts` - Treasury operations
- `lib/analytics/dao-stats.ts` - Analytics helpers

---

## Phase 4: AI Digest System (Priority 4)

### Feature: AI Transparency Digest
**Branch:** `feature/ai-digest-system`
**Estimated Time:** 2-3 weeks

#### Sub-tasks:
- [ ] Create digest schema
- [ ] Build OpenAI integration
- [ ] Implement weekly cron job
- [ ] Add translation service
- [ ] Integrate text-to-speech
- [ ] Create digest archive page
- [ ] Add Discord & email distribution

#### Database Schema:
```sql
-- ai_digests table
CREATE TABLE ai_digests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start DATE NOT NULL,
  summary_en TEXT,
  summary_fr TEXT,
  summary_pt TEXT,
  sentiment TEXT,
  audio_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Files to Create:
- `app/api/cron/digest/route.ts` - Weekly generation
- `app/digests/page.tsx` - Archive listing
- `app/digests/[slug]/page.tsx` - Individual digest
- `lib/openai/digest-generator.ts` - AI generation
- `lib/audio/text-to-speech.ts` - Audio generation

---

## Phase 5: Transparency Portal (Priority 5)

### Feature: Public Transparency Dashboard
**Branch:** `feature/transparency-portal`
**Estimated Time:** 1-2 weeks

#### Sub-tasks:
- [ ] Create transparency page
- [ ] Add real-time charts
- [ ] Implement auto-refresh
- [ ] Add digest feed integration
- [ ] Create embed API endpoint

#### Files to Create:
- `app/transparency/page.tsx` - Main dashboard
- `app/api/embed/transparency/route.ts` - Embed API
- `components/TransparencyWidget.tsx` - Widget component

---

## Phase 6: Member Dashboard (Priority 6)

### Feature: Member Portal
**Branch:** `feature/member-dashboard`
**Estimated Time:** 2 weeks

#### Sub-tasks:
- [ ] Build member authentication
- [ ] Create personalized dashboard
- [ ] Add membership tier system
- [ ] Implement NFT card generator
- [ ] Add voting history view

#### Files to Create:
- `app/dashboard/page.tsx` - Member dashboard
- `components/MembershipCard.tsx` - NFT-style card
- `lib/auth/membership.ts` - Tier management

---

## Technical Setup Required

### Environment Variables
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# OpenAI
OPENAI_API_KEY=

# Email (Resend)
RESEND_API_KEY=

# Discord
DISCORD_WEBHOOK_URL=

# Audio (Play.ht)
PLAYHT_API_KEY=
PLAYHT_USER_ID=
```

### Dependencies to Add
```bash
npm install @supabase/supabase-js wagmi viem
npm install openai
npm install resend
npm install chart.js react-chartjs-2
npm install date-fns
npm install zod
npm install @tanstack/react-query
```

---

## Git Workflow Commands

### Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/studio-booking-system
```

### Push Feature Branch
```bash
git add .
git commit -m "feat: implement booking form UI"
git push origin feature/studio-booking-system
```

### Create Pull Request
```bash
gh pr create --base develop --head feature/studio-booking-system \
  --title "Feature: Studio Booking System" \
  --body "Implements studio session booking with Supabase integration"
```

### Merge to Develop
```bash
git checkout develop
git merge feature/studio-booking-system
git push origin develop
```

---

## Testing Strategy

### Per Feature
1. Unit tests for utilities
2. Integration tests for API routes
3. E2E tests for user flows
4. Manual QA checklist

### Before Merging to Main
1. All tests passing
2. Code review approved
3. Staging deployment verified
4. Performance audit passed

---

## Timeline Estimate

| Phase | Feature | Duration | Dependencies |
|-------|---------|----------|--------------|
| 1 | Studio Booking | 2-3 weeks | Supabase setup |
| 2 | DAO Governance | 3-4 weeks | Phase 1 complete |
| 3 | Treasury Analytics | 2 weeks | Phase 2 complete |
| 4 | AI Digest System | 2-3 weeks | OpenAI setup |
| 5 | Transparency Portal | 1-2 weeks | Phase 3 & 4 complete |
| 6 | Member Dashboard | 2 weeks | Phase 2 complete |

**Total Estimated Time:** 12-16 weeks (3-4 months)

---

## Success Metrics

### Studio System
- ✅ Booking conversion rate > 60%
- ✅ Email confirmation delivery > 95%
- ✅ Admin can mark sessions complete

### DAO System
- ✅ > 100 active proposals in first month
- ✅ Voter participation > 40%
- ✅ Treasury tracking 100% accurate

### AI Digest
- ✅ Weekly digest generated automatically
- ✅ Published to Discord + Email
- ✅ Audio narration < 5min per digest

### Transparency
- ✅ Dashboard updates in real-time
- ✅ Public access (no login required)
- ✅ Embed API functional

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Feature delays | Prioritize MVP, defer nice-to-haves |
| Integration bugs | Comprehensive testing per phase |
| Database performance | Index optimization, materialized views |
| API rate limits | Caching, queue systems |
| Security issues | Supabase RLS policies, input validation |

---

## Next Steps

1. ✅ Review and approve development plan
2. Create `develop` branch
3. Set up Supabase project
4. Configure environment variables
5. Install required dependencies
6. Begin Phase 1: Studio Booking System

