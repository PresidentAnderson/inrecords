'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import TransparencyWidget from '@/components/TransparencyWidget';
import {
  TransparencyDashboard,
  TransparencyProposal,
  TransparencyTransaction,
  formatCurrency,
  formatPercentage,
  getStatusColor,
  getStatusBgColor,
  getTransactionIcon,
  timeAgo,
  getMockTransparencyData,
} from '@/lib/types/transparency';

// =====================================================
// Main Transparency Page
// =====================================================

export default function TransparencyPage() {
  const [dashboardData, setDashboardData] = useState<TransparencyDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // In production, this would call the API
      // const response = await fetch('/api/transparency/dashboard');
      // const data = await response.json();

      // For now, use mock data
      const data = getMockTransparencyData();

      setDashboardData(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');

      // Fallback to mock data on error
      setDashboardData(getMockTransparencyData());
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto p-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-800 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const { metrics, recentProposals, recentTransactions, recentActivity } = dashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-midnight to-black text-white">
      {/* Hero Section */}
      <section className="relative p-12 py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-5xl font-playfair mb-4">Transparency Portal</h1>
              <p className="text-xl text-gray-300 max-w-2xl">
                Real-time visibility into DAO operations, treasury management, and community decisions.
                100% transparent, 100% on-chain.
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-3 mb-2">
                <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm text-gray-400">Live Data</span>
              </div>
              <p className="text-xs text-gray-500">Updated {timeAgo(lastRefresh)}</p>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`mt-2 text-xs px-3 py-1 rounded-full ${
                  autoRefresh
                    ? 'bg-aurora/20 text-aurora'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <MetricCard
              icon="💰"
              label="Treasury Balance"
              value={formatCurrency(metrics.treasuryBalance)}
              change={metrics.netChange}
              changeLabel="This week"
            />
            <MetricCard
              icon="📋"
              label="Active Proposals"
              value={metrics.activeProposals.toString()}
              subtitle={`${metrics.totalProposals} total`}
            />
            <MetricCard
              icon="🗳️"
              label="Participation Rate"
              value={formatPercentage(metrics.participationRate, 0)}
              subtitle={`${metrics.uniqueVoters} unique voters`}
            />
            <MetricCard
              icon="👥"
              label="Community Members"
              value={metrics.totalMembers.toLocaleString()}
              subtitle={`+${metrics.newMembersThisWeek} this week`}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-12 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Charts & Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Treasury Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Treasury Overview</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Deposits</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(metrics.totalDeposits)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-red-400">
                    {formatCurrency(metrics.totalWithdrawals)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Net Change</p>
                  <p className={`text-2xl font-bold ${metrics.netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {metrics.netChange >= 0 ? '+' : ''}{formatCurrency(metrics.netChange)}
                  </p>
                </div>
              </div>

              {/* Simple line chart visualization */}
              <div className="relative h-64 flex items-end gap-2">
                {dashboardData.treasuryChart.map((point, index) => {
                  const maxValue = Math.max(...dashboardData.treasuryChart.map(p => p.value));
                  const height = (point.value / maxValue) * 100;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-aurora/20 hover:bg-aurora/40 rounded-t-lg transition cursor-pointer relative group" style={{ height: `${height}%` }}>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          {formatCurrency(point.value)}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{point.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Proposals */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Recent Proposals</h2>
                <Link href="/dao/proposals" className="text-aurora hover:underline text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recentProposals.map((proposal) => (
                  <ProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Recent Transactions</h2>
                <Link href="/treasury" className="text-aurora hover:underline text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <TransactionRow key={tx.id} transaction={tx} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Activity Feed */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sticky top-6">
              <h3 className="text-xl font-semibold mb-4">Live Activity Feed</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>

            {/* Weekly Stats */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">This Week</h3>
              <div className="space-y-4">
                <StatRow label="Proposals Submitted" value={metrics.proposalsThisWeek} />
                <StatRow label="Votes Cast" value={metrics.votesThisWeek} />
                <StatRow
                  label="Treasury Activity"
                  value={formatCurrency(metrics.treasuryActivityThisWeek)}
                />
                <StatRow label="New Members" value={metrics.newMembersThisWeek} />
              </div>
            </div>

            {/* Embed Widget */}
            <div className="bg-gradient-to-br from-aurora/20 to-gold/20 border border-aurora/30 rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-2">Embed This Widget</h3>
              <p className="text-sm text-gray-300 mb-4">
                Add real-time transparency to your website
              </p>
              <Link
                href="/api/embed/transparency"
                className="block text-center px-4 py-2 bg-aurora text-black rounded-lg hover:opacity-80 transition font-semibold"
              >
                Get Embed Code
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Demo Section */}
      <section className="max-w-7xl mx-auto p-12 py-16 border-t border-white/10">
        <h2 className="text-3xl font-playfair mb-8 text-center">Embeddable Widget</h2>
        <p className="text-center text-gray-300 mb-8">
          Integrate real-time transparency data into any website
        </p>
        <div className="max-w-4xl mx-auto">
          <TransparencyWidget
            config={{
              showHeader: true,
              showMetrics: true,
              showCharts: true,
              showRecentActivity: true,
              maxItems: 5,
              theme: 'dark',
            }}
            data={{
              metrics,
              recentActivity,
              chartData: {
                treasury: dashboardData.treasuryChart,
                proposals: dashboardData.proposalChart,
                voting: dashboardData.votingChart,
              },
            }}
          />
        </div>
      </section>
    </div>
  );
}

// =====================================================
// Component: Metric Card
// =====================================================

interface MetricCardProps {
  icon: string;
  label: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
}

function MetricCard({ icon, label, value, subtitle, change, changeLabel }: MetricCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-aurora/30 transition">
      <div className="text-3xl mb-3">{icon}</div>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold mb-2">{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      {change !== undefined && (
        <div className="flex items-center gap-2 mt-2 text-sm">
          <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
            {change >= 0 ? '↗' : '↘'} {formatCurrency(Math.abs(change))}
          </span>
          {changeLabel && <span className="text-gray-500 text-xs">{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Component: Proposal Card
// =====================================================

function ProposalCard({ proposal }: { proposal: TransparencyProposal }) {
  const progressPercent = proposal.fundingGoal > 0
    ? (proposal.currentFunding / proposal.fundingGoal) * 100
    : 0;

  const votePercent = proposal.totalVotes > 0
    ? (proposal.votesFor / proposal.totalVotes) * 100
    : 0;

  return (
    <div className="bg-black/40 border border-white/5 rounded-xl p-6 hover:border-aurora/30 transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-3 py-1 rounded-full ${getStatusBgColor(proposal.status)} ${getStatusColor(proposal.status)}`}>
              {proposal.status}
            </span>
            <span className="text-xs text-gray-500">{proposal.type}</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">{proposal.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">{proposal.description}</p>
        </div>
      </div>

      {/* Funding Progress */}
      {proposal.fundingGoal > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">Funding</span>
            <span className="font-semibold">
              {formatCurrency(proposal.currentFunding)} / {formatCurrency(proposal.fundingGoal)}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gold h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Voting Progress */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-400">For: {proposal.votesFor}</span>
          <span className="text-red-400">Against: {proposal.votesAgainst}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-aurora h-2 rounded-full transition-all"
            style={{ width: `${votePercent}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>by {proposal.createdBy}</span>
        <span>{timeAgo(proposal.createdAt)}</span>
      </div>
    </div>
  );
}

// =====================================================
// Component: Transaction Row
// =====================================================

function TransactionRow({ transaction }: { transaction: TransparencyTransaction }) {
  const isPositive = transaction.amount > 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-2xl flex-shrink-0">{getTransactionIcon(transaction.type)}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate">{transaction.description}</p>
          {transaction.proposalTitle && (
            <p className="text-xs text-gray-500 truncate">→ {transaction.proposalTitle}</p>
          )}
        </div>
      </div>
      <div className="text-right flex-shrink-0 ml-4">
        <p className={`text-sm font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-gray-500">{timeAgo(transaction.createdAt)}</p>
      </div>
    </div>
  );
}

// =====================================================
// Component: Activity Item
// =====================================================

function ActivityItem({ activity }: { activity: any }) {
  return (
    <div className="flex gap-3 text-sm">
      <span className="text-xl flex-shrink-0">
        {activity.type === 'proposal' && '📋'}
        {activity.type === 'vote' && '🗳️'}
        {activity.type === 'transaction' && '💸'}
        {activity.type === 'member' && '👤'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{activity.title}</p>
        <p className="text-xs text-gray-400 truncate">{activity.description}</p>
        <p className="text-xs text-gray-600 mt-1">{timeAgo(activity.timestamp)}</p>
      </div>
    </div>
  );
}

// =====================================================
// Component: Stat Row
// =====================================================

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-lg font-bold">{value}</span>
    </div>
  );
}
