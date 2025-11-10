# Phase 2: DAO Governance System - Route Map

## Frontend Routes

### Main DAO Page
**URL:** `/dao`
**File:** `app/dao/page.tsx` (existing)
**Purpose:** DAO landing page with overview, stats, and active proposals preview

### Create Proposal
**URL:** `/dao/propose`
**File:** `app/dao/propose/page.tsx`
**Purpose:** Form to create new DAO proposals
**Features:**
- Wallet address input
- Proposal type selection
- Title and description fields
- Funding goal (conditional)
- Voting duration selection
- Discord notification on submit

### All Proposals
**URL:** `/dao/proposals`
**File:** `app/dao/proposals/page.tsx`
**Purpose:** Browse and filter all DAO proposals
**Features:**
- Search by title/description/creator
- Filter by status (all/active/passed/rejected/executed)
- Filter by type (all/funding/governance/partnership/creative/technical)
- Vote summary display
- Funding progress visualization

### Proposal Detail & Voting
**URL:** `/dao/proposals/[id]`
**File:** `app/dao/proposals/[id]/page.tsx`
**Purpose:** View individual proposal and cast votes
**Features:**
- Full proposal details
- Interactive voting card
- Real-time vote updates
- Vote history ledger
- Share functionality
- Quick stats sidebar

## API Routes (Future Implementation)

### Proposal Operations
- `POST /api/dao/proposals` - Create proposal
- `GET /api/dao/proposals` - List proposals
- `GET /api/dao/proposals/[id]` - Get proposal
- `PATCH /api/dao/proposals/[id]` - Update proposal
- `DELETE /api/dao/proposals/[id]` - Cancel proposal

### Vote Operations
- `POST /api/dao/proposals/[id]/vote` - Cast vote
- `GET /api/dao/proposals/[id]/votes` - Get votes
- `GET /api/dao/votes/history` - Get voter history

### Analytics
- `GET /api/dao/analytics` - DAO overview stats
- `GET /api/dao/trending` - Trending proposals

## Component Usage

### VotingCard Component
**Location:** `components/VotingCard.tsx`
**Usage:**
```tsx
import VotingCard from '@/components/VotingCard';

<VotingCard
  proposal={proposal}
  voteSummary={voteSummary}
  userWallet="0x..."
  userTokens={1500}
  onVoteCast={() => refreshData()}
/>
```

## Database Operations

### Import DAO Operations
```typescript
import {
  getProposals,
  getProposal,
  createProposal,
  updateProposal,
  castVote,
  getProposalVotes,
  getVoterHistory,
  hasVoted,
  getProposalVoteSummary,
  getDAOAnalytics,
  getTrendingProposals,
  subscribeToProposals,
  subscribeToProposalVotes
} from '@/lib/supabase/dao';
```

### Import Discord Notifications
```typescript
import {
  notifyProposalCreated,
  notifyProposalPassed,
  notifyProposalRejected,
  notifyProposalExpiring,
  notifyVoteMilestone,
  notifyFundingGoalReached,
  notifyWeeklySummary,
  testDiscordWebhook
} from '@/lib/discord/notifications';
```

### Import Types
```typescript
import type {
  DAOProposal,
  CreateProposalInput,
  UpdateProposalInput,
  DAOVote,
  CastVoteInput,
  ProposalVoteSummary,
  VoteBreakdown,
  MembershipTier,
  ProposalType,
  ProposalStatus,
  VoteType
} from '@/lib/types/dao';

import {
  getMembershipTier,
  getVotingWeight,
  calculateVoteBreakdown,
  isVotingActive,
  getTimeRemaining,
  formatProposalStatus,
  formatProposalType
} from '@/lib/types/dao';
```

## Navigation Flow

```
/dao (Main DAO Page)
  ├── Click "Create Proposal" → /dao/propose
  ├── Click "View All" → /dao/proposals
  └── Click on Proposal → /dao/proposals/[id]

/dao/propose (Create Proposal)
  ├── Submit → /dao/proposals/[id] (newly created)
  └── Cancel → /dao

/dao/proposals (All Proposals)
  ├── Click on Proposal → /dao/proposals/[id]
  ├── Click "Create Proposal" → /dao/propose
  └── Back to DAO → /dao

/dao/proposals/[id] (Proposal Detail)
  ├── Cast Vote → Stay on page (refresh data)
  ├── View All Proposals → /dao/proposals
  ├── Create New Proposal → /dao/propose
  └── Back to Proposals → /dao/proposals
```

## Real-time Subscriptions

### Subscribe to All Proposals
```typescript
const subscription = subscribeToProposals((payload) => {
  console.log('Proposal update:', payload);
  refreshProposals();
});

// Cleanup
subscription.unsubscribe();
```

### Subscribe to Proposal Votes
```typescript
const subscription = subscribeToProposalVotes(proposalId, (payload) => {
  console.log('Vote update:', payload);
  refreshVotes();
});

// Cleanup
subscription.unsubscribe();
```

## Environment Setup

Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
DISCORD_WEBHOOK_URL=your_webhook_url
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing Routes

1. Start dev server: `npm run dev`
2. Visit `http://localhost:3000/dao`
3. Navigate to proposals: `http://localhost:3000/dao/proposals`
4. Create proposal: `http://localhost:3000/dao/propose`
5. View proposal: `http://localhost:3000/dao/proposals/[id]`

## Production URLs

- Main DAO: `https://inrecord.com/dao`
- All Proposals: `https://inrecord.com/dao/proposals`
- Create Proposal: `https://inrecord.com/dao/propose`
- Proposal Detail: `https://inrecord.com/dao/proposals/[id]`
