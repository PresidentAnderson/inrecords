'use client';

/**
 * inRECORD DAO Governance System - Voting Card Component
 * Phase 2: Interactive voting UI with weighted voting support
 */

import { useState, useEffect } from 'react';
import type {
  DAOProposal,
  ProposalVoteSummary,
  VoteType,
  MembershipTier
} from '../lib/types/dao';
import {
  formatProposalStatus,
  formatProposalType,
  getTimeRemaining,
  calculateVoteBreakdown,
  isVotingActive,
  getVotingWeight
} from '../lib/types/dao';
import { castVote, hasVoted } from '../lib/supabase/dao';
import { notifyVoteMilestone } from '../lib/discord/notifications';

interface VotingCardProps {
  proposal: DAOProposal;
  voteSummary: ProposalVoteSummary;
  userWallet?: string;
  userTokens?: number;
  onVoteCast?: () => void;
}

export default function VotingCard({
  proposal,
  voteSummary,
  userWallet,
  userTokens = 0,
  onVoteCast
}: VotingCardProps) {
  const [selectedVote, setSelectedVote] = useState<VoteType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userVote, setUserVote] = useState<VoteType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const statusInfo = formatProposalStatus(proposal.status);
  const typeInfo = formatProposalType(proposal.proposal_type);
  const voteBreakdown = calculateVoteBreakdown(voteSummary);
  const votingActive = isVotingActive(proposal);
  const voteWeight = getVotingWeight(userTokens);
  const canVote = votingActive && userWallet && voteWeight > 0;

  // Check if user has already voted
  useEffect(() => {
    async function checkUserVote() {
      if (!userWallet || !proposal.id) return;

      const { voted, vote } = await hasVoted(proposal.id, userWallet);
      if (voted && vote) {
        setUserVote(vote.vote_type as VoteType);
      }
    }

    checkUserVote();
  }, [proposal.id, userWallet]);

  // Handle vote submission
  const handleVote = async () => {
    if (!selectedVote || !userWallet || !canVote) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: voteError } = await castVote({
        proposal_id: proposal.id,
        voter_wallet: userWallet,
        vote_weight: voteWeight,
        vote_type: selectedVote,
        metadata: {
          tokens: userTokens,
          timestamp: new Date().toISOString()
        }
      });

      if (voteError) {
        throw new Error(voteError.message || 'Failed to cast vote');
      }

      setUserVote(selectedVote);
      setSuccess(`Vote cast successfully! Your vote has ${voteWeight}x weight.`);

      // Check for milestones
      const newTotal = voteSummary.total_votes + voteWeight;
      const milestones = [100, 500, 1000, 2000, 5000];
      const reachedMilestone = milestones.find(
        m => voteSummary.total_votes < m && newTotal >= m
      );

      if (reachedMilestone) {
        await notifyVoteMilestone(proposal, reachedMilestone, {
          ...voteSummary,
          total_votes: newTotal
        });
      }

      // Call callback if provided
      if (onVoteCast) {
        onVoteCast();
      }

      // Reset selected vote after success
      setTimeout(() => {
        setSelectedVote(null);
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      console.error('Error casting vote:', err);
      setError(err.message || 'Failed to cast vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle vote change
  const handleChangeVote = () => {
    setUserVote(null);
    setSelectedVote(null);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs px-3 py-1 rounded-full ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300">
                {typeInfo.icon} {typeInfo.label}
              </span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">{proposal.title}</h3>
            {proposal.voting_ends_at && (
              <p className="text-sm text-gray-400">
                {getTimeRemaining(proposal.voting_ends_at)}
              </p>
            )}
          </div>
        </div>

        {proposal.description && (
          <p className="text-gray-300 leading-relaxed">{proposal.description}</p>
        )}

        {proposal.funding_goal && (
          <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Funding Goal</span>
              <span className="text-lg font-semibold text-aurora">
                ${proposal.funding_goal.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-aurora to-blue-400 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((proposal.current_funding / proposal.funding_goal) * 100, 100)}%`
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              ${proposal.current_funding.toLocaleString()} raised ({Math.round((proposal.current_funding / proposal.funding_goal) * 100)}%)
            </p>
          </div>
        )}
      </div>

      {/* Vote Summary */}
      <div className="p-6 border-b border-white/10">
        <h4 className="text-sm font-semibold text-gray-400 mb-4">Current Votes</h4>

        <div className="space-y-3 mb-4">
          {/* For votes */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-green-400">For</span>
              <span className="text-white font-semibold">
                {voteSummary.votes_for} votes ({voteBreakdown.percentage_for}%)
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${voteBreakdown.percentage_for}%` }}
              />
            </div>
          </div>

          {/* Against votes */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-red-400">Against</span>
              <span className="text-white font-semibold">
                {voteSummary.votes_against} votes ({voteBreakdown.percentage_against}%)
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all"
                style={{ width: `${voteBreakdown.percentage_against}%` }}
              />
            </div>
          </div>

          {/* Abstain votes */}
          {voteSummary.votes_abstain > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Abstain</span>
                <span className="text-white font-semibold">
                  {voteSummary.votes_abstain} votes ({voteBreakdown.percentage_abstain}%)
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className="bg-gray-500 h-2 rounded-full transition-all"
                  style={{ width: `${voteBreakdown.percentage_abstain}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between text-sm text-gray-400">
          <span>Total Votes: {voteSummary.total_votes}</span>
          <span>Unique Voters: {voteSummary.unique_voters}</span>
        </div>
      </div>

      {/* Voting Interface */}
      <div className="p-6">
        {!userWallet ? (
          <div className="text-center py-4 text-gray-400">
            Connect your wallet to vote on this proposal
          </div>
        ) : voteWeight === 0 ? (
          <div className="text-center py-4 text-yellow-400">
            You need at least 100 tokens to vote (Bronze tier)
          </div>
        ) : !votingActive ? (
          <div className="text-center py-4 text-gray-400">
            Voting has ended for this proposal
          </div>
        ) : userVote ? (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
              <p className="text-green-400 font-semibold">
                You voted: {userVote.toUpperCase()}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Vote weight: {voteWeight}x ({userTokens.toLocaleString()} tokens)
              </p>
            </div>
            <button
              onClick={handleChangeVote}
              className="w-full py-3 border-2 border-aurora text-aurora rounded-lg hover:bg-aurora/10 transition font-semibold"
            >
              Change Vote
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Your voting power:</p>
              <p className="text-lg font-semibold text-aurora">
                {voteWeight}x weight ({userTokens.toLocaleString()} tokens)
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setSelectedVote('for')}
                className={`py-3 rounded-lg font-semibold transition ${
                  selectedVote === 'for'
                    ? 'bg-green-500 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                For
              </button>
              <button
                onClick={() => setSelectedVote('against')}
                className={`py-3 rounded-lg font-semibold transition ${
                  selectedVote === 'against'
                    ? 'bg-red-500 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                Against
              </button>
              <button
                onClick={() => setSelectedVote('abstain')}
                className={`py-3 rounded-lg font-semibold transition ${
                  selectedVote === 'abstain'
                    ? 'bg-gray-500 text-white'
                    : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                }`}
              >
                Abstain
              </button>
            </div>

            {selectedVote && (
              <button
                onClick={handleVote}
                disabled={isLoading}
                className="w-full py-3 bg-aurora text-black rounded-lg hover:opacity-80 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting Vote...' : `Cast Vote: ${selectedVote.toUpperCase()}`}
              </button>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                {success}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Proposal Metadata */}
      <div className="p-6 border-t border-white/10 bg-black/20">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Proposed by:</span>
            <p className="text-white font-mono mt-1">
              {proposal.created_by || 'Anonymous'}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Created:</span>
            <p className="text-white mt-1">
              {new Date(proposal.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
