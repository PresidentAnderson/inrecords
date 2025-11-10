// =====================================================
// Transparency Portal Type Definitions
// =====================================================

import { z } from 'zod';

/**
 * Real-time transparency metrics
 */
export interface TransparencyMetrics {
  // DAO Metrics
  totalProposals: number;
  activeProposals: number;
  fundedProposals: number;
  totalVotes: number;
  uniqueVoters: number;
  participationRate: number;

  // Treasury Metrics
  treasuryBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  netChange: number;

  // Member Metrics
  totalMembers: number;
  activeMembers: number;
  newMembersThisWeek: number;

  // Activity Metrics
  proposalsThisWeek: number;
  votesThisWeek: number;
  treasuryActivityThisWeek: number;
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

/**
 * Treasury transaction for transparency view
 */
export interface TransparencyTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'funding' | 'revenue';
  amount: number;
  description: string;
  proposalId?: string;
  proposalTitle?: string;
  contributorWallet?: string;
  contributorName?: string;
  createdAt: string;
}

/**
 * Proposal summary for transparency view
 */
export interface TransparencyProposal {
  id: string;
  title: string;
  description: string;
  type: string;
  status: 'active' | 'approved' | 'rejected' | 'funded' | 'completed';
  fundingGoal: number;
  currentFunding: number;
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  createdBy: string;
  createdAt: string;
  votingEndsAt?: string;
}

/**
 * Recent activity item
 */
export interface RecentActivity {
  id: string;
  type: 'proposal' | 'vote' | 'transaction' | 'member';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * Transparency dashboard data
 */
export interface TransparencyDashboard {
  metrics: TransparencyMetrics;
  recentProposals: TransparencyProposal[];
  recentTransactions: TransparencyTransaction[];
  recentActivity: RecentActivity[];
  treasuryChart: ChartDataPoint[];
  proposalChart: ChartDataPoint[];
  votingChart: ChartDataPoint[];
  lastUpdated: string;
}

/**
 * Widget configuration
 */
export interface WidgetConfig {
  showHeader?: boolean;
  showMetrics?: boolean;
  showCharts?: boolean;
  showRecentActivity?: boolean;
  maxItems?: number;
  theme?: 'light' | 'dark';
  refreshInterval?: number; // in milliseconds
}

/**
 * Embed widget response
 */
export interface EmbedWidgetData {
  metrics: TransparencyMetrics;
  recentActivity: RecentActivity[];
  chartData: {
    treasury: ChartDataPoint[];
    proposals: ChartDataPoint[];
    voting: ChartDataPoint[];
  };
  timestamp: string;
}

// =====================================================
// Zod Schemas for Validation
// =====================================================

export const TransparencyMetricsSchema = z.object({
  totalProposals: z.number().int().nonnegative(),
  activeProposals: z.number().int().nonnegative(),
  fundedProposals: z.number().int().nonnegative(),
  totalVotes: z.number().int().nonnegative(),
  uniqueVoters: z.number().int().nonnegative(),
  participationRate: z.number().min(0).max(1),
  treasuryBalance: z.number().nonnegative(),
  totalDeposits: z.number().nonnegative(),
  totalWithdrawals: z.number().nonnegative(),
  netChange: z.number(),
  totalMembers: z.number().int().nonnegative(),
  activeMembers: z.number().int().nonnegative(),
  newMembersThisWeek: z.number().int().nonnegative(),
  proposalsThisWeek: z.number().int().nonnegative(),
  votesThisWeek: z.number().int().nonnegative(),
  treasuryActivityThisWeek: z.number().nonnegative(),
});

export const ChartDataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
  date: z.string().optional(),
});

export const TransparencyTransactionSchema = z.object({
  id: z.string(),
  type: z.enum(['deposit', 'withdrawal', 'funding', 'revenue']),
  amount: z.number(),
  description: z.string(),
  proposalId: z.string().optional(),
  proposalTitle: z.string().optional(),
  contributorWallet: z.string().optional(),
  contributorName: z.string().optional(),
  createdAt: z.string(),
});

export const TransparencyProposalSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  status: z.enum(['active', 'approved', 'rejected', 'funded', 'completed']),
  fundingGoal: z.number(),
  currentFunding: z.number(),
  votesFor: z.number(),
  votesAgainst: z.number(),
  totalVotes: z.number(),
  createdBy: z.string(),
  createdAt: z.string(),
  votingEndsAt: z.string().optional(),
});

export const RecentActivitySchema = z.object({
  id: z.string(),
  type: z.enum(['proposal', 'vote', 'transaction', 'member']),
  title: z.string(),
  description: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const TransparencyDashboardSchema = z.object({
  metrics: TransparencyMetricsSchema,
  recentProposals: z.array(TransparencyProposalSchema),
  recentTransactions: z.array(TransparencyTransactionSchema),
  recentActivity: z.array(RecentActivitySchema),
  treasuryChart: z.array(ChartDataPointSchema),
  proposalChart: z.array(ChartDataPointSchema),
  votingChart: z.array(ChartDataPointSchema),
  lastUpdated: z.string(),
});

export const WidgetConfigSchema = z.object({
  showHeader: z.boolean().optional(),
  showMetrics: z.boolean().optional(),
  showCharts: z.boolean().optional(),
  showRecentActivity: z.boolean().optional(),
  maxItems: z.number().int().positive().max(50).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  refreshInterval: z.number().int().positive().min(5000).max(300000).optional(),
});

export const EmbedWidgetDataSchema = z.object({
  metrics: TransparencyMetricsSchema,
  recentActivity: z.array(RecentActivitySchema),
  chartData: z.object({
    treasury: z.array(ChartDataPointSchema),
    proposals: z.array(ChartDataPointSchema),
    voting: z.array(ChartDataPointSchema),
  }),
  timestamp: z.string(),
});

// =====================================================
// Helper Functions
// =====================================================

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Get status color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-aurora',
    approved: 'text-green-400',
    rejected: 'text-red-400',
    funded: 'text-gold',
    completed: 'text-blue-400',
  };
  return colors[status] || 'text-gray-400';
}

/**
 * Get status background color
 */
export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'bg-aurora/20',
    approved: 'bg-green-400/20',
    rejected: 'bg-red-400/20',
    funded: 'bg-gold/20',
    completed: 'bg-blue-400/20',
  };
  return colors[status] || 'bg-gray-400/20';
}

/**
 * Get transaction type icon
 */
export function getTransactionIcon(type: string): string {
  const icons: Record<string, string> = {
    deposit: '📥',
    withdrawal: '📤',
    funding: '💰',
    revenue: '💵',
  };
  return icons[type] || '💳';
}

/**
 * Get activity type icon
 */
export function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    proposal: '📋',
    vote: '🗳️',
    transaction: '💸',
    member: '👤',
  };
  return icons[type] || '📌';
}

/**
 * Calculate time ago
 */
export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return past.toLocaleDateString();
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} min${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Generate mock transparency data for development
 */
export function getMockTransparencyData(): TransparencyDashboard {
  return {
    metrics: {
      totalProposals: 49,
      activeProposals: 3,
      fundedProposals: 31,
      totalVotes: 4847,
      uniqueVoters: 487,
      participationRate: 0.67,
      treasuryBalance: 127000,
      totalDeposits: 245000,
      totalWithdrawals: 118000,
      netChange: 2500,
      totalMembers: 2847,
      activeMembers: 342,
      newMembersThisWeek: 12,
      proposalsThisWeek: 5,
      votesThisWeek: 120,
      treasuryActivityThisWeek: 15500,
    },
    recentProposals: [
      {
        id: '1',
        title: 'Fund "Midnight Sessions" Live Album Production',
        description: 'Proposal to allocate $15K from treasury for recording and producing a live album.',
        type: 'funding',
        status: 'active',
        fundingGoal: 15000,
        currentFunding: 12500,
        votesFor: 1847,
        votesAgainst: 234,
        totalVotes: 2081,
        createdBy: 'StudioNYNE',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        votingEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        title: 'Partnership with SoundScape Festival 2026',
        description: 'Establish official partnership for label showcase stage.',
        type: 'partnership',
        status: 'active',
        fundingGoal: 0,
        currentFunding: 0,
        votesFor: 2104,
        votesAgainst: 89,
        totalVotes: 2193,
        createdBy: 'PresidentAnderson',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        votingEndsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    recentTransactions: [
      {
        id: '1',
        type: 'funding',
        amount: -8500,
        description: 'Vinyl Pressing - Vol. 3',
        proposalId: 'prop-045',
        proposalTitle: 'Fund Vinyl Pressing Project',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'revenue',
        amount: 12340,
        description: 'Streaming Q4 2025 Revenue',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'funding',
        amount: -3000,
        description: 'Studio Session Grant',
        proposalId: 'prop-046',
        proposalTitle: 'Artist Studio Grant Program',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    recentActivity: [
      {
        id: '1',
        type: 'proposal',
        title: 'New Proposal Created',
        description: 'Launch Remix Bounty Program',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'vote',
        title: 'Proposal Vote',
        description: 'Community voted on Festival Partnership proposal',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'transaction',
        title: 'Treasury Deposit',
        description: '$5,000 deposited from token sale',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'member',
        title: 'New Members',
        description: '5 new members joined the DAO',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ],
    treasuryChart: [
      { label: 'Week 1', value: 115000, date: '2025-10-01' },
      { label: 'Week 2', value: 120000, date: '2025-10-08' },
      { label: 'Week 3', value: 118000, date: '2025-10-15' },
      { label: 'Week 4', value: 125000, date: '2025-10-22' },
      { label: 'Week 5', value: 127000, date: '2025-10-29' },
    ],
    proposalChart: [
      { label: 'Week 1', value: 8, date: '2025-10-01' },
      { label: 'Week 2', value: 12, date: '2025-10-08' },
      { label: 'Week 3', value: 6, date: '2025-10-15' },
      { label: 'Week 4', value: 10, date: '2025-10-22' },
      { label: 'Week 5', value: 5, date: '2025-10-29' },
    ],
    votingChart: [
      { label: 'Week 1', value: 145, date: '2025-10-01' },
      { label: 'Week 2', value: 189, date: '2025-10-08' },
      { label: 'Week 3', value: 167, date: '2025-10-15' },
      { label: 'Week 4', value: 203, date: '2025-10-22' },
      { label: 'Week 5', value: 120, date: '2025-10-29' },
    ],
    lastUpdated: new Date().toISOString(),
  };
}
