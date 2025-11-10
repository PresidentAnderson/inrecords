'use client';

import Link from 'next/link';
import { ProposalWithStats } from '@/lib/supabase/dao';
import {
  formatFunding,
  calculateApprovalPercentage,
  calculateFundingPercentage,
  getHoursRemaining,
  getDaysRemaining,
  isVotingActive,
} from '@/lib/schemas/dao';

interface ProposalCardProps {
  proposal: ProposalWithStats;
  showVoteButton?: boolean;
  compact?: boolean;
}

export default function ProposalCard({
  proposal,
  showVoteButton = true,
  compact = false,
}: ProposalCardProps) {
  const votingActive = isVotingActive(
    new Date(proposal.voting_ends_at),
    proposal.status as any
  );

  const hoursRemaining = getHoursRemaining(new Date(proposal.voting_ends_at));
  const daysRemaining = getDaysRemaining(new Date(proposal.voting_ends_at));

  const approvalPct = calculateApprovalPercentage(
    proposal.votes_for,
    proposal.votes_against
  );

  const fundingPct = proposal.funding_goal
    ? calculateFundingPercentage(proposal.current_funding, proposal.funding_goal)
    : 0;

  const totalVotes = proposal.votes_for + proposal.votes_against + proposal.votes_abstain;

  // Status badge colors
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    submitted: 'bg-blue-500',
    active_voting: 'bg-green-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-500',
    funded: 'bg-purple-500',
    completed: 'bg-indigo-500',
    cancelled: 'bg-gray-600',
  };

  const statusColor = statusColors[proposal.status] || 'bg-gray-500';

  // Time remaining display
  const timeRemainingDisplay = () => {
    if (!votingActive) return null;

    if (hoursRemaining <= 24) {
      return (
        <div className="flex items-center space-x-1 text-red-600 font-semibold">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm">{hoursRemaining}h remaining</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1 text-gray-600">
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm">{daysRemaining}d remaining</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${statusColor}`}
              >
                {proposal.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {proposal.proposal_type}
              </span>
            </div>
            <Link
              href={`/dao/proposals/${proposal.id}`}
              className="hover:text-blue-600 transition-colors"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {proposal.title}
              </h3>
            </Link>
            {!compact && (
              <p className="text-gray-600 text-sm line-clamp-2">
                {proposal.description}
              </p>
            )}
          </div>
        </div>

        {/* Voting Progress */}
        {(votingActive || proposal.status === 'approved' || proposal.status === 'rejected') && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Approval Rate</span>
              <span className="font-semibold text-gray-900">{approvalPct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  approvalPct >= 51 ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${approvalPct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>For: {proposal.votes_for}</span>
              <span>Against: {proposal.votes_against}</span>
              <span>Abstain: {proposal.votes_abstain}</span>
            </div>
          </div>
        )}

        {/* Funding Progress (if applicable) */}
        {proposal.funding_goal && proposal.funding_goal > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">Funding Progress</span>
              <span className="font-semibold text-gray-900">
                {formatFunding(proposal.current_funding, proposal.funding_currency as any)} /{' '}
                {formatFunding(proposal.funding_goal, proposal.funding_currency as any)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-purple-500 h-2.5 rounded-full"
                style={{ width: `${fundingPct}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {fundingPct}% funded
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 py-3 border-t border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Total Votes</p>
            <p className="text-lg font-semibold text-gray-900">{totalVotes}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Unique Voters</p>
            <p className="text-lg font-semibold text-gray-900">
              {proposal.unique_voters}
            </p>
          </div>
          {proposal.funding_goal && (
            <>
              <div>
                <p className="text-xs text-gray-500 mb-1">Goal</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatFunding(proposal.funding_goal, proposal.funding_currency as any)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Raised</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatFunding(proposal.current_funding, proposal.funding_currency as any)}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {proposal.creator_display_name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {proposal.creator_display_name || 'Anonymous'}
              </p>
              <p className="text-xs text-gray-500">{proposal.creator_tier}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {timeRemainingDisplay()}
            {showVoteButton && votingActive && (
              <Link
                href={`/dao/proposals/${proposal.id}`}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Vote Now
              </Link>
            )}
            {!votingActive && (
              <Link
                href={`/dao/proposals/${proposal.id}`}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                View Details
              </Link>
            )}
          </div>
        </div>

        {/* Tags */}
        {proposal.tags && proposal.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {proposal.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
