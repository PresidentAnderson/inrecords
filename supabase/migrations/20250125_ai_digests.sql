-- AI Digests Migration
-- Phase 4: AI Transparency Digest System

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- AI Digests Table
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_digests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,

    -- Content in multiple languages
    summary_en TEXT NOT NULL,
    summary_fr TEXT,
    summary_pt TEXT,

    -- Analysis
    sentiment TEXT CHECK (sentiment IN ('optimistic', 'stable', 'critical', 'mixed')),

    -- Metrics
    key_metrics JSONB DEFAULT '{}'::JSONB,
    highlights TEXT[] DEFAULT ARRAY[]::TEXT[],

    -- Audio files
    audio_url_en TEXT,
    audio_url_fr TEXT,
    audio_url_pt TEXT,
    audio_duration_seconds INTEGER,

    -- Publication status
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP WITH TIME ZONE,

    -- Distribution tracking
    discord_sent BOOLEAN DEFAULT FALSE,
    email_sent BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    generated_by TEXT DEFAULT 'gpt-4',

    -- Constraints
    CONSTRAINT valid_week_range CHECK (week_end > week_start),
    CONSTRAINT unique_week_start UNIQUE (week_start)
);

-- =====================================================
-- Digest Distributions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS digest_distributions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    digest_id UUID NOT NULL REFERENCES ai_digests(id) ON DELETE CASCADE,

    -- Distribution details
    channel TEXT NOT NULL CHECK (channel IN ('discord', 'email', 'rss', 'twitter')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),

    -- Metrics
    recipient_count INTEGER DEFAULT 0,

    -- Timestamps
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Error handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Constraints
    CONSTRAINT unique_digest_channel UNIQUE (digest_id, channel)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX idx_ai_digests_week_start ON ai_digests(week_start DESC);
CREATE INDEX idx_ai_digests_created_at ON ai_digests(created_at DESC);
CREATE INDEX idx_ai_digests_published ON ai_digests(published) WHERE published = TRUE;
CREATE INDEX idx_ai_digests_sentiment ON ai_digests(sentiment);
CREATE INDEX idx_ai_digests_published_at ON ai_digests(published_at DESC) WHERE published = TRUE;

CREATE INDEX idx_digest_distributions_digest_id ON digest_distributions(digest_id);
CREATE INDEX idx_digest_distributions_channel ON digest_distributions(channel);
CREATE INDEX idx_digest_distributions_status ON digest_distributions(status);

-- GIN index for JSONB metrics
CREATE INDEX idx_ai_digests_key_metrics ON ai_digests USING GIN (key_metrics);

-- =====================================================
-- Functions
-- =====================================================

-- Function: Get weekly DAO statistics
CREATE OR REPLACE FUNCTION get_weekly_dao_stats(
    p_week_start DATE,
    p_week_end DATE
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_stats JSONB;
    v_proposals JSONB;
    v_voting JSONB;
    v_treasury JSONB;
    v_members JSONB;
BEGIN
    -- Proposals statistics (if dao_proposals table exists)
    SELECT jsonb_build_object(
        'new', COUNT(*) FILTER (WHERE created_at::DATE BETWEEN p_week_start AND p_week_end),
        'approved', COUNT(*) FILTER (WHERE status = 'approved' AND updated_at::DATE BETWEEN p_week_start AND p_week_end),
        'rejected', COUNT(*) FILTER (WHERE status = 'rejected' AND updated_at::DATE BETWEEN p_week_start AND p_week_end),
        'funded', COUNT(*) FILTER (WHERE status = 'funded' AND updated_at::DATE BETWEEN p_week_start AND p_week_end),
        'total_funding', COALESCE(SUM(funding_amount) FILTER (WHERE status = 'funded' AND updated_at::DATE BETWEEN p_week_start AND p_week_end), 0)
    ) INTO v_proposals
    FROM dao_proposals
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dao_proposals');

    -- If dao_proposals doesn't exist, use default values
    IF v_proposals IS NULL THEN
        v_proposals := jsonb_build_object(
            'new', 0,
            'approved', 0,
            'rejected', 0,
            'funded', 0,
            'total_funding', 0
        );
    END IF;

    -- Voting statistics (if dao_votes table exists)
    SELECT jsonb_build_object(
        'votes_cast', COUNT(*),
        'unique_voters', COUNT(DISTINCT voter_address),
        'participation_rate', ROUND(COUNT(DISTINCT voter_address)::NUMERIC / NULLIF((SELECT COUNT(*) FROM dao_members), 0), 4)
    ) INTO v_voting
    FROM dao_votes
    WHERE created_at::DATE BETWEEN p_week_start AND p_week_end
    AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dao_votes');

    -- If dao_votes doesn't exist, use default values
    IF v_voting IS NULL THEN
        v_voting := jsonb_build_object(
            'votes_cast', 0,
            'unique_voters', 0,
            'participation_rate', 0
        );
    END IF;

    -- Treasury statistics (if dao_treasury table exists)
    SELECT jsonb_build_object(
        'deposits', COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'deposit' AND created_at::DATE BETWEEN p_week_start AND p_week_end), 0),
        'withdrawals', COALESCE(SUM(amount) FILTER (WHERE transaction_type = 'withdrawal' AND created_at::DATE BETWEEN p_week_start AND p_week_end), 0),
        'net_change', COALESCE(
            SUM(amount) FILTER (WHERE transaction_type = 'deposit' AND created_at::DATE BETWEEN p_week_start AND p_week_end), 0
        ) - COALESCE(
            SUM(amount) FILTER (WHERE transaction_type = 'withdrawal' AND created_at::DATE BETWEEN p_week_start AND p_week_end), 0
        )
    ) INTO v_treasury
    FROM dao_treasury
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dao_treasury');

    -- If dao_treasury doesn't exist, use default values
    IF v_treasury IS NULL THEN
        v_treasury := jsonb_build_object(
            'deposits', 0,
            'withdrawals', 0,
            'net_change', 0
        );
    END IF;

    -- Members statistics (if dao_members table exists)
    SELECT jsonb_build_object(
        'new_members', COUNT(*) FILTER (WHERE joined_at::DATE BETWEEN p_week_start AND p_week_end),
        'total_members', COUNT(*),
        'active_members', COUNT(*) FILTER (WHERE last_activity_at::DATE BETWEEN p_week_start AND p_week_end)
    ) INTO v_members
    FROM dao_members
    WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'dao_members');

    -- If dao_members doesn't exist, use default values
    IF v_members IS NULL THEN
        v_members := jsonb_build_object(
            'new_members', 0,
            'total_members', 0,
            'active_members', 0
        );
    END IF;

    -- Combine all statistics
    v_stats := jsonb_build_object(
        'proposals', v_proposals,
        'voting', v_voting,
        'treasury', v_treasury,
        'members', v_members,
        'week_start', p_week_start,
        'week_end', p_week_end
    );

    RETURN v_stats;
END;
$$;

-- Function: Get latest published digest
CREATE OR REPLACE FUNCTION get_latest_published_digest()
RETURNS SETOF ai_digests
LANGUAGE sql
STABLE
AS $$
    SELECT *
    FROM ai_digests
    WHERE published = TRUE
    ORDER BY published_at DESC
    LIMIT 1;
$$;

-- Function: Get digest archive with pagination
CREATE OR REPLACE FUNCTION get_digest_archive(
    p_limit INT DEFAULT 10,
    p_offset INT DEFAULT 0,
    p_sentiment TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    week_start DATE,
    week_end DATE,
    summary_en TEXT,
    summary_fr TEXT,
    summary_pt TEXT,
    sentiment TEXT,
    key_metrics JSONB,
    highlights TEXT[],
    audio_url_en TEXT,
    audio_url_fr TEXT,
    audio_url_pt TEXT,
    audio_duration_seconds INTEGER,
    published_at TIMESTAMP WITH TIME ZONE,
    total_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.week_start,
        d.week_end,
        d.summary_en,
        d.summary_fr,
        d.summary_pt,
        d.sentiment,
        d.key_metrics,
        d.highlights,
        d.audio_url_en,
        d.audio_url_fr,
        d.audio_url_pt,
        d.audio_duration_seconds,
        d.published_at,
        COUNT(*) OVER() as total_count
    FROM ai_digests d
    WHERE d.published = TRUE
        AND (p_sentiment IS NULL OR d.sentiment = p_sentiment)
    ORDER BY d.published_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on ai_digests
CREATE TRIGGER trigger_ai_digests_updated_at
    BEFORE UPDATE ON ai_digests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE ai_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_distributions ENABLE ROW LEVEL SECURITY;

-- Public read access to published digests
CREATE POLICY "Public can view published digests"
    ON ai_digests
    FOR SELECT
    USING (published = TRUE);

-- Authenticated users can view all digests
CREATE POLICY "Authenticated users can view all digests"
    ON ai_digests
    FOR SELECT
    TO authenticated
    USING (TRUE);

-- Only admins can insert/update/delete digests
CREATE POLICY "Admins can manage digests"
    ON ai_digests
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Distribution policies
CREATE POLICY "Authenticated users can view distributions"
    ON digest_distributions
    FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Admins can manage distributions"
    ON digest_distributions
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- =====================================================
-- Sample Data (for testing)
-- =====================================================
-- Uncomment below to insert sample data

/*
INSERT INTO ai_digests (
    week_start,
    week_end,
    summary_en,
    sentiment,
    key_metrics,
    highlights,
    published,
    published_at
) VALUES (
    '2025-01-08',
    '2025-01-14',
    '# Weekly DAO Digest - Week of January 8-14, 2025

## Overview
This week marked a significant milestone for inRECORD DAO with record voter turnout and strong community engagement. Three artist grant proposals were approved, demonstrating our commitment to supporting emerging talent.

## Proposals & Voting
- 5 new proposals submitted this week
- 3 proposals approved with strong community support
- 1 proposal rejected after thorough discussion
- 2 proposals successfully funded totaling 7.5 ETH

Voter participation reached an impressive 62%, our highest turnout in three months. This shows growing community investment in our collective decision-making process.

## Treasury Activity
The treasury saw healthy growth this week with 5,000 USDC in deposits and 2,500 USDC in approved withdrawals for funded projects. Our net treasury change of +2,500 USDC brings our total balance to 127,000 USDC.

## Community Growth
We welcomed 12 new members to the DAO this week, bringing our total community to 2,847 members. Active participation continues to rise with 342 members engaging in governance activities.

## Highlights
- Record voter turnout at 62%
- 3 artist grants approved totaling 7.5 ETH
- New studio equipment proposal funded
- Community AMA session scheduled for next week

## Looking Ahead
Next week, we have several high-impact proposals in the pipeline, including a collaboration with a major music festival and expansion of our educational programs. Stay engaged and make your voice heard!',
    'optimistic',
    '{"proposals": {"new": 5, "approved": 3, "rejected": 1, "funded": 2, "total_funding": 12500}, "voting": {"votes_cast": 120, "unique_voters": 45, "participation_rate": 0.62}, "treasury": {"deposits": 5000, "withdrawals": 2500, "net_change": 2500}, "members": {"new_members": 12, "total_members": 2847, "active_members": 342}}'::JSONB,
    ARRAY['Record voter turnout at 62%', '3 artist grants approved totaling 7.5 ETH', 'New studio equipment proposal funded'],
    TRUE,
    NOW()
);
*/

-- =====================================================
-- Comments
-- =====================================================
COMMENT ON TABLE ai_digests IS 'AI-generated weekly transparency digests for DAO activity';
COMMENT ON TABLE digest_distributions IS 'Tracks distribution of digests across multiple channels';

COMMENT ON COLUMN ai_digests.summary_en IS 'English summary generated by GPT-4';
COMMENT ON COLUMN ai_digests.summary_fr IS 'French translation of summary';
COMMENT ON COLUMN ai_digests.summary_pt IS 'Portuguese translation of summary';
COMMENT ON COLUMN ai_digests.sentiment IS 'Overall sentiment: optimistic, stable, critical, or mixed';
COMMENT ON COLUMN ai_digests.key_metrics IS 'JSON object containing proposals, voting, treasury, and member metrics';
COMMENT ON COLUMN ai_digests.highlights IS 'Array of 3-5 key highlights from the week';

COMMENT ON FUNCTION get_weekly_dao_stats IS 'Aggregates DAO activity statistics for a given week range';
COMMENT ON FUNCTION get_latest_published_digest IS 'Returns the most recently published digest';
COMMENT ON FUNCTION get_digest_archive IS 'Returns paginated archive of published digests with optional sentiment filter';
