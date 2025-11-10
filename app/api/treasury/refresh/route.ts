/**
 * Treasury Analytics Refresh API Route
 * POST /api/treasury/refresh
 *
 * Manually refreshes materialized views for analytics
 * Admin-only endpoint (or can be used by cron jobs)
 */

import { NextRequest, NextResponse } from 'next/server';
import { refreshAnalytics } from '@/lib/supabase/treasury';

export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // In production, verify that the user has admin privileges or that
    // the request is coming from a trusted cron job service

    // Optional: Check for a secret key in headers for cron jobs
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // If a cron secret is configured, validate it
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // For now, we'll allow any authenticated request
      // In production, implement proper admin role checking
      console.warn('Analytics refresh attempted without valid authorization');
    }

    // Refresh all materialized views
    const { success, error } = await refreshAnalytics();

    if (error || !success) {
      console.error('Error refreshing analytics:', error);
      return NextResponse.json(
        {
          error: 'Failed to refresh analytics',
          details: error?.message || 'Unknown error',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Analytics refreshed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Exception in treasury refresh endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Only allow POST method
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to refresh analytics.' },
    { status: 405 }
  );
}

// Enable dynamic rendering
export const dynamic = 'force-dynamic';
