import { supabase } from './client';
import {
  MembershipTier,
  ProposalCreate,
  ProposalUpdate,
  ProposalFilter,
  Vote,
  VoteHistoryFilter,
  getVoteWeight,
  CommentCreate,
  CommentUpdate,
} from '../schemas/dao';

// =============================================
// TYPE DEFINITIONS
// =============================================

export interface DAOMember {
  wallet_address: string;
  membership_tier: MembershipTier;
  tier_display_name: string | null;
  votes_cast: number;
  proposals_created: number;
  total_funding_received: number;
  is_active: boolean;
  joined_at: string;
  last_active_at: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  discord_handle: string | null;
}

export interface DAOProposal {
  id: string;
  title: string;
  description: string;
  proposal_type: string;
  funding_goal: number | null;
  current_funding: number;
  funding_currency: string;
  created_by: string;
  status: string;
  voting_ends_at: string;
  quorum_required: number;
  approval_threshold: number;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  total_vote_weight: number;
  unique_voters: number;
  voting_result: string | null;
  voting_closed_at: string | null;
  linked_session_id: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  tags: string[] | null;
  attachment_urls: string[] | null;
  admin_notes: string | null;
}

export interface DAOVote {
  id: string;
  proposal_id: string;
  voter_wallet: string;
  vote_type: 'for' | 'against' | 'abstain';
  vote_weight: number;
  membership_tier_at_vote: string;
  signature: string | null;
  signature_verified: boolean;
  voted_at: string;
  comment: string | null;
}

export interface ProposalWithStats extends DAOProposal {
  creator_display_name: string | null;
  creator_tier: string;
  is_voting_active: boolean;
  hours_remaining: number | null;
  funding_percentage: number;
  approval_percentage: number;
}

export interface VoteResults {
  total_votes_for: number;
  total_votes_against: number;
  total_votes_abstain: number;
  total_weight_for: number;
  total_weight_against: number;
  total_weight_abstain: number;
  unique_voters_count: number;
  approval_percentage: number;
  quorum_met: boolean;
  result: string;
}

// =============================================
// MEMBER OPERATIONS
// =============================================

/**
 * Register a new DAO member
 */
export async function registerMember(
  walletAddress: string,
  membershipTier: MembershipTier,
  additionalData?: Partial<DAOMember>
) {
  const { data, error } = await supabase
    .from('dao_members')
    .insert({
      wallet_address: walletAddress,
      membership_tier: membershipTier,
      tier_display_name: additionalData?.tier_display_name || null,
      display_name: additionalData?.display_name || null,
      bio: additionalData?.bio || null,
      avatar_url: additionalData?.avatar_url || null,
      email: additionalData?.email || null,
      discord_handle: additionalData?.discord_handle || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error registering member:', error);
    throw error;
  }

  return data as DAOMember;
}

/**
 * Get member by wallet address
 */
export async function getMember(walletAddress: string) {
  const { data, error } = await supabase
    .from('dao_members')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Error fetching member:', error);
    throw error;
  }

  return data as DAOMember;
}

/**
 * Update member profile
 */
export async function updateMemberProfile(
  walletAddress: string,
  updates: Partial<DAOMember>
) {
  const { data, error } = await supabase
    .from('dao_members')
    .update({
      display_name: updates.display_name,
      bio: updates.bio,
      avatar_url: updates.avatar_url,
      email: updates.email,
      discord_handle: updates.discord_handle,
    })
    .eq('wallet_address', walletAddress)
    .select()
    .single();

  if (error) {
    console.error('Error updating member profile:', error);
    throw error;
  }

  return data as DAOMember;
}

/**
 * Get all active members
 */
export async function getActiveMembers() {
  const { data, error } = await supabase
    .from('dao_members')
    .select('*')
    .eq('is_active', true)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching active members:', error);
    throw error;
  }

  return data as DAOMember[];
}

/**
 * Get member statistics
 */
export async function getMemberStats(walletAddress: string) {
  const member = await getMember(walletAddress);
  if (!member) return null;

  const voteWeight = getVoteWeight(member.membership_tier);

  return {
    walletAddress: member.wallet_address,
    membershipTier: member.membership_tier,
    votesCast: member.votes_cast,
    proposalsCreated: member.proposals_created,
    totalFundingReceived: member.total_funding_received,
    voteWeight,
    memberSince: new Date(member.joined_at),
    lastActive: new Date(member.last_active_at),
  };
}

// =============================================
// PROPOSAL OPERATIONS
// =============================================

/**
 * Create a new proposal (draft state)
 */
export async function createProposal(proposal: ProposalCreate) {
  const { data, error } = await supabase
    .from('dao_proposals')
    .insert({
      title: proposal.title,
      description: proposal.description,
      proposal_type: proposal.proposalType,
      funding_goal: proposal.fundingGoal || null,
      funding_currency: proposal.fundingCurrency,
      created_by: proposal.createdBy,
      voting_ends_at: proposal.votingEndsAt.toISOString(),
      quorum_required: proposal.quorumRequired,
      approval_threshold: proposal.approvalThreshold,
      linked_session_id: proposal.linkedSessionId || null,
      tags: proposal.tags || null,
      attachment_urls: proposal.attachmentUrls || null,
      status: 'draft',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating proposal:', error);
    throw error;
  }

  return data as DAOProposal;
}

/**
 * Submit proposal for voting
 */
export async function submitProposal(proposalId: string, walletAddress: string) {
  const { data, error } = await supabase
    .from('dao_proposals')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    .eq('id', proposalId)
    .eq('created_by', walletAddress)
    .eq('status', 'draft')
    .select()
    .single();

  if (error) {
    console.error('Error submitting proposal:', error);
    throw error;
  }

  return data as DAOProposal;
}

/**
 * Start voting on a proposal (admin function)
 */
export async function startVoting(proposalId: string) {
  const { data, error } = await supabase
    .from('dao_proposals')
    .update({
      status: 'active_voting',
    })
    .eq('id', proposalId)
    .eq('status', 'submitted')
    .select()
    .single();

  if (error) {
    console.error('Error starting voting:', error);
    throw error;
  }

  return data as DAOProposal;
}

/**
 * Get proposal by ID
 */
export async function getProposal(proposalId: string) {
  const { data, error } = await supabase
    .from('dao_proposals')
    .select('*')
    .eq('id', proposalId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching proposal:', error);
    throw error;
  }

  return data as DAOProposal;
}

/**
 * Get proposals with filters and pagination
 */
export async function getProposals(filters?: ProposalFilter) {
  let query = supabase.from('dao_proposals').select('*', { count: 'exact' });

  // Apply filters
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.proposalType) {
    query = query.eq('proposal_type', filters.proposalType);
  }

  if (filters?.createdBy) {
    query = query.eq('created_by', filters.createdBy);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  // Apply sorting
  switch (filters?.sortBy) {
    case 'oldest':
      query = query.order('created_at', { ascending: true });
      break;
    case 'most_funded':
      query = query.order('current_funding', { ascending: false });
      break;
    case 'ending_soon':
      query = query.order('voting_ends_at', { ascending: true });
      break;
    case 'most_votes':
      query = query.order('unique_voters', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Apply pagination
  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching proposals:', error);
    throw error;
  }

  return {
    proposals: data as DAOProposal[],
    total: count || 0,
  };
}

/**
 * Get active proposals with statistics
 */
export async function getActiveProposalsWithStats() {
  const { data, error } = await supabase
    .from('active_proposals_with_stats')
    .select('*')
    .order('voting_ends_at', { ascending: true });

  if (error) {
    console.error('Error fetching active proposals with stats:', error);
    throw error;
  }

  return data as ProposalWithStats[];
}

/**
 * Update proposal
 */
export async function updateProposal(
  proposalId: string,
  updates: ProposalUpdate,
  walletAddress: string
) {
  const { data, error } = await supabase
    .from('dao_proposals')
    .update({
      title: updates.title,
      description: updates.description,
      proposal_type: updates.proposalType,
      funding_goal: updates.fundingGoal,
      status: updates.status,
      tags: updates.tags,
      attachment_urls: updates.attachmentUrls,
      admin_notes: updates.adminNotes,
    })
    .eq('id', proposalId)
    .eq('created_by', walletAddress)
    .select()
    .single();

  if (error) {
    console.error('Error updating proposal:', error);
    throw error;
  }

  return data as DAOProposal;
}

/**
 * Cancel proposal
 */
export async function cancelProposal(proposalId: string, walletAddress: string) {
  const { data, error } = await supabase
    .from('dao_proposals')
    .update({ status: 'cancelled' })
    .eq('id', proposalId)
    .eq('created_by', walletAddress)
    .in('status', ['draft', 'submitted'])
    .select()
    .single();

  if (error) {
    console.error('Error cancelling proposal:', error);
    throw error;
  }

  return data as DAOProposal;
}

// =============================================
// VOTING OPERATIONS
// =============================================

/**
 * Check if member can vote on proposal
 */
export async function canMemberVote(walletAddress: string, proposalId: string) {
  const { data, error } = await supabase.rpc('can_member_vote', {
    p_wallet_address: walletAddress,
    p_proposal_id: proposalId,
  });

  if (error) {
    console.error('Error checking vote eligibility:', error);
    throw error;
  }

  return data as boolean;
}

/**
 * Cast a vote on a proposal
 */
export async function castVote(vote: Vote) {
  // Get member to determine vote weight
  const member = await getMember(vote.voterWallet);
  if (!member) {
    throw new Error('Member not found');
  }

  if (!member.is_active) {
    throw new Error('Member is not active');
  }

  const voteWeight = getVoteWeight(member.membership_tier);

  // Insert vote
  const { data, error } = await supabase
    .from('dao_votes')
    .insert({
      proposal_id: vote.proposalId,
      voter_wallet: vote.voterWallet,
      vote_type: vote.voteType,
      vote_weight: voteWeight,
      membership_tier_at_vote: member.membership_tier,
      signature: vote.signature,
      signature_verified: true, // In production, verify signature first
      comment: vote.comment || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error casting vote:', error);
    throw error;
  }

  return data as DAOVote;
}

/**
 * Get vote for a specific proposal and voter
 */
export async function getVote(proposalId: string, voterWallet: string) {
  const { data, error } = await supabase
    .from('dao_votes')
    .select('*')
    .eq('proposal_id', proposalId)
    .eq('voter_wallet', voterWallet)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching vote:', error);
    throw error;
  }

  return data as DAOVote;
}

/**
 * Get all votes for a proposal
 */
export async function getProposalVotes(proposalId: string) {
  const { data, error } = await supabase
    .from('dao_votes')
    .select('*')
    .eq('proposal_id', proposalId)
    .order('voted_at', { ascending: false });

  if (error) {
    console.error('Error fetching proposal votes:', error);
    throw error;
  }

  return data as DAOVote[];
}

/**
 * Get vote history for a member
 */
export async function getVoteHistory(walletAddress: string, filters?: VoteHistoryFilter) {
  let query = supabase
    .from('member_voting_history')
    .select('*')
    .eq('voter_wallet', walletAddress);

  if (filters?.proposalId) {
    query = query.eq('proposal_id', filters.proposalId);
  }

  if (filters?.voteType) {
    query = query.eq('vote_type', filters.voteType);
  }

  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching vote history:', error);
    throw error;
  }

  return data;
}

/**
 * Calculate proposal results
 */
export async function calculateProposalResults(proposalId: string) {
  const { data, error } = await supabase.rpc('calculate_proposal_results', {
    p_proposal_id: proposalId,
  });

  if (error) {
    console.error('Error calculating proposal results:', error);
    throw error;
  }

  return data as VoteResults[];
}

/**
 * Close proposal voting
 */
export async function closeProposalVoting(proposalId: string) {
  const { data, error } = await supabase.rpc('close_proposal_voting', {
    p_proposal_id: proposalId,
  });

  if (error) {
    console.error('Error closing proposal voting:', error);
    throw error;
  }

  return data;
}

// =============================================
// COMMENT OPERATIONS
// =============================================

/**
 * Add comment to proposal
 */
export async function addComment(comment: CommentCreate) {
  const { data, error } = await supabase
    .from('proposal_comments')
    .insert({
      proposal_id: comment.proposalId,
      commenter_wallet: comment.commenterWallet,
      comment_text: comment.commentText,
      parent_comment_id: comment.parentCommentId || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }

  return data;
}

/**
 * Get comments for proposal
 */
export async function getProposalComments(proposalId: string) {
  const { data, error } = await supabase
    .from('proposal_comments')
    .select('*')
    .eq('proposal_id', proposalId)
    .eq('deleted', false)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }

  return data;
}

/**
 * Update comment
 */
export async function updateComment(
  commentId: string,
  updates: CommentUpdate,
  walletAddress: string
) {
  const { data, error } = await supabase
    .from('proposal_comments')
    .update({
      comment_text: updates.commentText,
      edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('commenter_wallet', walletAddress)
    .select()
    .single();

  if (error) {
    console.error('Error updating comment:', error);
    throw error;
  }

  return data;
}

/**
 * Delete comment (soft delete)
 */
export async function deleteComment(commentId: string, walletAddress: string) {
  const { data, error } = await supabase
    .from('proposal_comments')
    .update({ deleted: true })
    .eq('id', commentId)
    .eq('commenter_wallet', walletAddress)
    .select()
    .single();

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }

  return data;
}

// =============================================
// STATISTICS OPERATIONS
// =============================================

/**
 * Get DAO statistics
 */
export async function getDAOStats() {
  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: totalProposals },
    { count: activeProposals },
    { count: approvedProposals },
    { count: rejectedProposals },
  ] = await Promise.all([
    supabase.from('dao_members').select('*', { count: 'exact', head: true }),
    supabase.from('dao_members').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('dao_proposals').select('*', { count: 'exact', head: true }),
    supabase
      .from('dao_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active_voting'),
    supabase
      .from('dao_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved'),
    supabase
      .from('dao_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'rejected'),
  ]);

  // Get funding stats
  const { data: fundingData } = await supabase
    .from('dao_proposals')
    .select('funding_goal, current_funding, status');

  const totalFundingRequested =
    fundingData?.reduce((sum, p) => sum + (p.funding_goal || 0), 0) || 0;
  const totalFundingApproved =
    fundingData
      ?.filter((p) => p.status === 'approved' || p.status === 'funded')
      .reduce((sum, p) => sum + (p.current_funding || 0), 0) || 0;

  // Get vote stats
  const { count: totalVotesCast } = await supabase
    .from('dao_votes')
    .select('*', { count: 'exact', head: true });

  // Calculate average voter participation
  const averageVoterParticipation =
    activeProposals && activeMembers
      ? Math.round((totalVotesCast || 0) / (activeProposals * activeMembers) * 100)
      : 0;

  return {
    totalMembers: totalMembers || 0,
    activeMembers: activeMembers || 0,
    totalProposals: totalProposals || 0,
    activeProposals: activeProposals || 0,
    approvedProposals: approvedProposals || 0,
    rejectedProposals: rejectedProposals || 0,
    totalFundingRequested,
    totalFundingApproved,
    totalVotesCast: totalVotesCast || 0,
    averageVoterParticipation,
  };
}
