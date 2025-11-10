import { createClient } from '@supabase/supabase-js';
import { WeeklyStats, WeeklyStatsSchema } from '../schemas/digest';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// =====================================================
// Weekly Stats Calculation
// =====================================================

/**
 * Calculate comprehensive weekly statistics for DAO activity
 * @param weekStart - Start date of the week (YYYY-MM-DD)
 * @param weekEnd - End date of the week (YYYY-MM-DD)
 * @returns WeeklyStats object with all metrics
 */
export async function calculateWeeklyStats(
  weekStart: string,
  weekEnd: string
): Promise<WeeklyStats> {
  try {
    // Call the database function to get aggregated stats
    const { data, error } = await supabase.rpc('get_weekly_dao_stats', {
      p_week_start: weekStart,
      p_week_end: weekEnd,
    });

    if (error) {
      console.error('Error fetching weekly stats:', error);
      throw new Error(`Failed to fetch weekly stats: ${error.message}`);
    }

    // Add week range to the data
    const statsWithWeek = {
      ...data,
      week_start: weekStart,
      week_end: weekEnd,
    };

    // Validate the response
    const validatedStats = WeeklyStatsSchema.parse(statsWithWeek);

    return validatedStats;
  } catch (error) {
    console.error('Error calculating weekly stats:', error);
    throw error;
  }
}

/**
 * Get detailed proposal breakdown for the week
 */
export async function getProposalDetails(weekStart: string, weekEnd: string) {
  try {
    const { data: proposals, error } = await supabase
      .from('dao_proposals')
      .select('*')
      .gte('created_at', weekStart)
      .lte('created_at', weekEnd)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposal details:', error);
      return [];
    }

    return proposals || [];
  } catch (error) {
    console.error('Error in getProposalDetails:', error);
    return [];
  }
}

/**
 * Get top voters for the week
 */
export async function getTopVoters(weekStart: string, weekEnd: string, limit: number = 5) {
  try {
    const { data: voters, error } = await supabase
      .from('dao_votes')
      .select('voter_address, voter_name')
      .gte('created_at', weekStart)
      .lte('created_at', weekEnd);

    if (error) {
      console.error('Error fetching voters:', error);
      return [];
    }

    // Count votes per voter
    const voterCounts = (voters || []).reduce((acc: any, vote: any) => {
      const address = vote.voter_address;
      if (!acc[address]) {
        acc[address] = {
          address,
          name: vote.voter_name,
          vote_count: 0,
        };
      }
      acc[address].vote_count++;
      return acc;
    }, {});

    // Sort by vote count and return top N
    return Object.values(voterCounts)
      .sort((a: any, b: any) => b.vote_count - a.vote_count)
      .slice(0, limit);
  } catch (error) {
    console.error('Error in getTopVoters:', error);
    return [];
  }
}

/**
 * Get largest treasury transactions for the week
 */
export async function getLargestTransactions(weekStart: string, weekEnd: string, limit: number = 5) {
  try {
    const { data: transactions, error } = await supabase
      .from('dao_treasury')
      .select('*')
      .gte('created_at', weekStart)
      .lte('created_at', weekEnd)
      .order('amount', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return transactions || [];
  } catch (error) {
    console.error('Error in getLargestTransactions:', error);
    return [];
  }
}

/**
 * Get new members for the week
 */
export async function getNewMembers(weekStart: string, weekEnd: string) {
  try {
    const { data: members, error } = await supabase
      .from('dao_members')
      .select('*')
      .gte('joined_at', weekStart)
      .lte('joined_at', weekEnd)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching new members:', error);
      return [];
    }

    return members || [];
  } catch (error) {
    console.error('Error in getNewMembers:', error);
    return [];
  }
}

/**
 * Generate highlights from weekly activity
 * This creates a list of notable events and achievements
 */
export async function generateHighlights(
  weekStart: string,
  weekEnd: string,
  stats: WeeklyStats
): Promise<string[]> {
  const highlights: string[] = [];

  try {
    // Voting participation highlight
    if (stats.voting.participation_rate > 0.5) {
      highlights.push(
        `Record voter turnout at ${Math.round(stats.voting.participation_rate * 100)}%`
      );
    } else if (stats.voting.participation_rate > 0.3) {
      highlights.push(
        `Strong community engagement with ${stats.voting.unique_voters} unique voters`
      );
    }

    // Proposal funding highlight
    if (stats.proposals.funded > 0) {
      const totalFunding = stats.proposals.total_funding;
      highlights.push(
        `${stats.proposals.funded} artist grant${stats.proposals.funded > 1 ? 's' : ''} approved totaling ${formatCurrency(totalFunding)}`
      );
    }

    // Treasury growth highlight
    if (stats.treasury.net_change > 0) {
      highlights.push(
        `Treasury grew by ${formatCurrency(stats.treasury.net_change)} this week`
      );
    } else if (stats.treasury.net_change < 0) {
      highlights.push(
        `${formatCurrency(Math.abs(stats.treasury.net_change))} deployed to fund community projects`
      );
    }

    // New member highlight
    if (stats.members.new_members > 10) {
      highlights.push(
        `Welcomed ${stats.members.new_members} new members to the community`
      );
    }

    // Get specific notable events
    const proposals = await getProposalDetails(weekStart, weekEnd);
    const fundedProposals = proposals.filter((p: any) => p.status === 'funded');

    // Add highlights for notable funded proposals
    fundedProposals.slice(0, 2).forEach((proposal: any) => {
      if (proposal.title) {
        highlights.push(`${proposal.title} proposal funded`);
      }
    });

    // If we have less than 3 highlights, add more generic ones
    if (highlights.length < 3) {
      if (stats.proposals.new > 0) {
        highlights.push(`${stats.proposals.new} new proposals submitted for community review`);
      }
      if (stats.voting.votes_cast > 50) {
        highlights.push(`Community cast ${stats.voting.votes_cast} votes on active proposals`);
      }
    }

    // Return up to 5 highlights
    return highlights.slice(0, 5);
  } catch (error) {
    console.error('Error generating highlights:', error);
    // Return basic highlights based on stats
    return [
      `${stats.proposals.new} new proposals submitted`,
      `${stats.voting.votes_cast} votes cast by ${stats.voting.unique_voters} members`,
      `Treasury balance change: ${formatCurrency(stats.treasury.net_change)}`,
    ];
  }
}

/**
 * Get comparison with previous week
 */
export async function getWeekOverWeekComparison(
  currentWeekStart: string,
  currentWeekEnd: string
): Promise<{
  current: WeeklyStats;
  previous: WeeklyStats;
  changes: {
    proposals: number;
    votes: number;
    participation: number;
    treasuryChange: number;
    newMembers: number;
  };
}> {
  // Calculate current week stats
  const current = await calculateWeeklyStats(currentWeekStart, currentWeekEnd);

  // Calculate previous week dates
  const currentStart = new Date(currentWeekStart);
  const previousStart = new Date(currentStart);
  previousStart.setDate(currentStart.getDate() - 7);

  const previousEnd = new Date(previousStart);
  previousEnd.setDate(previousStart.getDate() + 6);

  const previousWeekStart = previousStart.toISOString().split('T')[0];
  const previousWeekEnd = previousEnd.toISOString().split('T')[0];

  // Calculate previous week stats
  const previous = await calculateWeeklyStats(previousWeekStart, previousWeekEnd);

  // Calculate changes
  const changes = {
    proposals: current.proposals.new - previous.proposals.new,
    votes: current.voting.votes_cast - previous.voting.votes_cast,
    participation: current.voting.participation_rate - previous.voting.participation_rate,
    treasuryChange: current.treasury.net_change - previous.treasury.net_change,
    newMembers: current.members.new_members - previous.members.new_members,
  };

  return { current, previous, changes };
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Format currency for display
 */
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(2)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Get week-over-week trend emoji
 */
export function getTrendEmoji(change: number): string {
  if (change > 10) return '📈'; // Significant increase
  if (change > 0) return '↗️'; // Slight increase
  if (change === 0) return '➡️'; // No change
  if (change > -10) return '↘️'; // Slight decrease
  return '📉'; // Significant decrease
}

/**
 * Validate that tables exist before querying
 */
export async function validateDatabaseTables(): Promise<{
  proposals: boolean;
  votes: boolean;
  treasury: boolean;
  members: boolean;
}> {
  const tables = {
    proposals: false,
    votes: false,
    treasury: false,
    members: false,
  };

  try {
    // Check if dao_proposals table exists
    const { error: proposalsError } = await supabase
      .from('dao_proposals')
      .select('id')
      .limit(1);

    tables.proposals = !proposalsError;

    // Check if dao_votes table exists
    const { error: votesError } = await supabase.from('dao_votes').select('id').limit(1);

    tables.votes = !votesError;

    // Check if dao_treasury table exists
    const { error: treasuryError } = await supabase
      .from('dao_treasury')
      .select('id')
      .limit(1);

    tables.treasury = !treasuryError;

    // Check if dao_members table exists
    const { error: membersError } = await supabase
      .from('dao_members')
      .select('id')
      .limit(1);

    tables.members = !membersError;
  } catch (error) {
    console.error('Error validating database tables:', error);
  }

  return tables;
}

/**
 * Get mock data for testing when tables don't exist
 */
export function getMockWeeklyStats(weekStart: string, weekEnd: string): WeeklyStats {
  return {
    week_start: weekStart,
    week_end: weekEnd,
    proposals: {
      new: 5,
      approved: 3,
      rejected: 1,
      funded: 2,
      total_funding: 12500,
    },
    voting: {
      votes_cast: 120,
      unique_voters: 45,
      participation_rate: 0.62,
      avg_votes_per_proposal: 24,
    },
    treasury: {
      deposits: 5000,
      withdrawals: 2500,
      net_change: 2500,
      ending_balance: 127000,
    },
    members: {
      new_members: 12,
      total_members: 2847,
      active_members: 342,
    },
  };
}
