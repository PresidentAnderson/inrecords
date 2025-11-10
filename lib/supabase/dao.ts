/**
 * inRECORD DAO Governance System - Supabase Operations
 * Phase 2: Database operations for proposals and voting
 */

import { createClient } from '@supabase/supabase-js';
import type {
  DAOProposal,
  CreateProposalInput,
  UpdateProposalInput,
  DAOVote,
  CastVoteInput,
  UpdateVoteInput,
  ProposalVoteSummary,
  ProposalStatus,
  ProposalType
} from '../types/dao';

// =====================================================
// Supabase Client Setup
// =====================================================

let supabaseClient: ReturnType<typeof createClient>;

function getSupabase() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

// Export getter for backward compatibility
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  }
});

// =====================================================
// Proposal Operations
// =====================================================

/**
 * Fetch all proposals with optional filtering
 */
export async function getProposals(filters?: {
  status?: ProposalStatus;
  type?: ProposalType;
  limit?: number;
  offset?: number;
}): Promise<{ data: DAOProposal[] | null; error: any }> {
  try {
    let query = (supabase
      .from('dao_proposals') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('proposal_type', filters.type);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching proposals:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching proposals:', error);
    return { data: null, error };
  }
}

/**
 * Fetch a single proposal by ID
 */
export async function getProposal(
  proposalId: string
): Promise<{ data: DAOProposal | null; error: any }> {
  try {
    const { data, error } = await (supabase
      .from('dao_proposals') as any)
      .select('*')
      .eq('id', proposalId)
      .single();

    if (error) {
      console.error('Error fetching proposal:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching proposal:', error);
    return { data: null, error };
  }
}

/**
 * Create a new proposal
 */
export async function createProposal(
  input: CreateProposalInput
): Promise<{ data: DAOProposal | null; error: any }> {
  try {
    const { data, error } = await (supabase
      .from('dao_proposals') as any)
      .insert({
        title: input.title,
        description: input.description,
        proposal_type: input.proposal_type,
        funding_goal: input.funding_goal || null,
        created_by: input.created_by,
        voting_ends_at: input.voting_ends_at,
        status: 'active',
        metadata: input.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating proposal:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating proposal:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing proposal
 */
export async function updateProposal(
  proposalId: string,
  input: UpdateProposalInput
): Promise<{ data: DAOProposal | null; error: any }> {
  try {
    const { data, error } = await (supabase
      .from('dao_proposals') as any)
      .update(input)
      .eq('id', proposalId)
      .select()
      .single();

    if (error) {
      console.error('Error updating proposal:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating proposal:', error);
    return { data: null, error };
  }
}

/**
 * Delete a proposal (soft delete by setting status to cancelled)
 */
export async function deleteProposal(
  proposalId: string
): Promise<{ success: boolean; error: any }> {
  try {
    const { error } = await (supabase
      .from('dao_proposals') as any)
      .update({ status: 'cancelled' })
      .eq('id', proposalId);

    if (error) {
      console.error('Error deleting proposal:', error);
      return { success: false, error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Unexpected error deleting proposal:', error);
    return { success: false, error };
  }
}

// =====================================================
// Vote Operations
// =====================================================

/**
 * Cast a vote on a proposal
 */
export async function castVote(
  input: CastVoteInput
): Promise<{ data: DAOVote | null; error: any }> {
  try {
    // Check if user has already voted
    const { data: existingVote } = await (supabase
      .from('dao_votes') as any)
      .select('*')
      .eq('proposal_id', input.proposal_id)
      .eq('voter_wallet', input.voter_wallet)
      .single();

    if (existingVote) {
      // Update existing vote
      return updateVote(existingVote.id, {
        vote_type: input.vote_type,
        vote_weight: input.vote_weight,
        metadata: input.metadata
      });
    }

    // Insert new vote
    const { data, error } = await (supabase
      .from('dao_votes') as any)
      .insert({
        proposal_id: input.proposal_id,
        voter_wallet: input.voter_wallet,
        vote_weight: input.vote_weight,
        vote_type: input.vote_type,
        metadata: input.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Error casting vote:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error casting vote:', error);
    return { data: null, error };
  }
}

/**
 * Update an existing vote
 */
export async function updateVote(
  voteId: string,
  input: UpdateVoteInput
): Promise<{ data: DAOVote | null; error: any }> {
  try {
    const { data, error } = await (supabase
      .from('dao_votes') as any)
      .update(input)
      .eq('id', voteId)
      .select()
      .single();

    if (error) {
      console.error('Error updating vote:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating vote:', error);
    return { data: null, error };
  }
}

/**
 * Get votes for a specific proposal
 */
export async function getProposalVotes(
  proposalId: string
): Promise<{ data: DAOVote[] | null; error: any }> {
  try {
    const { data, error } = await (supabase
      .from('dao_votes') as any)
      .select('*')
      .eq('proposal_id', proposalId)
      .order('voted_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposal votes:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching proposal votes:', error);
    return { data: null, error };
  }
}

/**
 * Get vote history for a specific wallet
 */
export async function getVoterHistory(
  voterWallet: string
): Promise<{ data: DAOVote[] | null; error: any }> {
  try {
    const { data, error } = await (supabase
      .from('dao_votes') as any)
      .select('*, dao_proposals(*)')
      .eq('voter_wallet', voterWallet)
      .order('voted_at', { ascending: false });

    if (error) {
      console.error('Error fetching voter history:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching voter history:', error);
    return { data: null, error };
  }
}

/**
 * Check if a wallet has voted on a proposal
 */
export async function hasVoted(
  proposalId: string,
  voterWallet: string
): Promise<{ voted: boolean; vote: DAOVote | null; error: any }> {
  try {
    const { data, error } = await (supabase
      .from('dao_votes') as any)
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('voter_wallet', voterWallet)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is expected
      console.error('Error checking vote status:', error);
      return { voted: false, vote: null, error };
    }

    return { voted: !!data, vote: data, error: null };
  } catch (error) {
    console.error('Unexpected error checking vote status:', error);
    return { voted: false, vote: null, error };
  }
}

// =====================================================
// Vote Summary Operations
// =====================================================

/**
 * Get vote summary for a proposal
 */
export async function getProposalVoteSummary(
  proposalId: string
): Promise<{ data: ProposalVoteSummary | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('proposal_vote_summary')
      .select('*')
      .eq('id', proposalId)
      .single();

    if (error) {
      console.error('Error fetching vote summary:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching vote summary:', error);
    return { data: null, error };
  }
}

/**
 * Get vote summaries for all proposals
 */
export async function getAllVoteSummaries(): Promise<{
  data: ProposalVoteSummary[] | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from('proposal_vote_summary')
      .select('*')
      .order('voting_ends_at', { ascending: false });

    if (error) {
      console.error('Error fetching vote summaries:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching vote summaries:', error);
    return { data: null, error };
  }
}

// =====================================================
// Dashboard & Analytics Operations
// =====================================================

/**
 * Get DAO analytics overview
 */
export async function getDAOAnalytics(): Promise<{
  data: {
    total_proposals: number;
    active_proposals: number;
    total_votes: number;
    unique_voters: number;
    passed_proposals: number;
    rejected_proposals: number;
  } | null;
  error: any;
}> {
  try {
    // Get proposal counts
    const { data: proposals, error: proposalError } = await (supabase
      .from('dao_proposals') as any)
      .select('status');

    if (proposalError) throw proposalError;

    // Get vote counts
    const { data: votes, error: voteError } = await (supabase
      .from('dao_votes') as any)
      .select('voter_wallet');

    if (voteError) throw voteError;

    const analytics = {
      total_proposals: proposals?.length || 0,
      active_proposals: proposals?.filter((p: any) => p.status === 'active').length || 0,
      total_votes: votes?.length || 0,
      unique_voters: new Set(votes?.map((v: any) => v.voter_wallet) || []).size,
      passed_proposals: proposals?.filter((p: any) => p.status === 'passed').length || 0,
      rejected_proposals: proposals?.filter((p: any) => p.status === 'rejected').length || 0
    };

    return { data: analytics, error: null };
  } catch (error) {
    console.error('Error fetching DAO analytics:', error);
    return { data: null, error };
  }
}

/**
 * Get trending proposals (most voted in last 7 days)
 */
export async function getTrendingProposals(
  limit: number = 5
): Promise<{ data: DAOProposal[] | null; error: any }> {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await (supabase
      .from('dao_proposals') as any)
      .select(`
        *,
        dao_votes (count)
      `)
      .eq('status', 'active')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('dao_votes.count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching trending proposals:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching trending proposals:', error);
    return { data: null, error };
  }
}

// =====================================================
// Real-time Subscriptions
// =====================================================

/**
 * Subscribe to proposal updates
 */
export function subscribeToProposals(
  callback: (payload: any) => void
) {
  return supabase
    .channel('dao_proposals_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'dao_proposals'
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to vote updates for a specific proposal
 */
export function subscribeToProposalVotes(
  proposalId: string,
  callback: (payload: any) => void
) {
  return supabase
    .channel(`proposal_votes_${proposalId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'dao_votes',
        filter: `proposal_id=eq.${proposalId}`
      },
      callback
    )
    .subscribe();
}
