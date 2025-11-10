/**
 * Treasury Analytics API Route
 * GET /api/treasury/analytics
 *
 * Returns comprehensive analytics including:
 * - DAO analytics (proposals, funding, etc.)
 * - Treasury summary (balance, inflows, outflows)
 * - Funding distribution by proposal type
 *
 * Public endpoint for transparency
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getDAOAnalytics,
  getTreasurySummary,
  getFundingDistribution,
} from '@/lib/supabase/treasury';

export async function GET(request: NextRequest) {
  try {
    // Fetch all analytics in parallel for better performance
    const [daoAnalyticsResult, treasurySummaryResult, fundingDistributionResult] =
      await Promise.all([getDAOAnalytics(), getTreasurySummary(), getFundingDistribution()]);

    // Check for errors
    if (daoAnalyticsResult.error) {
      console.error('Error fetching DAO analytics:', daoAnalyticsResult.error);
      return NextResponse.json(
        {
          error: 'Failed to fetch DAO analytics',
          details: daoAnalyticsResult.error.message,
        },
        { status: 500 }
      );
    }

    if (treasurySummaryResult.error) {
      console.error('Error fetching treasury summary:', treasurySummaryResult.error);
      return NextResponse.json(
        {
          error: 'Failed to fetch treasury summary',
          details: treasurySummaryResult.error.message,
        },
        { status: 500 }
      );
    }

    if (fundingDistributionResult.error) {
      console.error('Error fetching funding distribution:', fundingDistributionResult.error);
      return NextResponse.json(
        {
          error: 'Failed to fetch funding distribution',
          details: fundingDistributionResult.error.message,
        },
        { status: 500 }
      );
    }

    // Combine all analytics
    const analytics = {
      dao: daoAnalyticsResult.data,
      treasury: treasurySummaryResult.data,
      funding_distribution: fundingDistributionResult.data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Exception in treasury analytics endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Enable dynamic rendering and disable caching for real-time data
export const dynamic = 'force-dynamic';
export const revalidate = 0;
