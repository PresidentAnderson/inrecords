-- Studio Sessions Schema Migration
-- Phase 1: Studio Booking System
-- Created: 2025-01-10

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create studio_sessions table
CREATE TABLE IF NOT EXISTS studio_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User Information
  user_email TEXT NOT NULL,
  user_name TEXT,
  user_wallet TEXT,
  user_phone TEXT,

  -- Session Details
  room_type TEXT NOT NULL CHECK (room_type IN ('Control Room A', 'Sound Lab', 'AI Suite', 'Immersive Listening Room')),
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL CHECK (duration_hours > 0 AND duration_hours <= 12),

  -- Session Purpose
  session_type TEXT CHECK (session_type IN ('Recording', 'Mixing', 'Mastering', 'Production', 'Rehearsal', 'Other')),
  project_description TEXT,

  -- Status & Pricing
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show')),
  total_cost DECIMAL(10,2),
  discount_applied BOOLEAN DEFAULT false,
  discount_reason TEXT,

  -- DAO Integration
  dao_funded BOOLEAN DEFAULT false,
  dao_proposal_id UUID,

  -- Verification & Confirmation
  confirmation_token TEXT UNIQUE,
  confirmed_at TIMESTAMP,

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,

  -- Admin Notes
  admin_notes TEXT,
  engineer_assigned TEXT,

  -- Constraints
  CONSTRAINT valid_session_time CHECK (session_time >= '09:00:00' AND session_time <= '21:00:00'),
  CONSTRAINT future_session CHECK (session_date >= CURRENT_DATE)
);

-- Create index for common queries
CREATE INDEX idx_studio_sessions_date ON studio_sessions(session_date);
CREATE INDEX idx_studio_sessions_status ON studio_sessions(status);
CREATE INDEX idx_studio_sessions_email ON studio_sessions(user_email);
CREATE INDEX idx_studio_sessions_room ON studio_sessions(room_type, session_date);
CREATE INDEX idx_studio_sessions_confirmation ON studio_sessions(confirmation_token);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to studio_sessions
CREATE TRIGGER update_studio_sessions_updated_at
  BEFORE UPDATE ON studio_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for available time slots
CREATE OR REPLACE VIEW available_time_slots AS
SELECT
  room_type,
  session_date,
  session_time,
  COUNT(*) as bookings
FROM studio_sessions
WHERE status NOT IN ('cancelled', 'no-show')
GROUP BY room_type, session_date, session_time;

-- Create function to check availability
CREATE OR REPLACE FUNCTION check_session_availability(
  p_room_type TEXT,
  p_session_date DATE,
  p_session_time TIME,
  p_duration_hours INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_conflicting_sessions INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_conflicting_sessions
  FROM studio_sessions
  WHERE room_type = p_room_type
    AND session_date = p_session_date
    AND status NOT IN ('cancelled', 'no-show')
    AND (
      -- Check if requested time overlaps with existing sessions
      (session_time <= p_session_time AND (session_time + (duration_hours || ' hours')::INTERVAL) > p_session_time)
      OR
      (session_time < (p_session_time + (p_duration_hours || ' hours')::INTERVAL) AND session_time >= p_session_time)
    );

  RETURN v_conflicting_sessions = 0;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate session cost
CREATE OR REPLACE FUNCTION calculate_session_cost(
  p_room_type TEXT,
  p_duration_hours INTEGER,
  p_is_academy_member BOOLEAN DEFAULT false
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_hourly_rate DECIMAL(10,2);
  v_discount_multiplier DECIMAL(3,2) := 1.0;
BEGIN
  -- Set hourly rate based on room type
  v_hourly_rate := CASE p_room_type
    WHEN 'Control Room A' THEN 150.00
    WHEN 'Sound Lab' THEN 100.00
    WHEN 'AI Suite' THEN 125.00
    WHEN 'Immersive Listening Room' THEN 75.00
    ELSE 100.00
  END;

  -- Apply Academy member discount (30% off)
  IF p_is_academy_member THEN
    v_discount_multiplier := 0.70;
  END IF;

  RETURN (v_hourly_rate * p_duration_hours * v_discount_multiplier)::DECIMAL(10,2);
END;
$$ LANGUAGE plpgsql;

-- Row Level Security Policies
ALTER TABLE studio_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own sessions
CREATE POLICY "Users can view own sessions"
  ON studio_sessions
  FOR SELECT
  USING (user_email = auth.jwt()->>'email' OR auth.jwt()->>'role' = 'admin');

-- Policy: Authenticated users can create sessions
CREATE POLICY "Authenticated users can create sessions"
  ON studio_sessions
  FOR INSERT
  WITH CHECK (auth.jwt() IS NOT NULL);

-- Policy: Users can update their own pending sessions
CREATE POLICY "Users can update own pending sessions"
  ON studio_sessions
  FOR UPDATE
  USING (
    user_email = auth.jwt()->>'email'
    AND status = 'pending'
  );

-- Policy: Admins can update any session
CREATE POLICY "Admins can update any session"
  ON studio_sessions
  FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

-- Policy: Admins can delete sessions
CREATE POLICY "Admins can delete sessions"
  ON studio_sessions
  FOR DELETE
  USING (auth.jwt()->>'role' = 'admin');

-- Insert sample data for testing (optional - comment out for production)
-- INSERT INTO studio_sessions (user_email, user_name, room_type, session_date, session_time, duration_hours, session_type, total_cost, status)
-- VALUES
--   ('test@example.com', 'Test User', 'Control Room A', CURRENT_DATE + 7, '10:00:00', 4, 'Recording', 600.00, 'confirmed'),
--   ('artist@example.com', 'Artist Name', 'Sound Lab', CURRENT_DATE + 5, '14:00:00', 3, 'Mixing', 300.00, 'pending');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON studio_sessions TO authenticated;
GRANT SELECT ON available_time_slots TO authenticated;
GRANT EXECUTE ON FUNCTION check_session_availability TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_session_cost TO authenticated;

COMMENT ON TABLE studio_sessions IS 'Studio booking sessions for IN Studio Montréal';
COMMENT ON FUNCTION check_session_availability IS 'Checks if a time slot is available for booking';
COMMENT ON FUNCTION calculate_session_cost IS 'Calculates total cost based on room type, duration, and discounts';
