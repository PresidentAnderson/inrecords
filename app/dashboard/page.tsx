'use client';

/**
 * Enhanced Member Dashboard Page
 * Phase 3: Treasury & Analytics Dashboard
 *
 * Integrated dashboard with DAO analytics, personal stats, and quick actions
 */

import React, { useState } from 'react';
import DAOAnalyticsWidget from '@/components/DAOAnalyticsWidget';
import DAOTransparencyWidget from '@/components/DAOTransparencyWidget';
import Link from 'next/link';

export default function DashboardPage() {
  const [memberStats] = useState({
    proposalsCreated: 0,
    votescast: 0,
    contributionsTotal: 0,
    membershipTier: 'bronze',
  });

  // Membership tier benefits
  const tierBenefits = {
    bronze: [
      'Access to DAO proposals',
      'Voting rights on all proposals',
      'Community forum access',
      'Monthly newsletter',
    ],
    silver: [
      'All Bronze benefits',
      'Priority proposal review',
      'Access to exclusive events',
      'Early feature access',
    ],
    gold: [
      'All Silver benefits',
      'Submit unlimited proposals',
      'Treasury fund allocation',
      'Governance committee membership',
    ],
    platinum: [
      'All Gold benefits',
      'Admin privileges',
      'Treasury management access',
      'Strategic planning input',
    ],
    diamond: [
      'All Platinum benefits',
      'Founding member status',
      'Lifetime membership',
      'Executive decision-making',
    ],
  };

  // Quick action cards
  const quickActions = [
    {
      title: 'Create Proposal',
      description: 'Submit a new proposal to the DAO',
      icon: '📝',
      href: '/dao/proposals/new',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Vote on Proposals',
      description: 'View and vote on active proposals',
      icon: '🗳️',
      href: '/dao/proposals',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Treasury',
      description: 'View treasury balance and analytics',
      icon: '💰',
      href: '/treasury',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Contribute',
      description: 'Support the DAO treasury',
      icon: '💎',
      href: '/dao/contribute',
      color: 'from-orange-500 to-amber-500',
    },
  ];

  // Get tier color
  const getTierColor = (tier: string): string => {
    const colors: Record<string, string> = {
      bronze: 'text-orange-700 bg-orange-100',
      silver: 'text-gray-700 bg-gray-100',
      gold: 'text-yellow-700 bg-yellow-100',
      platinum: 'text-purple-700 bg-purple-100',
      diamond: 'text-blue-700 bg-blue-100',
    };
    return colors[tier] || colors.bronze;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Member Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Your personalized hub for DAO activity and governance
          </p>
        </div>

        {/* Membership Card */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Membership Status</h2>
              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 rounded-full font-bold text-sm ${getTierColor(
                    memberStats.membershipTier
                  )}`}
                >
                  {memberStats.membershipTier.toUpperCase()}
                </span>
                <span className="text-sm opacity-90">Member since 2025</span>
              </div>
            </div>
            <div className="text-6xl">👤</div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
            <div>
              <p className="text-sm opacity-80">Proposals Created</p>
              <p className="text-3xl font-bold">{memberStats.proposalsCreated}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Votes Cast</p>
              <p className="text-3xl font-bold">{memberStats.votescast}</p>
            </div>
            <div>
              <p className="text-sm opacity-80">Contributions</p>
              <p className="text-3xl font-bold">
                {memberStats.contributionsTotal.toFixed(4)} ETH
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="block group"
              >
                <div
                  className={`bg-gradient-to-br ${action.color} rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-shadow`}
                >
                  <div className="text-4xl mb-3">{action.icon}</div>
                  <h3 className="text-lg font-bold mb-2">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* DAO Analytics */}
        <div className="mb-8">
          <DAOAnalyticsWidget refreshInterval={60000} />
        </div>

        {/* Transparency Widget */}
        <div className="mb-8">
          <DAOTransparencyWidget refreshInterval={60000} />
        </div>

        {/* Membership Tier Benefits */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Membership Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getTierColor(
                    memberStats.membershipTier
                  )}`}
                >
                  {memberStats.membershipTier.toUpperCase()}
                </span>
                Tier Benefits
              </h3>
              <ul className="space-y-2">
                {tierBenefits[memberStats.membershipTier as keyof typeof tierBenefits].map(
                  (benefit, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Upgrade Your Membership
              </h3>
              <p className="text-gray-600 mb-4">
                Unlock more benefits by upgrading your membership tier
              </p>
              <div className="space-y-2">
                {Object.keys(tierBenefits).map((tier) => {
                  const currentTierIndex = Object.keys(tierBenefits).indexOf(
                    memberStats.membershipTier
                  );
                  const tierIndex = Object.keys(tierBenefits).indexOf(tier);
                  const isCurrentTier = tier === memberStats.membershipTier;
                  const isLowerTier = tierIndex < currentTierIndex;

                  return (
                    <div
                      key={tier}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isCurrentTier
                          ? 'bg-purple-100 border-2 border-purple-400'
                          : isLowerTier
                          ? 'bg-gray-100 opacity-50'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <span className="font-medium capitalize">{tier}</span>
                      {isCurrentTier ? (
                        <span className="text-xs font-bold text-purple-700">CURRENT</span>
                      ) : isLowerTier ? (
                        <span className="text-xs text-gray-500">Completed</span>
                      ) : (
                        <button className="text-xs font-medium text-purple-600 hover:text-purple-700">
                          Upgrade
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
