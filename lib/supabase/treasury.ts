/**
 * Treasury Operations Library
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Provides functions for managing DAO treasury transactions and analytics
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'proposal_funding'
  | 'grant'
  | 'revenue'
  | 'expense';

export interface TreasuryTransaction {
  id?: string;
  transaction_type: TransactionType;
  amount: number;
  currency?: string;
  proposal_id?: string;
  contributor_wallet?: string;
  recipient_wallet?: string;
  transaction_hash?: string;
  description?: string;
  created_at?: string;
  created_by: string;
  proposal_title?: string;
}

export interface TreasuryBalance {
  current_balance: number;
  currency: string;
}

export interface TreasurySummary {
  total_inflow: number;
  total_outflow: number;
  current_balance: number;
  unique_contributors: number;
  unique_recipients: number;
  total_transactions: number;
  last_transaction_date: string;
  last_updated: string;
}

export interface DAOAnalytics {
  total_proposals: number;
  funded_count: number;
  active_count: number;
  approved_count: number;
  rejected_count: number;
  total_raised: number;
  avg_funding_per_proposal: number;
  unique_proposers: number;
  last_proposal_date: string;
  last_updated: string;
}

export interface FundingDistribution {
  proposal_type: string;
  proposal_count: number;
  total_funding: number;
  avg_funding: number;
  treasury_contribution: number;
  percentage: number;
}

export interface TopContributor {
  contributor_wallet: string;
  total_contributed: number;
  contribution_count: number;
  currency: string;
  last_contribution: string;
}

export interface TransactionFilters {
  transaction_type?: TransactionType;
  currency?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// ============================================================
// TRANSACTION MANAGEMENT
// ============================================================

/**
 * Record a new treasury transaction
 */
export async function recordTransaction(
  transaction: TreasuryTransaction
): Promise<{ data: TreasuryTransaction | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('dao_treasury')
      .insert({
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        currency: transaction.currency || 'ETH',
        proposal_id: transaction.proposal_id,
        contributor_wallet: transaction.contributor_wallet,
        recipient_wallet: transaction.recipient_wallet,
        transaction_hash: transaction.transaction_hash,
        description: transaction.description,
        created_by: transaction.created_by,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording transaction:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception in recordTransaction:', error);
    return { data: null, error };
  }
}

/**
 * Get treasury transaction history with optional filters
 */
export async function getTreasuryHistory(
  filters: TransactionFilters = {}
): Promise<{ data: TreasuryTransaction[] | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('get_treasury_transactions', {
      p_transaction_type: filters.transaction_type || null,
      p_currency: filters.currency || null,
      p_start_date: filters.start_date || null,
      p_end_date: filters.end_date || null,
      p_limit: filters.limit || 50,
      p_offset: filters.offset || 0,
    });

    if (error) {
      console.error('Error fetching treasury history:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception in getTreasuryHistory:', error);
    return { data: null, error };
  }
}

/**
 * Get funding history for a specific proposal
 */
export async function getProposalFundingHistory(
  proposalId: string
): Promise<{ data: TreasuryTransaction[] | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('get_proposal_funding_history', {
      p_proposal_id: proposalId,
    });

    if (error) {
      console.error('Error fetching proposal funding history:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception in getProposalFundingHistory:', error);
    return { data: null, error };
  }
}

// ============================================================
// BALANCE & SUMMARY
// ============================================================

/**
 * Get current treasury balance
 */
export async function getTreasuryBalance(
  currency: string = 'ETH'
): Promise<{ data: number | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('get_treasury_balance', {
      p_currency: currency,
    });

    if (error) {
      console.error('Error fetching treasury balance:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception in getTreasuryBalance:', error);
    return { data: null, error };
  }
}

/**
 * Get treasury summary statistics
 */
export async function getTreasurySummary(): Promise<{
  data: TreasurySummary | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from('treasury_summary')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching treasury summary:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception in getTreasurySummary:', error);
    return { data: null, error };
  }
}

// ============================================================
// ANALYTICS & REPORTING
// ============================================================

/**
 * Get DAO analytics data
 */
export async function getDAOAnalytics(): Promise<{
  data: DAOAnalytics | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from('dao_analytics')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching DAO analytics:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception in getDAOAnalytics:', error);
    return { data: null, error };
  }
}

/**
 * Get funding distribution by proposal type
 */
export async function getFundingDistribution(): Promise<{
  data: FundingDistribution[] | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase.rpc('get_funding_distribution');

    if (error) {
      console.error('Error fetching funding distribution:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception in getFundingDistribution:', error);
    return { data: null, error };
  }
}

/**
 * Get top contributors to the treasury
 */
export async function getTopContributors(
  limit: number = 10
): Promise<{ data: TopContributor[] | null; error: any }> {
  try {
    const { data, error } = await supabase.rpc('get_top_contributors', {
      p_limit: limit,
    });

    if (error) {
      console.error('Error fetching top contributors:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception in getTopContributors:', error);
    return { data: null, error };
  }
}

/**
 * Refresh all materialized views for analytics
 */
export async function refreshAnalytics(): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await supabase.rpc('refresh_dao_analytics');

    if (error) {
      console.error('Error refreshing analytics:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Exception in refreshAnalytics:', error);
    return { success: false, error };
  }
}

// ============================================================
// PROPOSAL FUNDING
// ============================================================

/**
 * Fund a proposal from the treasury
 */
export async function fundProposal(
  proposalId: string,
  amount: number,
  recipientWallet: string,
  transactionHash: string,
  createdBy: string,
  description?: string
): Promise<{ data: TreasuryTransaction | null; error: any }> {
  try {
    const transaction: TreasuryTransaction = {
      transaction_type: 'proposal_funding',
      amount,
      currency: 'ETH',
      proposal_id: proposalId,
      recipient_wallet: recipientWallet,
      transaction_hash: transactionHash,
      description: description || `Funding disbursed for proposal ${proposalId}`,
      created_by: createdBy,
    };

    const result = await recordTransaction(transaction);

    if (result.error) {
      return result;
    }

    // Refresh analytics after funding
    await refreshAnalytics();

    return result;
  } catch (error) {
    console.error('Exception in fundProposal:', error);
    return { data: null, error };
  }
}

// ============================================================
// TIME-SERIES DATA
// ============================================================

/**
 * Get treasury balance over time
 */
export async function getTreasuryBalanceHistory(
  days: number = 30,
  currency: string = 'ETH'
): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('dao_treasury')
      .select('created_at, amount, transaction_type, currency')
      .eq('currency', currency)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching balance history:', error);
      return { data: null, error };
    }

    // Calculate running balance
    let runningBalance = 0;
    const balanceHistory = data.map((tx) => {
      const isInflow = ['deposit', 'revenue'].includes(tx.transaction_type);
      runningBalance += isInflow ? tx.amount : -tx.amount;

      return {
        date: tx.created_at,
        balance: runningBalance,
        amount: tx.amount,
        type: tx.transaction_type,
      };
    });

    return { data: balanceHistory, error: null };
  } catch (error) {
    console.error('Exception in getTreasuryBalanceHistory:', error);
    return { data: null, error };
  }
}

/**
 * Get transaction volume over time
 */
export async function getTransactionVolume(
  days: number = 30,
  currency: string = 'ETH'
): Promise<{ data: any[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('dao_treasury')
      .select('created_at, amount, transaction_type, currency')
      .eq('currency', currency)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching transaction volume:', error);
      return { data: null, error };
    }

    // Group by date
    const volumeByDate = data.reduce((acc: any, tx) => {
      const date = new Date(tx.created_at).toISOString().split('T')[0];
      const isInflow = ['deposit', 'revenue'].includes(tx.transaction_type);

      if (!acc[date]) {
        acc[date] = { date, inflow: 0, outflow: 0, net: 0 };
      }

      if (isInflow) {
        acc[date].inflow += tx.amount;
        acc[date].net += tx.amount;
      } else {
        acc[date].outflow += tx.amount;
        acc[date].net -= tx.amount;
      }

      return acc;
    }, {});

    return { data: Object.values(volumeByDate), error: null };
  } catch (error) {
    console.error('Exception in getTransactionVolume:', error);
    return { data: null, error };
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Validate transaction before recording
 */
export function validateTransaction(transaction: TreasuryTransaction): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!transaction.transaction_type) {
    errors.push('Transaction type is required');
  }

  if (!transaction.amount || transaction.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!transaction.created_by) {
    errors.push('Created by is required');
  }

  // Check transaction-specific requirements
  const inflowTypes: TransactionType[] = ['deposit', 'revenue'];
  const outflowTypes: TransactionType[] = ['withdrawal', 'proposal_funding', 'grant', 'expense'];

  if (inflowTypes.includes(transaction.transaction_type)) {
    if (!transaction.contributor_wallet) {
      errors.push('Contributor wallet is required for inflow transactions');
    }
  }

  if (outflowTypes.includes(transaction.transaction_type)) {
    if (!transaction.recipient_wallet) {
      errors.push('Recipient wallet is required for outflow transactions');
    }
  }

  if (transaction.transaction_type === 'proposal_funding' && !transaction.proposal_id) {
    errors.push('Proposal ID is required for proposal funding transactions');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Format currency amount for display
 */
export function formatCurrency(
  amount: number,
  currency: string = 'ETH',
  decimals: number = 4
): string {
  return `${amount.toFixed(decimals)} ${currency}`;
}

/**
 * Truncate wallet address for display
 */
export function truncateWallet(wallet: string, chars: number = 6): string {
  if (!wallet || wallet.length <= chars * 2) return wallet;
  return `${wallet.slice(0, chars)}...${wallet.slice(-chars)}`;
}

/**
 * Get transaction type color
 */
export function getTransactionTypeColor(type: TransactionType): string {
  const colors: Record<TransactionType, string> = {
    deposit: 'green',
    revenue: 'green',
    withdrawal: 'red',
    proposal_funding: 'blue',
    grant: 'purple',
    expense: 'orange',
  };

  return colors[type] || 'gray';
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export default {
  // Transaction Management
  recordTransaction,
  getTreasuryHistory,
  getProposalFundingHistory,

  // Balance & Summary
  getTreasuryBalance,
  getTreasurySummary,

  // Analytics & Reporting
  getDAOAnalytics,
  getFundingDistribution,
  getTopContributors,
  refreshAnalytics,

  // Proposal Funding
  fundProposal,

  // Time-Series Data
  getTreasuryBalanceHistory,
  getTransactionVolume,

  // Utility Functions
  validateTransaction,
  formatCurrency,
  truncateWallet,
  getTransactionTypeColor,
  calculatePercentageChange,
};
