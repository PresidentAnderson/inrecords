/**
 * inRECORD DAO Governance System - Discord Notifications
 * Phase 2: Discord webhook integration for DAO events
 */

import type { DAOProposal, DAOVote, ProposalVoteSummary } from '../types/dao';
import { formatProposalType, formatProposalStatus, getTimeRemaining } from '../types/dao';

// =====================================================
// Configuration
// =====================================================

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';

// Discord color codes
const COLORS = {
  SUCCESS: 0x00ff00,    // Green
  INFO: 0x00d4ff,       // Aurora blue
  WARNING: 0xffaa00,    // Orange
  ERROR: 0xff0000,      // Red
  VOTE_FOR: 0x00ff00,   // Green
  VOTE_AGAINST: 0xff0000, // Red
  VOTE_ABSTAIN: 0x808080  // Gray
};

// =====================================================
// Discord Embed Types
// =====================================================

interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
  thumbnail?: {
    url: string;
  };
  url?: string;
}

interface DiscordWebhookPayload {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

// =====================================================
// Core Discord Functions
// =====================================================

/**
 * Send a message to Discord via webhook
 */
async function sendDiscordMessage(payload: DiscordWebhookPayload): Promise<{ success: boolean; error?: any }> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('Discord webhook URL not configured');
    return { success: false, error: 'Webhook URL not configured' };
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook error:', errorText);
      return { success: false, error: errorText };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending Discord message:', error);
    return { success: false, error };
  }
}

// =====================================================
// Proposal Notifications
// =====================================================

/**
 * Notify when a new proposal is created
 */
export async function notifyProposalCreated(proposal: DAOProposal): Promise<{ success: boolean; error?: any }> {
  const typeInfo = formatProposalType(proposal.proposal_type);
  const timeRemaining = proposal.voting_ends_at ? getTimeRemaining(proposal.voting_ends_at) : 'No deadline';

  const embed: DiscordEmbed = {
    title: `🆕 New Proposal: ${proposal.title}`,
    description: proposal.description || 'No description provided',
    color: COLORS.INFO,
    fields: [
      {
        name: 'Type',
        value: `${typeInfo.icon} ${typeInfo.label}`,
        inline: true
      },
      {
        name: 'Proposed By',
        value: proposal.created_by || 'Anonymous',
        inline: true
      },
      {
        name: 'Time Remaining',
        value: timeRemaining,
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/dao/proposals/${proposal.id}`
  };

  // Add funding goal if applicable
  if (proposal.funding_goal) {
    embed.fields?.push({
      name: 'Funding Goal',
      value: `$${proposal.funding_goal.toLocaleString()}`,
      inline: true
    });
  }

  const payload: DiscordWebhookPayload = {
    content: '@here A new proposal has been submitted to the DAO!',
    embeds: [embed],
    username: 'inRECORD DAO',
    avatar_url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
  };

  return sendDiscordMessage(payload);
}

/**
 * Notify when a proposal passes
 */
export async function notifyProposalPassed(
  proposal: DAOProposal,
  voteSummary: ProposalVoteSummary
): Promise<{ success: boolean; error?: any }> {
  const typeInfo = formatProposalType(proposal.proposal_type);
  const totalVotes = voteSummary.total_votes;
  const percentageFor = totalVotes > 0
    ? Math.round((voteSummary.votes_for / totalVotes) * 100)
    : 0;

  const embed: DiscordEmbed = {
    title: `✅ Proposal Passed: ${proposal.title}`,
    description: proposal.description || 'No description provided',
    color: COLORS.SUCCESS,
    fields: [
      {
        name: 'Type',
        value: `${typeInfo.icon} ${typeInfo.label}`,
        inline: true
      },
      {
        name: 'Votes For',
        value: voteSummary.votes_for.toString(),
        inline: true
      },
      {
        name: 'Votes Against',
        value: voteSummary.votes_against.toString(),
        inline: true
      },
      {
        name: 'Total Votes',
        value: totalVotes.toString(),
        inline: true
      },
      {
        name: 'Approval Rate',
        value: `${percentageFor}%`,
        inline: true
      },
      {
        name: 'Unique Voters',
        value: voteSummary.unique_voters.toString(),
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/dao/proposals/${proposal.id}`
  };

  const payload: DiscordWebhookPayload = {
    content: '🎉 @everyone A proposal has passed! The community has spoken.',
    embeds: [embed],
    username: 'inRECORD DAO',
    avatar_url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
  };

  return sendDiscordMessage(payload);
}

/**
 * Notify when a proposal is rejected
 */
export async function notifyProposalRejected(
  proposal: DAOProposal,
  voteSummary: ProposalVoteSummary
): Promise<{ success: boolean; error?: any }> {
  const typeInfo = formatProposalType(proposal.proposal_type);
  const totalVotes = voteSummary.total_votes;
  const percentageAgainst = totalVotes > 0
    ? Math.round((voteSummary.votes_against / totalVotes) * 100)
    : 0;

  const embed: DiscordEmbed = {
    title: `❌ Proposal Rejected: ${proposal.title}`,
    description: proposal.description || 'No description provided',
    color: COLORS.ERROR,
    fields: [
      {
        name: 'Type',
        value: `${typeInfo.icon} ${typeInfo.label}`,
        inline: true
      },
      {
        name: 'Votes For',
        value: voteSummary.votes_for.toString(),
        inline: true
      },
      {
        name: 'Votes Against',
        value: voteSummary.votes_against.toString(),
        inline: true
      },
      {
        name: 'Total Votes',
        value: totalVotes.toString(),
        inline: true
      },
      {
        name: 'Rejection Rate',
        value: `${percentageAgainst}%`,
        inline: true
      },
      {
        name: 'Unique Voters',
        value: voteSummary.unique_voters.toString(),
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/dao/proposals/${proposal.id}`
  };

  const payload: DiscordWebhookPayload = {
    content: 'A proposal has been rejected by the community.',
    embeds: [embed],
    username: 'inRECORD DAO',
    avatar_url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
  };

  return sendDiscordMessage(payload);
}

/**
 * Notify when a proposal is about to expire (24h warning)
 */
export async function notifyProposalExpiring(proposal: DAOProposal): Promise<{ success: boolean; error?: any }> {
  const typeInfo = formatProposalType(proposal.proposal_type);
  const timeRemaining = proposal.voting_ends_at ? getTimeRemaining(proposal.voting_ends_at) : 'Unknown';

  const embed: DiscordEmbed = {
    title: `⏰ Voting Ends Soon: ${proposal.title}`,
    description: proposal.description || 'No description provided',
    color: COLORS.WARNING,
    fields: [
      {
        name: 'Type',
        value: `${typeInfo.icon} ${typeInfo.label}`,
        inline: true
      },
      {
        name: 'Time Remaining',
        value: timeRemaining,
        inline: true
      },
      {
        name: 'Proposed By',
        value: proposal.created_by || 'Anonymous',
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/dao/proposals/${proposal.id}`
  };

  const payload: DiscordWebhookPayload = {
    content: '@here ⏰ Last call for votes! This proposal expires in less than 24 hours.',
    embeds: [embed],
    username: 'inRECORD DAO',
    avatar_url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
  };

  return sendDiscordMessage(payload);
}

// =====================================================
// Vote Notifications
// =====================================================

/**
 * Notify when a significant vote milestone is reached
 * (e.g., 100 votes, 500 votes, 1000 votes)
 */
export async function notifyVoteMilestone(
  proposal: DAOProposal,
  milestone: number,
  voteSummary: ProposalVoteSummary
): Promise<{ success: boolean; error?: any }> {
  const typeInfo = formatProposalType(proposal.proposal_type);
  const totalVotes = voteSummary.total_votes;
  const percentageFor = totalVotes > 0
    ? Math.round((voteSummary.votes_for / totalVotes) * 100)
    : 0;

  const embed: DiscordEmbed = {
    title: `🎯 Milestone Reached: ${milestone} Votes!`,
    description: `**${proposal.title}** has reached ${milestone} total votes!`,
    color: COLORS.INFO,
    fields: [
      {
        name: 'Proposal',
        value: proposal.title,
        inline: false
      },
      {
        name: 'Type',
        value: `${typeInfo.icon} ${typeInfo.label}`,
        inline: true
      },
      {
        name: 'Total Votes',
        value: totalVotes.toString(),
        inline: true
      },
      {
        name: 'Approval Rate',
        value: `${percentageFor}%`,
        inline: true
      },
      {
        name: 'Votes For',
        value: voteSummary.votes_for.toString(),
        inline: true
      },
      {
        name: 'Votes Against',
        value: voteSummary.votes_against.toString(),
        inline: true
      },
      {
        name: 'Unique Voters',
        value: voteSummary.unique_voters.toString(),
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/dao/proposals/${proposal.id}`
  };

  const payload: DiscordWebhookPayload = {
    content: `🎯 **${milestone} votes reached!** The community is engaged!`,
    embeds: [embed],
    username: 'inRECORD DAO',
    avatar_url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
  };

  return sendDiscordMessage(payload);
}

// =====================================================
// Funding Notifications
// =====================================================

/**
 * Notify when a funding proposal reaches its goal
 */
export async function notifyFundingGoalReached(proposal: DAOProposal): Promise<{ success: boolean; error?: any }> {
  if (!proposal.funding_goal) {
    return { success: false, error: 'Proposal has no funding goal' };
  }

  const embed: DiscordEmbed = {
    title: `💰 Funding Goal Reached: ${proposal.title}`,
    description: proposal.description || 'No description provided',
    color: COLORS.SUCCESS,
    fields: [
      {
        name: 'Funding Goal',
        value: `$${proposal.funding_goal.toLocaleString()}`,
        inline: true
      },
      {
        name: 'Current Funding',
        value: `$${proposal.current_funding.toLocaleString()}`,
        inline: true
      },
      {
        name: 'Proposed By',
        value: proposal.created_by || 'Anonymous',
        inline: true
      }
    ],
    timestamp: new Date().toISOString(),
    url: `${process.env.NEXT_PUBLIC_APP_URL}/dao/proposals/${proposal.id}`
  };

  const payload: DiscordWebhookPayload = {
    content: '🎉 @everyone Funding goal reached! This proposal is now fully funded.',
    embeds: [embed],
    username: 'inRECORD DAO',
    avatar_url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
  };

  return sendDiscordMessage(payload);
}

// =====================================================
// Weekly Summary Notification
// =====================================================

/**
 * Send weekly DAO activity summary
 */
export async function notifyWeeklySummary(summary: {
  new_proposals: number;
  total_votes: number;
  proposals_passed: number;
  proposals_rejected: number;
  unique_voters: number;
  top_proposals: DAOProposal[];
}): Promise<{ success: boolean; error?: any }> {
  const embed: DiscordEmbed = {
    title: '📊 Weekly DAO Summary',
    description: 'Here\'s what happened in the inRECORD DAO this week:',
    color: COLORS.INFO,
    fields: [
      {
        name: 'New Proposals',
        value: summary.new_proposals.toString(),
        inline: true
      },
      {
        name: 'Total Votes Cast',
        value: summary.total_votes.toString(),
        inline: true
      },
      {
        name: 'Active Voters',
        value: summary.unique_voters.toString(),
        inline: true
      },
      {
        name: 'Proposals Passed',
        value: summary.proposals_passed.toString(),
        inline: true
      },
      {
        name: 'Proposals Rejected',
        value: summary.proposals_rejected.toString(),
        inline: true
      }
    ],
    timestamp: new Date().toISOString()
  };

  // Add top proposals
  if (summary.top_proposals.length > 0) {
    const topProposalsText = summary.top_proposals
      .slice(0, 3)
      .map((p, i) => `${i + 1}. ${p.title}`)
      .join('\n');

    embed.fields?.push({
      name: 'Top Proposals',
      value: topProposalsText,
      inline: false
    });
  }

  const payload: DiscordWebhookPayload = {
    content: '📊 Your weekly DAO activity summary is here!',
    embeds: [embed],
    username: 'inRECORD DAO',
    avatar_url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
  };

  return sendDiscordMessage(payload);
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Test Discord webhook connection
 */
export async function testDiscordWebhook(): Promise<{ success: boolean; error?: any }> {
  const payload: DiscordWebhookPayload = {
    content: '✅ Discord webhook test successful! inRECORD DAO notifications are working.',
    username: 'inRECORD DAO',
    avatar_url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
  };

  return sendDiscordMessage(payload);
}
