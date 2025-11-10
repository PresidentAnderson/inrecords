-- =====================================================
-- Phase 3: Treasury & Analytics Migration
-- =====================================================

-- Create dao_proposals table (if not exists from Phase 2)
CREATE TABLE IF NOT EXISTS dao_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  proposal_type TEXT NOT NULL,
  funding_goal DECIMAL(10,2),
  current_funding DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  voting_ends_at TIMESTAMP
);

-- Create dao_treasury table for tracking all financial transactions
CREATE TABLE dao_treasury (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('contribution', 'disbursement', 'grant', 'revenue', 'expense')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  proposal_id UUID REFERENCES dao_proposals(id) ON DELETE SET NULL,
  contributor_wallet TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT
);

-- Create indexes for performance
CREATE INDEX idx_treasury_transaction_type ON dao_treasury(transaction_type);
CREATE INDEX idx_treasury_created_at ON dao_treasury(created_at DESC);
CREATE INDEX idx_treasury_proposal_id ON dao_treasury(proposal_id);
CREATE INDEX idx_treasury_contributor ON dao_treasury(contributor_wallet);

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW dao_analytics AS
SELECT
  -- Proposal Statistics
  COUNT(DISTINCT dp.id) as total_proposals,
  SUM(CASE WHEN dp.status = 'funded' THEN 1 ELSE 0 END) as funded_count,
  SUM(CASE WHEN dp.status = 'active' THEN 1 ELSE 0 END) as active_count,
  SUM(CASE WHEN dp.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,

  -- Treasury Statistics
  SUM(dp.current_funding) as total_raised,
  SUM(dp.funding_goal) as total_goals,

  -- Treasury Transactions
  (SELECT COUNT(*) FROM dao_treasury) as total_transactions,
  (SELECT SUM(amount) FROM dao_treasury WHERE transaction_type = 'contribution') as total_contributions,
  (SELECT SUM(amount) FROM dao_treasury WHERE transaction_type = 'disbursement') as total_disbursements,
  (SELECT SUM(amount) FROM dao_treasury WHERE transaction_type = 'grant') as total_grants,
  (SELECT SUM(amount) FROM dao_treasury WHERE transaction_type = 'revenue') as total_revenue,
  (SELECT SUM(amount) FROM dao_treasury WHERE transaction_type = 'expense') as total_expenses,

  -- Current Balance (contributions + revenue - disbursements - expenses)
  COALESCE((SELECT SUM(amount) FROM dao_treasury WHERE transaction_type IN ('contribution', 'revenue')), 0) -
  COALESCE((SELECT SUM(amount) FROM dao_treasury WHERE transaction_type IN ('disbursement', 'expense')), 0) as current_balance,

  -- Activity Metrics
  (SELECT COUNT(DISTINCT contributor_wallet) FROM dao_treasury WHERE contributor_wallet IS NOT NULL) as unique_contributors,

  -- Timestamps
  NOW() as last_updated
FROM dao_proposals dp;

-- Create index on the materialized view
CREATE UNIQUE INDEX idx_dao_analytics_refresh ON dao_analytics(last_updated);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_dao_analytics()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dao_analytics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to auto-refresh analytics
CREATE TRIGGER trigger_refresh_analytics_on_proposal
AFTER INSERT OR UPDATE OR DELETE ON dao_proposals
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dao_analytics();

CREATE TRIGGER trigger_refresh_analytics_on_treasury
AFTER INSERT OR UPDATE OR DELETE ON dao_treasury
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dao_analytics();

-- Create function to update proposal funding when treasury transactions are added
CREATE OR REPLACE FUNCTION update_proposal_funding()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.proposal_id IS NOT NULL AND NEW.transaction_type IN ('contribution', 'grant', 'revenue') THEN
    UPDATE dao_proposals
    SET current_funding = COALESCE(current_funding, 0) + NEW.amount,
        status = CASE
          WHEN (COALESCE(current_funding, 0) + NEW.amount) >= funding_goal THEN 'funded'
          ELSE status
        END
    WHERE id = NEW.proposal_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating proposal funding
CREATE TRIGGER trigger_update_proposal_funding
AFTER INSERT ON dao_treasury
FOR EACH ROW
EXECUTE FUNCTION update_proposal_funding();

-- Create view for recent transactions
CREATE OR REPLACE VIEW recent_treasury_transactions AS
SELECT
  t.id,
  t.transaction_type,
  t.amount,
  t.contributor_wallet,
  t.description,
  t.created_at,
  p.title as proposal_title,
  p.id as proposal_id
FROM dao_treasury t
LEFT JOIN dao_proposals p ON t.proposal_id = p.id
ORDER BY t.created_at DESC
LIMIT 100;

-- Create view for monthly treasury summary
CREATE OR REPLACE VIEW monthly_treasury_summary AS
SELECT
  DATE_TRUNC('month', created_at) as month,
  transaction_type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM dao_treasury
GROUP BY DATE_TRUNC('month', created_at), transaction_type
ORDER BY month DESC, transaction_type;

-- Create view for top contributors
CREATE OR REPLACE VIEW top_contributors AS
SELECT
  contributor_wallet,
  COUNT(*) as contribution_count,
  SUM(amount) as total_contributed,
  MAX(created_at) as last_contribution
FROM dao_treasury
WHERE contributor_wallet IS NOT NULL
  AND transaction_type = 'contribution'
GROUP BY contributor_wallet
ORDER BY total_contributed DESC
LIMIT 50;

-- Create view for proposal funding progress
CREATE OR REPLACE VIEW proposal_funding_progress AS
SELECT
  p.id,
  p.title,
  p.proposal_type,
  p.funding_goal,
  p.current_funding,
  ROUND((p.current_funding / NULLIF(p.funding_goal, 0) * 100)::numeric, 2) as funding_percentage,
  p.status,
  p.created_at,
  p.voting_ends_at,
  COUNT(t.id) as transaction_count,
  ARRAY_AGG(DISTINCT t.contributor_wallet) FILTER (WHERE t.contributor_wallet IS NOT NULL) as contributors
FROM dao_proposals p
LEFT JOIN dao_treasury t ON t.proposal_id = p.id
GROUP BY p.id, p.title, p.proposal_type, p.funding_goal, p.current_funding, p.status, p.created_at, p.voting_ends_at
ORDER BY p.created_at DESC;

-- Enable Row Level Security (RLS)
ALTER TABLE dao_treasury ENABLE ROW LEVEL SECURITY;

-- Create policies for dao_treasury
-- Allow anyone to read treasury data (transparency)
CREATE POLICY "Treasury data is public" ON dao_treasury
  FOR SELECT USING (true);

-- Allow authenticated users to insert transactions (will add wallet verification later)
CREATE POLICY "Authenticated users can add transactions" ON dao_treasury
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only admins can update or delete (for now, using service role)
CREATE POLICY "Only service role can modify" ON dao_treasury
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Only service role can delete" ON dao_treasury
  FOR DELETE USING (auth.role() = 'service_role');

-- Insert initial treasury data (optional seed data)
-- Uncomment to add sample data
/*
INSERT INTO dao_treasury (transaction_type, amount, description) VALUES
  ('contribution', 10000.00, 'Initial DAO treasury funding'),
  ('contribution', 5000.00, 'Community fundraising round 1');
*/

-- Refresh the materialized view for the first time
REFRESH MATERIALIZED VIEW dao_analytics;

-- Create function to get treasury balance
CREATE OR REPLACE FUNCTION get_treasury_balance()
RETURNS DECIMAL(10,2) AS $$
DECLARE
  balance DECIMAL(10,2);
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN transaction_type IN ('contribution', 'revenue', 'grant') THEN amount ELSE -amount END), 0)
  INTO balance
  FROM dao_treasury;

  RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- Create function to get transaction statistics for a date range
CREATE OR REPLACE FUNCTION get_transaction_stats(
  start_date TIMESTAMP DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMP DEFAULT NOW()
)
RETURNS TABLE (
  transaction_type TEXT,
  count BIGINT,
  total DECIMAL(10,2),
  average DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.transaction_type,
    COUNT(*)::BIGINT as count,
    SUM(t.amount)::DECIMAL(10,2) as total,
    AVG(t.amount)::DECIMAL(10,2) as average
  FROM dao_treasury t
  WHERE t.created_at BETWEEN start_date AND end_date
  GROUP BY t.transaction_type
  ORDER BY total DESC;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE dao_treasury IS 'Tracks all financial transactions in the DAO treasury';
COMMENT ON TABLE dao_proposals IS 'Stores DAO proposals with funding goals and status';
COMMENT ON MATERIALIZED VIEW dao_analytics IS 'Aggregated analytics for DAO operations and treasury';
COMMENT ON FUNCTION get_treasury_balance() IS 'Returns current treasury balance';
COMMENT ON FUNCTION get_transaction_stats(TIMESTAMP, TIMESTAMP) IS 'Returns transaction statistics for a date range';
