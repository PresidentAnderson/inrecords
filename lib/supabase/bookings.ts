import { supabase } from './client'
import { format } from 'date-fns'

export type RoomType = 'Control Room A' | 'Sound Lab' | 'AI Suite' | 'Immersive Listening Room'
export type SessionType = 'Recording' | 'Mixing' | 'Mastering' | 'Production' | 'Rehearsal' | 'Other'
export type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'

export interface StudioSession {
  id: string
  user_email: string
  user_name?: string
  user_wallet?: string
  user_phone?: string
  room_type: RoomType
  session_date: string
  session_time: string
  duration_hours: number
  session_type?: SessionType
  project_description?: string
  status: SessionStatus
  total_cost?: number
  discount_applied: boolean
  discount_reason?: string
  dao_funded: boolean
  dao_proposal_id?: string
  confirmation_token?: string
  confirmed_at?: string
  created_at: string
  updated_at: string
  cancelled_at?: string
  cancellation_reason?: string
  admin_notes?: string
  engineer_assigned?: string
}

export interface CreateSessionInput {
  user_email: string
  user_name: string
  user_phone?: string
  room_type: RoomType
  session_date: Date
  session_time: string
  duration_hours: number
  session_type: SessionType
  project_description?: string
  is_academy_member?: boolean
}

/**
 * Check if a time slot is available for booking
 */
export async function checkAvailability(
  room_type: RoomType,
  session_date: Date,
  session_time: string,
  duration_hours: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_session_availability', {
    p_room_type: room_type,
    p_session_date: format(session_date, 'yyyy-MM-dd'),
    p_session_time: session_time,
    p_duration_hours: duration_hours
  })

  if (error) {
    console.error('Error checking availability:', error)
    return false
  }

  return data === true
}

/**
 * Calculate session cost based on room type and duration
 */
export async function calculateCost(
  room_type: RoomType,
  duration_hours: number,
  is_academy_member: boolean = false
): Promise<number> {
  const { data, error } = await supabase.rpc('calculate_session_cost', {
    p_room_type: room_type,
    p_duration_hours: duration_hours,
    p_is_academy_member: is_academy_member
  })

  if (error) {
    console.error('Error calculating cost:', error)
    return 0
  }

  return parseFloat(data || '0')
}

/**
 * Create a new studio session booking
 */
export async function createSession(input: CreateSessionInput): Promise<{ data: StudioSession | null; error: Error | null }> {
  try {
    // Check availability first
    const isAvailable = await checkAvailability(
      input.room_type,
      input.session_date,
      input.session_time,
      input.duration_hours
    )

    if (!isAvailable) {
      return {
        data: null,
        error: new Error('This time slot is not available. Please choose a different time.')
      }
    }

    // Calculate cost
    const total_cost = await calculateCost(
      input.room_type,
      input.duration_hours,
      input.is_academy_member || false
    )

    // Generate confirmation token
    const confirmation_token = crypto.randomUUID()

    // Insert session
    const { data, error } = await supabase
      .from('studio_sessions')
      .insert({
        user_email: input.user_email,
        user_name: input.user_name,
        user_phone: input.user_phone,
        room_type: input.room_type,
        session_date: format(input.session_date, 'yyyy-MM-dd'),
        session_time: input.session_time,
        duration_hours: input.duration_hours,
        session_type: input.session_type,
        project_description: input.project_description,
        total_cost,
        discount_applied: input.is_academy_member || false,
        discount_reason: input.is_academy_member ? 'Academy Member (30% off)' : null,
        confirmation_token,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating session:', error)
      return { data: null, error: new Error('Failed to create booking. Please try again.') }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Unexpected error:', err)
    return { data: null, error: err as Error }
  }
}

/**
 * Confirm a session using the confirmation token
 */
export async function confirmSession(token: string): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('studio_sessions')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    })
    .eq('confirmation_token', token)
    .eq('status', 'pending')
    .select()
    .single()

  if (error || !data) {
    return { success: false, error: 'Invalid or expired confirmation link.' }
  }

  return { success: true }
}

/**
 * Get all sessions for a user by email
 */
export async function getUserSessions(email: string): Promise<StudioSession[]> {
  const { data, error } = await supabase
    .from('studio_sessions')
    .select('*')
    .eq('user_email', email)
    .order('session_date', { ascending: true })

  if (error) {
    console.error('Error fetching user sessions:', error)
    return []
  }

  return data || []
}

/**
 * Get all sessions (admin only)
 */
export async function getAllSessions(filters?: {
  status?: SessionStatus
  room_type?: RoomType
  from_date?: Date
  to_date?: Date
}): Promise<StudioSession[]> {
  let query = supabase
    .from('studio_sessions')
    .select('*')

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.room_type) {
    query = query.eq('room_type', filters.room_type)
  }

  if (filters?.from_date) {
    query = query.gte('session_date', format(filters.from_date, 'yyyy-MM-dd'))
  }

  if (filters?.to_date) {
    query = query.lte('session_date', format(filters.to_date, 'yyyy-MM-dd'))
  }

  const { data, error } = await query.order('session_date', { ascending: true })

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return data || []
}

/**
 * Update session status
 */
export async function updateSessionStatus(
  id: string,
  status: SessionStatus,
  admin_notes?: string
): Promise<{ success: boolean; error?: string }> {
  const updateData: Partial<StudioSession> = {
    status,
    admin_notes
  }

  if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('studio_sessions')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating session status:', error)
    return { success: false, error: 'Failed to update session status.' }
  }

  return { success: true }
}

/**
 * Cancel a session
 */
export async function cancelSession(
  id: string,
  cancellation_reason: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('studio_sessions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason
    })
    .eq('id', id)
    .in('status', ['pending', 'confirmed'])

  if (error) {
    console.error('Error cancelling session:', error)
    return { success: false, error: 'Failed to cancel session.' }
  }

  return { success: true }
}

/**
 * Link session to DAO proposal
 */
export async function linkSessionToDAO(
  session_id: string,
  dao_proposal_id: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('studio_sessions')
    .update({
      dao_funded: true,
      dao_proposal_id
    })
    .eq('id', session_id)

  if (error) {
    console.error('Error linking session to DAO:', error)
    return { success: false, error: 'Failed to link session to DAO proposal.' }
  }

  return { success: true }
}

/**
 * Get available time slots for a specific room and date
 */
export async function getAvailableTimeSlots(
  room_type: RoomType,
  date: Date
): Promise<string[]> {
  // Studio hours: 9 AM to 9 PM
  const allSlots = [
    '09:00:00', '10:00:00', '11:00:00', '12:00:00',
    '13:00:00', '14:00:00', '15:00:00', '16:00:00',
    '17:00:00', '18:00:00', '19:00:00', '20:00:00', '21:00:00'
  ]

  // Get existing bookings for this room and date
  const { data: bookedSessions } = await supabase
    .from('studio_sessions')
    .select('session_time, duration_hours')
    .eq('room_type', room_type)
    .eq('session_date', format(date, 'yyyy-MM-dd'))
    .in('status', ['pending', 'confirmed'])

  if (!bookedSessions) {
    return allSlots
  }

  // Filter out booked slots
  const availableSlots = allSlots.filter(slot => {
    return !bookedSessions.some(booking => {
      const bookingStart = booking.session_time
      const bookingEndHour = parseInt(bookingStart.split(':')[0]) + booking.duration_hours
      const slotHour = parseInt(slot.split(':')[0])

      return slotHour >= parseInt(bookingStart.split(':')[0]) && slotHour < bookingEndHour
    })
  })

  return availableSlots
}
