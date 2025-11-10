'use client';

/**
 * DAO Transparency Widget Component
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Public-facing read-only summary of DAO activity
 */

import React, { useState, useEffect } from 'react';
import {
  getTreasurySummary,
  getDAOAnalytics,
  getTreasuryHistory,
  TreasurySummary,
  DAOAnalytics,
  TreasuryTransaction,
  truncateWallet,
} from '@/lib/supabase/treasury';

// ============================================================
// TYPES
// ============================================================

interface DAOTransparencyWidgetProps {
  className?: string;
  refreshInterval?: number; // in milliseconds (default: 60 seconds)
}

// ============================================================
// COMPONENT
// ============================================================

export default function DAOTransparencyWidget({
  className = '',
  refreshInterval = 60000,
}: DAOTransparencyWidgetProps) {
  const [summary, setSummary] = useState<TreasurySummary | null>(null);
  const [analytics, setAnalytics] = useState<DAOAnalytics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TreasuryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all data
  const fetchData = async () => {
    try {
      // Fetch in parallel
      const [summaryResult, analyticsResult, transactionsResult] = await Promise.all([
        getTreasurySummary(),
        getDAOAnalytics(),
        getTreasuryHistory({ limit: 5 }),
      ]);

      if (summaryResult.error) {
        throw new Error(summaryResult.error.message || 'Failed to fetch treasury summary');
      }
      if (analyticsResult.error) {
        throw new Error(analyticsResult.error.message || 'Failed to fetch analytics');
      }
      if (transactionsResult.error) {
        throw new Error(transactionsResult.error.message || 'Failed to fetch transactions');
      }

      setSummary(summaryResult.data);
      setAnalytics(analyticsResult.data);
      setRecentTransactions(transactionsResult.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching transparency data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up auto-refresh
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Get transaction type badge color
  const getTransactionBadgeColor = (type: string): string => {
    const colors: Record<string, string> = {
      deposit: 'bg-green-100 text-green-700',
      revenue: 'bg-green-100 text-green-700',
      withdrawal: 'bg-red-100 text-red-700',
      proposal_funding: 'bg-blue-100 text-blue-700',
      grant: 'bg-purple-100 text-purple-700',
      expense: 'bg-orange-100 text-orange-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  // Get transaction icon
  const getTransactionIcon = (type: string): string => {
    const icons: Record<string, string> = {
      deposit: '💰',
      revenue: '💵',
      withdrawal: '📤',
      proposal_funding: '🎯',
      grant: '🎁',
      expense: '💳',
    };
    return icons[type] || '📊';
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">DAO Transparency</h2>
            <p className="text-sm opacity-90 mt-1">Real-time public dashboard</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm">Auto-refreshing</span>
            </div>
            {summary && (
              <p className="text-xs opacity-70 mt-1">
                Updated {new Date(summary.last_updated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 font-medium">Error loading data</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
            <button
              onClick={fetchData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && summary && analytics && (
        <div className="p-6 space-y-6">
          {/* Key metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-2xl">
                  💎
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-medium">Treasury Balance</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {summary.current_balance.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500">ETH</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-medium">Proposals Funded</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.funded_count}</p>
                  <p className="text-xs text-gray-500">
                    of {analytics.total_proposals} total
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center text-2xl">
                  👥
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase font-medium">Community Members</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {summary.unique_contributors}
                  </p>
                  <p className="text-xs text-gray-500">Contributors</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
              <span className="text-xs text-gray-500">Last 5 transactions</span>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Transaction info */}
                      <div className="flex items-start gap-3 flex-grow min-w-0">
                        <div className="text-2xl flex-shrink-0">
                          {getTransactionIcon(tx.transaction_type)}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-medium px-2 py-1 rounded ${getTransactionBadgeColor(
                                tx.transaction_type
                              )}`}
                            >
                              {tx.transaction_type.replace('_', ' ').toUpperCase()}
                            </span>
                            {tx.proposal_title && (
                              <span className="text-xs text-gray-500 truncate">
                                {tx.proposal_title}
                              </span>
                            )}
                          </div>
                          {tx.description && (
                            <p className="text-sm text-gray-600 mb-1 line-clamp-1">
                              {tx.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            {tx.contributor_wallet && (
                              <span className="font-mono">
                                From: {truncateWallet(tx.contributor_wallet, 6)}
                              </span>
                            )}
                            {tx.recipient_wallet && (
                              <span className="font-mono">
                                To: {truncateWallet(tx.recipient_wallet, 6)}
                              </span>
                            )}
                            <span>
                              {new Date(tx.created_at!).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-lg font-bold ${
                            ['deposit', 'revenue'].includes(tx.transaction_type)
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {['deposit', 'revenue'].includes(tx.transaction_type) ? '+' : '-'}
                          {tx.amount.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-500">{tx.currency || 'ETH'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Raised</p>
              <p className="text-lg font-semibold text-gray-800">
                {analytics.total_raised.toFixed(2)} ETH
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Active Proposals</p>
              <p className="text-lg font-semibold text-gray-800">{analytics.active_count}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Transactions</p>
              <p className="text-lg font-semibold text-gray-800">
                {summary.total_transactions}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Unique Proposers</p>
              <p className="text-lg font-semibold text-gray-800">
                {analytics.unique_proposers}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
