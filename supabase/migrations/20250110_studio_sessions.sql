-- Studio Sessions Table
-- This table stores all studio booking sessions for inRECORD

CREATE TABLE IF NOT EXISTS studio_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email TEXT NOT NULL,
  user_wallet TEXT,
  user_name TEXT,
  user_phone TEXT,
  room_type TEXT NOT NULL CHECK (room_type IN ('recording', 'mixing', 'mastering', 'podcast', 'rehearsal')),
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration_hours INTEGER NOT NULL CHECK (duration_hours > 0 AND duration_hours <= 12),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  total_cost DECIMAL(10,2),
  dao_funded BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_studio_sessions_date ON studio_sessions(session_date);
CREATE INDEX idx_studio_sessions_status ON studio_sessions(status);
CREATE INDEX idx_studio_sessions_user_email ON studio_sessions(user_email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_studio_sessions_updated_at
  BEFORE UPDATE ON studio_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE studio_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read all sessions (for availability checking)
CREATE POLICY "Allow public read access" ON studio_sessions
  FOR SELECT USING (true);

-- Policy: Allow users to insert their own bookings
CREATE POLICY "Allow insert for authenticated users" ON studio_sessions
  FOR INSERT WITH CHECK (true);

-- Policy: Allow users to update their own bookings
CREATE POLICY "Allow users to update own bookings" ON studio_sessions
  FOR UPDATE USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Policy: Allow service role to do anything (for admin dashboard)
CREATE POLICY "Allow service role full access" ON studio_sessions
  FOR ALL USING (current_setting('request.jwt.claims', true)::json->>'role' = 'service_role');

-- Room pricing configuration table
CREATE TABLE IF NOT EXISTS room_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_type TEXT NOT NULL UNIQUE,
  hourly_rate DECIMAL(10,2) NOT NULL,
  description TEXT,
  features TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default room pricing
INSERT INTO room_pricing (room_type, hourly_rate, description, features) VALUES
  ('recording', 75.00, 'Professional recording studio with vocal booth', ARRAY['Neumann U87', 'SSL Console', 'Vocal Booth', 'ProTools HD']),
  ('mixing', 60.00, 'Dedicated mixing suite with high-end monitors', ARRAY['Genelec 8351', 'UAD Plugins', 'Neve Console Emulation']),
  ('mastering', 80.00, 'Acoustically treated mastering room', ARRAY['Dangerous Music', 'Weiss EQ', 'Precision Monitoring']),
  ('podcast', 50.00, 'Podcast recording setup for up to 4 people', ARRAY['Shure SM7B Mics', 'RodeCaster Pro', 'Video Recording']),
  ('rehearsal', 30.00, 'Rehearsal space with backline equipment', ARRAY['Full Backline', 'PA System', 'Air Conditioning'])
ON CONFLICT (room_type) DO NOTHING;

-- Enable RLS on room_pricing
ALTER TABLE room_pricing ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to pricing
CREATE POLICY "Allow public read pricing" ON room_pricing
  FOR SELECT USING (true);

-- Comments for documentation
COMMENT ON TABLE studio_sessions IS 'Stores all studio booking sessions';
COMMENT ON TABLE room_pricing IS 'Configuration table for studio room types and pricing';
COMMENT ON COLUMN studio_sessions.dao_funded IS 'Indicates if session was funded by DAO proposal';
COMMENT ON COLUMN studio_sessions.status IS 'Booking status: pending, confirmed, completed, cancelled';
