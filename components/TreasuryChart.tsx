'use client';

/**
 * Treasury Chart Component
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Line chart displaying treasury balance over time
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getTreasuryBalanceHistory } from '@/lib/supabase/treasury';
import { lineChartOptions, chartColors, formatChartDate } from '@/lib/utils/chartConfig';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ============================================================
// TYPES
// ============================================================

interface TreasuryChartProps {
  currency?: string;
  height?: number;
  className?: string;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

// ============================================================
// COMPONENT
// ============================================================

export default function TreasuryChart({
  currency = 'ETH',
  height = 400,
  className = '',
}: TreasuryChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chartRef = useRef<any>(null);

  // Map time range to days
  const getDaysFromRange = (range: TimeRange): number => {
    switch (range) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      case 'all':
        return 365; // Default to 1 year for "all"
      default:
        return 30;
    }
  };

  // Fetch balance history
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const days = getDaysFromRange(timeRange);
        const { data, error: fetchError } = await getTreasuryBalanceHistory(days, currency);

        if (fetchError) {
          throw new Error(fetchError.message || 'Failed to fetch balance history');
        }

        if (!data || data.length === 0) {
          // Create empty state with current date
          const labels = [formatChartDate(new Date(), 'short')];
          const balances = [0];

          setChartData({
            labels,
            datasets: [
              {
                label: `Balance (${currency})`,
                data: balances,
                borderColor: chartColors.aurora.primary,
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6,
              },
            ],
          });
        } else {
          // Process data
          const labels = data.map((item) => formatChartDate(item.date, 'short'));
          const balances = data.map((item) => item.balance);

          setChartData({
            labels,
            datasets: [
              {
                label: `Balance (${currency})`,
                data: balances,
                borderColor: chartColors.aurora.primary,
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6,
              },
            ],
          });
        }
      } catch (err) {
        console.error('Error fetching treasury balance history:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeRange, currency]);

  // Chart options
  const options: ChartOptions<'line'> = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      title: {
        display: true,
        text: 'Treasury Balance Over Time',
        font: {
          size: 16,
          weight: 'bold',
          family: "'Inter', sans-serif",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        ...lineChartOptions.plugins?.tooltip,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(4) + ' ' + currency;
            }
            return label;
          },
        },
      },
    },
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header with time range selector */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Treasury Balance</h3>
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div style={{ height: `${height}px`, position: 'relative' }}>
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-red-600 font-medium">Error loading chart</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && chartData && (
          <Line ref={chartRef} data={chartData} options={options} />
        )}
      </div>

      {/* Summary stats */}
      {!loading && !error && chartData && chartData.datasets[0].data.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Current</p>
            <p className="text-lg font-semibold text-gray-800">
              {chartData.datasets[0].data[chartData.datasets[0].data.length - 1].toFixed(4)} {currency}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">High</p>
            <p className="text-lg font-semibold text-green-600">
              {Math.max(...chartData.datasets[0].data).toFixed(4)} {currency}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Low</p>
            <p className="text-lg font-semibold text-red-600">
              {Math.min(...chartData.datasets[0].data).toFixed(4)} {currency}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
