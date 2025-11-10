'use client';

/**
 * DAO Analytics Widget Component
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Displays key DAO metrics and statistics
 */

import React, { useState, useEffect } from 'react';
import { getDAOAnalytics, DAOAnalytics } from '@/lib/supabase/treasury';

// ============================================================
// TYPES
// ============================================================

interface DAOAnalyticsWidgetProps {
  className?: string;
  refreshInterval?: number; // in milliseconds
}

// ============================================================
// COMPONENT
// ============================================================

export default function DAOAnalyticsWidget({
  className = '',
  refreshInterval,
}: DAOAnalyticsWidgetProps) {
  const [analytics, setAnalytics] = useState<DAOAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchData = async () => {
    try {
      const { data, error: fetchError } = await getDAOAnalytics();

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch analytics');
      }

      setAnalytics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching DAO analytics:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up auto-refresh if interval is provided
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  // Calculate funding success rate
  const getFundingSuccessRate = (): number => {
    if (!analytics || analytics.total_proposals === 0) return 0;
    return (analytics.funded_count / analytics.total_proposals) * 100;
  };

  // Stat card component
  const StatCard = ({
    icon,
    label,
    value,
    subValue,
    color = 'purple',
  }: {
    icon: string;
    label: string;
    value: string | number;
    subValue?: string;
    color?: 'purple' | 'blue' | 'green' | 'orange' | 'pink';
  }) => {
    const colorClasses = {
      purple: 'bg-purple-100 text-purple-600',
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      pink: 'bg-pink-100 text-pink-600',
    };

    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center text-2xl`}>
            {icon}
          </div>
          <div className="flex-grow">
            <p className="text-xs text-gray-500 uppercase font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">DAO Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">
          Real-time statistics and metrics
          {analytics?.last_updated && (
            <span className="ml-2">
              • Updated {new Date(analytics.last_updated).toLocaleTimeString()}
            </span>
          )}
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 font-medium">Error loading analytics</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Analytics grid */}
      {!loading && !error && analytics && (
        <div className="space-y-6">
          {/* Primary metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon="📊"
              label="Total Proposals"
              value={analytics.total_proposals}
              color="purple"
            />
            <StatCard
              icon="💰"
              label="Funded Proposals"
              value={analytics.funded_count}
              subValue={`${getFundingSuccessRate().toFixed(1)}% success rate`}
              color="green"
            />
            <StatCard
              icon="🚀"
              label="Active Proposals"
              value={analytics.active_count}
              color="blue"
            />
            <StatCard
              icon="✅"
              label="Approved Proposals"
              value={analytics.approved_count}
              color="orange"
            />
          </div>

          {/* Financial metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon="💎"
              label="Total Raised"
              value={`${analytics.total_raised.toFixed(4)} ETH`}
              color="purple"
            />
            <StatCard
              icon="📈"
              label="Avg per Proposal"
              value={`${analytics.avg_funding_per_proposal.toFixed(4)} ETH`}
              color="pink"
            />
            <StatCard
              icon="👥"
              label="Unique Proposers"
              value={analytics.unique_proposers}
              color="blue"
            />
          </div>

          {/* Progress bars */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Proposal Status Distribution</h3>
            <div className="space-y-4">
              {/* Funded */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Funded</span>
                  <span className="font-medium text-gray-800">
                    {analytics.funded_count} ({getFundingSuccessRate().toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getFundingSuccessRate()}%` }}
                  />
                </div>
              </div>

              {/* Active */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Active</span>
                  <span className="font-medium text-gray-800">
                    {analytics.active_count} (
                    {analytics.total_proposals > 0
                      ? ((analytics.active_count / analytics.total_proposals) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        analytics.total_proposals > 0
                          ? (analytics.active_count / analytics.total_proposals) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Approved */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-medium text-gray-800">
                    {analytics.approved_count} (
                    {analytics.total_proposals > 0
                      ? ((analytics.approved_count / analytics.total_proposals) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        analytics.total_proposals > 0
                          ? (analytics.approved_count / analytics.total_proposals) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Rejected */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Rejected</span>
                  <span className="font-medium text-gray-800">
                    {analytics.rejected_count} (
                    {analytics.total_proposals > 0
                      ? ((analytics.rejected_count / analytics.total_proposals) * 100).toFixed(1)
                      : 0}
                    %)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        analytics.total_proposals > 0
                          ? (analytics.rejected_count / analytics.total_proposals) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
