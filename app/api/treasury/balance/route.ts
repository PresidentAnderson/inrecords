/**
 * Treasury Balance API Route
 * GET /api/treasury/balance
 *
 * Returns current treasury balance
 * Public endpoint for transparency
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTreasuryBalance } from '@/lib/supabase/treasury';

export async function GET(request: NextRequest) {
  try {
    // Get currency from query params (default: ETH)
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency') || 'ETH';

    // Fetch balance
    const { data, error } = await getTreasuryBalance(currency);

    if (error) {
      console.error('Error fetching treasury balance:', error);
      return NextResponse.json(
        { error: 'Failed to fetch treasury balance', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      balance: data,
      currency,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Exception in treasury balance endpoint:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Enable CORS for public access
export const dynamic = 'force-dynamic';
export const revalidate = 0;
