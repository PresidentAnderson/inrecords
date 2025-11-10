/**
 * Chart.js Configuration Utilities
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Provides default configurations, themes, and utilities for Chart.js
 */

import { ChartOptions } from 'chart.js';

// ============================================================
// COLOR THEMES
// ============================================================

export const chartColors = {
  aurora: {
    primary: '#8B5CF6', // Purple
    secondary: '#EC4899', // Pink
    tertiary: '#3B82F6', // Blue
    success: '#10B981', // Green
    warning: '#F59E0B', // Amber
    danger: '#EF4444', // Red
    info: '#06B6D4', // Cyan
    dark: '#1F2937', // Gray-800
    light: '#F3F4F6', // Gray-100
  },
  gold: {
    primary: '#F59E0B', // Amber
    secondary: '#FBBF24', // Yellow
    tertiary: '#FB923C', // Orange
    gradient: ['#FBBF24', '#F59E0B', '#FB923C'],
  },
  midnight: {
    primary: '#1E293B', // Slate-800
    secondary: '#334155', // Slate-700
    tertiary: '#475569', // Slate-600
    text: '#F1F5F9', // Slate-100
    border: '#64748B', // Slate-500
  },
  gradient: {
    purple: ['rgba(139, 92, 246, 0.8)', 'rgba(139, 92, 246, 0.2)'],
    pink: ['rgba(236, 72, 153, 0.8)', 'rgba(236, 72, 153, 0.2)'],
    blue: ['rgba(59, 130, 246, 0.8)', 'rgba(59, 130, 246, 0.2)'],
    green: ['rgba(16, 185, 129, 0.8)', 'rgba(16, 185, 129, 0.2)'],
    amber: ['rgba(245, 158, 11, 0.8)', 'rgba(245, 158, 11, 0.2)'],
  },
};

// ============================================================
// DEFAULT CHART OPTIONS
// ============================================================

export const defaultChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: chartColors.aurora.primary,
      borderWidth: 1,
      padding: 12,
      displayColors: true,
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-US', {
              style: 'decimal',
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            }).format(context.parsed.y);
          }
          return label;
        },
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif",
        },
      },
    },
  },
  animation: {
    duration: 750,
    easing: 'easeInOutQuart',
  },
};

export const lineChartOptions: ChartOptions<'line'> = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins?.legend,
      display: true,
    },
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2,
    },
    point: {
      radius: 3,
      hoverRadius: 6,
      hitRadius: 10,
    },
  },
};

export const barChartOptions: ChartOptions<'bar'> = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins?.legend,
      display: false,
    },
  },
  scales: {
    ...defaultChartOptions.scales,
    x: {
      ...defaultChartOptions.scales?.x,
      grid: {
        display: false,
      },
    },
    y: {
      ...defaultChartOptions.scales?.y,
      beginAtZero: true,
    },
  },
};

export const doughnutChartOptions: ChartOptions<'doughnut'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: "'Inter', sans-serif",
        },
        generateLabels: (chart) => {
          const data = chart.data;
          if (data.labels && data.datasets.length) {
            return data.labels.map((label, i) => {
              const dataset = data.datasets[0];
              const value = dataset.data[i] as number;
              const total = (dataset.data as number[]).reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);

              return {
                text: `${label}: ${percentage}%`,
                fillStyle: Array.isArray(dataset.backgroundColor)
                  ? dataset.backgroundColor[i]
                  : dataset.backgroundColor,
                hidden: false,
                index: i,
              };
            });
          }
          return [];
        },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: chartColors.aurora.primary,
      borderWidth: 1,
      padding: 12,
      callbacks: {
        label: function (context) {
          const label = context.label || '';
          const value = context.parsed;
          const dataset = context.dataset;
          const total = (dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value.toFixed(4)} (${percentage}%)`;
        },
      },
    },
  },
  cutout: '65%',
  animation: {
    animateRotate: true,
    animateScale: true,
  },
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Create gradient for canvas
 */
export function createGradient(
  ctx: CanvasRenderingContext2D,
  colors: string[],
  height: number
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  return gradient;
}

/**
 * Format currency for chart labels
 */
export function formatChartCurrency(value: number, currency: string = 'ETH'): string {
  return `${value.toFixed(4)} ${currency}`;
}

/**
 * Format date for chart labels
 */
export function formatChartDate(date: string | Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    case 'medium':
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
    case 'long':
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Get color palette for multiple datasets
 */
export function getColorPalette(count: number): string[] {
  const baseColors = [
    chartColors.aurora.primary,
    chartColors.aurora.secondary,
    chartColors.aurora.tertiary,
    chartColors.aurora.success,
    chartColors.aurora.warning,
    chartColors.aurora.info,
    chartColors.aurora.danger,
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // Generate additional colors if needed
  const colors = [...baseColors];
  while (colors.length < count) {
    const hue = (colors.length * 137.5) % 360; // Golden angle approximation
    colors.push(`hsl(${hue}, 70%, 60%)`);
  }

  return colors;
}

/**
 * Calculate appropriate Y-axis max value
 */
export function calculateYAxisMax(data: number[]): number {
  const max = Math.max(...data);
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  return Math.ceil(max / magnitude) * magnitude;
}

/**
 * Calculate appropriate Y-axis step size
 */
export function calculateYAxisStep(max: number, desiredSteps: number = 5): number {
  return max / desiredSteps;
}

/**
 * Generate time-series labels
 */
export function generateTimeLabels(
  days: number,
  format: 'short' | 'medium' | 'long' = 'short'
): string[] {
  const labels: string[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    labels.push(formatChartDate(date, format));
  }

  return labels;
}

/**
 * Aggregate data by time period
 */
export function aggregateByPeriod(
  data: Array<{ date: string; value: number }>,
  period: 'day' | 'week' | 'month'
): Array<{ date: string; value: number }> {
  const aggregated: Record<string, number> = {};

  data.forEach((item) => {
    const date = new Date(item.date);
    let key: string;

    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString().split('T')[0];
    }

    aggregated[key] = (aggregated[key] || 0) + item.value;
  });

  return Object.entries(aggregated).map(([date, value]) => ({ date, value }));
}

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}

/**
 * Create dataset configuration
 */
export function createDatasetConfig(
  label: string,
  data: number[],
  colorIndex: number = 0,
  type: 'line' | 'bar' | 'doughnut' = 'line'
) {
  const colors = getColorPalette(10);
  const color = colors[colorIndex % colors.length];

  const baseConfig = {
    label,
    data,
    borderColor: color,
    backgroundColor: color,
  };

  if (type === 'line') {
    return {
      ...baseConfig,
      backgroundColor: `${color}20`, // 20 = 12.5% opacity in hex
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6,
    };
  }

  if (type === 'bar') {
    return {
      ...baseConfig,
      backgroundColor: `${color}80`, // 80 = 50% opacity in hex
      borderWidth: 0,
    };
  }

  return baseConfig;
}

export default {
  chartColors,
  defaultChartOptions,
  lineChartOptions,
  barChartOptions,
  doughnutChartOptions,
  createGradient,
  formatChartCurrency,
  formatChartDate,
  getColorPalette,
  calculateYAxisMax,
  calculateYAxisStep,
  generateTimeLabels,
  aggregateByPeriod,
  formatLargeNumber,
  createDatasetConfig,
};
