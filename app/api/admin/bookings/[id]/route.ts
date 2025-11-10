/**
 * API Route: Update Individual Booking
 * Admin endpoint to update specific booking details
 */

import { NextRequest, NextResponse } from 'next/server';
import { updateBooking, getBookingById } from '@/lib/supabase/bookings';
import { sendStatusUpdateEmail } from '@/lib/email/booking-confirmation';
import type { StudioSessionUpdate } from '@/lib/supabase/types';
import { z } from 'zod';

// Validation schema for booking updates
const updateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  dao_funded: z.boolean().optional(),
  notes: z.string().optional(),
});

/**
 * PATCH /api/admin/bookings/[id]
 * Update a specific booking (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check here
    // Verify user has admin role before proceeding

    const bookingId = params.id;

    // Get current booking state
    const currentBooking = await getBookingById(bookingId);
    if (!currentBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const body = await request.json();

    // Validate request body
    const validationResult = updateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const updates: StudioSessionUpdate = {};

    // Apply updates
    if (validationResult.data.status !== undefined) {
      updates.status = validationResult.data.status;
    }
    if (validationResult.data.dao_funded !== undefined) {
      updates.dao_funded = validationResult.data.dao_funded;
    }
    if (validationResult.data.notes !== undefined) {
      updates.notes = validationResult.data.notes;
    }

    // Update booking in database
    const updatedBooking = await updateBooking(bookingId, updates);

    // Send status update email if status changed
    if (
      updates.status &&
      updates.status !== currentBooking.status &&
      ['confirmed', 'cancelled', 'completed'].includes(updates.status)
    ) {
      sendStatusUpdateEmail(updatedBooking, currentBooking.status).catch((error) => {
        console.error('Failed to send status update email:', error);
      });
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      {
        error: 'Failed to update booking',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/bookings/[id]
 * Delete a specific booking (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // TODO: Add authentication check here
    // Verify user has admin role before proceeding

    const bookingId = params.id;

    // Check if booking exists
    const booking = await getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Delete booking
    const { deleteBooking } = await import('@/lib/supabase/bookings');
    await deleteBooking(bookingId);

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete booking',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
