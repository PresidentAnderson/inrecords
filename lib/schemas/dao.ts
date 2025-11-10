import { z } from 'zod';

// =============================================
// MEMBERSHIP SCHEMAS
// =============================================

export const MembershipTierEnum = z.enum(['Bronze', 'Silver', 'Gold', 'Platinum']);

export const TierDisplayNameEnum = z.enum(['Listener', 'Supporter', 'Curator', 'Producer']);

export const memberRegistrationSchema = z.object({
  walletAddress: z.string().min(32, 'Invalid wallet address'),
  membershipTier: MembershipTierEnum,
  tierDisplayName: TierDisplayNameEnum.optional(),
  displayName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  email: z.string().email().optional(),
  discordHandle: z.string().min(2).max(100).optional(),
});

export const memberUpdateSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
  email: z.string().email().optional(),
  discordHandle: z.string().min(2).max(100).optional(),
});

// =============================================
// PROPOSAL SCHEMAS
// =============================================

export const ProposalTypeEnum = z.enum([
  'Studio Funding',
  'Equipment Purchase',
  'Artist Grant',
  'Community Event',
  'Platform Feature',
  'Treasury Allocation',
  'Governance Change',
  'Other',
]);

export const ProposalStatusEnum = z.enum([
  'draft',
  'submitted',
  'active_voting',
  'approved',
  'rejected',
  'funded',
  'completed',
  'cancelled',
]);

export const FundingCurrencyEnum = z.enum(['USD', 'SOL', 'USDC']);

export const proposalCreateSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),

  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(10000, 'Description must not exceed 10,000 characters')
    .trim(),

  proposalType: ProposalTypeEnum,

  fundingGoal: z
    .number()
    .positive('Funding goal must be positive')
    .max(1000000, 'Funding goal cannot exceed $1,000,000')
    .optional(),

  fundingCurrency: FundingCurrencyEnum.default('USD'),

  createdBy: z.string().min(32, 'Invalid wallet address'),

  votingEndsAt: z.coerce.date().refine(
    (date) => date > new Date(),
    'Voting end date must be in the future'
  ),

  quorumRequired: z
    .number()
    .int()
    .min(1, 'Quorum must be at least 1%')
    .max(100, 'Quorum cannot exceed 100%')
    .default(10),

  approvalThreshold: z
    .number()
    .int()
    .min(1, 'Approval threshold must be at least 1%')
    .max(100, 'Approval threshold cannot exceed 100%')
    .default(51),

  linkedSessionId: z.string().uuid().optional(),

  tags: z.array(z.string().min(2).max(50)).max(10).optional(),

  attachmentUrls: z.array(z.string().url()).max(5).optional(),
});

export const proposalUpdateSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),

  description: z
    .string()
    .min(50, 'Description must be at least 50 characters')
    .max(10000, 'Description must not exceed 10,000 characters')
    .trim()
    .optional(),

  proposalType: ProposalTypeEnum.optional(),

  fundingGoal: z
    .number()
    .positive('Funding goal must be positive')
    .max(1000000, 'Funding goal cannot exceed $1,000,000')
    .optional(),

  status: ProposalStatusEnum.optional(),

  tags: z.array(z.string().min(2).max(50)).max(10).optional(),

  attachmentUrls: z.array(z.string().url()).max(5).optional(),

  adminNotes: z.string().max(2000).optional(),
});

export const proposalSubmitSchema = z.object({
  proposalId: z.string().uuid(),
  walletAddress: z.string().min(32, 'Invalid wallet address'),
});

// =============================================
// VOTING SCHEMAS
// =============================================

export const VoteTypeEnum = z.enum(['for', 'against', 'abstain']);

export const voteSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),

  voterWallet: z.string().min(32, 'Invalid wallet address'),

  voteType: VoteTypeEnum,

  signature: z.string().min(64, 'Invalid signature'),

  comment: z.string().min(1).max(2000).optional(),
});

export const voteVerificationSchema = z.object({
  proposalId: z.string().uuid(),
  voterWallet: z.string().min(32),
  voteType: VoteTypeEnum,
  timestamp: z.coerce.date(),
});

// =============================================
// QUERY/FILTER SCHEMAS
// =============================================

export const proposalFilterSchema = z.object({
  status: ProposalStatusEnum.optional(),
  proposalType: ProposalTypeEnum.optional(),
  createdBy: z.string().optional(),
  tags: z.array(z.string()).optional(),
  search: z.string().min(2).max(200).optional(),
  sortBy: z.enum(['newest', 'oldest', 'most_funded', 'ending_soon', 'most_votes']).default('newest'),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});

export const voteHistoryFilterSchema = z.object({
  voterWallet: z.string().optional(),
  proposalId: z.string().uuid().optional(),
  voteType: VoteTypeEnum.optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

// =============================================
// COMMENT SCHEMAS
// =============================================

export const commentCreateSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),
  commenterWallet: z.string().min(32, 'Invalid wallet address'),
  commentText: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must not exceed 2,000 characters')
    .trim(),
  parentCommentId: z.string().uuid().optional(),
});

export const commentUpdateSchema = z.object({
  commentText: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must not exceed 2,000 characters')
    .trim(),
});

// =============================================
// STATS SCHEMAS
// =============================================

export const daoStatsSchema = z.object({
  totalMembers: z.number().int().nonnegative(),
  activeMembers: z.number().int().nonnegative(),
  totalProposals: z.number().int().nonnegative(),
  activeProposals: z.number().int().nonnegative(),
  approvedProposals: z.number().int().nonnegative(),
  rejectedProposals: z.number().int().nonnegative(),
  totalFundingRequested: z.number().nonnegative(),
  totalFundingApproved: z.number().nonnegative(),
  totalVotesCast: z.number().int().nonnegative(),
  averageVoterParticipation: z.number().min(0).max(100),
});

export const memberStatsSchema = z.object({
  walletAddress: z.string().min(32),
  membershipTier: MembershipTierEnum,
  votesCast: z.number().int().nonnegative(),
  proposalsCreated: z.number().int().nonnegative(),
  totalFundingReceived: z.number().nonnegative(),
  voteWeight: z.number().positive(),
  memberSince: z.coerce.date(),
  lastActive: z.coerce.date(),
});

// =============================================
// TYPE EXPORTS
// =============================================

export type MembershipTier = z.infer<typeof MembershipTierEnum>;
export type TierDisplayName = z.infer<typeof TierDisplayNameEnum>;
export type ProposalType = z.infer<typeof ProposalTypeEnum>;
export type ProposalStatus = z.infer<typeof ProposalStatusEnum>;
export type FundingCurrency = z.infer<typeof FundingCurrencyEnum>;
export type VoteType = z.infer<typeof VoteTypeEnum>;

export type MemberRegistration = z.infer<typeof memberRegistrationSchema>;
export type MemberUpdate = z.infer<typeof memberUpdateSchema>;
export type ProposalCreate = z.infer<typeof proposalCreateSchema>;
export type ProposalUpdate = z.infer<typeof proposalUpdateSchema>;
export type ProposalSubmit = z.infer<typeof proposalSubmitSchema>;
export type Vote = z.infer<typeof voteSchema>;
export type VoteVerification = z.infer<typeof voteVerificationSchema>;
export type ProposalFilter = z.infer<typeof proposalFilterSchema>;
export type VoteHistoryFilter = z.infer<typeof voteHistoryFilterSchema>;
export type CommentCreate = z.infer<typeof commentCreateSchema>;
export type CommentUpdate = z.infer<typeof commentUpdateSchema>;
export type DaoStats = z.infer<typeof daoStatsSchema>;
export type MemberStats = z.infer<typeof memberStatsSchema>;

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Get vote weight based on membership tier
 */
export function getVoteWeight(tier: MembershipTier): number {
  const weights: Record<MembershipTier, number> = {
    Bronze: 1,
    Silver: 2,
    Gold: 3,
    Platinum: 5,
  };
  return weights[tier];
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: MembershipTier): TierDisplayName {
  const displayNames: Record<MembershipTier, TierDisplayName> = {
    Bronze: 'Listener',
    Silver: 'Supporter',
    Gold: 'Curator',
    Platinum: 'Producer',
  };
  return displayNames[tier];
}

/**
 * Calculate voting period (default 7 days from now)
 */
export function getDefaultVotingEndDate(daysFromNow: number = 7): Date {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + daysFromNow);
  return endDate;
}

/**
 * Validate wallet signature format
 */
export function isValidSignature(signature: string): boolean {
  // Basic validation - should be at least 64 characters
  return signature.length >= 64 && /^[a-fA-F0-9]+$/.test(signature);
}

/**
 * Calculate days remaining until voting ends
 */
export function getDaysRemaining(votingEndsAt: Date): number {
  const now = new Date();
  const diff = votingEndsAt.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate hours remaining until voting ends
 */
export function getHoursRemaining(votingEndsAt: Date): number {
  const now = new Date();
  const diff = votingEndsAt.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60));
}

/**
 * Format funding amount with currency
 */
export function formatFunding(amount: number, currency: FundingCurrency = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'USDC' ? 'USD' : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (currency === 'USDC') {
    return `${formatter.format(amount)} USDC`;
  }

  return formatter.format(amount);
}

/**
 * Calculate approval percentage
 */
export function calculateApprovalPercentage(votesFor: number, votesAgainst: number): number {
  const total = votesFor + votesAgainst;
  if (total === 0) return 0;
  return Math.round((votesFor / total) * 100);
}

/**
 * Calculate funding percentage
 */
export function calculateFundingPercentage(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min(Math.round((current / goal) * 100), 100);
}

/**
 * Check if voting is still active
 */
export function isVotingActive(votingEndsAt: Date, status: ProposalStatus): boolean {
  return status === 'active_voting' && new Date() < votingEndsAt;
}
