/**
 * CSV Export Utilities
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Provides functions to export data to CSV format
 */

import { TreasuryTransaction } from '../supabase/treasury';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface ExportOptions {
  filename?: string;
  headers?: string[];
  dateFormat?: 'short' | 'long' | 'iso';
  includeTimestamp?: boolean;
}

// ============================================================
// CORE EXPORT FUNCTIONS
// ============================================================

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV<T extends Record<string, any>>(
  data: T[],
  headers?: string[]
): string {
  if (data.length === 0) {
    return '';
  }

  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0]);

  // Create header row
  const headerRow = csvHeaders.join(',');

  // Create data rows
  const dataRows = data.map((row) => {
    return csvHeaders
      .map((header) => {
        const value = row[header];
        return formatCSVValue(value);
      })
      .join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Format a value for CSV
 */
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  // Handle dates
  if (value instanceof Date) {
    return `"${value.toISOString()}"`;
  }

  // Handle strings with special characters
  if (typeof value === 'string') {
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // Handle numbers
  if (typeof value === 'number') {
    return value.toString();
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  // Handle objects and arrays
  if (typeof value === 'object') {
    return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
  }

  return String(value);
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    // Create a link to the file
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(
  prefix: string,
  includeTimestamp: boolean = true,
  extension: string = 'csv'
): string {
  if (!includeTimestamp) {
    return `${prefix}.${extension}`;
  }

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .split('T')[0];

  return `${prefix}_${timestamp}.${extension}`;
}

// ============================================================
// SPECIFIC EXPORT FUNCTIONS
// ============================================================

/**
 * Export treasury transactions to CSV
 */
export function exportTreasuryTransactions(
  transactions: TreasuryTransaction[],
  options: ExportOptions = {}
): void {
  const {
    filename = generateFilename('treasury_transactions', options.includeTimestamp ?? true),
    headers = [
      'Transaction ID',
      'Type',
      'Amount',
      'Currency',
      'Proposal Title',
      'Contributor Wallet',
      'Recipient Wallet',
      'Transaction Hash',
      'Description',
      'Created At',
      'Created By',
    ],
  } = options;

  // Transform data for export
  const exportData = transactions.map((tx) => ({
    'Transaction ID': tx.id || '',
    Type: tx.transaction_type,
    Amount: tx.amount,
    Currency: tx.currency || 'ETH',
    'Proposal Title': tx.proposal_title || '',
    'Contributor Wallet': tx.contributor_wallet || '',
    'Recipient Wallet': tx.recipient_wallet || '',
    'Transaction Hash': tx.transaction_hash || '',
    Description: tx.description || '',
    'Created At': tx.created_at ? formatDate(tx.created_at, options.dateFormat) : '',
    'Created By': tx.created_by,
  }));

  const csv = arrayToCSV(exportData, headers);
  downloadCSV(csv, filename);
}

/**
 * Export proposal history to CSV
 */
export function exportProposalHistory(
  proposals: any[],
  options: ExportOptions = {}
): void {
  const {
    filename = generateFilename('proposal_history', options.includeTimestamp ?? true),
    headers = [
      'Proposal ID',
      'Title',
      'Type',
      'Status',
      'Created By',
      'Funding Goal',
      'Current Funding',
      'Votes For',
      'Votes Against',
      'Created At',
      'Updated At',
    ],
  } = options;

  // Transform data for export
  const exportData = proposals.map((proposal) => ({
    'Proposal ID': proposal.id || '',
    Title: proposal.title || '',
    Type: proposal.proposal_type || '',
    Status: proposal.status || '',
    'Created By': proposal.created_by || '',
    'Funding Goal': proposal.funding_goal || 0,
    'Current Funding': proposal.current_funding || 0,
    'Votes For': proposal.votes_for || 0,
    'Votes Against': proposal.votes_against || 0,
    'Created At': proposal.created_at ? formatDate(proposal.created_at, options.dateFormat) : '',
    'Updated At': proposal.updated_at ? formatDate(proposal.updated_at, options.dateFormat) : '',
  }));

  const csv = arrayToCSV(exportData, headers);
  downloadCSV(csv, filename);
}

/**
 * Export analytics summary to CSV
 */
export function exportAnalyticsSummary(
  analytics: any,
  options: ExportOptions = {}
): void {
  const {
    filename = generateFilename('dao_analytics', options.includeTimestamp ?? true),
  } = options;

  // Transform analytics object to array format
  const exportData = [
    {
      Metric: 'Total Proposals',
      Value: analytics.total_proposals || 0,
    },
    {
      Metric: 'Funded Proposals',
      Value: analytics.funded_count || 0,
    },
    {
      Metric: 'Active Proposals',
      Value: analytics.active_count || 0,
    },
    {
      Metric: 'Approved Proposals',
      Value: analytics.approved_count || 0,
    },
    {
      Metric: 'Rejected Proposals',
      Value: analytics.rejected_count || 0,
    },
    {
      Metric: 'Total Raised (ETH)',
      Value: analytics.total_raised || 0,
    },
    {
      Metric: 'Average Funding per Proposal (ETH)',
      Value: analytics.avg_funding_per_proposal || 0,
    },
    {
      Metric: 'Unique Proposers',
      Value: analytics.unique_proposers || 0,
    },
  ];

  const csv = arrayToCSV(exportData, ['Metric', 'Value']);
  downloadCSV(csv, filename);
}

/**
 * Export treasury summary to CSV
 */
export function exportTreasurySummary(
  summary: any,
  options: ExportOptions = {}
): void {
  const {
    filename = generateFilename('treasury_summary', options.includeTimestamp ?? true),
  } = options;

  // Transform summary object to array format
  const exportData = [
    {
      Metric: 'Total Inflow (ETH)',
      Value: summary.total_inflow || 0,
    },
    {
      Metric: 'Total Outflow (ETH)',
      Value: summary.total_outflow || 0,
    },
    {
      Metric: 'Current Balance (ETH)',
      Value: summary.current_balance || 0,
    },
    {
      Metric: 'Unique Contributors',
      Value: summary.unique_contributors || 0,
    },
    {
      Metric: 'Unique Recipients',
      Value: summary.unique_recipients || 0,
    },
    {
      Metric: 'Total Transactions',
      Value: summary.total_transactions || 0,
    },
  ];

  const csv = arrayToCSV(exportData, ['Metric', 'Value']);
  downloadCSV(csv, filename);
}

/**
 * Export top contributors to CSV
 */
export function exportTopContributors(
  contributors: any[],
  options: ExportOptions = {}
): void {
  const {
    filename = generateFilename('top_contributors', options.includeTimestamp ?? true),
    headers = [
      'Rank',
      'Wallet Address',
      'Total Contributed',
      'Currency',
      'Number of Contributions',
      'Last Contribution',
    ],
  } = options;

  // Transform data for export
  const exportData = contributors.map((contributor, index) => ({
    Rank: index + 1,
    'Wallet Address': contributor.contributor_wallet || '',
    'Total Contributed': contributor.total_contributed || 0,
    Currency: contributor.currency || 'ETH',
    'Number of Contributions': contributor.contribution_count || 0,
    'Last Contribution': contributor.last_contribution
      ? formatDate(contributor.last_contribution, options.dateFormat)
      : '',
  }));

  const csv = arrayToCSV(exportData, headers);
  downloadCSV(csv, filename);
}

/**
 * Export funding distribution to CSV
 */
export function exportFundingDistribution(
  distribution: any[],
  options: ExportOptions = {}
): void {
  const {
    filename = generateFilename('funding_distribution', options.includeTimestamp ?? true),
    headers = [
      'Proposal Type',
      'Number of Proposals',
      'Total Funding',
      'Average Funding',
      'Treasury Contribution',
      'Percentage',
    ],
  } = options;

  // Transform data for export
  const exportData = distribution.map((item) => ({
    'Proposal Type': item.proposal_type || '',
    'Number of Proposals': item.proposal_count || 0,
    'Total Funding': item.total_funding || 0,
    'Average Funding': item.avg_funding || 0,
    'Treasury Contribution': item.treasury_contribution || 0,
    Percentage: item.percentage ? `${item.percentage}%` : '0%',
  }));

  const csv = arrayToCSV(exportData, headers);
  downloadCSV(csv, filename);
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/**
 * Format date for CSV export
 */
function formatDate(
  date: string | Date,
  format: 'short' | 'long' | 'iso' = 'iso'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US');
    case 'long':
      return d.toLocaleString('en-US');
    case 'iso':
    default:
      return d.toISOString();
  }
}

/**
 * Export multiple datasets to a single CSV with sections
 */
export function exportMultiSection(
  sections: Array<{ title: string; data: any[]; headers?: string[] }>,
  filename: string
): void {
  const csvSections = sections.map((section) => {
    const csv = arrayToCSV(section.data, section.headers);
    return `${section.title}\n${csv}`;
  });

  const csvContent = csvSections.join('\n\n');
  downloadCSV(csvContent, filename);
}

/**
 * Validate data before export
 */
export function validateExportData<T>(data: T[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
  }

  if (data.length === 0) {
    errors.push('Data array is empty');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  arrayToCSV,
  downloadCSV,
  generateFilename,
  exportTreasuryTransactions,
  exportProposalHistory,
  exportAnalyticsSummary,
  exportTreasurySummary,
  exportTopContributors,
  exportFundingDistribution,
  exportMultiSection,
  validateExportData,
};
