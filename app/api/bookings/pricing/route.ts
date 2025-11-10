/**
 * API Route: Room Pricing
 * Returns pricing information for all studio room types
 */

import { NextResponse } from 'next/server';
import { getRoomPricing } from '@/lib/supabase/bookings';

/**
 * GET /api/bookings/pricing
 * Get pricing information for all room types
 */
export async function GET() {
  try {
    const pricing = await getRoomPricing();

    return NextResponse.json(pricing);
  } catch (error) {
    console.error('Error fetching room pricing:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch room pricing',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
