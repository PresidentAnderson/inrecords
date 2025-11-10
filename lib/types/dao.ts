/**
 * inRECORD DAO Governance System - TypeScript Types
 * Phase 2: Type definitions for proposals, votes, and related entities
 */

// =====================================================
// Proposal Types
// =====================================================

export type ProposalType = 'funding' | 'governance' | 'partnership' | 'creative' | 'technical';

export type ProposalStatus = 'draft' | 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled';

export interface DAOProposal {
  id: string;
  title: string;
  description: string | null;
  proposal_type: ProposalType;
  funding_goal: number | null;
  current_funding: number;
  status: ProposalStatus;
  created_by: string | null;
  created_at: string;
  voting_ends_at: string | null;
  executed_at: string | null;
  metadata: Record<string, any>;
}

export interface CreateProposalInput {
  title: string;
  description: string;
  proposal_type: ProposalType;
  funding_goal?: number;
  created_by: string;
  voting_ends_at: string;
  metadata?: Record<string, any>;
}

export interface UpdateProposalInput {
  title?: string;
  description?: string;
  funding_goal?: number;
  status?: ProposalStatus;
  current_funding?: number;
  executed_at?: string;
  metadata?: Record<string, any>;
}

// =====================================================
// Vote Types
// =====================================================

export type VoteType = 'for' | 'against' | 'abstain';

export interface DAOVote {
  id: string;
  proposal_id: string;
  voter_wallet: string;
  vote_weight: number;
  vote_type: VoteType;
  voted_at: string;
  metadata: Record<string, any>;
}

export interface CastVoteInput {
  proposal_id: string;
  voter_wallet: string;
  vote_weight: number;
  vote_type: VoteType;
  metadata?: Record<string, any>;
}

export interface UpdateVoteInput {
  vote_type: VoteType;
  vote_weight?: number;
  metadata?: Record<string, any>;
}

// =====================================================
// Vote Summary Types
// =====================================================

export interface ProposalVoteSummary {
  id: string;
  title: string;
  status: ProposalStatus;
  voting_ends_at: string | null;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_votes: number;
  unique_voters: number;
}

export interface VoteBreakdown {
  for: number;
  against: number;
  abstain: number;
  total: number;
  percentage_for: number;
  percentage_against: number;
  percentage_abstain: number;
}

// =====================================================
// Membership Tier Types
// =====================================================

export type MembershipTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export interface TierRequirements {
  tier: MembershipTier;
  min_tokens: number;
  vote_weight: number;
  benefits: string[];
}

export const TIER_REQUIREMENTS: TierRequirements[] = [
  {
    tier: 'bronze',
    min_tokens: 100,
    vote_weight: 1,
    benefits: ['Vote on proposals', 'Forum access', 'Quarterly updates', 'Basic token-gated content']
  },
  {
    tier: 'silver',
    min_tokens: 500,
    vote_weight: 2,
    benefits: ['All Bronze perks', 'Early release access', 'Monthly AMAs', 'Exclusive merch discounts']
  },
  {
    tier: 'gold',
    min_tokens: 1000,
    vote_weight: 3,
    benefits: ['All Silver perks', 'Studio tour access', 'Stem downloads', 'VIP event invites']
  },
  {
    tier: 'platinum',
    min_tokens: 5000,
    vote_weight: 5,
    benefits: ['All Gold perks', '1-on-1 artist sessions', 'Producer credits', 'Advisory board seat']
  }
];

// =====================================================
// Helper Functions
// =====================================================

/**
 * Determines membership tier based on token count
 */
export function getMembershipTier(tokenCount: number): MembershipTier {
  if (tokenCount >= 5000) return 'platinum';
  if (tokenCount >= 1000) return 'gold';
  if (tokenCount >= 500) return 'silver';
  if (tokenCount >= 100) return 'bronze';
  return 'none';
}

/**
 * Gets voting weight based on token count
 */
export function getVotingWeight(tokenCount: number): number {
  const tier = getMembershipTier(tokenCount);
  const tierReq = TIER_REQUIREMENTS.find(t => t.tier === tier);
  return tierReq?.vote_weight || 0;
}

/**
 * Calculates vote percentages
 */
export function calculateVoteBreakdown(summary: ProposalVoteSummary): VoteBreakdown {
  const total = summary.total_votes || 1; // Avoid division by zero

  return {
    for: summary.votes_for,
    against: summary.votes_against,
    abstain: summary.votes_abstain,
    total: summary.total_votes,
    percentage_for: Math.round((summary.votes_for / total) * 100),
    percentage_against: Math.round((summary.votes_against / total) * 100),
    percentage_abstain: Math.round((summary.votes_abstain / total) * 100)
  };
}

/**
 * Checks if proposal voting is still active
 */
export function isVotingActive(proposal: DAOProposal): boolean {
  if (proposal.status !== 'active') return false;
  if (!proposal.voting_ends_at) return false;

  const now = new Date();
  const endDate = new Date(proposal.voting_ends_at);

  return now < endDate;
}

/**
 * Gets time remaining for voting
 */
export function getTimeRemaining(votingEndsAt: string): string {
  const now = new Date();
  const endDate = new Date(votingEndsAt);
  const diff = endDate.getTime() - now.getTime();

  if (diff <= 0) return 'Voting ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
  } else {
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
  }
}

/**
 * Formats proposal status for display
 */
export function formatProposalStatus(status: ProposalStatus): {
  label: string;
  color: string;
} {
  const statusMap: Record<ProposalStatus, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-gray-500/20 text-gray-400' },
    active: { label: 'Active', color: 'bg-aurora/20 text-aurora' },
    passed: { label: 'Passed', color: 'bg-green-500/20 text-green-400' },
    rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400' },
    executed: { label: 'Executed', color: 'bg-blue-500/20 text-blue-400' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-500/20 text-gray-400' }
  };

  return statusMap[status] || statusMap.draft;
}

/**
 * Formats proposal type for display
 */
export function formatProposalType(type: ProposalType): {
  label: string;
  icon: string;
} {
  const typeMap: Record<ProposalType, { label: string; icon: string }> = {
    funding: { label: 'Funding Request', icon: '💰' },
    governance: { label: 'Governance', icon: '⚖️' },
    partnership: { label: 'Partnership', icon: '🤝' },
    creative: { label: 'Creative Initiative', icon: '🎨' },
    technical: { label: 'Technical Upgrade', icon: '🔧' }
  };

  return typeMap[type] || typeMap.funding;
}
