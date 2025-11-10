-- DAO Governance Schema Migration
-- Phase 2: DAO Governance System
-- Created: 2025-01-15

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DAO MEMBERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dao_members (
  wallet_address TEXT PRIMARY KEY,

  -- Membership Information
  membership_tier TEXT NOT NULL CHECK (membership_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  tier_display_name TEXT, -- Listener, Supporter, Curator, Producer

  -- Activity Tracking
  votes_cast INTEGER DEFAULT 0,
  proposals_created INTEGER DEFAULT 0,
  total_funding_received DECIMAL(12,2) DEFAULT 0.00,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  joined_at TIMESTAMP DEFAULT NOW(),
  last_active_at TIMESTAMP DEFAULT NOW(),

  -- Profile (optional)
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,

  -- Contact
  email TEXT,
  discord_handle TEXT,

  -- Constraints
  CONSTRAINT valid_tier CHECK (
    (membership_tier = 'Bronze' AND tier_display_name = 'Listener') OR
    (membership_tier = 'Silver' AND tier_display_name = 'Supporter') OR
    (membership_tier = 'Gold' AND tier_display_name = 'Curator') OR
    (membership_tier = 'Platinum' AND tier_display_name = 'Producer') OR
    tier_display_name IS NULL
  )
);

-- =============================================
-- DAO PROPOSALS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dao_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Proposal Details
  title TEXT NOT NULL CHECK (length(title) >= 10 AND length(title) <= 200),
  description TEXT NOT NULL CHECK (length(description) >= 50),

  -- Proposal Type
  proposal_type TEXT NOT NULL CHECK (proposal_type IN (
    'Studio Funding',
    'Equipment Purchase',
    'Artist Grant',
    'Community Event',
    'Platform Feature',
    'Treasury Allocation',
    'Governance Change',
    'Other'
  )),

  -- Funding Information
  funding_goal DECIMAL(12,2) CHECK (funding_goal > 0),
  current_funding DECIMAL(12,2) DEFAULT 0.00,
  funding_currency TEXT DEFAULT 'USD' CHECK (funding_currency IN ('USD', 'SOL', 'USDC')),

  -- Creator Information
  created_by TEXT NOT NULL REFERENCES dao_members(wallet_address),

  -- Status & Lifecycle
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft',
    'submitted',
    'active_voting',
    'approved',
    'rejected',
    'funded',
    'completed',
    'cancelled'
  )),

  -- Voting Configuration
  voting_ends_at TIMESTAMP NOT NULL,
  quorum_required INTEGER DEFAULT 10, -- Percentage of active members
  approval_threshold INTEGER DEFAULT 51, -- Percentage of votes needed

  -- Vote Counts (denormalized for performance)
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  total_vote_weight DECIMAL(10,2) DEFAULT 0,
  unique_voters INTEGER DEFAULT 0,

  -- Results
  voting_result TEXT CHECK (voting_result IN ('pending', 'passed', 'failed', 'quorum_not_met')),
  voting_closed_at TIMESTAMP,

  -- Session Integration (if proposal originated from studio booking)
  linked_session_id UUID REFERENCES studio_sessions(id),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,

  -- Additional Data
  tags TEXT[], -- For categorization and search
  attachment_urls TEXT[], -- Supporting documents, images, etc.

  -- Admin
  admin_notes TEXT,

  -- Constraints
  CONSTRAINT valid_voting_period CHECK (voting_ends_at > created_at),
  CONSTRAINT valid_funding_amounts CHECK (current_funding <= funding_goal),
  CONSTRAINT valid_vote_counts CHECK (
    votes_for >= 0 AND
    votes_against >= 0 AND
    votes_abstain >= 0
  )
);

-- =============================================
-- DAO VOTES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS dao_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Vote Reference
  proposal_id UUID NOT NULL REFERENCES dao_proposals(id) ON DELETE CASCADE,
  voter_wallet TEXT NOT NULL REFERENCES dao_members(wallet_address),

  -- Vote Details
  vote_type TEXT NOT NULL CHECK (vote_type IN ('for', 'against', 'abstain')),
  vote_weight DECIMAL(10,2) NOT NULL CHECK (vote_weight > 0),

  -- Vote Metadata
  membership_tier_at_vote TEXT NOT NULL, -- Snapshot of tier when vote was cast

  -- Verification
  signature TEXT, -- Wallet signature for vote verification
  signature_verified BOOLEAN DEFAULT false,

  -- Timestamps
  voted_at TIMESTAMP DEFAULT NOW(),

  -- Vote Rationale (optional)
  comment TEXT,

  -- Prevent double voting
  CONSTRAINT unique_vote_per_proposal UNIQUE (proposal_id, voter_wallet)
);

-- =============================================
-- PROPOSAL COMMENTS TABLE (for future enhancement)
-- =============================================
CREATE TABLE IF NOT EXISTS proposal_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES dao_proposals(id) ON DELETE CASCADE,
  commenter_wallet TEXT NOT NULL REFERENCES dao_members(wallet_address),

  comment_text TEXT NOT NULL CHECK (length(comment_text) >= 1 AND length(comment_text) <= 2000),
  parent_comment_id UUID REFERENCES proposal_comments(id), -- For nested replies

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  edited BOOLEAN DEFAULT false,
  deleted BOOLEAN DEFAULT false
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- DAO Members Indexes
CREATE INDEX idx_dao_members_tier ON dao_members(membership_tier);
CREATE INDEX idx_dao_members_active ON dao_members(is_active);
CREATE INDEX idx_dao_members_joined ON dao_members(joined_at);

-- DAO Proposals Indexes
CREATE INDEX idx_dao_proposals_status ON dao_proposals(status);
CREATE INDEX idx_dao_proposals_type ON dao_proposals(proposal_type);
CREATE INDEX idx_dao_proposals_creator ON dao_proposals(created_by);
CREATE INDEX idx_dao_proposals_voting_ends ON dao_proposals(voting_ends_at);
CREATE INDEX idx_dao_proposals_created ON dao_proposals(created_at);
CREATE INDEX idx_dao_proposals_tags ON dao_proposals USING GIN(tags);
CREATE INDEX idx_dao_proposals_active_voting ON dao_proposals(status, voting_ends_at)
  WHERE status = 'active_voting';

-- DAO Votes Indexes
CREATE INDEX idx_dao_votes_proposal ON dao_votes(proposal_id);
CREATE INDEX idx_dao_votes_voter ON dao_votes(voter_wallet);
CREATE INDEX idx_dao_votes_voted_at ON dao_votes(voted_at);
CREATE INDEX idx_dao_votes_type ON dao_votes(vote_type);

-- Proposal Comments Indexes
CREATE INDEX idx_proposal_comments_proposal ON proposal_comments(proposal_id);
CREATE INDEX idx_proposal_comments_commenter ON proposal_comments(commenter_wallet);
CREATE INDEX idx_proposal_comments_parent ON proposal_comments(parent_comment_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE TRIGGER update_dao_proposals_updated_at
  BEFORE UPDATE ON dao_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_comments_updated_at
  BEFORE UPDATE ON proposal_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update member last_active_at on vote
CREATE OR REPLACE FUNCTION update_member_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE dao_members
  SET last_active_at = NOW()
  WHERE wallet_address = NEW.voter_wallet;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_member_active_on_vote
  AFTER INSERT ON dao_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_member_last_active();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function: Get vote weight based on membership tier
CREATE OR REPLACE FUNCTION get_vote_weight(p_tier TEXT)
RETURNS DECIMAL(10,2) AS $$
BEGIN
  RETURN CASE p_tier
    WHEN 'Bronze' THEN 1.0
    WHEN 'Silver' THEN 2.0
    WHEN 'Gold' THEN 3.0
    WHEN 'Platinum' THEN 5.0
    ELSE 1.0
  END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate proposal vote results
CREATE OR REPLACE FUNCTION calculate_proposal_results(p_proposal_id UUID)
RETURNS TABLE(
  total_votes_for INTEGER,
  total_votes_against INTEGER,
  total_votes_abstain INTEGER,
  total_weight_for DECIMAL(10,2),
  total_weight_against DECIMAL(10,2),
  total_weight_abstain DECIMAL(10,2),
  unique_voters_count INTEGER,
  approval_percentage DECIMAL(5,2),
  quorum_met BOOLEAN,
  result TEXT
) AS $$
DECLARE
  v_votes_for INTEGER;
  v_votes_against INTEGER;
  v_votes_abstain INTEGER;
  v_weight_for DECIMAL(10,2);
  v_weight_against DECIMAL(10,2);
  v_weight_abstain DECIMAL(10,2);
  v_unique_voters INTEGER;
  v_approval_pct DECIMAL(5,2);
  v_total_active_members INTEGER;
  v_quorum_required INTEGER;
  v_approval_threshold INTEGER;
  v_quorum_met BOOLEAN;
  v_result TEXT;
BEGIN
  -- Get vote counts
  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'for'),
    COUNT(*) FILTER (WHERE vote_type = 'against'),
    COUNT(*) FILTER (WHERE vote_type = 'abstain'),
    COALESCE(SUM(vote_weight) FILTER (WHERE vote_type = 'for'), 0),
    COALESCE(SUM(vote_weight) FILTER (WHERE vote_type = 'against'), 0),
    COALESCE(SUM(vote_weight) FILTER (WHERE vote_type = 'abstain'), 0),
    COUNT(DISTINCT voter_wallet)
  INTO v_votes_for, v_votes_against, v_votes_abstain,
       v_weight_for, v_weight_against, v_weight_abstain,
       v_unique_voters
  FROM dao_votes
  WHERE proposal_id = p_proposal_id;

  -- Get total active members
  SELECT COUNT(*) INTO v_total_active_members
  FROM dao_members
  WHERE is_active = true;

  -- Get proposal requirements
  SELECT quorum_required, approval_threshold
  INTO v_quorum_required, v_approval_threshold
  FROM dao_proposals
  WHERE id = p_proposal_id;

  -- Calculate approval percentage (based on weight)
  IF (v_weight_for + v_weight_against) > 0 THEN
    v_approval_pct := (v_weight_for / (v_weight_for + v_weight_against) * 100)::DECIMAL(5,2);
  ELSE
    v_approval_pct := 0;
  END IF;

  -- Check quorum
  v_quorum_met := (v_unique_voters::DECIMAL / v_total_active_members * 100) >= v_quorum_required;

  -- Determine result
  IF NOT v_quorum_met THEN
    v_result := 'quorum_not_met';
  ELSIF v_approval_pct >= v_approval_threshold THEN
    v_result := 'passed';
  ELSE
    v_result := 'failed';
  END IF;

  -- Return results
  RETURN QUERY SELECT
    v_votes_for,
    v_votes_against,
    v_votes_abstain,
    v_weight_for,
    v_weight_against,
    v_weight_abstain,
    v_unique_voters,
    v_approval_pct,
    v_quorum_met,
    v_result;
END;
$$ LANGUAGE plpgsql;

-- Function: Update proposal vote counts (called after vote insert)
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the denormalized vote counts in dao_proposals
  UPDATE dao_proposals
  SET
    votes_for = (SELECT COUNT(*) FROM dao_votes WHERE proposal_id = NEW.proposal_id AND vote_type = 'for'),
    votes_against = (SELECT COUNT(*) FROM dao_votes WHERE proposal_id = NEW.proposal_id AND vote_type = 'against'),
    votes_abstain = (SELECT COUNT(*) FROM dao_votes WHERE proposal_id = NEW.proposal_id AND vote_type = 'abstain'),
    total_vote_weight = (SELECT COALESCE(SUM(vote_weight), 0) FROM dao_votes WHERE proposal_id = NEW.proposal_id),
    unique_voters = (SELECT COUNT(DISTINCT voter_wallet) FROM dao_votes WHERE proposal_id = NEW.proposal_id),
    updated_at = NOW()
  WHERE id = NEW.proposal_id;

  -- Update member votes_cast count
  UPDATE dao_members
  SET votes_cast = votes_cast + 1
  WHERE wallet_address = NEW.voter_wallet;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proposal_counts_on_vote
  AFTER INSERT ON dao_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_vote_counts();

-- Function: Update member proposals_created count
CREATE OR REPLACE FUNCTION update_member_proposal_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND OLD.status = 'draft' THEN
    UPDATE dao_members
    SET proposals_created = proposals_created + 1
    WHERE wallet_address = NEW.created_by;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_member_proposal_count_on_submit
  AFTER UPDATE ON dao_proposals
  FOR EACH ROW
  WHEN (NEW.status = 'submitted' AND OLD.status = 'draft')
  EXECUTE FUNCTION update_member_proposal_count();

-- Function: Check if member can vote on proposal
CREATE OR REPLACE FUNCTION can_member_vote(
  p_wallet_address TEXT,
  p_proposal_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_already_voted BOOLEAN;
  v_is_active BOOLEAN;
  v_voting_ended BOOLEAN;
  v_proposal_status TEXT;
BEGIN
  -- Check if already voted
  SELECT EXISTS(
    SELECT 1 FROM dao_votes
    WHERE proposal_id = p_proposal_id
    AND voter_wallet = p_wallet_address
  ) INTO v_already_voted;

  -- Check if member is active
  SELECT is_active INTO v_is_active
  FROM dao_members
  WHERE wallet_address = p_wallet_address;

  -- Check if voting period has ended and proposal status
  SELECT
    voting_ends_at < NOW(),
    status
  INTO v_voting_ended, v_proposal_status
  FROM dao_proposals
  WHERE id = p_proposal_id;

  -- Can vote if: not already voted, member is active, voting period not ended, proposal is in active_voting status
  RETURN NOT v_already_voted
    AND v_is_active
    AND NOT v_voting_ended
    AND v_proposal_status = 'active_voting';
END;
$$ LANGUAGE plpgsql;

-- Function: Close voting on proposal (to be called when voting_ends_at is reached)
CREATE OR REPLACE FUNCTION close_proposal_voting(p_proposal_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_result RECORD;
  v_status TEXT;
BEGIN
  -- Calculate results
  SELECT * INTO v_result FROM calculate_proposal_results(p_proposal_id);

  -- Update proposal with results
  UPDATE dao_proposals
  SET
    voting_result = v_result.result,
    voting_closed_at = NOW(),
    status = CASE
      WHEN v_result.result = 'passed' THEN 'approved'
      WHEN v_result.result = 'failed' THEN 'rejected'
      WHEN v_result.result = 'quorum_not_met' THEN 'rejected'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = p_proposal_id;

  RETURN v_result.result;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE dao_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dao_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dao_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_comments ENABLE ROW LEVEL SECURITY;

-- DAO Members Policies
CREATE POLICY "Anyone can view member profiles"
  ON dao_members FOR SELECT
  USING (true);

CREATE POLICY "Members can update own profile"
  ON dao_members FOR UPDATE
  USING (wallet_address = auth.jwt()->>'wallet_address');

CREATE POLICY "Authenticated users can register as members"
  ON dao_members FOR INSERT
  WITH CHECK (auth.jwt() IS NOT NULL);

-- DAO Proposals Policies
CREATE POLICY "Anyone can view submitted proposals"
  ON dao_proposals FOR SELECT
  USING (status != 'draft' OR created_by = auth.jwt()->>'wallet_address');

CREATE POLICY "Members can create proposals"
  ON dao_proposals FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND created_by = auth.jwt()->>'wallet_address'
    AND EXISTS (SELECT 1 FROM dao_members WHERE wallet_address = created_by AND is_active = true)
  );

CREATE POLICY "Creators can update own draft proposals"
  ON dao_proposals FOR UPDATE
  USING (
    created_by = auth.jwt()->>'wallet_address'
    AND status = 'draft'
  );

CREATE POLICY "Admins can update any proposal"
  ON dao_proposals FOR UPDATE
  USING (auth.jwt()->>'role' = 'admin');

-- DAO Votes Policies
CREATE POLICY "Anyone can view votes"
  ON dao_votes FOR SELECT
  USING (true);

CREATE POLICY "Active members can cast votes"
  ON dao_votes FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND voter_wallet = auth.jwt()->>'wallet_address'
    AND EXISTS (SELECT 1 FROM dao_members WHERE wallet_address = voter_wallet AND is_active = true)
    AND can_member_vote(voter_wallet, proposal_id)
  );

-- Proposal Comments Policies
CREATE POLICY "Anyone can view non-deleted comments"
  ON proposal_comments FOR SELECT
  USING (deleted = false);

CREATE POLICY "Members can post comments"
  ON proposal_comments FOR INSERT
  WITH CHECK (
    auth.jwt() IS NOT NULL
    AND commenter_wallet = auth.jwt()->>'wallet_address'
    AND EXISTS (SELECT 1 FROM dao_members WHERE wallet_address = commenter_wallet AND is_active = true)
  );

CREATE POLICY "Commenters can update own comments"
  ON proposal_comments FOR UPDATE
  USING (commenter_wallet = auth.jwt()->>'wallet_address');

-- =============================================
-- VIEWS
-- =============================================

-- View: Active proposals with vote statistics
CREATE OR REPLACE VIEW active_proposals_with_stats AS
SELECT
  p.*,
  m.display_name as creator_display_name,
  m.membership_tier as creator_tier,
  CASE
    WHEN p.voting_ends_at > NOW() THEN true
    ELSE false
  END as is_voting_active,
  EXTRACT(EPOCH FROM (p.voting_ends_at - NOW())) / 3600 as hours_remaining,
  CASE
    WHEN p.funding_goal > 0 THEN (p.current_funding / p.funding_goal * 100)
    ELSE 0
  END as funding_percentage,
  CASE
    WHEN (p.votes_for + p.votes_against) > 0 THEN
      (p.votes_for::DECIMAL / (p.votes_for + p.votes_against) * 100)
    ELSE 0
  END as approval_percentage
FROM dao_proposals p
JOIN dao_members m ON p.created_by = m.wallet_address
WHERE p.status IN ('active_voting', 'approved', 'funded');

-- View: Member voting history
CREATE OR REPLACE VIEW member_voting_history AS
SELECT
  v.voter_wallet,
  v.proposal_id,
  p.title as proposal_title,
  v.vote_type,
  v.vote_weight,
  v.voted_at,
  p.status as proposal_status,
  p.voting_result
FROM dao_votes v
JOIN dao_proposals p ON v.proposal_id = p.id
ORDER BY v.voted_at DESC;

-- =============================================
-- GRANTS
-- =============================================

GRANT SELECT, INSERT, UPDATE ON dao_members TO authenticated;
GRANT SELECT, INSERT, UPDATE ON dao_proposals TO authenticated;
GRANT SELECT, INSERT ON dao_votes TO authenticated;
GRANT SELECT, INSERT, UPDATE ON proposal_comments TO authenticated;

GRANT SELECT ON active_proposals_with_stats TO authenticated;
GRANT SELECT ON member_voting_history TO authenticated;

GRANT EXECUTE ON FUNCTION get_vote_weight TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_proposal_results TO authenticated;
GRANT EXECUTE ON FUNCTION can_member_vote TO authenticated;
GRANT EXECUTE ON FUNCTION close_proposal_voting TO authenticated;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE dao_members IS 'DAO member registry with tiered membership system';
COMMENT ON TABLE dao_proposals IS 'Community proposals for funding and governance decisions';
COMMENT ON TABLE dao_votes IS 'Weighted votes on DAO proposals';
COMMENT ON TABLE proposal_comments IS 'Discussion comments on proposals';

COMMENT ON FUNCTION get_vote_weight IS 'Returns vote weight multiplier based on membership tier';
COMMENT ON FUNCTION calculate_proposal_results IS 'Calculates comprehensive voting results for a proposal';
COMMENT ON FUNCTION can_member_vote IS 'Checks if a member is eligible to vote on a specific proposal';
COMMENT ON FUNCTION close_proposal_voting IS 'Closes voting period and determines final result';
