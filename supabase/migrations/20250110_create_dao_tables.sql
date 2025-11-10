-- =====================================================
-- inRECORD DAO Governance System - Database Schema
-- Phase 2: DAO Proposals and Voting Tables
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Table: dao_proposals
-- Purpose: Store all DAO governance proposals
-- =====================================================
CREATE TABLE IF NOT EXISTS dao_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  proposal_type TEXT NOT NULL CHECK (proposal_type IN ('funding', 'governance', 'partnership', 'creative', 'technical')),
  funding_goal DECIMAL(10,2),
  current_funding DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'passed', 'rejected', 'executed', 'cancelled')),
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  voting_ends_at TIMESTAMP,
  executed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Indexes for common queries
  CONSTRAINT valid_funding CHECK (funding_goal IS NULL OR funding_goal >= 0),
  CONSTRAINT valid_current_funding CHECK (current_funding >= 0),
  CONSTRAINT valid_voting_end_date CHECK (voting_ends_at > created_at)
);

-- Create indexes for performance
CREATE INDEX idx_dao_proposals_status ON dao_proposals(status);
CREATE INDEX idx_dao_proposals_type ON dao_proposals(proposal_type);
CREATE INDEX idx_dao_proposals_created_at ON dao_proposals(created_at DESC);
CREATE INDEX idx_dao_proposals_created_by ON dao_proposals(created_by);
CREATE INDEX idx_dao_proposals_voting_ends ON dao_proposals(voting_ends_at);

-- =====================================================
-- Table: dao_votes
-- Purpose: Store all votes cast on proposals
-- =====================================================
CREATE TABLE IF NOT EXISTS dao_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID NOT NULL REFERENCES dao_proposals(id) ON DELETE CASCADE,
  voter_wallet TEXT NOT NULL,
  vote_weight INTEGER DEFAULT 1 CHECK (vote_weight > 0),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('for', 'against', 'abstain')),
  voted_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Ensure one vote per wallet per proposal
  CONSTRAINT unique_vote_per_proposal UNIQUE (proposal_id, voter_wallet)
);

-- Create indexes for performance
CREATE INDEX idx_dao_votes_proposal_id ON dao_votes(proposal_id);
CREATE INDEX idx_dao_votes_voter_wallet ON dao_votes(voter_wallet);
CREATE INDEX idx_dao_votes_voted_at ON dao_votes(voted_at DESC);
CREATE INDEX idx_dao_votes_vote_type ON dao_votes(vote_type);

-- =====================================================
-- View: proposal_vote_summary
-- Purpose: Quick summary of votes per proposal
-- =====================================================
CREATE OR REPLACE VIEW proposal_vote_summary AS
SELECT
  p.id,
  p.title,
  p.status,
  p.voting_ends_at,
  COALESCE(SUM(CASE WHEN v.vote_type = 'for' THEN v.vote_weight ELSE 0 END), 0) as votes_for,
  COALESCE(SUM(CASE WHEN v.vote_type = 'against' THEN v.vote_weight ELSE 0 END), 0) as votes_against,
  COALESCE(SUM(CASE WHEN v.vote_type = 'abstain' THEN v.vote_weight ELSE 0 END), 0) as votes_abstain,
  COALESCE(SUM(v.vote_weight), 0) as total_votes,
  COUNT(DISTINCT v.voter_wallet) as unique_voters
FROM dao_proposals p
LEFT JOIN dao_votes v ON p.id = v.proposal_id
GROUP BY p.id, p.title, p.status, p.voting_ends_at;

-- =====================================================
-- Function: get_voter_tier
-- Purpose: Determine voting weight based on token holdings
-- =====================================================
CREATE OR REPLACE FUNCTION get_voter_tier(token_count INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Platinum tier: 5000+ tokens = 5x weight
  IF token_count >= 5000 THEN
    RETURN 5;
  -- Gold tier: 1000+ tokens = 3x weight
  ELSIF token_count >= 1000 THEN
    RETURN 3;
  -- Silver tier: 500+ tokens = 2x weight
  ELSIF token_count >= 500 THEN
    RETURN 2;
  -- Bronze tier: 100+ tokens = 1x weight
  ELSIF token_count >= 100 THEN
    RETURN 1;
  -- Below minimum threshold
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- =====================================================
-- Function: update_proposal_status
-- Purpose: Automatically update proposal status based on time
-- =====================================================
CREATE OR REPLACE FUNCTION update_proposal_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If voting period has ended and status is still active
  IF NEW.voting_ends_at <= NOW() AND NEW.status = 'active' THEN
    -- Get vote counts
    DECLARE
      votes_for INTEGER;
      votes_against INTEGER;
    BEGIN
      SELECT
        COALESCE(SUM(CASE WHEN vote_type = 'for' THEN vote_weight ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN vote_type = 'against' THEN vote_weight ELSE 0 END), 0)
      INTO votes_for, votes_against
      FROM dao_votes
      WHERE proposal_id = NEW.id;

      -- Update status based on votes
      IF votes_for > votes_against THEN
        NEW.status := 'passed';
      ELSE
        NEW.status := 'rejected';
      END IF;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status updates
CREATE TRIGGER trigger_update_proposal_status
  BEFORE UPDATE ON dao_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_status();

-- =====================================================
-- Row Level Security (RLS) Policies
-- Purpose: Secure data access patterns
-- =====================================================

-- Enable RLS
ALTER TABLE dao_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dao_votes ENABLE ROW LEVEL SECURITY;

-- Public read access for proposals
CREATE POLICY "Public read access for proposals"
  ON dao_proposals FOR SELECT
  USING (true);

-- Authenticated users can create proposals
CREATE POLICY "Authenticated users can create proposals"
  ON dao_proposals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Only creators can update their proposals (if status is draft)
CREATE POLICY "Creators can update their draft proposals"
  ON dao_proposals FOR UPDATE
  USING (auth.uid()::text = created_by AND status = 'draft');

-- Public read access for votes
CREATE POLICY "Public read access for votes"
  ON dao_votes FOR SELECT
  USING (true);

-- Authenticated users can vote
CREATE POLICY "Authenticated users can vote"
  ON dao_votes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own votes before voting ends
CREATE POLICY "Users can update their own votes"
  ON dao_votes FOR UPDATE
  USING (
    auth.uid()::text = voter_wallet
    AND EXISTS (
      SELECT 1 FROM dao_proposals
      WHERE id = proposal_id
      AND voting_ends_at > NOW()
    )
  );

-- =====================================================
-- Insert Sample Data (for testing/demo)
-- =====================================================

-- Sample proposals
INSERT INTO dao_proposals (title, description, proposal_type, funding_goal, status, created_by, voting_ends_at) VALUES
  (
    'Fund "Midnight Sessions" Live Album Production',
    'Proposal to allocate $15,000 from treasury for recording and producing a live album featuring DAO member artists. This includes studio time, mixing, mastering, and initial promotion.',
    'funding',
    15000.00,
    'active',
    'studionyne.eth',
    NOW() + INTERVAL '3 days'
  ),
  (
    'Partnership with SoundScape Festival 2026',
    'Establish official partnership for label showcase stage, including artist lineup curation by DAO vote. Expected exposure to 50K+ attendees.',
    'partnership',
    NULL,
    'active',
    'presidentanderson.eth',
    NOW() + INTERVAL '5 days'
  ),
  (
    'Launch Remix Bounty Program',
    'Create incentive program for community remixes with $500 bounties per approved remix, funded quarterly. Estimated 20 remixes per quarter.',
    'creative',
    10000.00,
    'draft',
    'lexchronos.eth',
    NOW() + INTERVAL '7 days'
  );

-- Sample votes
INSERT INTO dao_votes (proposal_id, voter_wallet, vote_weight, vote_type)
SELECT
  (SELECT id FROM dao_proposals WHERE title LIKE 'Fund "Midnight%' LIMIT 1),
  'voter1.eth',
  3,
  'for';

INSERT INTO dao_votes (proposal_id, voter_wallet, vote_weight, vote_type)
SELECT
  (SELECT id FROM dao_proposals WHERE title LIKE 'Fund "Midnight%' LIMIT 1),
  'voter2.eth',
  2,
  'for';

INSERT INTO dao_votes (proposal_id, voter_wallet, vote_weight, vote_type)
SELECT
  (SELECT id FROM dao_proposals WHERE title LIKE 'Fund "Midnight%' LIMIT 1),
  'voter3.eth',
  1,
  'against';

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE dao_proposals IS 'Stores all DAO governance proposals including funding requests, partnerships, and governance changes';
COMMENT ON TABLE dao_votes IS 'Records all votes cast on proposals with weighted voting based on token tier';
COMMENT ON FUNCTION get_voter_tier IS 'Calculates voting weight multiplier based on token holdings (1-5x)';
COMMENT ON VIEW proposal_vote_summary IS 'Aggregated view of vote counts per proposal for quick dashboard queries';
