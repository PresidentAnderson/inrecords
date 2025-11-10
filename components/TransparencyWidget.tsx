'use client';

import { useState, useEffect } from 'react';
import {
  TransparencyMetrics,
  RecentActivity,
  ChartDataPoint,
  WidgetConfig,
  formatCurrency,
  formatPercentage,
  getActivityIcon,
  timeAgo,
} from '@/lib/types/transparency';

// =====================================================
// Main Widget Component
// =====================================================

interface TransparencyWidgetProps {
  config?: WidgetConfig;
  data?: {
    metrics: TransparencyMetrics;
    recentActivity: RecentActivity[];
    chartData: {
      treasury: ChartDataPoint[];
      proposals: ChartDataPoint[];
      voting: ChartDataPoint[];
    };
  };
  autoRefresh?: boolean;
}

export default function TransparencyWidget({
  config = {
    showHeader: true,
    showMetrics: true,
    showCharts: true,
    showRecentActivity: true,
    maxItems: 5,
    theme: 'dark',
    refreshInterval: 30000, // 30 seconds
  },
  data,
  autoRefresh = false,
}: TransparencyWidgetProps) {
  const [widgetData, setWidgetData] = useState(data);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch data function
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/embed/transparency');
      if (!response.ok) {
        throw new Error('Failed to fetch transparency data');
      }

      const result = await response.json();
      setWidgetData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching transparency data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch if no data provided
  useEffect(() => {
    if (!data) {
      fetchData();
    }
  }, [data]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && config.refreshInterval) {
      const interval = setInterval(fetchData, config.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, config.refreshInterval]);

  // Theme classes
  const isDark = config.theme === 'dark';
  const bgClass = isDark ? 'bg-black' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderClass = isDark ? 'border-white/10' : 'border-gray-200';
  const cardBgClass = isDark ? 'bg-white/5' : 'bg-gray-50';

  // Loading state
  if (loading && !widgetData) {
    return (
      <div className={`${bgClass} ${textClass} p-8 rounded-2xl border ${borderClass}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${bgClass} ${textClass} p-8 rounded-2xl border border-red-500/50`}>
        <div className="text-red-400 text-center">
          <p className="text-xl font-semibold mb-2">Error Loading Data</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!widgetData) {
    return null;
  }

  const { metrics, recentActivity } = widgetData;

  return (
    <div className={`${bgClass} ${textClass} rounded-2xl border ${borderClass} overflow-hidden`}>
      {/* Header */}
      {config.showHeader && (
        <div className={`p-6 border-b ${borderClass}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">DAO Transparency</h3>
              <p className={`text-sm ${subTextClass} mt-1`}>
                Real-time community metrics
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs ${subTextClass}`}>Last updated</p>
              <p className="text-sm font-semibold">{timeAgo(lastUpdated)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      {config.showMetrics && (
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Treasury */}
            <MetricCard
              label="Treasury"
              value={formatCurrency(metrics.treasuryBalance)}
              change={metrics.netChange}
              changeLabel="This week"
              isDark={isDark}
            />

            {/* Active Proposals */}
            <MetricCard
              label="Active Proposals"
              value={metrics.activeProposals.toString()}
              subtitle={`${metrics.totalProposals} total`}
              isDark={isDark}
            />

            {/* Participation */}
            <MetricCard
              label="Participation"
              value={formatPercentage(metrics.participationRate, 0)}
              subtitle={`${metrics.uniqueVoters} voters`}
              isDark={isDark}
            />

            {/* Members */}
            <MetricCard
              label="Members"
              value={metrics.totalMembers.toLocaleString()}
              subtitle={`+${metrics.newMembersThisWeek} this week`}
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* Charts */}
      {config.showCharts && widgetData.chartData && (
        <div className={`p-6 border-t ${borderClass}`}>
          <h4 className="text-lg font-semibold mb-4">Weekly Activity</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <MiniChart
              title="Treasury"
              data={widgetData.chartData.treasury}
              color="aurora"
              isDark={isDark}
            />
            <MiniChart
              title="Proposals"
              data={widgetData.chartData.proposals}
              color="gold"
              isDark={isDark}
            />
            <MiniChart
              title="Votes"
              data={widgetData.chartData.voting}
              color="green"
              isDark={isDark}
            />
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {config.showRecentActivity && recentActivity && (
        <div className={`p-6 border-t ${borderClass}`}>
          <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {recentActivity.slice(0, config.maxItems || 5).map((activity) => (
              <ActivityItem key={activity.id} activity={activity} isDark={isDark} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`p-4 border-t ${borderClass} text-center`}>
        <a
          href="/transparency"
          className="text-aurora hover:underline text-sm font-semibold"
        >
          View Full Transparency Dashboard →
        </a>
      </div>
    </div>
  );
}

// =====================================================
// Metric Card Component
// =====================================================

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeLabel?: string;
  isDark: boolean;
}

function MetricCard({ label, value, subtitle, change, changeLabel, isDark }: MetricCardProps) {
  const cardBgClass = isDark ? 'bg-white/5' : 'bg-gray-50';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`${cardBgClass} rounded-xl p-4`}>
      <p className={`text-xs ${subTextClass} mb-1`}>{label}</p>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {subtitle && <p className={`text-xs ${subTextClass}`}>{subtitle}</p>}
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
            {change >= 0 ? '↗' : '↘'} {formatCurrency(Math.abs(change))}
          </span>
          {changeLabel && <span className={`text-xs ${subTextClass}`}>{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

// =====================================================
// Mini Chart Component
// =====================================================

interface MiniChartProps {
  title: string;
  data: ChartDataPoint[];
  color: 'aurora' | 'gold' | 'green';
  isDark: boolean;
}

function MiniChart({ title, data, color, isDark }: MiniChartProps) {
  const cardBgClass = isDark ? 'bg-white/5' : 'bg-gray-50';
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-600';

  const colorClasses = {
    aurora: 'bg-aurora',
    gold: 'bg-gold',
    green: 'bg-green-400',
  };

  // Calculate max value for scaling
  const maxValue = Math.max(...data.map((d) => d.value));
  const latestValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const change = latestValue - previousValue;

  return (
    <div className={`${cardBgClass} rounded-xl p-4`}>
      <div className="flex justify-between items-start mb-3">
        <p className={`text-xs ${subTextClass}`}>{title}</p>
        <span className={change >= 0 ? 'text-green-400' : 'text-red-400'}>
          {change >= 0 ? '↗' : '↘'}
        </span>
      </div>

      {/* Simple bar chart */}
      <div className="flex items-end gap-1 h-16">
        {data.map((point, index) => {
          const height = maxValue > 0 ? (point.value / maxValue) * 100 : 0;
          return (
            <div
              key={index}
              className={`flex-1 ${colorClasses[color]} rounded-t opacity-70 hover:opacity-100 transition`}
              style={{ height: `${height}%` }}
              title={`${point.label}: ${point.value}`}
            />
          );
        })}
      </div>
    </div>
  );
}

// =====================================================
// Activity Item Component
// =====================================================

interface ActivityItemProps {
  activity: RecentActivity;
  isDark: boolean;
}

function ActivityItem({ activity, isDark }: ActivityItemProps) {
  const subTextClass = isDark ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className="flex items-start gap-3">
      <span className="text-2xl flex-shrink-0">{getActivityIcon(activity.type)}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{activity.title}</p>
        <p className={`text-xs ${subTextClass} truncate`}>{activity.description}</p>
      </div>
      <span className={`text-xs ${subTextClass} flex-shrink-0`}>
        {timeAgo(activity.timestamp)}
      </span>
    </div>
  );
}

// =====================================================
// Embed Script Component
// =====================================================

export function TransparencyWidgetEmbed() {
  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Embed Widget Code</h3>
      <pre className="bg-black p-4 rounded text-xs overflow-x-auto">
        {`<!-- inRECORD Transparency Widget -->
<div id="inrecord-transparency-widget"></div>
<script>
  (function() {
    const script = document.createElement('script');
    script.src = 'https://inrecord.com/widget.js';
    script.async = true;
    script.onload = function() {
      InRecordWidget.init({
        container: '#inrecord-transparency-widget',
        type: 'transparency',
        theme: 'dark',
        autoRefresh: true,
        refreshInterval: 30000
      });
    };
    document.head.appendChild(script);
  })();
</script>`}
      </pre>
      <p className="text-sm text-gray-400 mt-4">
        Copy this code to embed the transparency widget on your website.
      </p>
    </div>
  );
}
