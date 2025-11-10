/**
 * Treasury Operations
 * Handles all treasury-related database operations
 */

import { supabase } from './client';
import type {
  TreasuryTransaction,
  TreasuryTransactionInsert,
  TreasuryTransactionUpdate,
  DAOAnalytics,
  RecentTransaction,
  MonthlySummary,
  TopContributor,
  ProposalProgress,
  TransactionStats,
} from './types';

// =====================================
// Treasury Transaction Operations
// =====================================

/**
 * Add a new treasury transaction
 */
export async function addTransaction(
  transaction: TreasuryTransactionInsert
): Promise<{ data: TreasuryTransaction | null; error: any }> {
  try {
    const { data, error } = await ((supabase
      .from('dao_treasury') as any)
      .insert(transaction)
      .select()
      .single());

    if (error) throw error;
    return { data: data as TreasuryTransaction, error: null };
  } catch (error) {
    console.error('Error adding transaction:', error);
    return { data: null, error };
  }
}

/**
 * Get all transactions with optional filtering
 */
export async function getTransactions(filters?: {
  type?: string;
  proposal_id?: string;
  limit?: number;
  offset?: number;
}): Promise<{ data: TreasuryTransaction[] | null; error: any }> {
  try {
    let query = supabase
      .from('dao_treasury')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.type) {
      query = query.eq('transaction_type', filters.type);
    }

    if (filters?.proposal_id) {
      query = query.eq('proposal_id', filters.proposal_id);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return { data: null, error };
  }
}

/**
 * Get recent transactions (uses view)
 */
export async function getRecentTransactions(
  limit: number = 100
): Promise<{ data: RecentTransaction[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('recent_treasury_transactions')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return { data: null, error };
  }
}

/**
 * Get a single transaction by ID
 */
export async function getTransactionById(
  id: string
): Promise<{ data: TreasuryTransaction | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('dao_treasury')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return { data: null, error };
  }
}

/**
 * Update a transaction (admin only)
 */
export async function updateTransaction(
  id: string,
  updates: TreasuryTransactionUpdate
): Promise<{ data: TreasuryTransaction | null; error: any }> {
  try {
    const { data, error } = await ((supabase
      .from('dao_treasury') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single());

    if (error) throw error;
    return { data: data as TreasuryTransaction, error: null };
  } catch (error) {
    console.error('Error updating transaction:', error);
    return { data: null, error };
  }
}

/**
 * Delete a transaction (admin only)
 */
export async function deleteTransaction(
  id: string
): Promise<{ error: any }> {
  try {
    const { error } = await supabase
      .from('dao_treasury')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return { error };
  }
}

// =====================================
// Analytics & Statistics
// =====================================

/**
 * Get DAO analytics (from materialized view)
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

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching DAO analytics:', error);
    return { data: null, error };
  }
}

/**
 * Get monthly treasury summary
 */
export async function getMonthlySummary(
  months: number = 12
): Promise<{ data: MonthlySummary[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('monthly_treasury_summary')
      .select('*')
      .limit(months * 5); // 5 transaction types per month max

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    return { data: null, error };
  }
}

/**
 * Get top contributors
 */
export async function getTopContributors(
  limit: number = 50
): Promise<{ data: TopContributor[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('top_contributors')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching top contributors:', error);
    return { data: null, error };
  }
}

/**
 * Get proposal funding progress
 */
export async function getProposalProgress(): Promise<{
  data: ProposalProgress[] | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from('proposal_funding_progress')
      .select('*');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching proposal progress:', error);
    return { data: null, error };
  }
}

/**
 * Get treasury balance using database function
 */
export async function getTreasuryBalance(): Promise<{
  data: number | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase.rpc('get_treasury_balance');

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching treasury balance:', error);
    return { data: null, error };
  }
}

/**
 * Get transaction statistics for a date range
 */
export async function getTransactionStats(
  startDate?: string,
  endDate?: string
): Promise<{ data: TransactionStats[] | null; error: any }> {
  try {
    const { data, error } = await (supabase.rpc('get_transaction_stats', {
      start_date: startDate,
      end_date: endDate,
    } as any) as any);

    if (error) throw error;
    return { data: data as TransactionStats[], error: null };
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    return { data: null, error };
  }
}

// =====================================
// Real-time Subscriptions
// =====================================

/**
 * Subscribe to treasury transactions in real-time
 */
export function subscribeToTransactions(
  callback: (transaction: TreasuryTransaction) => void
) {
  const subscription = supabase
    .channel('treasury_transactions')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'dao_treasury',
      },
      (payload) => {
        callback(payload.new as TreasuryTransaction);
      }
    )
    .subscribe();

  return subscription;
}

/**
 * Subscribe to analytics updates
 */
export function subscribeToAnalytics(
  callback: (analytics: DAOAnalytics) => void
) {
  // Poll for updates since materialized views don't have real-time updates
  const intervalId = setInterval(async () => {
    const { data, error } = await getDAOAnalytics();
    if (data && !error) {
      callback(data);
    }
  }, 5000); // Poll every 5 seconds

  return {
    unsubscribe: () => clearInterval(intervalId),
  };
}

// =====================================
// Batch Operations
// =====================================

/**
 * Add multiple transactions at once
 */
export async function addBatchTransactions(
  transactions: TreasuryTransactionInsert[]
): Promise<{ data: TreasuryTransaction[] | null; error: any }> {
  try {
    const { data, error } = await ((supabase
      .from('dao_treasury') as any)
      .insert(transactions)
      .select());

    if (error) throw error;
    return { data: data as TreasuryTransaction[], error: null };
  } catch (error) {
    console.error('Error adding batch transactions:', error);
    return { data: null, error };
  }
}

/**
 * Get transactions by wallet address
 */
export async function getTransactionsByWallet(
  walletAddress: string
): Promise<{ data: TreasuryTransaction[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('dao_treasury')
      .select('*')
      .eq('contributor_wallet', walletAddress)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching transactions by wallet:', error);
    return { data: null, error };
  }
}

/**
 * Get transactions by proposal ID
 */
export async function getTransactionsByProposal(
  proposalId: string
): Promise<{ data: TreasuryTransaction[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('dao_treasury')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching transactions by proposal:', error);
    return { data: null, error };
  }
}

/**
 * Calculate total by transaction type
 */
export async function getTotalsByType(): Promise<{
  data: Record<string, number> | null;
  error: any;
}> {
  try {
    const { data, error } = await ((supabase
      .from('dao_treasury') as any)
      .select('transaction_type, amount'));

    if (error) throw error;

    const totals = (data as any[]).reduce((acc, transaction) => {
      const type = transaction.transaction_type;
      acc[type] = (acc[type] || 0) + Number(transaction.amount);
      return acc;
    }, {} as Record<string, number>);

    return { data: totals, error: null };
  } catch (error) {
    console.error('Error calculating totals by type:', error);
    return { data: null, error };
  }
}

/**
 * Get transaction count by month for charts
 */
export async function getTransactionCountByMonth(): Promise<{
  data: { month: string; count: number }[] | null;
  error: any;
}> {
  try {
    const { data, error } = await ((supabase
      .from('monthly_treasury_summary') as any)
      .select('month, transaction_count'));

    if (error) throw error;

    // Group by month
    const monthlyData = (data as any[]).reduce((acc, item) => {
      const month = item.month;
      const existing = acc.find((x: any) => x.month === month);
      if (existing) {
        existing.count += Number(item.transaction_count);
      } else {
        acc.push({ month, count: Number(item.transaction_count) });
      }
      return acc;
    }, [] as { month: string; count: number }[]);

    return { data: monthlyData, error: null };
  } catch (error) {
    console.error('Error fetching transaction count by month:', error);
    return { data: null, error };
  }
}
