'use client';

import React from 'react';
import {
  Member,
  MembershipTier,
  getTierBenefits,
  formatWalletAddress,
  formatTokenBalance,
} from '@/lib/auth/membership';

interface MembershipCardProps {
  member: Member;
  variant?: 'default' | 'compact' | 'nft';
  showDetails?: boolean;
}

/**
 * NFT-style membership card component
 * Displays member information in a visually appealing card format
 */
export default function MembershipCard({
  member,
  variant = 'default',
  showDetails = true,
}: MembershipCardProps) {
  const tierConfig = getTierBenefits(member.membership_tier);

  // Compact variant - small card for lists
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-aurora/30 transition">
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${tierConfig.gradient} flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-xl font-bold text-white">
            {member.display_name?.[0] || member.username?.[0] || '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold truncate">
            {member.display_name || member.username || 'Anonymous'}
          </div>
          <div className="text-sm text-gray-400">
            {tierConfig.name} • {formatTokenBalance(member.token_balance)} tokens
          </div>
        </div>
        {member.card_number && (
          <div className="text-xs font-mono text-gray-500">
            {member.card_number}
          </div>
        )}
      </div>
    );
  }

  // NFT variant - stylized digital card
  if (variant === 'nft') {
    return (
      <div className="relative w-full max-w-md mx-auto">
        {/* Card container with 3D effect */}
        <div
          className="relative rounded-2xl overflow-hidden border-2 shadow-2xl transform transition-all duration-300 hover:scale-105 hover:rotate-1"
          style={{
            borderColor: tierConfig.color,
            boxShadow: `0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px ${tierConfig.color}40`,
          }}
        >
          {/* Background gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${tierConfig.gradient} opacity-90`}
          />

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, white 1px, transparent 1px),
                linear-gradient(to bottom, white 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px',
            }}
          />

          {/* Content */}
          <div className="relative p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-sm font-semibold text-white/80 mb-1">
                  inRECORD DAO
                </div>
                <div className="text-2xl font-bold text-white">
                  {tierConfig.name} Member
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/40">
                <span className="text-3xl font-bold text-white">
                  {member.display_name?.[0] || member.username?.[0] || '?'}
                </span>
              </div>
            </div>

            {/* Member info */}
            <div className="space-y-3 mb-8">
              <div>
                <div className="text-xs text-white/60 mb-1">Member Name</div>
                <div className="text-xl font-semibold text-white truncate">
                  {member.display_name || member.username || 'Anonymous Member'}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/60 mb-1">Wallet Address</div>
                <div className="text-sm font-mono text-white/90">
                  {formatWalletAddress(member.wallet_address)}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {formatTokenBalance(member.token_balance)}
                </div>
                <div className="text-xs text-white/70">Tokens</div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {member.total_votes_cast}
                </div>
                <div className="text-xs text-white/70">Votes</div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-white">
                  {member.total_proposals_created}
                </div>
                <div className="text-xs text-white/70">Proposals</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xs text-white/60 mb-1">Card Number</div>
                <div className="text-sm font-mono text-white">
                  {member.card_number || 'Pending'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/60 mb-1">Member Since</div>
                <div className="text-sm text-white">
                  {new Date(member.joined_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Holographic shine effect */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%)',
              backgroundSize: '200% 200%',
              animation: 'shine 3s infinite',
            }}
          />
        </div>

        {/* Add shine animation */}
        <style jsx>{`
          @keyframes shine {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  // Default variant - detailed card
  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-black to-midnight">
        {/* Header with tier gradient */}
        <div
          className={`bg-gradient-to-r ${tierConfig.gradient} p-6 relative overflow-hidden`}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          />
          <div className="relative flex justify-between items-start">
            <div>
              <div className="text-sm font-semibold text-white/80 mb-1">
                inRECORD DAO Member
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {member.display_name || member.username || 'Anonymous'}
              </div>
              <div className="text-white/90 font-mono text-sm">
                {formatWalletAddress(member.wallet_address)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white mb-1">
                {tierConfig.name}
              </div>
              <div className="text-sm text-white/80">Tier</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-aurora mb-1">
                {formatTokenBalance(member.token_balance)}
              </div>
              <div className="text-xs text-gray-400">$RECORD Tokens</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-gold mb-1">
                {member.total_votes_cast}
              </div>
              <div className="text-xs text-gray-400">Votes Cast</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-white mb-1">
                {member.total_proposals_created}
              </div>
              <div className="text-xs text-gray-400">Proposals</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
              <div className="text-2xl font-bold text-green-400 mb-1">
                ${member.total_contributions_usd.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400">Contributions</div>
            </div>
          </div>

          {showDetails && (
            <>
              {/* Membership Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-400 mb-2">Card Number</div>
                  <div className="text-lg font-mono text-white">
                    {member.card_number || 'Card not issued yet'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Member Since</div>
                  <div className="text-lg text-white">
                    {new Date(member.joined_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Last Activity</div>
                  <div className="text-lg text-white">
                    {new Date(member.last_activity_at).toLocaleDateString(
                      'en-US',
                      {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400 mb-2">Preferred Language</div>
                  <div className="text-lg text-white uppercase">
                    {member.preferred_language}
                  </div>
                </div>
              </div>

              {/* Tier Benefits */}
              <div>
                <div className="text-sm text-gray-400 mb-3">
                  {tierConfig.name} Tier Benefits
                </div>
                <div className="grid md:grid-cols-2 gap-2">
                  {tierConfig.benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-300"
                    >
                      <span className="text-aurora mr-2">✓</span>
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Tier badge component - small indicator for tier level
 */
export function TierBadge({ tier }: { tier: MembershipTier }) {
  const tierConfig = getTierBenefits(tier);

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${tierConfig.gradient} text-white text-sm font-semibold`}
    >
      <span>{tierConfig.name}</span>
    </div>
  );
}

/**
 * Token balance display component
 */
export function TokenBalance({
  balance,
  showLabel = true,
}: {
  balance: number;
  showLabel?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-2xl font-bold text-aurora">
        {formatTokenBalance(balance)}
      </span>
      {showLabel && (
        <span className="text-sm text-gray-400">$RECORD tokens</span>
      )}
    </div>
  );
}
