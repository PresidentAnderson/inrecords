/**
 * Database operations for studio session bookings
 */

import { supabase, supabaseAdmin } from './client';
import type {
  StudioSession,
  StudioSessionInsert,
  StudioSessionUpdate,
  RoomPricing,
  RoomType,
  SessionStatus,
  AvailabilitySlot,
} from './types';
import { format, parse, addHours, startOfDay, endOfDay } from 'date-fns';

/**
 * Get all room pricing information
 */
export async function getRoomPricing(): Promise<RoomPricing[]> {
  const { data, error } = await supabase
    .from('room_pricing')
    .select('*')
    .order('hourly_rate', { ascending: true });

  if (error) {
    console.error('Error fetching room pricing:', error);
    throw new Error('Failed to fetch room pricing');
  }

  return data || [];
}

/**
 * Get pricing for a specific room type
 */
export async function getRoomPricingByType(roomType: RoomType): Promise<RoomPricing | null> {
  const { data, error } = await supabase
    .from('room_pricing')
    .select('*')
    .eq('room_type', roomType)
    .single();

  if (error) {
    console.error('Error fetching room pricing:', error);
    return null;
  }

  return data;
}

/**
 * Calculate total cost for a booking
 */
export async function calculateBookingCost(
  roomType: RoomType,
  durationHours: number
): Promise<number> {
  const pricing = await getRoomPricingByType(roomType);
  if (!pricing) {
    throw new Error('Room pricing not found');
  }
  return Number(pricing.hourly_rate) * durationHours;
}

/**
 * Check availability for a specific date and room type
 */
export async function checkAvailability(
  date: string,
  roomType: RoomType
): Promise<AvailabilitySlot[]> {
  // Get all bookings for the specified date and room type
  const { data: bookings, error } = await supabase
    .from('studio_sessions')
    .select('id, session_time, duration_hours')
    .eq('session_date', date)
    .eq('room_type', roomType)
    .in('status', ['pending', 'confirmed'])
    .order('session_time');

  if (error) {
    console.error('Error checking availability:', error);
    throw new Error('Failed to check availability');
  }

  // Generate time slots (9 AM to 9 PM, hourly)
  const slots: AvailabilitySlot[] = [];
  for (let hour = 9; hour <= 21; hour++) {
    const time = `${hour.toString().padStart(2, '0')}:00:00`;

    // Check if this slot is blocked by any booking
    const isBooked = bookings?.some((booking: any) => {
      const bookingHour = parseInt(booking.session_time.split(':')[0]);
      const bookingEndHour = bookingHour + booking.duration_hours;
      return hour >= bookingHour && hour < bookingEndHour;
    });

    slots.push({
      time,
      available: !isBooked,
      session_id: isBooked
        ? (bookings?.find((b: any) => {
            const bookingHour = parseInt(b.session_time.split(':')[0]);
            const bookingEndHour = bookingHour + b.duration_hours;
            return hour >= bookingHour && hour < bookingEndHour;
          }) as any)?.id
        : undefined,
    });
  }

  return slots;
}

/**
 * Create a new booking
 */
export async function createBooking(
  booking: StudioSessionInsert
): Promise<StudioSession> {
  // Calculate total cost
  const totalCost = await calculateBookingCost(
    booking.room_type,
    booking.duration_hours
  );

  // Create booking with total cost
  const { data, error } = await supabase
    .from('studio_sessions')
    .insert({
      ...booking,
      total_cost: totalCost,
      status: 'pending',
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    throw new Error('Failed to create booking');
  }

  return data;
}

/**
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<StudioSession | null> {
  const { data, error } = await supabase
    .from('studio_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching booking:', error);
    return null;
  }

  return data;
}

/**
 * Get bookings by user email
 */
export async function getBookingsByEmail(email: string): Promise<StudioSession[]> {
  const { data, error } = await supabase
    .from('studio_sessions')
    .select('*')
    .eq('user_email', email)
    .order('session_date', { ascending: false })
    .order('session_time', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    throw new Error('Failed to fetch bookings');
  }

  return data || [];
}

/**
 * Update booking status
 */
export async function updateBookingStatus(
  id: string,
  status: SessionStatus
): Promise<StudioSession> {
  const { data, error } = await (supabase
    .from('studio_sessions') as any)
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status');
  }

  return data;
}

/**
 * Update booking DAO funding status
 */
export async function updateDaoFundingStatus(
  id: string,
  daoFunded: boolean
): Promise<StudioSession> {
  const { data, error } = await (supabase
    .from('studio_sessions') as any)
    .update({ dao_funded: daoFunded })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating DAO funding status:', error);
    throw new Error('Failed to update DAO funding status');
  }

  return data;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string): Promise<StudioSession> {
  return updateBookingStatus(id, 'cancelled');
}

/**
 * Confirm a booking
 */
export async function confirmBooking(id: string): Promise<StudioSession> {
  return updateBookingStatus(id, 'confirmed');
}

/**
 * Complete a booking
 */
export async function completeBooking(id: string): Promise<StudioSession> {
  return updateBookingStatus(id, 'completed');
}

/**
 * ADMIN FUNCTIONS - Use supabaseAdmin for these
 */

/**
 * Get all bookings (Admin only)
 */
export async function getAllBookings(
  filters?: {
    status?: SessionStatus;
    roomType?: RoomType;
    startDate?: string;
    endDate?: string;
  }
): Promise<StudioSession[]> {
  if (!supabaseAdmin) {
    throw new Error('Admin access not configured');
  }

  let query = supabaseAdmin.from('studio_sessions').select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.roomType) {
    query = query.eq('room_type', filters.roomType);
  }
  if (filters?.startDate) {
    query = query.gte('session_date', filters.startDate);
  }
  if (filters?.endDate) {
    query = query.lte('session_date', filters.endDate);
  }

  query = query
    .order('session_date', { ascending: false })
    .order('session_time', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching all bookings:', error);
    throw new Error('Failed to fetch all bookings');
  }

  return data || [];
}

/**
 * Update booking (Admin only)
 */
export async function updateBooking(
  id: string,
  updates: StudioSessionUpdate
): Promise<StudioSession> {
  if (!supabaseAdmin) {
    throw new Error('Admin access not configured');
  }

  const { data, error } = await (supabaseAdmin
    .from('studio_sessions') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating booking:', error);
    throw new Error('Failed to update booking');
  }

  return data;
}

/**
 * Delete booking (Admin only)
 */
export async function deleteBooking(id: string): Promise<void> {
  if (!supabaseAdmin) {
    throw new Error('Admin access not configured');
  }

  const { error } = await supabaseAdmin
    .from('studio_sessions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting booking:', error);
    throw new Error('Failed to delete booking');
  }
}

/**
 * Get booking statistics (Admin only)
 */
export async function getBookingStats(): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  daoFunded: number;
  totalRevenue: number;
}> {
  if (!supabaseAdmin) {
    throw new Error('Admin access not configured');
  }

  const { data, error } = await supabaseAdmin.from('studio_sessions').select('*');

  if (error) {
    console.error('Error fetching booking stats:', error);
    throw new Error('Failed to fetch booking stats');
  }

  const stats = {
    total: data?.length || 0,
    pending: data?.filter((b: any) => b.status === 'pending').length || 0,
    confirmed: data?.filter((b: any) => b.status === 'confirmed').length || 0,
    completed: data?.filter((b: any) => b.status === 'completed').length || 0,
    cancelled: data?.filter((b: any) => b.status === 'cancelled').length || 0,
    daoFunded: data?.filter((b: any) => b.dao_funded).length || 0,
    totalRevenue:
      data?.reduce((sum: number, b: any) => sum + (Number(b.total_cost) || 0), 0) || 0,
  };

  return stats;
}
