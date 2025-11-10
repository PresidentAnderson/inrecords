import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// Types & Interfaces
// =====================================================

export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface Member {
  id: string;
  wallet_address: string;
  email?: string;
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  membership_tier: MembershipTier;
  token_balance: number;
  card_number?: string;
  card_image_url?: string;
  card_issued_at?: string;
  joined_at: string;
  last_activity_at: string;
  last_login_at?: string;
  total_votes_cast: number;
  total_proposals_created: number;
  total_contributions_usd: number;
  email_notifications: boolean;
  discord_notifications: boolean;
  preferred_language: 'en' | 'fr' | 'pt';
  metadata?: any;
}

export interface MemberDashboardData {
  member: Member;
  recent_votes: RecentVote[];
  recent_proposals: RecentProposal[];
  recent_activity: RecentActivity[];
  stats: MemberStats;
}

export interface RecentVote {
  id: string;
  proposal_id: string;
  proposal_title: string;
  vote_type: 'for' | 'against' | 'abstain';
  created_at: string;
}

export interface RecentProposal {
  id: string;
  title: string;
  status: string;
  votes_for: number;
  votes_against: number;
  created_at: string;
}

export interface RecentActivity {
  activity_type: string;
  activity_description: string;
  created_at: string;
}

export interface MemberStats {
  vote_participation_rate: number;
  total_active_proposals: number;
  member_rank_by_votes: number;
}

export interface TierBenefits {
  tier: MembershipTier;
  name: string;
  minTokens: number;
  color: string;
  gradient: string;
  benefits: string[];
  features: {
    voting: boolean;
    forumAccess: boolean;
    earlyReleases: boolean;
    stemDownloads: boolean;
    studioTours: boolean;
    artistSessions: boolean;
    producerCredits: boolean;
    advisoryBoard: boolean;
  };
}

// =====================================================
// Tier Configuration
// =====================================================

export const TIER_CONFIG: Record<MembershipTier, TierBenefits> = {
  bronze: {
    tier: 'bronze',
    name: 'Bronze',
    minTokens: 100,
    color: '#CD7F32',
    gradient: 'from-orange-600 to-orange-800',
    benefits: [
      'Vote on proposals',
      'Forum access',
      'Quarterly updates',
      'Basic token-gated content',
    ],
    features: {
      voting: true,
      forumAccess: true,
      earlyReleases: false,
      stemDownloads: false,
      studioTours: false,
      artistSessions: false,
      producerCredits: false,
      advisoryBoard: false,
    },
  },
  silver: {
    tier: 'silver',
    name: 'Silver',
    minTokens: 500,
    color: '#C0C0C0',
    gradient: 'from-gray-400 to-gray-600',
    benefits: [
      'All Bronze perks',
      'Early release access',
      'Monthly AMAs',
      'Exclusive merch discounts',
      'Priority support',
    ],
    features: {
      voting: true,
      forumAccess: true,
      earlyReleases: true,
      stemDownloads: false,
      studioTours: false,
      artistSessions: false,
      producerCredits: false,
      advisoryBoard: false,
    },
  },
  gold: {
    tier: 'gold',
    name: 'Gold',
    minTokens: 1000,
    color: '#D4AF37',
    gradient: 'from-gold to-yellow-600',
    benefits: [
      'All Silver perks',
      'Studio tour access',
      'Stem downloads',
      'VIP event invites',
      'Artist meet & greets',
      'Exclusive NFT drops',
    ],
    features: {
      voting: true,
      forumAccess: true,
      earlyReleases: true,
      stemDownloads: true,
      studioTours: true,
      artistSessions: false,
      producerCredits: false,
      advisoryBoard: false,
    },
  },
  platinum: {
    tier: 'platinum',
    name: 'Platinum',
    minTokens: 5000,
    color: '#0099FF',
    gradient: 'from-aurora to-blue-600',
    benefits: [
      'All Gold perks',
      '1-on-1 artist sessions',
      'Producer credits',
      'Advisory board seat',
      'Revenue sharing',
      'Lifetime access',
    ],
    features: {
      voting: true,
      forumAccess: true,
      earlyReleases: true,
      stemDownloads: true,
      studioTours: true,
      artistSessions: true,
      producerCredits: true,
      advisoryBoard: true,
    },
  },
};

// =====================================================
// Membership Functions
// =====================================================

/**
 * Get tier based on token balance
 */
export function getTierFromTokens(tokenBalance: number): MembershipTier {
  if (tokenBalance >= TIER_CONFIG.platinum.minTokens) return 'platinum';
  if (tokenBalance >= TIER_CONFIG.gold.minTokens) return 'gold';
  if (tokenBalance >= TIER_CONFIG.silver.minTokens) return 'silver';
  return 'bronze';
}

/**
 * Get tier benefits configuration
 */
export function getTierBenefits(tier: MembershipTier): TierBenefits {
  return TIER_CONFIG[tier];
}

/**
 * Get all tiers sorted by minimum tokens
 */
export function getAllTiers(): TierBenefits[] {
  return Object.values(TIER_CONFIG).sort((a, b) => a.minTokens - b.minTokens);
}

/**
 * Check if member has access to a feature
 */
export function hasFeatureAccess(
  tier: MembershipTier,
  feature: keyof TierBenefits['features']
): boolean {
  return TIER_CONFIG[tier].features[feature];
}

/**
 * Calculate tokens needed for next tier
 */
export function tokensToNextTier(currentTokens: number): {
  tokensNeeded: number;
  nextTier: MembershipTier | null;
  currentTier: MembershipTier;
} {
  const currentTier = getTierFromTokens(currentTokens);
  const tiers = getAllTiers();
  const currentIndex = tiers.findIndex((t) => t.tier === currentTier);

  if (currentIndex >= tiers.length - 1) {
    return {
      tokensNeeded: 0,
      nextTier: null,
      currentTier,
    };
  }

  const nextTier = tiers[currentIndex + 1];
  return {
    tokensNeeded: nextTier.minTokens - currentTokens,
    nextTier: nextTier.tier,
    currentTier,
  };
}

// =====================================================
// Database Operations
// =====================================================

/**
 * Get member by wallet address
 */
export async function getMember(walletAddress: string): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('dao_members')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      console.error('Error fetching member:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getMember:', error);
    return null;
  }
}

/**
 * Get member dashboard data
 */
export async function getMemberDashboard(
  walletAddress: string
): Promise<MemberDashboardData | null> {
  try {
    const { data, error } = await supabase.rpc('get_member_dashboard_data', {
      p_wallet_address: walletAddress,
    });

    if (error) {
      console.error('Error fetching dashboard data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getMemberDashboard:', error);
    return null;
  }
}

/**
 * Create new member
 */
export async function createMember(member: {
  wallet_address: string;
  email?: string;
  username?: string;
  display_name?: string;
  token_balance?: number;
}): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('dao_members')
      .insert([member])
      .select()
      .single();

    if (error) {
      console.error('Error creating member:', error);
      return null;
    }

    // Issue membership card
    await issueMembershipCard(member.wallet_address);

    return data;
  } catch (error) {
    console.error('Error in createMember:', error);
    return null;
  }
}

/**
 * Update member profile
 */
export async function updateMemberProfile(
  walletAddress: string,
  updates: Partial<Member>
): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('dao_members')
      .update(updates)
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) {
      console.error('Error updating member:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateMemberProfile:', error);
    return null;
  }
}

/**
 * Update member token balance
 */
export async function updateTokenBalance(
  walletAddress: string,
  newBalance: number
): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('dao_members')
      .update({ token_balance: newBalance })
      .eq('wallet_address', walletAddress)
      .select()
      .single();

    if (error) {
      console.error('Error updating token balance:', error);
      return null;
    }

    // Log tier upgrade if applicable
    const oldTier = getTierFromTokens(data.token_balance - newBalance);
    const newTier = getTierFromTokens(newBalance);

    if (oldTier !== newTier) {
      await logMemberActivity(walletAddress, {
        activity_type: 'tier_upgrade',
        activity_description: `Upgraded from ${oldTier} to ${newTier} tier`,
      });
    }

    return data;
  } catch (error) {
    console.error('Error in updateTokenBalance:', error);
    return null;
  }
}

/**
 * Issue membership card
 */
export async function issueMembershipCard(
  walletAddress: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('issue_membership_card', {
      p_wallet_address: walletAddress,
    });

    if (error) {
      console.error('Error issuing membership card:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in issueMembershipCard:', error);
    return null;
  }
}

/**
 * Log member activity
 */
export async function logMemberActivity(
  walletAddress: string,
  activity: {
    activity_type: string;
    activity_description?: string;
    reference_id?: string;
    reference_type?: string;
    metadata?: any;
  }
): Promise<boolean> {
  try {
    // Get member ID
    const member = await getMember(walletAddress);
    if (!member) return false;

    const { error } = await supabase.from('member_activity_log').insert([
      {
        member_id: member.id,
        member_wallet: walletAddress,
        ...activity,
      },
    ]);

    if (error) {
      console.error('Error logging activity:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in logMemberActivity:', error);
    return false;
  }
}

/**
 * Record member login
 */
export async function recordLogin(walletAddress: string): Promise<boolean> {
  try {
    await updateMemberProfile(walletAddress, {
      last_login_at: new Date().toISOString(),
    });

    await logMemberActivity(walletAddress, {
      activity_type: 'login',
      activity_description: 'Member logged in',
    });

    return true;
  } catch (error) {
    console.error('Error in recordLogin:', error);
    return false;
  }
}

/**
 * Get member voting history
 */
export async function getMemberVotingHistory(
  walletAddress: string,
  limit: number = 20
): Promise<RecentVote[]> {
  try {
    const { data, error } = await supabase
      .from('dao_votes')
      .select(
        `
        id,
        proposal_id,
        vote_type,
        created_at,
        dao_proposals (
          title
        )
      `
      )
      .eq('voter_address', walletAddress)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching voting history:', error);
      return [];
    }

    return (
      data?.map((vote: any) => ({
        id: vote.id,
        proposal_id: vote.proposal_id,
        proposal_title: vote.dao_proposals?.title || 'Unknown Proposal',
        vote_type: vote.vote_type,
        created_at: vote.created_at,
      })) || []
    );
  } catch (error) {
    console.error('Error in getMemberVotingHistory:', error);
    return [];
  }
}

/**
 * Get member proposals
 */
export async function getMemberProposals(
  walletAddress: string,
  limit: number = 20
): Promise<RecentProposal[]> {
  try {
    const { data, error } = await supabase
      .from('dao_proposals')
      .select('id, title, status, votes_for, votes_against, created_at')
      .eq('created_by', walletAddress)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching member proposals:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMemberProposals:', error);
    return [];
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  type: 'votes' | 'proposals' | 'contributions' = 'votes',
  limit: number = 10
): Promise<Member[]> {
  try {
    let orderBy: string;
    switch (type) {
      case 'votes':
        orderBy = 'total_votes_cast';
        break;
      case 'proposals':
        orderBy = 'total_proposals_created';
        break;
      case 'contributions':
        orderBy = 'total_contributions_usd';
        break;
    }

    const { data, error } = await supabase
      .from('dao_members')
      .select('*')
      .order(orderBy, { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    return [];
  }
}

/**
 * Get total member count
 */
export async function getTotalMemberCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('dao_members')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error fetching member count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getTotalMemberCount:', error);
    return 0;
  }
}

/**
 * Get member count by tier
 */
export async function getMemberCountByTier(): Promise<
  Record<MembershipTier, number>
> {
  try {
    const { data, error } = await supabase
      .from('dao_members')
      .select('membership_tier');

    if (error) {
      console.error('Error fetching member tiers:', error);
      return { bronze: 0, silver: 0, gold: 0, platinum: 0 };
    }

    const counts: Record<MembershipTier, number> = {
      bronze: 0,
      silver: 0,
      gold: 0,
      platinum: 0,
    };

    data?.forEach((member: any) => {
      if (member.membership_tier in counts) {
        counts[member.membership_tier as MembershipTier]++;
      }
    });

    return counts;
  } catch (error) {
    console.error('Error in getMemberCountByTier:', error);
    return { bronze: 0, silver: 0, gold: 0, platinum: 0 };
  }
}

// =====================================================
// Authentication Helpers
// =====================================================

/**
 * Check if wallet address is registered
 */
export async function isWalletRegistered(
  walletAddress: string
): Promise<boolean> {
  const member = await getMember(walletAddress);
  return member !== null;
}

/**
 * Get or create member (for auto-registration)
 */
export async function getOrCreateMember(member: {
  wallet_address: string;
  email?: string;
  username?: string;
  display_name?: string;
}): Promise<Member | null> {
  // Check if member exists
  const existing = await getMember(member.wallet_address);
  if (existing) return existing;

  // Create new member
  return await createMember(member);
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Format wallet address for display
 */
export function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format token balance
 */
export function formatTokenBalance(balance: number): string {
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(2)}M`;
  } else if (balance >= 1000) {
    return `${(balance / 1000).toFixed(1)}K`;
  }
  return balance.toString();
}

/**
 * Get tier color class
 */
export function getTierColorClass(tier: MembershipTier): string {
  const config = TIER_CONFIG[tier];
  return `text-[${config.color}]`;
}

/**
 * Validate username
 */
export function isValidUsername(username: string): boolean {
  // Must be 3-20 characters, alphanumeric and underscores only
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
}

/**
 * Generate mock member data (for testing)
 */
export function generateMockMember(
  walletAddress: string,
  tier: MembershipTier = 'bronze'
): Member {
  return {
    id: `mock-${walletAddress}`,
    wallet_address: walletAddress,
    username: `user_${walletAddress.slice(-4)}`,
    display_name: `User ${walletAddress.slice(-4)}`,
    membership_tier: tier,
    token_balance: TIER_CONFIG[tier].minTokens,
    card_number: `INR-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`,
    joined_at: new Date().toISOString(),
    last_activity_at: new Date().toISOString(),
    total_votes_cast: Math.floor(Math.random() * 100),
    total_proposals_created: Math.floor(Math.random() * 10),
    total_contributions_usd: Math.floor(Math.random() * 10000),
    email_notifications: true,
    discord_notifications: true,
    preferred_language: 'en',
  };
}
