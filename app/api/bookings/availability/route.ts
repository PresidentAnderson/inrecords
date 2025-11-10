/**
 * API Route: Check Studio Availability
 * Returns available time slots for a specific date and room type
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAvailability } from '@/lib/supabase/bookings';
import { z } from 'zod';

/**
 * GET /api/bookings/availability?date=2025-01-15&roomType=recording
 * Check availability for a specific date and room type
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const roomType = searchParams.get('roomType');

    // Validate required parameters
    if (!date || !roomType) {
      return NextResponse.json(
        { error: 'Both date and roomType parameters are required' },
        { status: 400 }
      );
    }

    // Validate parameters
    const schema = z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)'),
      roomType: z.enum(['recording', 'mixing', 'mastering', 'podcast', 'rehearsal']),
    });

    const validationResult = schema.safeParse({ date, roomType });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Check if date is in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return NextResponse.json(
        { error: 'Cannot check availability for past dates' },
        { status: 400 }
      );
    }

    // Get availability from database
    const availability = await checkAvailability(
      date,
      roomType as 'recording' | 'mixing' | 'mastering' | 'podcast' | 'rehearsal'
    );

    return NextResponse.json(availability);
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      {
        error: 'Failed to check availability',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
