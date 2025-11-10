'use client';

/**
 * Proposal Card Component
 * Phase 3: Treasury & Analytics Dashboard Integration
 *
 * Display proposal information with treasury funding badge
 */

import React from 'react';
import Link from 'next/link';

// ============================================================
// TYPES
// ============================================================

export interface Proposal {
  id: string;
  title: string;
  description: string;
  proposal_type: string;
  status: 'draft' | 'active' | 'approved' | 'rejected' | 'funded';
  created_by: string;
  funding_goal?: number;
  current_funding?: number;
  votes_for?: number;
  votes_against?: number;
  created_at: string;
  funding_source?: 'community' | 'treasury' | 'mixed';
}

interface ProposalCardProps {
  proposal: Proposal;
  showFundingInfo?: boolean;
  className?: string;
}

// ============================================================
// COMPONENT
// ============================================================

export default function ProposalCard({
  proposal,
  showFundingInfo = true,
  className = '',
}: ProposalCardProps) {
  // Calculate funding progress percentage
  const getFundingProgress = (): number => {
    if (!proposal.funding_goal || proposal.funding_goal === 0) return 0;
    return Math.min(
      ((proposal.current_funding || 0) / proposal.funding_goal) * 100,
      100
    );
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      active: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      funded: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || colors.draft;
  };

  // Get proposal type icon
  const getTypeIcon = (type: string): string => {
    const icons: Record<string, string> = {
      feature: '🚀',
      bug_fix: '🐛',
      improvement: '⚡',
      research: '🔬',
      community: '👥',
      marketing: '📢',
      partnership: '🤝',
      infrastructure: '🏗️',
      other: '📌',
    };
    return icons[type] || icons.other;
  };

  // Check if funded by treasury
  const isTreasuryFunded =
    proposal.funding_source === 'treasury' || proposal.funding_source === 'mixed';

  return (
    <Link href={`/dao/proposals/${proposal.id}`}>
      <div
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 hover:border-purple-300 p-6 cursor-pointer ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-grow">
            <span className="text-3xl">{getTypeIcon(proposal.proposal_type)}</span>
            <div className="flex-grow min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                {proposal.title}
              </h3>
              <p className="text-sm text-gray-500">
                by {proposal.created_by} •{' '}
                {new Date(proposal.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
              proposal.status
            )}`}
          >
            {proposal.status.toUpperCase()}
          </span>
        </div>

        {/* Treasury badge - show if funded by treasury */}
        {isTreasuryFunded && (
          <div className="mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-300 rounded-full">
              <span className="text-lg">💎</span>
              <span className="text-xs font-semibold text-purple-700">
                {proposal.funding_source === 'treasury'
                  ? 'DAO Treasury Funded'
                  : 'Mixed Funding'}
              </span>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-3">{proposal.description}</p>

        {/* Funding information */}
        {showFundingInfo && proposal.funding_goal && proposal.funding_goal > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Funding Progress</span>
              <span className="font-semibold text-gray-900">
                {(proposal.current_funding || 0).toFixed(4)} / {proposal.funding_goal.toFixed(4)}{' '}
                ETH
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getFundingProgress()}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{getFundingProgress().toFixed(1)}% funded</p>
          </div>
        )}

        {/* Voting information */}
        {(proposal.votes_for !== undefined || proposal.votes_against !== undefined) && (
          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold">
                👍 {proposal.votes_for || 0}
              </span>
              <span className="text-xs text-gray-500">For</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-semibold">
                👎 {proposal.votes_against || 0}
              </span>
              <span className="text-xs text-gray-500">Against</span>
            </div>
            <div className="ml-auto">
              <span className="text-xs font-medium text-gray-600 capitalize">
                {proposal.proposal_type.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* View details prompt */}
        <div className="mt-4 text-right">
          <span className="text-sm text-purple-600 font-medium hover:text-purple-700">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  );
}
