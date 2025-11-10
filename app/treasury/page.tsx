'use client';

/**
 * Treasury Dashboard Page
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Full treasury dashboard with charts, transactions, and analytics
 * Authentication required
 */

import React, { useState, useEffect } from 'react';
import TreasuryChart from '@/components/TreasuryChart';
import FundingDistributionChart from '@/components/FundingDistributionChart';
import ContributorLeaderboard from '@/components/ContributorLeaderboard';
import FundingTracker from '@/components/FundingTracker';
import {
  getTreasuryHistory,
  TreasuryTransaction,
  truncateWallet,
  getTransactionTypeColor,
} from '@/lib/supabase/treasury';
import {
  exportTreasuryTransactions,
  exportTreasurySummary,
  exportAnalyticsSummary,
} from '@/lib/utils/exportCSV';

export default function TreasuryPage() {
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<string>('all');
  const itemsPerPage = 10;

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);

      try {
        const offset = (currentPage - 1) * itemsPerPage;
        const { data, error: fetchError } = await getTreasuryHistory({
          transaction_type: filter !== 'all' ? (filter as any) : undefined,
          limit: itemsPerPage,
          offset,
        });

        if (fetchError) {
          throw new Error(fetchError.message || 'Failed to fetch transactions');
        }

        setTransactions(data || []);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [currentPage, filter]);

  // Export to CSV
  const handleExport = async () => {
    try {
      // Fetch all transactions for export
      const { data } = await getTreasuryHistory({ limit: 1000 });
      if (data) {
        exportTreasuryTransactions(data);
      }
    } catch (err) {
      console.error('Error exporting transactions:', err);
      alert('Failed to export transactions');
    }
  };

  // Get transaction type badge
  const getTransactionBadge = (type: string) => {
    const color = getTransactionTypeColor(type as any);
    const colorClasses: Record<string, string> = {
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      orange: 'bg-orange-100 text-orange-700',
      gray: 'bg-gray-100 text-gray-700',
    };

    return (
      <span className={`text-xs font-medium px-2 py-1 rounded ${colorClasses[color]}`}>
        {type.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Treasury Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive view of DAO treasury and funding analytics
          </p>
        </div>

        {/* Funding Tracker */}
        <div className="mb-8">
          <FundingTracker />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TreasuryChart />
          <FundingDistributionChart />
        </div>

        {/* Contributor Leaderboard */}
        <div className="mb-8">
          <ContributorLeaderboard limit={10} />
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
              <p className="text-sm text-gray-500 mt-1">All treasury activity</p>
            </div>

            <div className="flex gap-3">
              {/* Filter dropdown */}
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="proposal_funding">Proposal Funding</option>
                <option value="grant">Grants</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expenses</option>
              </select>

              {/* Export button */}
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export CSV
              </button>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-medium">Error loading transactions</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Transactions table */}
          {!loading && !error && (
            <>
              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No transactions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Proposal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          From/To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getTransactionBadge(tx.transaction_type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`font-semibold ${
                                ['deposit', 'revenue'].includes(tx.transaction_type)
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {['deposit', 'revenue'].includes(tx.transaction_type) ? '+' : '-'}
                              {tx.amount.toFixed(4)} {tx.currency || 'ETH'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {tx.proposal_title ? (
                              <span className="text-sm text-gray-900">{tx.proposal_title}</span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {tx.contributor_wallet && (
                              <span className="text-xs font-mono text-gray-600">
                                {truncateWallet(tx.contributor_wallet, 6)}
                              </span>
                            )}
                            {tx.recipient_wallet && (
                              <span className="text-xs font-mono text-gray-600">
                                {truncateWallet(tx.recipient_wallet, 6)}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(tx.created_at!).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {tx.description || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {transactions.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing page {currentPage}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={transactions.length < itemsPerPage}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
