/**
 * API Route: Studio Bookings
 * Handles creating and retrieving studio session bookings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getBookingsByEmail } from '@/lib/supabase/bookings';
import {
  sendBookingConfirmation,
  sendAdminNotification,
} from '@/lib/email/booking-confirmation';
import type { BookingFormData } from '@/lib/supabase/types';
import { z } from 'zod';

// Validation schema for booking creation
const bookingSchema = z.object({
  user_email: z.string().email('Invalid email address'),
  user_name: z.string().min(2, 'Name must be at least 2 characters'),
  user_phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  user_wallet: z.string().optional(),
  room_type: z.enum(['recording', 'mixing', 'mastering', 'podcast', 'rehearsal']),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  session_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time format'),
  duration_hours: z.number().min(1).max(12),
  notes: z.string().optional(),
});

/**
 * POST /api/bookings
 * Create a new studio booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = bookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const bookingData = validationResult.data;

    // Ensure time is in HH:MM:SS format
    const sessionTime = bookingData.session_time.length === 5
      ? `${bookingData.session_time}:00`
      : bookingData.session_time;

    // Create booking in database
    const booking = await createBooking({
      user_email: bookingData.user_email,
      user_name: bookingData.user_name,
      user_phone: bookingData.user_phone,
      user_wallet: bookingData.user_wallet || null,
      room_type: bookingData.room_type,
      session_date: bookingData.session_date,
      session_time: sessionTime,
      duration_hours: bookingData.duration_hours,
      notes: bookingData.notes || null,
    });

    // Send confirmation email to user (non-blocking)
    sendBookingConfirmation(booking).catch((error) => {
      console.error('Failed to send booking confirmation email:', error);
    });

    // Send notification to admin (non-blocking)
    sendAdminNotification(booking).catch((error) => {
      console.error('Failed to send admin notification email:', error);
    });

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          session_date: booking.session_date,
          session_time: booking.session_time,
          room_type: booking.room_type,
          total_cost: booking.total_cost,
          status: booking.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      {
        error: 'Failed to create booking',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings?email=user@example.com
 * Get bookings for a specific user by email
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailSchema = z.string().email();
    const validationResult = emailSchema.safeParse(email);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const bookings = await getBookingsByEmail(email);

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
