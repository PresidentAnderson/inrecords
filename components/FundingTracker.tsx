'use client';

/**
 * Funding Tracker Component
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Real-time display of treasury balance and recent activity
 */

import React, { useState, useEffect } from 'react';
import { getTreasurySummary, TreasurySummary, calculatePercentageChange } from '@/lib/supabase/treasury';

// ============================================================
// TYPES
// ============================================================

interface FundingTrackerProps {
  className?: string;
  refreshInterval?: number; // in milliseconds
}

// ============================================================
// COMPONENT
// ============================================================

export default function FundingTracker({
  className = '',
  refreshInterval = 60000, // Default: 1 minute
}: FundingTrackerProps) {
  const [summary, setSummary] = useState<TreasurySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousBalance, setPreviousBalance] = useState<number | null>(null);

  // Fetch treasury summary
  const fetchData = async () => {
    try {
      const { data, error: fetchError } = await getTreasurySummary();

      if (fetchError) {
        throw new Error(fetchError.message || 'Failed to fetch treasury summary');
      }

      // Store previous balance for change calculation
      if (summary) {
        setPreviousBalance(summary.current_balance);
      }

      setSummary(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching treasury summary:', err);
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

  // Calculate change percentage
  const getBalanceChange = (): number => {
    if (!summary || previousBalance === null) return 0;
    return calculatePercentageChange(summary.current_balance, previousBalance);
  };

  // Get change indicator
  const ChangeIndicator = ({ value }: { value: number }) => {
    if (value === 0) return null;

    const isPositive = value > 0;
    return (
      <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(value).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className={`bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Treasury Balance</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm opacity-90">Live</span>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-white/10 rounded-lg p-4 text-center">
          <p className="font-medium">Error loading data</p>
          <p className="text-sm opacity-80 mt-1">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main balance display */}
      {!loading && !error && summary && (
        <div className="space-y-6">
          {/* Current balance */}
          <div className="text-center">
            <p className="text-sm opacity-80 mb-2">Current Balance</p>
            <div className="flex items-center justify-center gap-3">
              <h1 className="text-5xl font-bold">{summary.current_balance.toFixed(4)}</h1>
              <span className="text-2xl opacity-90">ETH</span>
            </div>
            <div className="mt-2">
              <ChangeIndicator value={getBalanceChange()} />
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Total inflow */}
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💰</span>
                <p className="text-sm opacity-80">Total Inflow</p>
              </div>
              <p className="text-2xl font-bold">{summary.total_inflow.toFixed(4)}</p>
              <p className="text-xs opacity-70 mt-1">ETH</p>
            </div>

            {/* Total outflow */}
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📤</span>
                <p className="text-sm opacity-80">Total Outflow</p>
              </div>
              <p className="text-2xl font-bold">{summary.total_outflow.toFixed(4)}</p>
              <p className="text-xs opacity-70 mt-1">ETH</p>
            </div>

            {/* Unique contributors */}
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👥</span>
                <p className="text-sm opacity-80">Contributors</p>
              </div>
              <p className="text-2xl font-bold">{summary.unique_contributors}</p>
              <p className="text-xs opacity-70 mt-1">Unique wallets</p>
            </div>

            {/* Total transactions */}
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📊</span>
                <p className="text-sm opacity-80">Transactions</p>
              </div>
              <p className="text-2xl font-bold">{summary.total_transactions}</p>
              <p className="text-xs opacity-70 mt-1">Total count</p>
            </div>
          </div>

          {/* Net flow indicator */}
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Net Flow</span>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">
                  {(summary.total_inflow - summary.total_outflow).toFixed(4)} ETH
                </span>
                {summary.total_inflow > summary.total_outflow ? (
                  <span className="text-green-400">✓</span>
                ) : (
                  <span className="text-red-400">↓</span>
                )}
              </div>
            </div>
          </div>

          {/* Last updated */}
          <div className="text-center text-xs opacity-70">
            Last updated: {new Date(summary.last_updated).toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
