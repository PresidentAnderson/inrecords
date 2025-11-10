'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import VotingWidget from '@/components/VotingWidget';
import { DAOProposal, DAOVote } from '@/lib/supabase/dao';
import {
  formatFunding,
  calculateApprovalPercentage,
  calculateFundingPercentage,
  getHoursRemaining,
  getDaysRemaining,
  isVotingActive,
  MembershipTier,
  VoteType,
} from '@/lib/schemas/dao';

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<DAOProposal | null>(null);
  const [votes, setVotes] = useState<DAOVote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock wallet data - replace with actual wallet integration
  const [walletAddress] = useState<string | null>('mock_wallet_address');
  const [membershipTier] = useState<MembershipTier | null>('Gold');
  const [userVote, setUserVote] = useState<VoteType | null>(null);

  // Fetch proposal details
  const fetchProposal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dao/proposals?proposalId=${proposalId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch proposal');
      }

      const data = await response.json();
      setProposal(data.proposals[0]);

      // Fetch votes
      const votesResponse = await fetch(`/api/dao/votes?proposalId=${proposalId}`);
      if (votesResponse.ok) {
        const votesData = await votesResponse.json();
        setVotes(votesData.votes || []);
      }

      // Check if user has voted
      if (walletAddress) {
        const userVoteResponse = await fetch(
          `/api/dao/vote?proposalId=${proposalId}&voterWallet=${walletAddress}`
        );
        if (userVoteResponse.ok) {
          const userVoteData = await userVoteResponse.json();
          if (userVoteData.hasVoted) {
            setUserVote(userVoteData.vote.vote_type);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load proposal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (proposalId) {
      fetchProposal();
    }
  }, [proposalId]);

  const handleVoteSuccess = () => {
    // Refresh proposal data after successful vote
    fetchProposal();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Proposal Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The proposal you are looking for does not exist.'}</p>
          <Link
            href="/dao/proposals"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  const votingActive = isVotingActive(new Date(proposal.voting_ends_at), proposal.status as any);
  const hoursRemaining = getHoursRemaining(new Date(proposal.voting_ends_at));
  const daysRemaining = getDaysRemaining(new Date(proposal.voting_ends_at));
  const approvalPct = calculateApprovalPercentage(proposal.votes_for, proposal.votes_against);
  const fundingPct = proposal.funding_goal
    ? calculateFundingPercentage(proposal.current_funding, proposal.funding_goal)
    : 0;

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/dao/proposals"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Proposals
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Proposal Header */}
            <div className="bg-white rounded-lg shadow-md p-8 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${
                    statusColors[proposal.status]
                  }`}
                >
                  {proposal.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                  {proposal.proposal_type}
                </span>
                {votingActive && hoursRemaining <= 24 && (
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                    Ending Soon: {hoursRemaining}h
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{proposal.title}</h1>

              {/* Creator Info */}
              <div className="flex items-center space-x-3 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                  A
                </div>
                <div>
                  <p className="text-sm text-gray-500">Proposed by</p>
                  <p className="font-medium text-gray-900">{proposal.created_by.slice(0, 16)}...</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium text-gray-900">
                    {new Date(proposal.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {proposal.description}
                </p>
              </div>

              {/* Tags */}
              {proposal.tags && proposal.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {proposal.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Vote History */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Vote History</h2>

              {votes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No votes cast yet</p>
              ) : (
                <div className="space-y-4">
                  {votes.slice(0, 10).map((vote) => (
                    <div
                      key={vote.id}
                      className="flex items-center justify-between border-b border-gray-200 pb-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                          {vote.voter_wallet[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {vote.voter_wallet.slice(0, 16)}...
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(vote.voted_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            vote.vote_type === 'for'
                              ? 'bg-green-100 text-green-700'
                              : vote.vote_type === 'against'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {vote.vote_type.toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">Weight: {vote.vote_weight}x</p>
                      </div>
                    </div>
                  ))}
                  {votes.length > 10 && (
                    <p className="text-center text-sm text-gray-500 pt-4">
                      Showing 10 of {votes.length} votes
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Voting Stats */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Voting Status</h3>

              <div className="space-y-4">
                {/* Approval Rate */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Approval Rate</span>
                    <span className="font-bold text-gray-900">{approvalPct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        approvalPct >= 51 ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${approvalPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Vote Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-green-700">{proposal.votes_for}</p>
                    <p className="text-xs text-green-600">For</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-red-700">{proposal.votes_against}</p>
                    <p className="text-xs text-red-600">Against</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-2xl font-bold text-gray-700">{proposal.votes_abstain}</p>
                    <p className="text-xs text-gray-600">Abstain</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Unique Voters</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {proposal.unique_voters}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Vote Weight</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {proposal.total_vote_weight}
                    </span>
                  </div>
                  {votingActive && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time Remaining</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {daysRemaining > 0 ? `${daysRemaining}d` : `${hoursRemaining}h`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Funding Info */}
            {proposal.funding_goal && proposal.funding_goal > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Funding Goal</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-700">Progress</span>
                      <span className="font-bold text-gray-900">{fundingPct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-purple-500 h-3 rounded-full"
                        style={{ width: `${fundingPct}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Goal</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatFunding(proposal.funding_goal, proposal.funding_currency as any)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Raised</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatFunding(proposal.current_funding, proposal.funding_currency as any)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Voting Widget */}
            {votingActive && (
              <VotingWidget
                proposalId={proposal.id}
                walletAddress={walletAddress}
                membershipTier={membershipTier}
                hasVoted={!!userVote}
                existingVote={userVote}
                onVoteSuccess={handleVoteSuccess}
              />
            )}

            {/* Comments Placeholder */}
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-500 text-sm">Comments feature coming soon!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
