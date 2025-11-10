'use client';

/**
 * inRECORD DAO Governance System - Proposals Listing Page
 * Phase 2: Browse and filter all DAO proposals
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { DAOProposal, ProposalStatus, ProposalType } from '../../../lib/types/dao';
import {
  formatProposalStatus,
  formatProposalType,
  getTimeRemaining
} from '../../../lib/types/dao';
import { getProposals, getAllVoteSummaries } from '../../../lib/supabase/dao';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<DAOProposal[]>([]);
  const [voteSummaries, setVoteSummaries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<ProposalType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch proposals
  useEffect(() => {
    async function fetchProposals() {
      setIsLoading(true);
      setError(null);

      try {
        const filters: any = {};
        if (statusFilter !== 'all') filters.status = statusFilter;
        if (typeFilter !== 'all') filters.type = typeFilter;

        const { data: proposalsData, error: proposalsError } = await getProposals(filters);
        const { data: summariesData, error: summariesError } = await getAllVoteSummaries();

        if (proposalsError) throw proposalsError;
        if (summariesError) throw summariesError;

        setProposals(proposalsData || []);
        setVoteSummaries(summariesData || []);
      } catch (err: any) {
        console.error('Error fetching proposals:', err);
        setError(err.message || 'Failed to load proposals');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProposals();
  }, [statusFilter, typeFilter]);

  // Filter proposals by search query
  const filteredProposals = proposals.filter(proposal => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      proposal.title.toLowerCase().includes(query) ||
      proposal.description?.toLowerCase().includes(query) ||
      proposal.created_by?.toLowerCase().includes(query)
    );
  });

  // Get vote summary for a proposal
  const getVoteSummary = (proposalId: string) => {
    return voteSummaries.find(s => s.id === proposalId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-midnight to-black text-white">
      <div className="max-w-7xl mx-auto p-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dao"
            className="text-aurora hover:underline mb-4 inline-block"
          >
            ← Back to DAO
          </Link>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-5xl font-playfair mb-4">All Proposals</h1>
              <p className="text-gray-300 text-lg">
                Browse and vote on active DAO proposals. Your voice matters.
              </p>
            </div>
            <Link
              href="/dao/propose"
              className="px-6 py-3 bg-aurora text-black rounded-lg hover:opacity-80 transition font-bold whitespace-nowrap"
            >
              Create Proposal
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div>
            <input
              type="text"
              placeholder="Search proposals by title, description, or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-aurora transition"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <span className="text-sm text-gray-400 self-center">Status:</span>
              {['all', 'active', 'passed', 'rejected', 'executed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    statusFilter === status
                      ? 'bg-aurora text-black'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <span className="text-sm text-gray-400 self-center">Type:</span>
              {['all', 'funding', 'governance', 'partnership', 'creative', 'technical'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    typeFilter === type
                      ? 'bg-aurora text-black'
                      : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-aurora"></div>
            <p className="text-gray-400 mt-4">Loading proposals...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Proposals List */}
        {!isLoading && !error && (
          <>
            {filteredProposals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg mb-4">No proposals found</p>
                <Link
                  href="/dao/propose"
                  className="inline-block px-6 py-3 bg-aurora text-black rounded-lg hover:opacity-80 transition font-bold"
                >
                  Create the First Proposal
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-400">
                  Showing {filteredProposals.length} proposal{filteredProposals.length !== 1 ? 's' : ''}
                </div>

                <div className="space-y-6">
                  {filteredProposals.map((proposal) => {
                    const statusInfo = formatProposalStatus(proposal.status);
                    const typeInfo = formatProposalType(proposal.proposal_type);
                    const summary = getVoteSummary(proposal.id);
                    const totalVotes = summary?.total_votes || 0;
                    const votesFor = summary?.votes_for || 0;
                    const votesAgainst = summary?.votes_against || 0;
                    const percentageFor = totalVotes > 0
                      ? Math.round((votesFor / totalVotes) * 100)
                      : 0;

                    return (
                      <Link
                        key={proposal.id}
                        href={`/dao/proposals/${proposal.id}`}
                        className="block rounded-2xl p-6 bg-black/60 border border-white/10 hover:border-aurora/30 transition group"
                      >
                        {/* Header */}
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
                            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-aurora transition">
                              {proposal.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              by {proposal.created_by || 'Anonymous'}
                            </p>
                          </div>
                          {proposal.voting_ends_at && (
                            <div className="text-right ml-4">
                              <div className="text-sm text-gray-400">Time Left</div>
                              <div className="text-lg font-semibold">
                                {getTimeRemaining(proposal.voting_ends_at)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-300 mb-4 line-clamp-2">
                          {proposal.description || 'No description provided'}
                        </p>

                        {/* Funding Goal */}
                        {proposal.funding_goal && (
                          <div className="mb-4 p-3 rounded-lg bg-white/5">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-400">Funding Goal</span>
                              <span className="text-aurora font-semibold">
                                ${proposal.funding_goal.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                              <div
                                className="bg-aurora h-1.5 rounded-full"
                                style={{
                                  width: `${Math.min((proposal.current_funding / proposal.funding_goal) * 100, 100)}%`
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Vote Summary */}
                        {totalVotes > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-green-400">
                                For: {votesFor} ({percentageFor}%)
                              </span>
                              <span className="text-red-400">
                                Against: {votesAgainst} ({100 - percentageFor}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-500 to-aurora h-2 rounded-full"
                                style={{ width: `${percentageFor}%` }}
                              />
                            </div>
                            <div className="text-xs text-gray-400">
                              {totalVotes} total votes from {summary?.unique_voters || 0} voters
                            </div>
                          </div>
                        )}

                        {/* No Votes Yet */}
                        {totalVotes === 0 && proposal.status === 'active' && (
                          <div className="text-sm text-gray-400 italic">
                            No votes yet. Be the first to vote!
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* Info Section */}
        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-xl font-semibold mb-4">About DAO Governance</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="text-aurora font-semibold mb-2">Weighted Voting</h4>
              <p>
                Your voting power is based on your token holdings. Higher tiers get more weight (1x-5x).
              </p>
            </div>
            <div>
              <h4 className="text-aurora font-semibold mb-2">Proposal Types</h4>
              <p>
                Submit funding requests, governance changes, partnerships, creative initiatives, or technical upgrades.
              </p>
            </div>
            <div>
              <h4 className="text-aurora font-semibold mb-2">Voting Process</h4>
              <p>
                Proposals require simple majority (51%+) to pass. Results are final when voting period ends.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
