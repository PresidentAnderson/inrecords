'use client';

/**
 * Treasury Dashboard Page
 * Real-time treasury analytics and visualization dashboard
 */

import React, { useEffect, useState } from 'react';
import {
  getDAOAnalytics,
  getRecentTransactions,
  getMonthlySummary,
  getTopContributors,
  getTransactionStats,
  subscribeToTransactions,
  subscribeToAnalytics,
} from '@/lib/supabase/treasury';
import {
  formatCurrency,
  formatPercentage,
  formatDate,
  getKeyMetrics,
  generateTreasurySummary,
  prepareBalanceChartData,
  prepareTransactionTypeChart,
  prepareMonthlySummaryChart,
  calculateTreasuryHealth,
  getTreasuryStatus,
} from '@/lib/analytics/dao-stats';
import {
  BalanceLineChart,
  MonthlySummaryChart,
  TransactionTypePieChart,
  StatCard,
  ProgressBar,
  ChartSkeleton,
  StatCardSkeleton,
} from '@/components/TreasuryChart';
import type {
  DAOAnalytics,
  RecentTransaction,
  MonthlySummary,
  TopContributor,
  TransactionStats,
  TreasuryTransaction,
} from '@/lib/supabase/types';

export default function TreasuryPage() {
  // State management
  const [analytics, setAnalytics] = useState<DAOAnalytics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [topContributors, setTopContributors] = useState<TopContributor[]>([]);
  const [transactionStats, setTransactionStats] = useState<TransactionStats[]>([]);
  const [allTransactions, setAllTransactions] = useState<TreasuryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        analyticsRes,
        transactionsRes,
        summaryRes,
        contributorsRes,
        statsRes,
      ] = await Promise.all([
        getDAOAnalytics(),
        getRecentTransactions(100),
        getMonthlySummary(12),
        getTopContributors(10),
        getTransactionStats(),
      ]);

      if (analyticsRes.error) throw new Error('Failed to fetch analytics');
      if (transactionsRes.error) throw new Error('Failed to fetch transactions');

      setAnalytics(analyticsRes.data);
      setRecentTransactions(transactionsRes.data || []);
      setMonthlySummary(summaryRes.data || []);
      setTopContributors(contributorsRes.data || []);
      setTransactionStats(statsRes.data || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching treasury data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load treasury data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to new transactions
    const transactionSubscription = subscribeToTransactions((newTransaction) => {
      console.log('New transaction received:', newTransaction);
      fetchData(); // Refresh all data when new transaction arrives
    });

    // Subscribe to analytics updates
    const analyticsSubscription = subscribeToAnalytics((newAnalytics) => {
      setAnalytics(newAnalytics);
      setLastUpdate(new Date());
    });

    // Cleanup subscriptions
    return () => {
      if (transactionSubscription) {
        transactionSubscription.unsubscribe();
      }
      if (analyticsSubscription) {
        analyticsSubscription.unsubscribe();
      }
    };
  }, []);

  // Loading state
  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-2">Error Loading Treasury Data</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Prepare chart data
  const balanceChartData = prepareBalanceChartData(recentTransactions as any);
  const transactionTypeChartData = prepareTransactionTypeChart(transactionStats);
  const monthlySummaryChartData = prepareMonthlySummaryChart(monthlySummary);

  // Generate summary
  const summary = generateTreasurySummary(analytics, recentTransactions as any);
  const keyMetrics = getKeyMetrics(analytics);
  const treasuryStatus = getTreasuryStatus(analytics.current_balance);
  const healthScore = calculateTreasuryHealth(analytics);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Treasury Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Real-time analytics and insights for the inRECORD DAO treasury
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Last updated</div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(lastUpdate, 'MMM dd, yyyy HH:mm:ss')}
              </div>
              <button
                onClick={fetchData}
                className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Treasury Status Banner */}
          <div
            className="mt-6 p-4 rounded-lg"
            style={{ backgroundColor: treasuryStatus.color + '20' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium" style={{ color: treasuryStatus.color }}>
                  {treasuryStatus.status.toUpperCase()}
                </div>
                <div className="text-lg font-bold" style={{ color: treasuryStatus.color }}>
                  {treasuryStatus.message}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Health Score</div>
                <div className="text-3xl font-bold" style={{ color: treasuryStatus.color }}>
                  {healthScore}/100
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Current Balance"
            value={formatCurrency(analytics.current_balance)}
            trend="stable"
          />
          <StatCard
            label="Total Raised"
            value={formatCurrency(analytics.total_raised)}
            change="+12.5%"
            trend="up"
          />
          <StatCard
            label="Active Proposals"
            value={analytics.active_count}
          />
          <StatCard
            label="Contributors"
            value={analytics.unique_contributors}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Inflows</h3>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(summary.totalIn)}
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Contributions:</span>
                <span className="font-medium">
                  {formatCurrency(analytics.total_contributions || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Revenue:</span>
                <span className="font-medium">
                  {formatCurrency(analytics.total_revenue || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Grants:</span>
                <span className="font-medium">
                  {formatCurrency(analytics.total_grants || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Outflows</h3>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(summary.totalOut)}
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Disbursements:</span>
                <span className="font-medium">
                  {formatCurrency(analytics.total_disbursements || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expenses:</span>
                <span className="font-medium">
                  {formatCurrency(analytics.total_expenses || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Net Flow</h3>
            <p
              className={`text-3xl font-bold ${
                summary.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(summary.netFlow)}
            </p>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Transactions:</span>
                <span className="font-medium">{analytics.total_transactions}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg per Transaction:</span>
                <span className="font-medium">
                  {formatCurrency(summary.avgTransaction)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Balance Over Time</h3>
            <BalanceLineChart data={balanceChartData} height={300} />
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Transaction Distribution
            </h3>
            <TransactionTypePieChart data={transactionTypeChartData} height={300} />
          </div>
        </div>

        {/* Monthly Summary Chart */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
          <MonthlySummaryChart data={monthlySummaryChartData} height={300} />
        </div>

        {/* Recent Transactions & Top Contributors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentTransactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          ['contribution', 'revenue', 'grant'].includes(
                            transaction.transaction_type
                          )
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="font-medium text-sm capitalize">
                        {transaction.transaction_type}
                      </span>
                    </div>
                    {transaction.description && (
                      <p className="text-xs text-gray-600 mt-1">{transaction.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(transaction.created_at, 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        ['contribution', 'revenue', 'grant'].includes(
                          transaction.transaction_type
                        )
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {['contribution', 'revenue', 'grant'].includes(
                        transaction.transaction_type
                      )
                        ? '+'
                        : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h3>
            <div className="space-y-3">
              {topContributors.slice(0, 10).map((contributor, index) => (
                <div
                  key={contributor.contributor_wallet}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-mono text-sm">
                        {contributor.contributor_wallet.slice(0, 6)}...
                        {contributor.contributor_wallet.slice(-4)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {contributor.contribution_count} contributions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {formatCurrency(contributor.total_contributed)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
