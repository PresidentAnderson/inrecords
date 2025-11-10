'use client';

/**
 * Contributor Leaderboard Component
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Displays top contributors to the DAO treasury
 */

import React, { useState, useEffect } from 'react';
import { getTopContributors, TopContributor, truncateWallet } from '@/lib/supabase/treasury';

// ============================================================
// TYPES
// ============================================================

interface ContributorLeaderboardProps {
  limit?: number;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function ContributorLeaderboard({
  limit = 10,
  className = '',
}: ContributorLeaderboardProps) {
  const [contributors, setContributors] = useState<TopContributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  // Fetch top contributors
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getTopContributors(limit);

        if (fetchError) {
          throw new Error(fetchError.message || 'Failed to fetch top contributors');
        }

        setContributors(data || []);
      } catch (err) {
        console.error('Error fetching top contributors:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [limit]);

  // Copy wallet address to clipboard
  const copyToClipboard = async (wallet: string) => {
    try {
      await navigator.clipboard.writeText(wallet);
      setCopiedWallet(wallet);
      setTimeout(() => setCopiedWallet(null), 2000);
    } catch (err) {
      console.error('Failed to copy wallet address:', err);
    }
  };

  // Get rank badge color
  const getRankBadgeColor = (rank: number): string => {
    if (rank === 1) return 'bg-yellow-500 text-white';
    if (rank === 2) return 'bg-gray-400 text-white';
    if (rank === 3) return 'bg-orange-600 text-white';
    return 'bg-gray-200 text-gray-700';
  };

  // Get rank icon
  const getRankIcon = (rank: number): string => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Top Contributors</h3>
        <p className="text-sm text-gray-500 mt-1">
          Recognizing our most generous community members
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 font-medium">Error loading contributors</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Contributors list */}
      {!loading && !error && (
        <div className="space-y-3">
          {contributors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No contributors yet</p>
              <p className="text-sm mt-1">Be the first to contribute to the treasury!</p>
            </div>
          ) : (
            contributors.map((contributor, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;

              return (
                <div
                  key={contributor.contributor_wallet}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    isTopThree
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankBadgeColor(
                        rank
                      )}`}
                    >
                      {getRankIcon(rank) || `#${rank}`}
                    </div>
                  </div>

                  {/* Contributor info */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(contributor.contributor_wallet)}
                        className="font-mono text-sm text-gray-700 hover:text-purple-600 transition-colors"
                        title="Click to copy full address"
                      >
                        {truncateWallet(contributor.contributor_wallet, 8)}
                      </button>
                      {copiedWallet === contributor.contributor_wallet && (
                        <span className="text-xs text-green-600 font-medium">Copied!</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {contributor.contribution_count}{' '}
                      {contributor.contribution_count === 1 ? 'contribution' : 'contributions'}
                    </p>
                  </div>

                  {/* Contribution amount */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-800">
                      {contributor.total_contributed.toFixed(4)} {contributor.currency}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(contributor.last_contribution).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Summary stats */}
      {!loading && !error && contributors.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Total Contributors</p>
            <p className="text-lg font-semibold text-gray-800">{contributors.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Total Contributed</p>
            <p className="text-lg font-semibold text-purple-600">
              {contributors
                .reduce((sum, c) => sum + c.total_contributed, 0)
                .toFixed(4)}{' '}
              ETH
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
