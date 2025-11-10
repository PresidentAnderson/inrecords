import { NextRequest, NextResponse } from 'next/server';
import {
  EmbedWidgetData,
  EmbedWidgetDataSchema,
  TransparencyMetrics,
  RecentActivity,
  ChartDataPoint,
  getMockTransparencyData,
} from '@/lib/types/transparency';

// =====================================================
// GET /api/embed/transparency
// Returns transparency data for embedding in external sites
// =====================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Optional parameters for customization
    const maxItems = parseInt(searchParams.get('maxItems') || '5');
    const includeCharts = searchParams.get('charts') !== 'false';
    const includeActivity = searchParams.get('activity') !== 'false';

    // Get transparency data
    // In production, this would fetch from Supabase
    const dashboardData = getMockTransparencyData();

    // Build embed widget data
    const embedData: EmbedWidgetData = {
      metrics: dashboardData.metrics,
      recentActivity: includeActivity
        ? dashboardData.recentActivity.slice(0, maxItems)
        : [],
      chartData: includeCharts
        ? {
            treasury: dashboardData.treasuryChart,
            proposals: dashboardData.proposalChart,
            voting: dashboardData.votingChart,
          }
        : {
            treasury: [],
            proposals: [],
            voting: [],
          },
      timestamp: new Date().toISOString(),
    };

    // Validate response
    const validatedData = EmbedWidgetDataSchema.parse(embedData);

    // Return with CORS headers for embedding
    return NextResponse.json(validatedData, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error generating embed data:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate embed data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// =====================================================
// OPTIONS /api/embed/transparency
// Handle CORS preflight requests
// =====================================================

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

// =====================================================
// Helper: Fetch Real Transparency Data (Production)
// =====================================================

/**
 * This would be the production implementation that fetches from Supabase
 * Currently commented out as it requires proper Supabase setup
 */
/*
async function fetchTransparencyData(): Promise<{
  metrics: TransparencyMetrics;
  recentActivity: RecentActivity[];
  chartData: {
    treasury: ChartDataPoint[];
    proposals: ChartDataPoint[];
    voting: ChartDataPoint[];
  };
}> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Fetch metrics
  const metrics = await fetchMetrics(supabase);

  // Fetch recent activity
  const recentActivity = await fetchRecentActivity(supabase);

  // Fetch chart data (last 30 days)
  const chartData = await fetchChartData(supabase);

  return {
    metrics,
    recentActivity,
    chartData,
  };
}

async function fetchMetrics(supabase: any): Promise<TransparencyMetrics> {
  // Get current week dates
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);

  // Fetch proposal metrics
  const { data: proposalData } = await supabase
    .from('dao_proposals')
    .select('status, funding_goal, current_funding');

  const totalProposals = proposalData?.length || 0;
  const activeProposals = proposalData?.filter((p: any) => p.status === 'active').length || 0;
  const fundedProposals = proposalData?.filter((p: any) => p.status === 'funded').length || 0;

  // Fetch voting metrics
  const { data: voteData } = await supabase
    .from('dao_votes')
    .select('voter_address');

  const totalVotes = voteData?.length || 0;
  const uniqueVoters = new Set(voteData?.map((v: any) => v.voter_address)).size;

  // Fetch member metrics
  const { data: memberData } = await supabase
    .from('dao_members')
    .select('id, joined_at');

  const totalMembers = memberData?.length || 0;
  const newMembersThisWeek = memberData?.filter(
    (m: any) => new Date(m.joined_at) >= weekStart
  ).length || 0;

  // Fetch treasury metrics
  const { data: treasuryData } = await supabase
    .from('dao_treasury')
    .select('amount, transaction_type, created_at')
    .order('created_at', { ascending: false });

  const totalDeposits = treasuryData
    ?.filter((t: any) => t.transaction_type === 'deposit')
    .reduce((sum: number, t: any) => sum + t.amount, 0) || 0;

  const totalWithdrawals = treasuryData
    ?.filter((t: any) => t.transaction_type === 'withdrawal')
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0) || 0;

  const treasuryBalance = totalDeposits - totalWithdrawals;

  const weekActivity = treasuryData?.filter(
    (t: any) => new Date(t.created_at) >= weekStart
  ) || [];

  const treasuryActivityThisWeek = weekActivity.reduce(
    (sum: number, t: any) => sum + Math.abs(t.amount),
    0
  );

  const netChange = weekActivity.reduce(
    (sum: number, t: any) =>
      sum + (t.transaction_type === 'deposit' ? t.amount : -Math.abs(t.amount)),
    0
  );

  // Calculate participation rate
  const participationRate = totalMembers > 0 ? uniqueVoters / totalMembers : 0;

  return {
    totalProposals,
    activeProposals,
    fundedProposals,
    totalVotes,
    uniqueVoters,
    participationRate,
    treasuryBalance,
    totalDeposits,
    totalWithdrawals,
    netChange,
    totalMembers,
    activeMembers: uniqueVoters,
    newMembersThisWeek,
    proposalsThisWeek: proposalData?.filter(
      (p: any) => new Date(p.created_at) >= weekStart
    ).length || 0,
    votesThisWeek: voteData?.filter(
      (v: any) => new Date(v.voted_at) >= weekStart
    ).length || 0,
    treasuryActivityThisWeek,
  };
}

async function fetchRecentActivity(supabase: any): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  // Fetch recent proposals
  const { data: proposals } = await supabase
    .from('dao_proposals')
    .select('id, title, created_at')
    .order('created_at', { ascending: false })
    .limit(2);

  proposals?.forEach((p: any) => {
    activities.push({
      id: p.id,
      type: 'proposal',
      title: 'New Proposal Created',
      description: p.title,
      timestamp: p.created_at,
    });
  });

  // Fetch recent votes
  const { data: votes } = await supabase
    .from('dao_votes')
    .select('id, proposal_id, voted_at, dao_proposals(title)')
    .order('voted_at', { ascending: false })
    .limit(2);

  votes?.forEach((v: any) => {
    activities.push({
      id: v.id,
      type: 'vote',
      title: 'Proposal Vote',
      description: `Vote cast on ${v.dao_proposals?.title || 'proposal'}`,
      timestamp: v.voted_at,
    });
  });

  // Fetch recent transactions
  const { data: transactions } = await supabase
    .from('dao_treasury')
    .select('id, transaction_type, amount, created_at')
    .order('created_at', { ascending: false })
    .limit(2);

  transactions?.forEach((t: any) => {
    activities.push({
      id: t.id,
      type: 'transaction',
      title: 'Treasury Transaction',
      description: `${t.transaction_type}: ${Math.abs(t.amount)}`,
      timestamp: t.created_at,
    });
  });

  // Sort by timestamp and return
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
}

async function fetchChartData(supabase: any): Promise<{
  treasury: ChartDataPoint[];
  proposals: ChartDataPoint[];
  voting: ChartDataPoint[];
}> {
  const days = 30;
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(now.getDate() - days);

  // Fetch daily treasury balance
  const { data: treasuryData } = await supabase
    .from('dao_treasury')
    .select('amount, transaction_type, created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  // Calculate running balance
  let runningBalance = 0;
  const treasuryByDay: Record<string, number> = {};

  treasuryData?.forEach((t: any) => {
    const date = new Date(t.created_at).toISOString().split('T')[0];
    if (!treasuryByDay[date]) {
      treasuryByDay[date] = runningBalance;
    }
    runningBalance +=
      t.transaction_type === 'deposit' ? t.amount : -Math.abs(t.amount);
    treasuryByDay[date] = runningBalance;
  });

  // Fetch daily proposal counts
  const { data: proposalData } = await supabase
    .from('dao_proposals')
    .select('created_at')
    .gte('created_at', startDate.toISOString());

  const proposalsByDay: Record<string, number> = {};
  proposalData?.forEach((p: any) => {
    const date = new Date(p.created_at).toISOString().split('T')[0];
    proposalsByDay[date] = (proposalsByDay[date] || 0) + 1;
  });

  // Fetch daily vote counts
  const { data: voteData } = await supabase
    .from('dao_votes')
    .select('voted_at')
    .gte('voted_at', startDate.toISOString());

  const votesByDay: Record<string, number> = {};
  voteData?.forEach((v: any) => {
    const date = new Date(v.voted_at).toISOString().split('T')[0];
    votesByDay[date] = (votesByDay[date] || 0) + 1;
  });

  // Convert to chart data (weekly aggregation)
  const weeks = 5;
  const treasury: ChartDataPoint[] = [];
  const proposals: ChartDataPoint[] = [];
  const voting: ChartDataPoint[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const label = `Week ${weeks - i}`;
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    treasury.push({
      label,
      value: treasuryByDay[weekEndStr] || runningBalance,
      date: weekEndStr,
    });

    const weekProposals = Object.entries(proposalsByDay)
      .filter(([date]) => date >= weekStart.toISOString().split('T')[0] && date <= weekEndStr)
      .reduce((sum, [, count]) => sum + count, 0);

    proposals.push({
      label,
      value: weekProposals,
      date: weekEndStr,
    });

    const weekVotes = Object.entries(votesByDay)
      .filter(([date]) => date >= weekStart.toISOString().split('T')[0] && date <= weekEndStr)
      .reduce((sum, [, count]) => sum + count, 0);

    voting.push({
      label,
      value: weekVotes,
      date: weekEndStr,
    });
  }

  return {
    treasury,
    proposals,
    voting,
  };
}
*/
