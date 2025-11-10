/**
 * DAO Analytics and Statistics Helpers
 * Provides utility functions for processing and formatting treasury data
 */

import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import type {
  DAOAnalytics,
  TreasuryTransaction,
  MonthlySummary,
  TransactionStats,
  TreasuryChartData,
  ChartDataPoint,
} from '@/lib/supabase/types';

// =====================================
// Formatting Utilities
// =====================================

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, formatString: string = 'MMM dd, yyyy'): string {
  return format(new Date(date), formatString);
}

// =====================================
// Analytics Calculations
// =====================================

/**
 * Calculate funding percentage
 */
export function calculateFundingPercentage(current: number, goal: number): number {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
}

/**
 * Calculate average transaction amount
 */
export function calculateAverageTransaction(transactions: TreasuryTransaction[]): number {
  if (transactions.length === 0) return 0;
  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  return total / transactions.length;
}

/**
 * Calculate treasury health score (0-100)
 * Based on balance, transaction frequency, and contributor diversity
 */
export function calculateTreasuryHealth(analytics: DAOAnalytics): number {
  let score = 0;

  // Balance score (40 points)
  const balanceScore = Math.min((analytics.current_balance / 100000) * 40, 40);
  score += balanceScore;

  // Activity score (30 points)
  const activityScore = Math.min((analytics.total_transactions / 100) * 30, 30);
  score += activityScore;

  // Diversity score (30 points)
  const diversityScore = Math.min((analytics.unique_contributors / 50) * 30, 30);
  score += diversityScore;

  return Math.round(score);
}

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Get treasury status based on balance
 */
export function getTreasuryStatus(balance: number): {
  status: 'healthy' | 'warning' | 'critical';
  message: string;
  color: string;
} {
  if (balance >= 50000) {
    return {
      status: 'healthy',
      message: 'Treasury is healthy',
      color: '#10b981', // green
    };
  } else if (balance >= 10000) {
    return {
      status: 'warning',
      message: 'Treasury needs attention',
      color: '#f59e0b', // yellow
    };
  } else {
    return {
      status: 'critical',
      message: 'Treasury is critical',
      color: '#ef4444', // red
    };
  }
}

// =====================================
// Chart Data Preparation
// =====================================

/**
 * Prepare data for treasury balance line chart
 */
export function prepareBalanceChartData(
  transactions: TreasuryTransaction[]
): TreasuryChartData {
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  let runningBalance = 0;
  const dataPoints: { date: string; balance: number }[] = [];

  sortedTransactions.forEach((transaction) => {
    if (['contribution', 'revenue', 'grant'].includes(transaction.transaction_type)) {
      runningBalance += Number(transaction.amount);
    } else {
      runningBalance -= Number(transaction.amount);
    }

    dataPoints.push({
      date: format(new Date(transaction.created_at), 'MMM dd'),
      balance: runningBalance,
    });
  });

  return {
    labels: dataPoints.map((d) => d.date),
    datasets: [
      {
        label: 'Treasury Balance',
        data: dataPoints.map((d) => d.balance),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
      },
    ],
  };
}

/**
 * Prepare data for transaction type pie chart
 */
export function prepareTransactionTypeChart(
  stats: TransactionStats[]
): TreasuryChartData {
  const colors = {
    contribution: '#10b981',
    revenue: '#3b82f6',
    grant: '#8b5cf6',
    disbursement: '#f59e0b',
    expense: '#ef4444',
  };

  return {
    labels: stats.map((s) => s.transaction_type),
    datasets: [
      {
        label: 'Amount by Type',
        data: stats.map((s) => s.total),
        backgroundColor: stats.map(
          (s) => colors[s.transaction_type as keyof typeof colors] || '#6b7280'
        ),
      },
    ],
  };
}

/**
 * Prepare data for monthly summary bar chart
 */
export function prepareMonthlySummaryChart(
  summary: MonthlySummary[]
): TreasuryChartData {
  const months = Array.from(new Set(summary.map((s) => format(new Date(s.month), 'MMM yyyy'))));
  const types = Array.from(new Set(summary.map((s) => s.transaction_type)));

  const colors: Record<string, string> = {
    contribution: '#10b981',
    revenue: '#3b82f6',
    grant: '#8b5cf6',
    disbursement: '#f59e0b',
    expense: '#ef4444',
  };

  const datasets = types.map((type) => ({
    label: type,
    data: months.map((month) => {
      const item = summary.find(
        (s) => format(new Date(s.month), 'MMM yyyy') === month && s.transaction_type === type
      );
      return item ? item.total_amount : 0;
    }),
    backgroundColor: colors[type] || '#6b7280',
  }));

  return {
    labels: months,
    datasets,
  };
}

/**
 * Prepare data for contributor ranking
 */
export function prepareContributorChart(
  contributors: { wallet: string; amount: number }[],
  limit: number = 10
): ChartDataPoint[] {
  return contributors
    .slice(0, limit)
    .map((c) => ({
      label: c.wallet.slice(0, 6) + '...' + c.wallet.slice(-4),
      value: c.amount,
      color: '#3b82f6',
    }));
}

// =====================================
// Data Aggregation
// =====================================

/**
 * Group transactions by month
 */
export function groupTransactionsByMonth(
  transactions: TreasuryTransaction[]
): Record<string, TreasuryTransaction[]> {
  return transactions.reduce((acc, transaction) => {
    const month = format(startOfMonth(new Date(transaction.created_at)), 'yyyy-MM');
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(transaction);
    return acc;
  }, {} as Record<string, TreasuryTransaction[]>);
}

/**
 * Group transactions by type
 */
export function groupTransactionsByType(
  transactions: TreasuryTransaction[]
): Record<string, TreasuryTransaction[]> {
  return transactions.reduce((acc, transaction) => {
    const type = transaction.transaction_type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(transaction);
    return acc;
  }, {} as Record<string, TreasuryTransaction[]>);
}

/**
 * Calculate totals by type
 */
export function calculateTotalsByType(
  transactions: TreasuryTransaction[]
): Record<string, number> {
  return transactions.reduce((acc, transaction) => {
    const type = transaction.transaction_type;
    acc[type] = (acc[type] || 0) + Number(transaction.amount);
    return acc;
  }, {} as Record<string, number>);
}

// =====================================
// Comparison & Trends
// =====================================

/**
 * Compare current month vs previous month
 */
export function compareMonthlyPerformance(transactions: TreasuryTransaction[]): {
  current: number;
  previous: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
} {
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));

  const currentTotal = transactions
    .filter((t) => new Date(t.created_at) >= currentMonthStart)
    .reduce((sum, t) => {
      return ['contribution', 'revenue', 'grant'].includes(t.transaction_type)
        ? sum + Number(t.amount)
        : sum - Number(t.amount);
    }, 0);

  const previousTotal = transactions
    .filter(
      (t) =>
        new Date(t.created_at) >= previousMonthStart &&
        new Date(t.created_at) <= previousMonthEnd
    )
    .reduce((sum, t) => {
      return ['contribution', 'revenue', 'grant'].includes(t.transaction_type)
        ? sum + Number(t.amount)
        : sum - Number(t.amount);
    }, 0);

  const growth = calculateGrowthRate(currentTotal, previousTotal);

  return {
    current: currentTotal,
    previous: previousTotal,
    growth,
    trend: growth > 5 ? 'up' : growth < -5 ? 'down' : 'stable',
  };
}

/**
 * Get transaction velocity (transactions per day)
 */
export function getTransactionVelocity(
  transactions: TreasuryTransaction[],
  days: number = 30
): number {
  const cutoffDate = subMonths(new Date(), 1);
  const recentTransactions = transactions.filter(
    (t) => new Date(t.created_at) >= cutoffDate
  );

  return recentTransactions.length / days;
}

/**
 * Calculate runway (months of operation based on current balance and burn rate)
 */
export function calculateRunway(
  currentBalance: number,
  monthlyExpenses: number
): number {
  if (monthlyExpenses === 0) return Infinity;
  return currentBalance / monthlyExpenses;
}

// =====================================
// Summary Statistics
// =====================================

/**
 * Generate comprehensive treasury summary
 */
export function generateTreasurySummary(
  analytics: DAOAnalytics,
  transactions: TreasuryTransaction[]
): {
  balance: number;
  totalIn: number;
  totalOut: number;
  netFlow: number;
  health: number;
  status: ReturnType<typeof getTreasuryStatus>;
  velocity: number;
  avgTransaction: number;
} {
  const totalIn =
    (analytics.total_contributions || 0) +
    (analytics.total_revenue || 0) +
    (analytics.total_grants || 0);

  const totalOut =
    (analytics.total_disbursements || 0) + (analytics.total_expenses || 0);

  const netFlow = totalIn - totalOut;

  return {
    balance: analytics.current_balance,
    totalIn,
    totalOut,
    netFlow,
    health: calculateTreasuryHealth(analytics),
    status: getTreasuryStatus(analytics.current_balance),
    velocity: getTransactionVelocity(transactions),
    avgTransaction: calculateAverageTransaction(transactions),
  };
}

/**
 * Get key metrics for dashboard
 */
export function getKeyMetrics(analytics: DAOAnalytics): {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
}[] {
  return [
    {
      label: 'Current Balance',
      value: formatCurrency(analytics.current_balance),
      trend: 'stable',
    },
    {
      label: 'Total Raised',
      value: formatCurrency(analytics.total_raised),
    },
    {
      label: 'Active Proposals',
      value: analytics.active_count.toString(),
    },
    {
      label: 'Contributors',
      value: analytics.unique_contributors.toString(),
    },
    {
      label: 'Funded Projects',
      value: analytics.funded_count.toString(),
    },
    {
      label: 'Total Transactions',
      value: analytics.total_transactions.toString(),
    },
  ];
}
