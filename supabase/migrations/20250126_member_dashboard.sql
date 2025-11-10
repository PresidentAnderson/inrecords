-- Member Dashboard Migration
-- Phase 6: Member Portal - Authentication & Membership Tiers

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- DAO Members Table (Enhanced for Dashboard)
-- =====================================================
CREATE TABLE IF NOT EXISTS dao_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Authentication
    wallet_address TEXT UNIQUE NOT NULL,
    email TEXT,
    username TEXT UNIQUE,

    -- Profile Information
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,

    -- Membership Tier
    membership_tier TEXT NOT NULL DEFAULT 'bronze' CHECK (
        membership_tier IN ('bronze', 'silver', 'gold', 'platinum')
    ),
    token_balance INTEGER DEFAULT 0,

    -- NFT Card Data
    card_image_url TEXT,
    card_number TEXT UNIQUE, -- Format: INR-XXXX-XXXX
    card_issued_at TIMESTAMP WITH TIME ZONE,

    -- Activity Tracking
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,

    -- Statistics
    total_votes_cast INTEGER DEFAULT 0,
    total_proposals_created INTEGER DEFAULT 0,
    total_contributions_usd DECIMAL(10,2) DEFAULT 0,

    -- Preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    discord_notifications BOOLEAN DEFAULT TRUE,
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'fr', 'pt')),

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_token_balance CHECK (token_balance >= 0)
);

-- =====================================================
-- DAO Proposals Table
-- =====================================================
CREATE TABLE IF NOT EXISTS dao_proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Proposal Details
    title TEXT NOT NULL,
    description TEXT,
    proposal_type TEXT NOT NULL CHECK (
        proposal_type IN ('grant', 'governance', 'technical', 'partnership', 'other')
    ),

    -- Funding
    funding_amount DECIMAL(10,2),
    funding_goal DECIMAL(10,2),
    current_funding DECIMAL(10,2) DEFAULT 0,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (
        status IN ('draft', 'active', 'approved', 'rejected', 'funded', 'completed', 'cancelled')
    ),

    -- Creator
    created_by TEXT REFERENCES dao_members(wallet_address),
    created_by_name TEXT,

    -- Voting
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    votes_abstain INTEGER DEFAULT 0,
    voting_starts_at TIMESTAMP WITH TIME ZONE,
    voting_ends_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    attachments JSONB DEFAULT '[]'::JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DAO Votes Table
-- =====================================================
CREATE TABLE IF NOT EXISTS dao_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Voting Details
    proposal_id UUID NOT NULL REFERENCES dao_proposals(id) ON DELETE CASCADE,
    voter_address TEXT NOT NULL REFERENCES dao_members(wallet_address),
    voter_name TEXT,

    -- Vote
    vote_type TEXT NOT NULL CHECK (vote_type IN ('for', 'against', 'abstain')),
    vote_weight INTEGER DEFAULT 1,

    -- Metadata
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_vote_per_proposal UNIQUE (proposal_id, voter_address)
);

-- =====================================================
-- DAO Treasury Table
-- =====================================================
CREATE TABLE IF NOT EXISTS dao_treasury (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Transaction Details
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN ('deposit', 'withdrawal', 'funding', 'revenue', 'fee')
    ),
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',

    -- References
    proposal_id UUID REFERENCES dao_proposals(id),
    contributor_wallet TEXT REFERENCES dao_members(wallet_address),

    -- Description
    description TEXT,

    -- Transaction Hash (for blockchain transactions)
    tx_hash TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB
);

-- =====================================================
-- Member Activity Log
-- =====================================================
CREATE TABLE IF NOT EXISTS member_activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Member
    member_id UUID NOT NULL REFERENCES dao_members(id) ON DELETE CASCADE,
    member_wallet TEXT NOT NULL REFERENCES dao_members(wallet_address),

    -- Activity
    activity_type TEXT NOT NULL CHECK (
        activity_type IN ('login', 'vote', 'proposal_created', 'comment', 'contribution', 'tier_upgrade')
    ),
    activity_description TEXT,

    -- References
    reference_id UUID, -- Could be proposal_id, vote_id, etc.
    reference_type TEXT, -- 'proposal', 'vote', etc.

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- DAO Members Indexes
CREATE INDEX idx_dao_members_wallet ON dao_members(wallet_address);
CREATE INDEX idx_dao_members_email ON dao_members(email) WHERE email IS NOT NULL;
CREATE INDEX idx_dao_members_username ON dao_members(username) WHERE username IS NOT NULL;
CREATE INDEX idx_dao_members_tier ON dao_members(membership_tier);
CREATE INDEX idx_dao_members_joined_at ON dao_members(joined_at DESC);
CREATE INDEX idx_dao_members_last_activity ON dao_members(last_activity_at DESC);
CREATE INDEX idx_dao_members_token_balance ON dao_members(token_balance DESC);

-- DAO Proposals Indexes
CREATE INDEX idx_dao_proposals_status ON dao_proposals(status);
CREATE INDEX idx_dao_proposals_created_by ON dao_proposals(created_by);
CREATE INDEX idx_dao_proposals_created_at ON dao_proposals(created_at DESC);
CREATE INDEX idx_dao_proposals_voting_ends ON dao_proposals(voting_ends_at);
CREATE INDEX idx_dao_proposals_type ON dao_proposals(proposal_type);
CREATE INDEX idx_dao_proposals_tags ON dao_proposals USING GIN(tags);

-- DAO Votes Indexes
CREATE INDEX idx_dao_votes_proposal_id ON dao_votes(proposal_id);
CREATE INDEX idx_dao_votes_voter_address ON dao_votes(voter_address);
CREATE INDEX idx_dao_votes_created_at ON dao_votes(created_at DESC);

-- DAO Treasury Indexes
CREATE INDEX idx_dao_treasury_transaction_type ON dao_treasury(transaction_type);
CREATE INDEX idx_dao_treasury_proposal_id ON dao_treasury(proposal_id);
CREATE INDEX idx_dao_treasury_contributor ON dao_treasury(contributor_wallet);
CREATE INDEX idx_dao_treasury_created_at ON dao_treasury(created_at DESC);

-- Member Activity Indexes
CREATE INDEX idx_member_activity_member_id ON member_activity_log(member_id);
CREATE INDEX idx_member_activity_wallet ON member_activity_log(member_wallet);
CREATE INDEX idx_member_activity_type ON member_activity_log(activity_type);
CREATE INDEX idx_member_activity_created_at ON member_activity_log(created_at DESC);

-- =====================================================
-- Functions
-- =====================================================

-- Function: Update member's last activity timestamp
CREATE OR REPLACE FUNCTION update_member_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE dao_members
    SET last_activity_at = NOW()
    WHERE wallet_address = NEW.member_wallet;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update member activity on activity log insert
CREATE TRIGGER trigger_update_member_activity
    AFTER INSERT ON member_activity_log
    FOR EACH ROW
    EXECUTE FUNCTION update_member_activity();

-- Function: Update member tier based on token balance
CREATE OR REPLACE FUNCTION update_member_tier()
RETURNS TRIGGER AS $$
BEGIN
    -- Update tier based on token balance
    IF NEW.token_balance >= 5000 THEN
        NEW.membership_tier := 'platinum';
    ELSIF NEW.token_balance >= 1000 THEN
        NEW.membership_tier := 'gold';
    ELSIF NEW.token_balance >= 500 THEN
        NEW.membership_tier := 'silver';
    ELSE
        NEW.membership_tier := 'bronze';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update tier on token balance change
CREATE TRIGGER trigger_update_member_tier
    BEFORE INSERT OR UPDATE OF token_balance ON dao_members
    FOR EACH ROW
    EXECUTE FUNCTION update_member_tier();

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers: Auto-update updated_at
CREATE TRIGGER trigger_dao_members_updated_at
    BEFORE UPDATE ON dao_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_dao_proposals_updated_at
    BEFORE UPDATE ON dao_proposals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function: Increment member vote count
CREATE OR REPLACE FUNCTION increment_member_vote_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE dao_members
    SET total_votes_cast = total_votes_cast + 1
    WHERE wallet_address = NEW.voter_address;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-increment vote count
CREATE TRIGGER trigger_increment_vote_count
    AFTER INSERT ON dao_votes
    FOR EACH ROW
    EXECUTE FUNCTION increment_member_vote_count();

-- Function: Increment proposal count
CREATE OR REPLACE FUNCTION increment_proposal_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE dao_members
    SET total_proposals_created = total_proposals_created + 1
    WHERE wallet_address = NEW.created_by;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-increment proposal count
CREATE TRIGGER trigger_increment_proposal_count
    AFTER INSERT ON dao_proposals
    FOR EACH ROW
    WHEN (NEW.created_by IS NOT NULL)
    EXECUTE FUNCTION increment_proposal_count();

-- Function: Update proposal vote counts
CREATE OR REPLACE FUNCTION update_proposal_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE dao_proposals
    SET
        votes_for = (SELECT COUNT(*) FROM dao_votes WHERE proposal_id = NEW.proposal_id AND vote_type = 'for'),
        votes_against = (SELECT COUNT(*) FROM dao_votes WHERE proposal_id = NEW.proposal_id AND vote_type = 'against'),
        votes_abstain = (SELECT COUNT(*) FROM dao_votes WHERE proposal_id = NEW.proposal_id AND vote_type = 'abstain')
    WHERE id = NEW.proposal_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update proposal vote counts
CREATE TRIGGER trigger_update_proposal_votes
    AFTER INSERT OR UPDATE OR DELETE ON dao_votes
    FOR EACH ROW
    EXECUTE FUNCTION update_proposal_vote_counts();

-- Function: Get member dashboard data
CREATE OR REPLACE FUNCTION get_member_dashboard_data(p_wallet_address TEXT)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_member JSONB;
    v_recent_votes JSONB;
    v_recent_proposals JSONB;
    v_activity JSONB;
    v_stats JSONB;
BEGIN
    -- Get member data
    SELECT jsonb_build_object(
        'id', id,
        'wallet_address', wallet_address,
        'display_name', display_name,
        'username', username,
        'membership_tier', membership_tier,
        'token_balance', token_balance,
        'card_number', card_number,
        'joined_at', joined_at,
        'total_votes_cast', total_votes_cast,
        'total_proposals_created', total_proposals_created,
        'total_contributions_usd', total_contributions_usd
    ) INTO v_member
    FROM dao_members
    WHERE wallet_address = p_wallet_address;

    -- Get recent votes (last 5)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', v.id,
            'proposal_id', v.proposal_id,
            'proposal_title', p.title,
            'vote_type', v.vote_type,
            'created_at', v.created_at
        )
    ) INTO v_recent_votes
    FROM (
        SELECT * FROM dao_votes
        WHERE voter_address = p_wallet_address
        ORDER BY created_at DESC
        LIMIT 5
    ) v
    LEFT JOIN dao_proposals p ON v.proposal_id = p.id;

    -- Get proposals created by member (last 5)
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'title', title,
            'status', status,
            'votes_for', votes_for,
            'votes_against', votes_against,
            'created_at', created_at
        )
    ) INTO v_recent_proposals
    FROM (
        SELECT * FROM dao_proposals
        WHERE created_by = p_wallet_address
        ORDER BY created_at DESC
        LIMIT 5
    ) proposals;

    -- Get recent activity (last 10)
    SELECT jsonb_agg(
        jsonb_build_object(
            'activity_type', activity_type,
            'activity_description', activity_description,
            'created_at', created_at
        )
    ) INTO v_activity
    FROM (
        SELECT * FROM member_activity_log
        WHERE member_wallet = p_wallet_address
        ORDER BY created_at DESC
        LIMIT 10
    ) activity;

    -- Get participation stats
    SELECT jsonb_build_object(
        'vote_participation_rate', COALESCE(
            ROUND(
                (SELECT COUNT(DISTINCT proposal_id)::NUMERIC FROM dao_votes WHERE voter_address = p_wallet_address) /
                NULLIF((SELECT COUNT(*)::NUMERIC FROM dao_proposals WHERE status IN ('active', 'completed')), 0),
                4
            ),
            0
        ),
        'total_active_proposals', (SELECT COUNT(*) FROM dao_proposals WHERE status = 'active'),
        'member_rank_by_votes', (
            SELECT COUNT(*) + 1
            FROM dao_members
            WHERE total_votes_cast > (SELECT total_votes_cast FROM dao_members WHERE wallet_address = p_wallet_address)
        )
    ) INTO v_stats;

    -- Combine all data
    RETURN jsonb_build_object(
        'member', v_member,
        'recent_votes', COALESCE(v_recent_votes, '[]'::jsonb),
        'recent_proposals', COALESCE(v_recent_proposals, '[]'::jsonb),
        'recent_activity', COALESCE(v_activity, '[]'::jsonb),
        'stats', v_stats
    );
END;
$$;

-- Function: Generate unique card number
CREATE OR REPLACE FUNCTION generate_card_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_card_number TEXT;
    v_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate format: INR-XXXX-XXXX where X is a random digit
        v_card_number := 'INR-' ||
            LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || '-' ||
            LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');

        -- Check if it already exists
        SELECT EXISTS(SELECT 1 FROM dao_members WHERE card_number = v_card_number) INTO v_exists;

        EXIT WHEN NOT v_exists;
    END LOOP;

    RETURN v_card_number;
END;
$$;

-- Function: Issue membership card
CREATE OR REPLACE FUNCTION issue_membership_card(p_wallet_address TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_card_number TEXT;
BEGIN
    -- Generate card number
    v_card_number := generate_card_number();

    -- Update member record
    UPDATE dao_members
    SET
        card_number = v_card_number,
        card_issued_at = NOW()
    WHERE wallet_address = p_wallet_address
        AND card_number IS NULL;

    RETURN v_card_number;
END;
$$;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE dao_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dao_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE dao_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dao_treasury ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activity_log ENABLE ROW LEVEL SECURITY;

-- Members: Public can view basic info, members can view/update their own
CREATE POLICY "Public can view member profiles"
    ON dao_members
    FOR SELECT
    USING (TRUE);

CREATE POLICY "Members can update own profile"
    ON dao_members
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'wallet_address' = wallet_address);

CREATE POLICY "Anyone can create member profile"
    ON dao_members
    FOR INSERT
    WITH CHECK (TRUE);

-- Proposals: Public read, authenticated can create
CREATE POLICY "Public can view proposals"
    ON dao_proposals
    FOR SELECT
    USING (TRUE);

CREATE POLICY "Authenticated can create proposals"
    ON dao_proposals
    FOR INSERT
    TO authenticated
    WITH CHECK (TRUE);

CREATE POLICY "Creators can update own proposals"
    ON dao_proposals
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.jwt() ->> 'wallet_address');

-- Votes: Members can view all, only vote once per proposal
CREATE POLICY "Public can view votes"
    ON dao_votes
    FOR SELECT
    USING (TRUE);

CREATE POLICY "Authenticated members can vote"
    ON dao_votes
    FOR INSERT
    TO authenticated
    WITH CHECK (voter_address = auth.jwt() ->> 'wallet_address');

-- Treasury: Public read access
CREATE POLICY "Public can view treasury"
    ON dao_treasury
    FOR SELECT
    USING (TRUE);

CREATE POLICY "Admins can manage treasury"
    ON dao_treasury
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Activity: Members can view own activity
CREATE POLICY "Members can view own activity"
    ON member_activity_log
    FOR SELECT
    TO authenticated
    USING (member_wallet = auth.jwt() ->> 'wallet_address');

CREATE POLICY "System can log activity"
    ON member_activity_log
    FOR INSERT
    WITH CHECK (TRUE);

-- =====================================================
-- Sample Data (for testing)
-- =====================================================
-- Uncomment to insert sample data

/*
-- Sample member
INSERT INTO dao_members (
    wallet_address,
    username,
    display_name,
    email,
    membership_tier,
    token_balance
) VALUES (
    '0x1234567890abcdef1234567890abcdef12345678',
    'president_anderson',
    'President Anderson',
    'president@inrecord.io',
    'platinum',
    10000
);

-- Generate card for member
SELECT issue_membership_card('0x1234567890abcdef1234567890abcdef12345678');
*/

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE dao_members IS 'DAO members with authentication and tier system';
COMMENT ON TABLE dao_proposals IS 'DAO governance proposals';
COMMENT ON TABLE dao_votes IS 'Member votes on proposals';
COMMENT ON TABLE dao_treasury IS 'DAO treasury transactions';
COMMENT ON TABLE member_activity_log IS 'Activity log for member dashboard';

COMMENT ON COLUMN dao_members.membership_tier IS 'bronze: 100+, silver: 500+, gold: 1000+, platinum: 5000+';
COMMENT ON COLUMN dao_members.card_number IS 'Unique NFT-style membership card number';
COMMENT ON COLUMN dao_members.token_balance IS 'Current $RECORD token balance';

COMMENT ON FUNCTION get_member_dashboard_data IS 'Get comprehensive dashboard data for a member';
COMMENT ON FUNCTION generate_card_number IS 'Generate unique membership card number in format INR-XXXX-XXXX';
COMMENT ON FUNCTION issue_membership_card IS 'Issue a new membership card to a member';
