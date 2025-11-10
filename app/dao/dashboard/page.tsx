'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MembershipTier, getVoteWeight, getTierDisplayName } from '@/lib/schemas/dao';

interface MemberStats {
  walletAddress: string;
  membershipTier: MembershipTier;
  votesCast: number;
  proposalsCreated: number;
  totalFundingReceived: number;
  voteWeight: number;
  memberSince: Date;
  lastActive: Date;
}

interface DAOStats {
  totalMembers: number;
  activeMembers: number;
  totalProposals: number;
  activeProposals: number;
  approvedProposals: number;
  rejectedProposals: number;
  totalFundingRequested: number;
  totalFundingApproved: number;
  totalVotesCast: number;
  averageVoterParticipation: number;
}

export default function DashboardPage() {
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null);
  const [daoStats, setDaoStats] = useState<DAOStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock wallet - replace with actual wallet integration
  const [walletAddress] = useState<string | null>('mock_wallet_address');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch DAO stats
        const daoResponse = await fetch('/api/dao/stats');
        if (daoResponse.ok) {
          const daoData = await daoResponse.json();
          setDaoStats(daoData.stats);
        }

        // Fetch member stats if wallet is connected
        if (walletAddress) {
          const memberResponse = await fetch(`/api/dao/stats?walletAddress=${walletAddress}`);
          if (memberResponse.ok) {
            const memberData = await memberResponse.json();
            setMemberStats(memberData.stats);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [walletAddress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <svg
            className="w-16 h-16 text-yellow-500 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">
            Connect your wallet to view your DAO dashboard and participate in governance.
          </p>
          <button
            onClick={() => {
              alert('Wallet connection coming soon!');
            }}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const tierColors: Record<MembershipTier, string> = {
    Bronze: 'from-orange-600 to-orange-400',
    Silver: 'from-gray-400 to-gray-300',
    Gold: 'from-yellow-500 to-yellow-300',
    Platinum: 'from-purple-600 to-pink-500',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">DAO Dashboard</h1>
          <p className="text-xl text-purple-100">Your participation in the community</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Member Profile Card */}
        {memberStats && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${
                    tierColors[memberStats.membershipTier]
                  } rounded-full flex items-center justify-center text-white text-3xl font-bold`}
                >
                  {memberStats.walletAddress[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {memberStats.walletAddress.slice(0, 16)}...
                  </h2>
                  <p className="text-gray-600">
                    {getTierDisplayName(memberStats.membershipTier)} Member
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(memberStats.memberSince).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Membership Badge */}
            <div
              className={`bg-gradient-to-r ${
                tierColors[memberStats.membershipTier]
              } rounded-lg p-6 text-white mb-6`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-1">Membership Tier</p>
                  <p className="text-3xl font-bold">{memberStats.membershipTier}</p>
                  <p className="text-white/90">{getTierDisplayName(memberStats.membershipTier)}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/80 mb-1">Vote Weight</p>
                  <p className="text-5xl font-bold">{memberStats.voteWeight}x</p>
                </div>
              </div>
            </div>

            {/* Member Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Votes Cast</p>
                <p className="text-4xl font-bold text-blue-600">{memberStats.votesCast}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Proposals Created</p>
                <p className="text-4xl font-bold text-purple-600">
                  {memberStats.proposalsCreated}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Funding Received</p>
                <p className="text-4xl font-bold text-green-600">
                  ${memberStats.totalFundingReceived.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-1">Last Active</p>
                <p className="text-lg font-semibold text-gray-700">
                  {new Date(memberStats.lastActive).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/dao/propose"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create Proposal</h3>
                <p className="text-sm text-gray-600">Submit a new proposal</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dao/proposals"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Vote on Proposals</h3>
                <p className="text-sm text-gray-600">Cast your votes</p>
              </div>
            </div>
          </Link>

          <Link
            href="/studio/book"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Book Studio</h3>
                <p className="text-sm text-gray-600">Request DAO funding</p>
              </div>
            </div>
          </Link>
        </div>

        {/* DAO Overview */}
        {daoStats && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">DAO Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm mb-1">Total Members</p>
                <p className="text-4xl font-bold text-gray-900">{daoStats.totalMembers}</p>
                <p className="text-sm text-green-600 mt-2">
                  {daoStats.activeMembers} active
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm mb-1">Total Proposals</p>
                <p className="text-4xl font-bold text-gray-900">{daoStats.totalProposals}</p>
                <p className="text-sm text-blue-600 mt-2">
                  {daoStats.activeProposals} active
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm mb-1">Approved Proposals</p>
                <p className="text-4xl font-bold text-green-600">{daoStats.approvedProposals}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {daoStats.rejectedProposals} rejected
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-500 text-sm mb-1">Total Votes Cast</p>
                <p className="text-4xl font-bold text-purple-600">{daoStats.totalVotesCast}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {daoStats.averageVoterParticipation}% participation
                </p>
              </div>
            </div>

            {/* Funding Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-8 text-white">
                <p className="text-blue-100 mb-2">Total Funding Requested</p>
                <p className="text-5xl font-bold">
                  ${daoStats.totalFundingRequested.toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-8 text-white">
                <p className="text-green-100 mb-2">Total Funding Approved</p>
                <p className="text-5xl font-bold">
                  ${daoStats.totalFundingApproved.toLocaleString()}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
