'use client';

/**
 * inRECORD DAO Governance System - Proposal Detail Page
 * Phase 2: Individual proposal view with voting interface
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import VotingCard from '../../../../components/VotingCard';
import type { DAOProposal, DAOVote } from '../../../../lib/types/dao';
import {
  getProposal,
  getProposalVoteSummary,
  getProposalVotes,
  subscribeToProposalVotes
} from '../../../../lib/supabase/dao';
import { formatProposalType } from '../../../../lib/types/dao';

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params?.id as string;

  const [proposal, setProposal] = useState<DAOProposal | null>(null);
  const [voteSummary, setVoteSummary] = useState<any>(null);
  const [votes, setVotes] = useState<DAOVote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user data (in production, this would come from wallet connection)
  const [userWallet, setUserWallet] = useState<string>('');
  const [userTokens, setUserTokens] = useState<number>(1500); // Gold tier
  const [showVoteHistory, setShowVoteHistory] = useState(false);

  // Fetch proposal data
  const fetchProposalData = async () => {
    if (!proposalId) return;

    try {
      const [proposalResult, summaryResult, votesResult] = await Promise.all([
        getProposal(proposalId),
        getProposalVoteSummary(proposalId),
        getProposalVotes(proposalId)
      ]);

      if (proposalResult.error) throw proposalResult.error;
      if (summaryResult.error) throw summaryResult.error;
      if (votesResult.error) throw votesResult.error;

      if (!proposalResult.data) {
        throw new Error('Proposal not found');
      }

      setProposal(proposalResult.data);
      setVoteSummary(summaryResult.data);
      setVotes(votesResult.data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching proposal:', err);
      setError(err.message || 'Failed to load proposal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposalData();
  }, [proposalId]);

  // Subscribe to real-time vote updates
  useEffect(() => {
    if (!proposalId) return;

    const subscription = subscribeToProposalVotes(proposalId, (payload) => {
      console.log('Vote update received:', payload);
      fetchProposalData(); // Refresh data on vote changes
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [proposalId]);

  // Mock wallet connection
  const connectWallet = () => {
    // In production, this would trigger actual wallet connection
    setUserWallet('user.eth');
  };

  const disconnectWallet = () => {
    setUserWallet('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-midnight to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-aurora mb-4"></div>
          <p className="text-gray-400">Loading proposal...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal || !voteSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-midnight to-black text-white">
        <div className="max-w-4xl mx-auto p-6 py-12">
          <Link href="/dao/proposals" className="text-aurora hover:underline mb-4 inline-block">
            ← Back to Proposals
          </Link>
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error || 'Proposal not found'}
          </div>
        </div>
      </div>
    );
  }

  const typeInfo = formatProposalType(proposal.proposal_type);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-midnight to-black text-white">
      <div className="max-w-6xl mx-auto p-6 py-12">
        {/* Navigation */}
        <div className="mb-8">
          <Link href="/dao/proposals" className="text-aurora hover:underline mb-4 inline-block">
            ← Back to Proposals
          </Link>
        </div>

        {/* Header Actions */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-playfair mb-2">Proposal Details</h1>
            <p className="text-gray-400">
              Proposal ID: <span className="font-mono">{proposal.id.slice(0, 8)}...</span>
            </p>
          </div>

          {/* Wallet Connection */}
          <div>
            {!userWallet ? (
              <button
                onClick={connectWallet}
                className="px-6 py-3 bg-aurora text-black rounded-lg hover:opacity-80 transition font-bold"
              >
                Connect Wallet
              </button>
            ) : (
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Connected Wallet</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm">{userWallet}</span>
                  <button
                    onClick={disconnectWallet}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {userTokens.toLocaleString()} tokens (Gold tier)
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Voting Card */}
            <VotingCard
              proposal={proposal}
              voteSummary={voteSummary}
              userWallet={userWallet}
              userTokens={userTokens}
              onVoteCast={fetchProposalData}
            />

            {/* Proposal Details */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <h2 className="text-2xl font-semibold mb-4">Additional Information</h2>

              <div className="space-y-4">
                {/* Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Created:</span>
                      <span className="text-white">
                        {new Date(proposal.created_at).toLocaleString()}
                      </span>
                    </div>
                    {proposal.voting_ends_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Voting Ends:</span>
                        <span className="text-white">
                          {new Date(proposal.voting_ends_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {proposal.executed_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-300">Executed:</span>
                        <span className="text-white">
                          {new Date(proposal.executed_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metadata */}
                {Object.keys(proposal.metadata || {}).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Metadata</h3>
                    <pre className="text-xs bg-black/40 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(proposal.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* Vote History */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Vote History</h2>
                <button
                  onClick={() => setShowVoteHistory(!showVoteHistory)}
                  className="text-sm text-aurora hover:underline"
                >
                  {showVoteHistory ? 'Hide' : 'Show'} All Votes
                </button>
              </div>

              {showVoteHistory && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {votes.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No votes cast yet
                    </p>
                  ) : (
                    votes.map((vote) => (
                      <div
                        key={vote.id}
                        className="flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5"
                      >
                        <div>
                          <span className="font-mono text-sm text-gray-300">
                            {vote.voter_wallet}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(vote.voted_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-sm font-semibold ${
                              vote.vote_type === 'for'
                                ? 'text-green-400'
                                : vote.vote_type === 'against'
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }`}
                          >
                            {vote.vote_type.toUpperCase()}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Weight: {vote.vote_weight}x
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Total Votes</div>
                  <div className="text-3xl font-bold text-aurora">
                    {voteSummary.total_votes}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Unique Voters</div>
                  <div className="text-2xl font-bold text-white">
                    {voteSummary.unique_voters}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Approval Rate</div>
                  <div className="text-2xl font-bold text-green-400">
                    {voteSummary.total_votes > 0
                      ? Math.round((voteSummary.votes_for / voteSummary.total_votes) * 100)
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>

            {/* Related Actions */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <h3 className="text-lg font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/dao/proposals"
                  className="block w-full py-2 text-center border-2 border-white/20 text-white rounded-lg hover:bg-white/10 transition font-semibold"
                >
                  View All Proposals
                </Link>
                <Link
                  href="/dao/propose"
                  className="block w-full py-2 text-center bg-aurora text-black rounded-lg hover:opacity-80 transition font-bold"
                >
                  Create New Proposal
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full py-2 text-center border-2 border-white/20 text-white rounded-lg hover:bg-white/10 transition font-semibold"
                >
                  Refresh Data
                </button>
              </div>
            </div>

            {/* Share */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <h3 className="text-lg font-semibold mb-4">Share</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    alert('Link copied to clipboard!');
                  }}
                  className="w-full py-2 text-center border-2 border-white/20 text-white rounded-lg hover:bg-white/10 transition font-semibold"
                >
                  Copy Link
                </button>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Vote on: ${proposal.title}`
                  )}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 text-center border-2 border-white/20 text-white rounded-lg hover:bg-white/10 transition font-semibold"
                >
                  Share on Twitter
                </a>
              </div>
            </div>

            {/* Help */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6">
              <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
              <p className="text-sm text-gray-300 mb-3">
                Questions about this proposal or how to vote?
              </p>
              <div className="space-y-2">
                <Link
                  href="/dao/faq"
                  className="block text-sm text-aurora hover:underline"
                >
                  → View DAO FAQ
                </Link>
                <a
                  href="https://discord.gg/inrecord"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-aurora hover:underline"
                >
                  → Join Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
