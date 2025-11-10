'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import MembershipCard, { TierBadge, TokenBalance } from '@/components/MembershipCard';
import {
  Member,
  MemberDashboardData,
  getTierBenefits,
  tokensToNextTier,
  formatWalletAddress,
  getAllTiers,
  generateMockMember,
} from '@/lib/auth/membership';

/**
 * Member Dashboard Page
 * Phase 6: Member Portal
 *
 * Features:
 * - Personalized member card (NFT-style)
 * - Token balance and tier status
 * - Voting history
 * - Proposal submissions
 * - Activity feed
 * - Tier progression tracker
 * - Leaderboard rankings
 */
export default function DashboardPage() {
  const [member, setMember] = useState<Member | null>(null);
  const [dashboardData, setDashboardData] = useState<MemberDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'votes' | 'proposals' | 'activity'>('overview');
  const [isConnected, setIsConnected] = useState(false);

  // Simulate wallet connection (in production, use wagmi or similar)
  useEffect(() => {
    // For demo purposes, generate mock member data
    // In production, replace with actual wallet connection
    setTimeout(() => {
      const mockWallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb8';
      const mockMember = generateMockMember(mockWallet, 'gold');
      setMember(mockMember);
      setIsConnected(true);
      setLoading(false);

      // Mock dashboard data
      setDashboardData({
        member: mockMember,
        recent_votes: [
          {
            id: '1',
            proposal_id: 'prop-1',
            proposal_title: 'Fund "Midnight Sessions" Live Album',
            vote_type: 'for',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            proposal_id: 'prop-2',
            proposal_title: 'Partnership with SoundScape Festival',
            vote_type: 'for',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            proposal_id: 'prop-3',
            proposal_title: 'Launch Remix Bounty Program',
            vote_type: 'abstain',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        recent_proposals: [
          {
            id: 'prop-user-1',
            title: 'Studio Equipment Upgrade Proposal',
            status: 'approved',
            votes_for: 234,
            votes_against: 45,
            created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        recent_activity: [
          {
            activity_type: 'vote',
            activity_description: 'Voted on "Fund Midnight Sessions Live Album"',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            activity_type: 'login',
            activity_description: 'Logged into dashboard',
            created_at: new Date().toISOString(),
          },
        ],
        stats: {
          vote_participation_rate: 0.78,
          total_active_proposals: 8,
          member_rank_by_votes: 42,
        },
      });
    }, 1000);
  }, []);

  // Connect wallet handler
  const handleConnectWallet = () => {
    // In production, implement actual wallet connection
    alert('Wallet connection coming soon! This will integrate with MetaMask, WalletConnect, etc.');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-aurora border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Not connected state
  if (!isConnected || !member) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-midnight text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-playfair mb-6">Member Dashboard</h1>
          <p className="text-xl text-gray-300 mb-12">
            Connect your wallet to access your personalized DAO dashboard
          </p>

          <div className="bg-white/5 rounded-2xl border border-white/10 p-12 mb-12">
            <div className="w-20 h-20 bg-aurora/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-aurora"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-8">
              Connect your Ethereum wallet to view your membership status, voting history, and
              exclusive DAO features.
            </p>
            <button
              onClick={handleConnectWallet}
              className="px-8 py-4 bg-aurora text-black rounded-full hover:opacity-80 transition font-semibold text-lg"
            >
              Connect Wallet
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {getAllTiers().slice(0, 3).map((tier) => (
              <div
                key={tier.tier}
                className="bg-white/5 rounded-xl border border-white/10 p-6 text-left"
              >
                <div className={`bg-gradient-to-r ${tier.gradient} text-white px-3 py-1 rounded-full text-sm font-semibold inline-block mb-4`}>
                  {tier.name}
                </div>
                <div className="text-sm text-gray-400 mb-4">{tier.minTokens}+ tokens</div>
                <ul className="space-y-2">
                  {tier.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-300 flex items-start">
                      <span className="text-aurora mr-2">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const tierConfig = getTierBenefits(member.membership_tier);
  const progression = tokensToNextTier(member.token_balance);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-midnight to-black p-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-playfair mb-2">
                  Welcome back, {member.display_name || member.username || 'Member'}
                </h1>
                <p className="text-gray-400">
                  Manage your membership, vote on proposals, and track your DAO participation
                </p>
              </div>
              <div className="flex items-center gap-4">
                <TierBadge tier={member.membership_tier} />
                <Link
                  href="/dao"
                  className="px-6 py-3 bg-aurora text-black rounded-full hover:opacity-80 transition font-semibold"
                >
                  View Proposals
                </Link>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="text-sm text-gray-400 mb-2">Token Balance</div>
              <TokenBalance balance={member.token_balance} showLabel={false} />
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="text-sm text-gray-400 mb-2">Voting Power</div>
              <div className="text-3xl font-bold text-white">
                {Math.round((dashboardData?.stats.vote_participation_rate || 0) * 100)}%
              </div>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="text-sm text-gray-400 mb-2">Votes Cast</div>
              <div className="text-3xl font-bold text-gold">{member.total_votes_cast}</div>
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 p-6">
              <div className="text-sm text-gray-400 mb-2">DAO Rank</div>
              <div className="text-3xl font-bold text-green-400">
                #{dashboardData?.stats.member_rank_by_votes || 'N/A'}
              </div>
            </div>
          </div>

          {/* Tier Progression */}
          {progression.nextTier && (
            <div className="bg-gradient-to-r from-white/5 to-aurora/10 rounded-xl border border-aurora/20 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Next Tier Progress</div>
                  <div className="text-xl font-semibold">
                    {progression.tokensNeeded} more tokens to{' '}
                    {getTierBenefits(progression.nextTier).name}
                  </div>
                </div>
                <div className="text-3xl">{progression.tokensNeeded < 500 ? '🔥' : '⭐'}</div>
              </div>
              <div className="w-full bg-black/30 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-aurora to-blue-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${
                      ((member.token_balance - tierConfig.minTokens) /
                        (getTierBenefits(progression.nextTier).minTokens - tierConfig.minTokens)) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Dashboard Content */}
      <section className="p-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Membership Card */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-semibold mb-6">Your Membership Card</h2>
              <MembershipCard member={member} variant="nft" />

              {/* Quick Actions */}
              <div className="mt-6 space-y-3">
                <Link
                  href="/dao/propose"
                  className="block w-full py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:border-aurora/30 transition text-center"
                >
                  Create Proposal
                </Link>
                <Link
                  href="/dao/proposals"
                  className="block w-full py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:border-aurora/30 transition text-center"
                >
                  View Active Votes
                </Link>
                <Link
                  href="/settings"
                  className="block w-full py-3 px-4 bg-white/5 border border-white/10 rounded-lg hover:border-aurora/30 transition text-center"
                >
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Right Column - Activity Tabs */}
            <div className="lg:col-span-2">
              {/* Tab Navigation */}
              <div className="flex gap-2 mb-6 border-b border-white/10">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'votes', label: 'Voting History' },
                  { key: 'proposals', label: 'My Proposals' },
                  { key: 'activity', label: 'Activity' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-6 py-3 font-semibold transition ${
                      activeTab === tab.key
                        ? 'text-aurora border-b-2 border-aurora'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                      <h3 className="text-xl font-semibold mb-4">Tier Benefits</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {tierConfig.benefits.map((benefit, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm bg-white/5 rounded-lg p-3"
                          >
                            <span className="text-aurora mr-2">✓</span>
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl border border-white/10 p-6">
                      <h3 className="text-xl font-semibold mb-4">Participation Stats</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Vote Participation Rate</span>
                          <span className="text-xl font-bold text-aurora">
                            {Math.round((dashboardData?.stats.vote_participation_rate || 0) * 100)}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Votes Cast</span>
                          <span className="text-xl font-bold">{member.total_votes_cast}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Proposals Created</span>
                          <span className="text-xl font-bold">
                            {member.total_proposals_created}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Contributions</span>
                          <span className="text-xl font-bold text-green-400">
                            ${member.total_contributions_usd.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Voting History Tab */}
                {activeTab === 'votes' && (
                  <div className="space-y-4">
                    {dashboardData?.recent_votes.map((vote) => (
                      <div
                        key={vote.id}
                        className="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-aurora/30 transition"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <Link
                              href={`/dao/proposals/${vote.proposal_id}`}
                              className="text-lg font-semibold hover:text-aurora transition"
                            >
                              {vote.proposal_title}
                            </Link>
                            <div className="text-sm text-gray-400 mt-1">
                              {new Date(vote.created_at).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              vote.vote_type === 'for'
                                ? 'bg-green-500/20 text-green-400'
                                : vote.vote_type === 'against'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {vote.vote_type.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!dashboardData?.recent_votes.length && (
                      <div className="text-center py-12 text-gray-400">
                        <p>No voting history yet</p>
                        <Link href="/dao/proposals" className="text-aurora hover:underline mt-2 inline-block">
                          View active proposals
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* My Proposals Tab */}
                {activeTab === 'proposals' && (
                  <div className="space-y-4">
                    {dashboardData?.recent_proposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        className="bg-white/5 rounded-xl border border-white/10 p-6 hover:border-aurora/30 transition"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <Link
                              href={`/dao/proposals/${proposal.id}`}
                              className="text-lg font-semibold hover:text-aurora transition"
                            >
                              {proposal.title}
                            </Link>
                            <div className="text-sm text-gray-400 mt-1">
                              Created{' '}
                              {new Date(proposal.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                          <div
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              proposal.status === 'approved'
                                ? 'bg-green-500/20 text-green-400'
                                : proposal.status === 'active'
                                ? 'bg-aurora/20 text-aurora'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {proposal.status.toUpperCase()}
                          </div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <span className="text-gray-400">For:</span>{' '}
                            <span className="text-green-400 font-semibold">
                              {proposal.votes_for}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Against:</span>{' '}
                            <span className="text-red-400 font-semibold">
                              {proposal.votes_against}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!dashboardData?.recent_proposals.length && (
                      <div className="text-center py-12 text-gray-400">
                        <p>You haven't created any proposals yet</p>
                        <Link
                          href="/dao/propose"
                          className="text-aurora hover:underline mt-2 inline-block"
                        >
                          Create your first proposal
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="space-y-3">
                    {dashboardData?.recent_activity.map((activity, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-lg border border-white/10 p-4 flex items-start gap-4"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            activity.activity_type === 'vote'
                              ? 'bg-aurora/20 text-aurora'
                              : activity.activity_type === 'proposal_created'
                              ? 'bg-gold/20 text-gold'
                              : 'bg-white/10 text-gray-400'
                          }`}
                        >
                          {activity.activity_type === 'vote' ? '🗳️' : activity.activity_type === 'proposal_created' ? '📝' : '👤'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{activity.activity_description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(activity.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!dashboardData?.recent_activity.length && (
                      <div className="text-center py-12 text-gray-400">
                        No recent activity
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
