/**
 * API Route: Admin Bookings Management
 * Admin-only endpoints for managing all bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllBookings } from '@/lib/supabase/bookings';
import type { SessionStatus, RoomType } from '@/lib/supabase/types';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/bookings
 * Get all bookings with optional filters (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // Verify user has admin role before proceeding

    const searchParams = request.nextUrl.searchParams;
    const filters: {
      status?: SessionStatus;
      roomType?: RoomType;
      startDate?: string;
      endDate?: string;
    } = {};

    const status = searchParams.get('status');
    const roomType = searchParams.get('roomType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (status) filters.status = status as SessionStatus;
    if (roomType) filters.roomType = roomType as RoomType;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const bookings = await getAllBookings(filters);

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
