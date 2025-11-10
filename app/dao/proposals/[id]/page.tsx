'use client';

/**
 * Proposal Detail Page
 * Phase 3: Treasury & Analytics Dashboard Integration
 *
 * Shows detailed proposal information with funding history
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  getProposalFundingHistory,
  TreasuryTransaction,
  truncateWallet,
} from '@/lib/supabase/treasury';

export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = params.id as string;

  const [fundingHistory, setFundingHistory] = useState<TreasuryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock proposal data - in production, fetch from Supabase
  const [proposal] = useState({
    id: proposalId,
    title: 'Example Proposal',
    description:
      'This is an example proposal demonstrating the funding history integration.',
    proposal_type: 'feature',
    status: 'funded',
    created_by: '0x1234...5678',
    funding_goal: 10.0,
    current_funding: 10.0,
    votes_for: 45,
    votes_against: 5,
    created_at: new Date().toISOString(),
    funding_source: 'treasury' as const,
  });

  // Fetch funding history
  useEffect(() => {
    const fetchFundingHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getProposalFundingHistory(proposalId);

        if (fetchError) {
          throw new Error(fetchError.message || 'Failed to fetch funding history');
        }

        setFundingHistory(data || []);
      } catch (err) {
        console.error('Error fetching funding history:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (proposalId) {
      fetchFundingHistory();
    }
  }, [proposalId]);

  // Get status badge color
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      funded: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || colors.draft;
  };

  // Calculate funding progress
  const getFundingProgress = (): number => {
    if (!proposal.funding_goal || proposal.funding_goal === 0) return 0;
    return Math.min((proposal.current_funding / proposal.funding_goal) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
        >
          ← Back to Proposals
        </button>

        {/* Proposal header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex-grow">{proposal.title}</h1>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(
                proposal.status
              )}`}
            >
              {proposal.status.toUpperCase()}
            </span>
          </div>

          {/* Treasury badge */}
          {proposal.funding_source === 'treasury' && (
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-full">
                <span className="text-2xl">💎</span>
                <span className="text-sm font-semibold text-purple-700">
                  DAO Treasury Funded
                </span>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
            <span>Created by {proposal.created_by}</span>
            <span>•</span>
            <span>
              {new Date(proposal.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span>•</span>
            <span className="capitalize">{proposal.proposal_type.replace('_', ' ')}</span>
          </div>

          {/* Description */}
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700">{proposal.description}</p>
          </div>

          {/* Funding progress */}
          {proposal.funding_goal > 0 && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Progress</h3>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Goal Progress</span>
                <span className="font-semibold text-gray-900">
                  {proposal.current_funding.toFixed(4)} / {proposal.funding_goal.toFixed(4)} ETH
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getFundingProgress()}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{getFundingProgress().toFixed(1)}% funded</p>
            </div>
          )}

          {/* Voting results */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👍</span>
                <span className="text-sm font-medium text-green-700">Votes For</span>
              </div>
              <p className="text-3xl font-bold text-green-700">{proposal.votes_for}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👎</span>
                <span className="text-sm font-medium text-red-700">Votes Against</span>
              </div>
              <p className="text-3xl font-bold text-red-700">{proposal.votes_against}</p>
            </div>
          </div>
        </div>

        {/* Funding History Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Funding History</h2>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <p className="text-red-600 font-medium">Error loading funding history</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {fundingHistory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No funding transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {fundingHistory.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow">
                          {/* Transaction type and amount */}
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">💰</span>
                            <div>
                              <span className="text-xs font-medium px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                {tx.transaction_type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          {tx.description && (
                            <p className="text-sm text-gray-600 mb-2">{tx.description}</p>
                          )}

                          {/* Transaction details */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            {tx.contributor_wallet && (
                              <span className="font-mono">
                                From: {truncateWallet(tx.contributor_wallet, 6)}
                              </span>
                            )}
                            {tx.transaction_hash && (
                              <span className="font-mono">TX: {truncateWallet(tx.transaction_hash, 8)}</span>
                            )}
                            <span>
                              {new Date(tx.created_at!).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            +{tx.amount.toFixed(4)}
                          </p>
                          <p className="text-xs text-gray-500">{tx.currency || 'ETH'}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Total funded */}
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-6 border border-purple-300">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-purple-900">Total Funded</span>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-purple-900">
                          {fundingHistory
                            .reduce((sum, tx) => sum + tx.amount, 0)
                            .toFixed(4)}
                        </p>
                        <p className="text-sm text-purple-700">ETH</p>
                      </div>
                    </div>
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
