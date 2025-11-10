/**
 * API Route: Admin Booking Statistics
 * Returns statistics about all bookings
 */

import { NextResponse } from 'next/server';
import { getBookingStats } from '@/lib/supabase/bookings';

/**
 * GET /api/admin/bookings/stats
 * Get booking statistics (Admin only)
 */
export async function GET() {
  try {
    // TODO: Add authentication check here
    // Verify user has admin role before proceeding

    const stats = await getBookingStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch booking statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
