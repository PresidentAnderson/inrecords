import { NextRequest, NextResponse } from 'next/server';
import { getDAOStats, getMemberStats } from '@/lib/supabase/dao';

/**
 * GET /api/dao/stats
 * Get overall DAO statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('walletAddress');

    // If wallet address is provided, get member-specific stats
    if (walletAddress) {
      const memberStats = await getMemberStats(walletAddress);

      if (!memberStats) {
        return NextResponse.json(
          { error: 'Member not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        type: 'member',
        stats: memberStats,
      });
    }

    // Otherwise, get overall DAO stats
    const daoStats = await getDAOStats();

    return NextResponse.json({
      success: true,
      type: 'dao',
      stats: daoStats,
    });
  } catch (error: any) {
    console.error('Error fetching DAO stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
