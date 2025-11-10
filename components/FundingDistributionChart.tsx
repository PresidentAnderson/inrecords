'use client';

/**
 * Funding Distribution Chart Component
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Doughnut chart showing funding distribution by proposal type
 */

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getFundingDistribution, FundingDistribution } from '@/lib/supabase/treasury';
import { doughnutChartOptions, chartColors } from '@/lib/utils/chartConfig';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// ============================================================
// TYPES
// ============================================================

interface FundingDistributionChartProps {
  height?: number;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function FundingDistributionChart({
  height = 400,
  className = '',
}: FundingDistributionChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [distribution, setDistribution] = useState<FundingDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch funding distribution
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await getFundingDistribution();

        if (fetchError) {
          throw new Error(fetchError.message || 'Failed to fetch funding distribution');
        }

        if (!data || data.length === 0) {
          // Create empty state
          setChartData({
            labels: ['No Data'],
            datasets: [
              {
                label: 'Funding Distribution',
                data: [1],
                backgroundColor: [chartColors.aurora.dark],
                borderColor: ['#fff'],
                borderWidth: 2,
              },
            ],
          });
          setDistribution([]);
        } else {
          // Sort by total funding descending
          const sortedData = [...data].sort((a, b) => b.total_funding - a.total_funding);
          setDistribution(sortedData);

          // Prepare chart data
          const labels = sortedData.map((item) => item.proposal_type);
          const values = sortedData.map((item) => item.total_funding);
          const colors = [
            chartColors.aurora.primary,
            chartColors.aurora.secondary,
            chartColors.aurora.tertiary,
            chartColors.aurora.success,
            chartColors.aurora.warning,
            chartColors.aurora.info,
            chartColors.aurora.danger,
          ];

          setChartData({
            labels,
            datasets: [
              {
                label: 'Funding Amount (ETH)',
                data: values,
                backgroundColor: colors.slice(0, sortedData.length),
                borderColor: Array(sortedData.length).fill('#fff'),
                borderWidth: 2,
              },
            ],
          });
        }
      } catch (err) {
        console.error('Error fetching funding distribution:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chart options
  const options: ChartOptions<'doughnut'> = {
    ...doughnutChartOptions,
    plugins: {
      ...doughnutChartOptions.plugins,
      title: {
        display: true,
        text: 'Funding Distribution by Proposal Type',
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
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const dataset = context.dataset;
            const total = (dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${value.toFixed(4)} ETH (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Funding Distribution</h3>
        <p className="text-sm text-gray-500 mt-1">By proposal type</p>
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
          <Doughnut data={chartData} options={options} />
        )}
      </div>

      {/* Detailed breakdown */}
      {!loading && !error && distribution.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Breakdown</h4>
          <div className="space-y-2">
            {distribution.map((item, index) => (
              <div
                key={item.proposal_type}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: chartData.datasets[0].backgroundColor[index],
                    }}
                  />
                  <span className="text-gray-700 capitalize">
                    {item.proposal_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">
                    {item.total_funding.toFixed(4)} ETH
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.proposal_count} {item.proposal_count === 1 ? 'proposal' : 'proposals'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && distribution.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          <p>No funding data available yet</p>
        </div>
      )}
    </div>
  );
}
