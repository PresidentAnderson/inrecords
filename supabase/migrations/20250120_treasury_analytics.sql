-- Phase 3: Treasury & Analytics Dashboard Migration
-- Created: 2025-01-20
-- Purpose: Enable DAO treasury management and analytics tracking

-- ============================================================
-- 1. DAO TREASURY TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS dao_treasury (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'proposal_funding', 'grant', 'revenue', 'expense')),
  amount DECIMAL(20, 8) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'ETH',
  proposal_id UUID REFERENCES dao_proposals(id) ON DELETE SET NULL,
  contributor_wallet TEXT,
  recipient_wallet TEXT,
  transaction_hash TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT NOT NULL,

  -- Constraints
  CONSTRAINT valid_transaction_hash CHECK (transaction_hash IS NULL OR LENGTH(transaction_hash) > 0),
  CONSTRAINT valid_wallets CHECK (
    (transaction_type IN ('deposit', 'revenue') AND contributor_wallet IS NOT NULL) OR
    (transaction_type IN ('withdrawal', 'proposal_funding', 'grant', 'expense') AND recipient_wallet IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_treasury_transaction_type ON dao_treasury(transaction_type);
CREATE INDEX idx_treasury_created_at ON dao_treasury(created_at DESC);
CREATE INDEX idx_treasury_proposal_id ON dao_treasury(proposal_id) WHERE proposal_id IS NOT NULL;
CREATE INDEX idx_treasury_contributor_wallet ON dao_treasury(contributor_wallet) WHERE contributor_wallet IS NOT NULL;
CREATE INDEX idx_treasury_recipient_wallet ON dao_treasury(recipient_wallet) WHERE recipient_wallet IS NOT NULL;
CREATE INDEX idx_treasury_currency ON dao_treasury(currency);

-- ============================================================
-- 2. MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================

-- DAO Analytics View
CREATE MATERIALIZED VIEW dao_analytics AS
SELECT
  COUNT(DISTINCT id) as total_proposals,
  SUM(CASE WHEN status = 'funded' THEN 1 ELSE 0 END) as funded_count,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
  SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
  SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
  COALESCE(SUM(current_funding), 0) as total_raised,
  AVG(CASE WHEN status = 'funded' AND current_funding > 0 THEN current_funding ELSE NULL END) as avg_funding_per_proposal,
  COUNT(DISTINCT created_by) as unique_proposers,
  MAX(created_at) as last_proposal_date,
  NOW() as last_updated
FROM dao_proposals;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX dao_analytics_idx ON dao_analytics(last_updated);

-- Treasury Summary View
CREATE MATERIALIZED VIEW treasury_summary AS
SELECT
  COALESCE(SUM(CASE WHEN transaction_type IN ('deposit', 'revenue') THEN amount ELSE 0 END), 0) as total_inflow,
  COALESCE(SUM(CASE WHEN transaction_type IN ('withdrawal', 'proposal_funding', 'grant', 'expense') THEN amount ELSE 0 END), 0) as total_outflow,
  COALESCE(SUM(CASE WHEN transaction_type IN ('deposit', 'revenue') THEN amount ELSE -amount END), 0) as current_balance,
  COUNT(DISTINCT contributor_wallet) as unique_contributors,
  COUNT(DISTINCT recipient_wallet) as unique_recipients,
  COUNT(*) as total_transactions,
  MAX(created_at) as last_transaction_date,
  NOW() as last_updated
FROM dao_treasury;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX treasury_summary_idx ON treasury_summary(last_updated);

-- Funding Distribution by Proposal Type View
CREATE MATERIALIZED VIEW funding_distribution AS
SELECT
  p.proposal_type,
  COUNT(p.id) as proposal_count,
  COALESCE(SUM(p.current_funding), 0) as total_funding,
  COALESCE(AVG(p.current_funding), 0) as avg_funding,
  COALESCE(SUM(t.amount), 0) as treasury_contribution,
  NOW() as last_updated
FROM dao_proposals p
LEFT JOIN dao_treasury t ON t.proposal_id = p.id AND t.transaction_type = 'proposal_funding'
GROUP BY p.proposal_type;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX funding_distribution_idx ON funding_distribution(proposal_type);

-- ============================================================
-- 3. FUNCTIONS
-- ============================================================

-- Function to refresh all materialized views
CREATE OR REPLACE FUNCTION refresh_dao_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dao_analytics;
  REFRESH MATERIALIZED VIEW CONCURRENTLY treasury_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY funding_distribution;
END;
$$;

-- Function to get current treasury balance
CREATE OR REPLACE FUNCTION get_treasury_balance(p_currency TEXT DEFAULT 'ETH')
RETURNS DECIMAL(20, 8)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_balance DECIMAL(20, 8);
BEGIN
  SELECT COALESCE(
    SUM(CASE
      WHEN transaction_type IN ('deposit', 'revenue') THEN amount
      ELSE -amount
    END),
    0
  )
  INTO v_balance
  FROM dao_treasury
  WHERE currency = p_currency;

  RETURN v_balance;
END;
$$;

-- Function to get funding distribution by proposal type
CREATE OR REPLACE FUNCTION get_funding_distribution()
RETURNS TABLE(
  proposal_type TEXT,
  proposal_count BIGINT,
  total_funding DECIMAL(20, 8),
  avg_funding DECIMAL(20, 8),
  treasury_contribution DECIMAL(20, 8),
  percentage DECIMAL(5, 2)
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_total DECIMAL(20, 8);
BEGIN
  -- Get total funding across all types
  SELECT COALESCE(SUM(current_funding), 0) INTO v_total FROM dao_proposals;

  -- Return distribution with percentages
  RETURN QUERY
  SELECT
    p.proposal_type,
    COUNT(p.id)::BIGINT as proposal_count,
    COALESCE(SUM(p.current_funding), 0) as total_funding,
    COALESCE(AVG(p.current_funding), 0) as avg_funding,
    COALESCE(SUM(t.amount), 0) as treasury_contribution,
    CASE
      WHEN v_total > 0 THEN (COALESCE(SUM(p.current_funding), 0) / v_total * 100)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END as percentage
  FROM dao_proposals p
  LEFT JOIN dao_treasury t ON t.proposal_id = p.id AND t.transaction_type = 'proposal_funding'
  GROUP BY p.proposal_type
  ORDER BY total_funding DESC;
END;
$$;

-- Function to get top contributors
CREATE OR REPLACE FUNCTION get_top_contributors(p_limit INT DEFAULT 10)
RETURNS TABLE(
  contributor_wallet TEXT,
  total_contributed DECIMAL(20, 8),
  contribution_count BIGINT,
  currency TEXT,
  last_contribution TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.contributor_wallet,
    SUM(t.amount) as total_contributed,
    COUNT(*)::BIGINT as contribution_count,
    t.currency,
    MAX(t.created_at) as last_contribution
  FROM dao_treasury t
  WHERE t.transaction_type IN ('deposit', 'revenue')
    AND t.contributor_wallet IS NOT NULL
  GROUP BY t.contributor_wallet, t.currency
  ORDER BY total_contributed DESC
  LIMIT p_limit;
END;
$$;

-- Function to get proposal funding history
CREATE OR REPLACE FUNCTION get_proposal_funding_history(p_proposal_id UUID)
RETURNS TABLE(
  id UUID,
  transaction_type TEXT,
  amount DECIMAL(20, 8),
  currency TEXT,
  contributor_wallet TEXT,
  transaction_hash TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.transaction_type,
    t.amount,
    t.currency,
    t.contributor_wallet,
    t.transaction_hash,
    t.description,
    t.created_at,
    t.created_by
  FROM dao_treasury t
  WHERE t.proposal_id = p_proposal_id
  ORDER BY t.created_at DESC;
END;
$$;

-- Function to get treasury transactions with filters
CREATE OR REPLACE FUNCTION get_treasury_transactions(
  p_transaction_type TEXT DEFAULT NULL,
  p_currency TEXT DEFAULT NULL,
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  transaction_type TEXT,
  amount DECIMAL(20, 8),
  currency TEXT,
  proposal_id UUID,
  contributor_wallet TEXT,
  recipient_wallet TEXT,
  transaction_hash TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT,
  proposal_title TEXT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.transaction_type,
    t.amount,
    t.currency,
    t.proposal_id,
    t.contributor_wallet,
    t.recipient_wallet,
    t.transaction_hash,
    t.description,
    t.created_at,
    t.created_by,
    p.title as proposal_title
  FROM dao_treasury t
  LEFT JOIN dao_proposals p ON t.proposal_id = p.id
  WHERE
    (p_transaction_type IS NULL OR t.transaction_type = p_transaction_type)
    AND (p_currency IS NULL OR t.currency = p_currency)
    AND (p_start_date IS NULL OR t.created_at >= p_start_date)
    AND (p_end_date IS NULL OR t.created_at <= p_end_date)
  ORDER BY t.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================================
-- 4. TRIGGERS
-- ============================================================

-- Trigger to refresh analytics when proposals are updated
CREATE OR REPLACE FUNCTION trigger_refresh_analytics()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Refresh materialized views asynchronously
  PERFORM refresh_dao_analytics();
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_proposal_change
AFTER INSERT OR UPDATE OR DELETE ON dao_proposals
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_analytics();

-- Trigger to update proposal funding when treasury transaction is added
CREATE OR REPLACE FUNCTION trigger_update_proposal_funding()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update if transaction is proposal_funding and proposal_id exists
  IF NEW.transaction_type = 'proposal_funding' AND NEW.proposal_id IS NOT NULL THEN
    UPDATE dao_proposals
    SET
      current_funding = COALESCE(current_funding, 0) + NEW.amount,
      updated_at = NOW()
    WHERE id = NEW.proposal_id;
  END IF;

  -- Refresh analytics
  PERFORM refresh_dao_analytics();

  RETURN NEW;
END;
$$;

CREATE TRIGGER after_treasury_transaction
AFTER INSERT ON dao_treasury
FOR EACH ROW
EXECUTE FUNCTION trigger_update_proposal_funding();

-- Trigger to refresh treasury summary after any treasury change
CREATE OR REPLACE FUNCTION trigger_refresh_treasury_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM refresh_dao_analytics();
  RETURN NEW;
END;
$$;

CREATE TRIGGER after_treasury_change
AFTER INSERT OR UPDATE OR DELETE ON dao_treasury
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_treasury_summary();

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on dao_treasury
ALTER TABLE dao_treasury ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read treasury transactions (transparency)
CREATE POLICY "Public read access to treasury"
ON dao_treasury
FOR SELECT
TO public
USING (true);

-- Policy: Only authenticated users with admin role can insert
CREATE POLICY "Admin insert access to treasury"
ON dao_treasury
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM dao_members
    WHERE wallet_address = auth.jwt() ->> 'sub'
    AND membership_tier IN ('platinum', 'diamond')
  )
);

-- Policy: Only authenticated users with admin role can update
CREATE POLICY "Admin update access to treasury"
ON dao_treasury
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dao_members
    WHERE wallet_address = auth.jwt() ->> 'sub'
    AND membership_tier IN ('platinum', 'diamond')
  )
);

-- Policy: Only authenticated users with admin role can delete
CREATE POLICY "Admin delete access to treasury"
ON dao_treasury
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM dao_members
    WHERE wallet_address = auth.jwt() ->> 'sub'
    AND membership_tier IN ('platinum', 'diamond')
  )
);

-- ============================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE dao_treasury IS 'Tracks all treasury transactions including deposits, withdrawals, and proposal funding';
COMMENT ON COLUMN dao_treasury.transaction_type IS 'Type of transaction: deposit, withdrawal, proposal_funding, grant, revenue, expense';
COMMENT ON COLUMN dao_treasury.amount IS 'Transaction amount with 8 decimal precision';
COMMENT ON COLUMN dao_treasury.currency IS 'Currency type, default is ETH';
COMMENT ON COLUMN dao_treasury.transaction_hash IS 'Blockchain transaction hash for verification';

COMMENT ON MATERIALIZED VIEW dao_analytics IS 'Aggregated analytics for DAO proposals and funding';
COMMENT ON MATERIALIZED VIEW treasury_summary IS 'Summary of treasury inflows, outflows, and current balance';
COMMENT ON MATERIALIZED VIEW funding_distribution IS 'Distribution of funding across proposal types';

COMMENT ON FUNCTION refresh_dao_analytics() IS 'Refreshes all materialized views for analytics';
COMMENT ON FUNCTION get_treasury_balance(TEXT) IS 'Returns current treasury balance for specified currency';
COMMENT ON FUNCTION get_funding_distribution() IS 'Returns funding distribution grouped by proposal type with percentages';
COMMENT ON FUNCTION get_top_contributors(INT) IS 'Returns top N contributors by total contribution amount';

-- ============================================================
-- 7. INITIAL DATA REFRESH
-- ============================================================

-- Perform initial refresh of materialized views
SELECT refresh_dao_analytics();

-- ============================================================
-- END OF MIGRATION
-- ============================================================
