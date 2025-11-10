'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import type { TreasuryChartData } from '@/lib/supabase/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  data: TreasuryChartData;
  title?: string;
  height?: number;
  className?: string;
}

export function BalanceLineChart({ data, title, height = 300, className = '' }: ChartProps) {
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(value as number);
          },
        },
      },
    },
  };

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Line data={data} options={options} />
    </div>
  );
}

export function MonthlySummaryChart({ data, title, height = 300, className = '' }: ChartProps) {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: false,
      },
      y: {
        stacked: false,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(value as number);
          },
        },
      },
    },
  };

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Bar data={data} options={options} />
    </div>
  );
}

export function TransactionTypePieChart({ data, title, height = 300, className = '' }: ChartProps) {
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Pie data={data} options={options} />
    </div>
  );
}

export function BudgetDoughnutChart({ data, title, height = 300, className = '' }: ChartProps) {
  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = (context.dataset.data as number[]).reduce(
              (acc, val) => acc + val,
              0
            );
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
            }).format(value)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
  };

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}

export function StackedBarChart({ data, title, height = 300, className = '' }: ChartProps) {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
            }).format(value as number);
          },
        },
      },
    },
  };

  return (
    <div className={className} style={{ height: `${height}px` }}>
      <Bar data={data} options={options} />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, change, trend, icon, className = '' }: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600',
  };

  const trendIcons = {
    up: '',
    down: '',
    stable: '',
  };

  return (
    <div className={`bg-white rounded-lg shadow p-6 border border-gray-200 hover:shadow-lg transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {change && trend && (
            <p className={`mt-2 text-sm ${trendColors[trend]}`}>
              <span className="font-medium">
                {trendIcons[trend]} {change}
              </span>
            </p>
          )}
        </div>
        {icon && <div className="ml-4 text-gray-400">{icon}</div>}
      </div>
    </div>
  );
}

interface ProgressBarProps {
  label: string;
  current: number;
  goal: number;
  className?: string;
}

export function ProgressBar({ label, current, goal, className = '' }: ProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isComplete = percentage >= 100;

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(current)} / {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goal)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-600' : 'bg-blue-600'}`} style={{ width: `${percentage}%` }}></div>
      </div>
      <div className="mt-1 text-xs text-gray-500 text-right">{percentage.toFixed(1)}%</div>
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return <div className="animate-pulse bg-gray-200 rounded-lg" style={{ height: `${height}px` }}></div>;
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
}
