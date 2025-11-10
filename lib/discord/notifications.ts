/**
 * Discord Webhook Integration for DAO Notifications
 * Sends notifications to Discord channels for DAO activity
 */

import { DAOProposal, ProposalWithStats } from '../supabase/dao';
import { formatFunding } from '../schemas/dao';

// =============================================
// CONFIGURATION
// =============================================

const DISCORD_WEBHOOK_URL = process.env.DISCORD_DAO_WEBHOOK_URL;

interface DiscordEmbed {
  title: string;
  description?: string;
  color: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
  };
  timestamp?: string;
  url?: string;
}

interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

// Discord color codes
const COLORS = {
  NEW_PROPOSAL: 0x5865f2, // Blurple
  PROPOSAL_FUNDED: 0x57f287, // Green
  VOTING_MILESTONE: 0xfee75c, // Yellow
  PROPOSAL_APPROVED: 0x57f287, // Green
  PROPOSAL_REJECTED: 0xed4245, // Red
  VOTING_ENDING_SOON: 0xeb459e, // Pink
};

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Send a message to Discord webhook
 */
async function sendDiscordWebhook(message: DiscordMessage): Promise<void> {
  if (!DISCORD_WEBHOOK_URL) {
    console.warn('Discord webhook URL not configured. Skipping notification.');
    return;
  }

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...message,
        username: message.username || 'inRECORDS DAO',
        avatar_url:
          message.avatar_url ||
          'https://cdn.discordapp.com/icons/123456789/icon.png', // Replace with actual logo
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Discord webhook error:', response.status, errorText);
    }
  } catch (error) {
    console.error('Failed to send Discord notification:', error);
  }
}

/**
 * Get proposal URL (update with your actual domain)
 */
function getProposalUrl(proposalId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inrecords.io';
  return `${baseUrl}/dao/proposals/${proposalId}`;
}

/**
 * Truncate text to specified length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// =============================================
// NOTIFICATION FUNCTIONS
// =============================================

/**
 * Notify when a new proposal is submitted
 */
export async function notifyNewProposal(proposal: DAOProposal): Promise<void> {
  const votingEndDate = new Date(proposal.voting_ends_at);
  const daysUntilEnd = Math.ceil(
    (votingEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const embed: DiscordEmbed = {
    title: `New Proposal: ${truncate(proposal.title, 100)}`,
    description: truncate(proposal.description, 300),
    color: COLORS.NEW_PROPOSAL,
    fields: [
      {
        name: 'Type',
        value: proposal.proposal_type,
        inline: true,
      },
      {
        name: 'Funding Goal',
        value: proposal.funding_goal
          ? formatFunding(proposal.funding_goal, proposal.funding_currency as any)
          : 'N/A',
        inline: true,
      },
      {
        name: 'Voting Period',
        value: `${daysUntilEnd} days`,
        inline: true,
      },
    ],
    footer: {
      text: 'Vote now to have your voice heard!',
    },
    timestamp: new Date().toISOString(),
    url: getProposalUrl(proposal.id),
  };

  if (proposal.tags && proposal.tags.length > 0) {
    embed.fields?.push({
      name: 'Tags',
      value: proposal.tags.join(', '),
      inline: false,
    });
  }

  await sendDiscordWebhook({
    content: '@everyone A new proposal needs your vote!',
    embeds: [embed],
  });
}

/**
 * Notify when a proposal is fully funded
 */
export async function notifyProposalFunded(proposal: DAOProposal): Promise<void> {
  const embed: DiscordEmbed = {
    title: `Proposal Funded: ${truncate(proposal.title, 100)}`,
    description: 'This proposal has reached its funding goal!',
    color: COLORS.PROPOSAL_FUNDED,
    fields: [
      {
        name: 'Funding Goal',
        value: formatFunding(proposal.funding_goal || 0, proposal.funding_currency as any),
        inline: true,
      },
      {
        name: 'Current Funding',
        value: formatFunding(proposal.current_funding, proposal.funding_currency as any),
        inline: true,
      },
      {
        name: 'Progress',
        value: '100%',
        inline: true,
      },
      {
        name: 'Total Votes',
        value: `${proposal.unique_voters} members`,
        inline: true,
      },
      {
        name: 'For/Against',
        value: `${proposal.votes_for}/${proposal.votes_against}`,
        inline: true,
      },
    ],
    footer: {
      text: 'Thank you to all community members who voted!',
    },
    timestamp: new Date().toISOString(),
    url: getProposalUrl(proposal.id),
  });

  await sendDiscordWebhook({
    content: 'Congratulations! A proposal has been successfully funded!',
    embeds: [embed],
  });
}

/**
 * Notify when a proposal is approved
 */
export async function notifyProposalApproved(proposal: DAOProposal): Promise<void> {
  const approvalPct =
    proposal.votes_for + proposal.votes_against > 0
      ? Math.round((proposal.votes_for / (proposal.votes_for + proposal.votes_against)) * 100)
      : 0;

  const embed: DiscordEmbed = {
    title: `Proposal Approved: ${truncate(proposal.title, 100)}`,
    description: 'The community has spoken! This proposal has been approved.',
    color: COLORS.PROPOSAL_APPROVED,
    fields: [
      {
        name: 'Approval Rate',
        value: `${approvalPct}%`,
        inline: true,
      },
      {
        name: 'Total Votes',
        value: `${proposal.unique_voters} members`,
        inline: true,
      },
      {
        name: 'For/Against',
        value: `${proposal.votes_for}/${proposal.votes_against}`,
        inline: true,
      },
    ],
    footer: {
      text: 'Implementation will begin shortly',
    },
    timestamp: new Date().toISOString(),
    url: getProposalUrl(proposal.id),
  };

  await sendDiscordWebhook({
    embeds: [embed],
  });
}

/**
 * Notify when a proposal is rejected
 */
export async function notifyProposalRejected(proposal: DAOProposal): Promise<void> {
  const embed: DiscordEmbed = {
    title: `Proposal Not Approved: ${truncate(proposal.title, 100)}`,
    description:
      proposal.voting_result === 'quorum_not_met'
        ? 'This proposal did not meet the required quorum.'
        : 'This proposal did not receive enough support to pass.',
    color: COLORS.PROPOSAL_REJECTED,
    fields: [
      {
        name: 'Total Votes',
        value: `${proposal.unique_voters} members`,
        inline: true,
      },
      {
        name: 'For/Against',
        value: `${proposal.votes_for}/${proposal.votes_against}`,
        inline: true,
      },
      {
        name: 'Result',
        value: proposal.voting_result || 'Failed',
        inline: true,
      },
    ],
    footer: {
      text: 'Thank you to everyone who participated',
    },
    timestamp: new Date().toISOString(),
    url: getProposalUrl(proposal.id),
  });

  await sendDiscordWebhook({
    embeds: [embed],
  });
}

/**
 * Notify when voting milestone is reached (50%, 75%, 100% participation)
 */
export async function notifyVotingMilestone(
  proposal: ProposalWithStats,
  milestone: 50 | 75 | 100,
  totalMembers: number
): Promise<void> {
  const participationRate = Math.round((proposal.unique_voters / totalMembers) * 100);

  const embed: DiscordEmbed = {
    title: `Voting Milestone: ${milestone}% Participation`,
    description: `"${truncate(proposal.title, 100)}" has reached ${milestone}% voter participation!`,
    color: COLORS.VOTING_MILESTONE,
    fields: [
      {
        name: 'Participation',
        value: `${proposal.unique_voters}/${totalMembers} members (${participationRate}%)`,
        inline: false,
      },
      {
        name: 'Current Results',
        value: `For: ${proposal.votes_for} | Against: ${proposal.votes_against} | Abstain: ${proposal.votes_abstain}`,
        inline: false,
      },
      {
        name: 'Time Remaining',
        value:
          proposal.hours_remaining > 24
            ? `${Math.ceil(proposal.hours_remaining / 24)} days`
            : `${Math.ceil(proposal.hours_remaining)} hours`,
        inline: true,
      },
    ],
    footer: {
      text: milestone === 100 ? 'Maximum participation achieved!' : 'Every vote counts!',
    },
    timestamp: new Date().toISOString(),
    url: getProposalUrl(proposal.id),
  });

  const content =
    milestone === 100
      ? 'Amazing! 100% voter participation reached!'
      : milestone === 75
      ? "We're almost there! 75% participation achieved."
      : 'Halfway there! 50% of members have voted.';

  await sendDiscordWebhook({
    content,
    embeds: [embed],
  });
}

/**
 * Notify when voting is ending soon (24 hours remaining)
 */
export async function notifyVotingEndingSoon(proposal: ProposalWithStats): Promise<void> {
  const hoursRemaining = Math.ceil(proposal.hours_remaining);

  const embed: DiscordEmbed = {
    title: `Voting Ends Soon: ${truncate(proposal.title, 100)}`,
    description: `Only ${hoursRemaining} hours left to vote on this proposal!`,
    color: COLORS.VOTING_ENDING_SOON,
    fields: [
      {
        name: 'Current Votes',
        value: `${proposal.unique_voters} members`,
        inline: true,
      },
      {
        name: 'For/Against',
        value: `${proposal.votes_for}/${proposal.votes_against}`,
        inline: true,
      },
      {
        name: 'Approval',
        value: `${proposal.approval_percentage.toFixed(1)}%`,
        inline: true,
      },
    ],
    footer: {
      text: "Don't miss your chance to vote!",
    },
    timestamp: new Date().toISOString(),
    url: getProposalUrl(proposal.id),
  });

  await sendDiscordWebhook({
    content: '@everyone Final call! Voting ends in less than 24 hours.',
    embeds: [embed],
  });
}

/**
 * Notify custom message (for testing or special announcements)
 */
export async function notifyCustom(
  title: string,
  description: string,
  fields?: Array<{ name: string; value: string; inline?: boolean }>
): Promise<void> {
  const embed: DiscordEmbed = {
    title,
    description,
    color: COLORS.NEW_PROPOSAL,
    fields,
    timestamp: new Date().toISOString(),
  };

  await sendDiscordWebhook({
    embeds: [embed],
  });
}

// =============================================
// BATCH NOTIFICATIONS
// =============================================

/**
 * Send daily digest of DAO activity
 */
export async function sendDailyDigest(stats: {
  newProposals: number;
  activeProposals: number;
  closedProposals: number;
  totalVotesCast: number;
  newMembers: number;
}): Promise<void> {
  const embed: DiscordEmbed = {
    title: 'Daily DAO Activity Digest',
    description: "Here's what happened in the DAO today:",
    color: COLORS.NEW_PROPOSAL,
    fields: [
      {
        name: 'New Proposals',
        value: stats.newProposals.toString(),
        inline: true,
      },
      {
        name: 'Active Proposals',
        value: stats.activeProposals.toString(),
        inline: true,
      },
      {
        name: 'Closed Today',
        value: stats.closedProposals.toString(),
        inline: true,
      },
      {
        name: 'Votes Cast',
        value: stats.totalVotesCast.toString(),
        inline: true,
      },
      {
        name: 'New Members',
        value: stats.newMembers.toString(),
        inline: true,
      },
    ],
    footer: {
      text: 'Stay active in the DAO!',
    },
    timestamp: new Date().toISOString(),
  };

  await sendDiscordWebhook({
    embeds: [embed],
  });
}

// =============================================
// ERROR HANDLING
// =============================================

/**
 * Notify about errors or issues (for admins)
 */
export async function notifyError(
  error: string,
  context?: Record<string, any>
): Promise<void> {
  const embed: DiscordEmbed = {
    title: 'DAO System Error',
    description: truncate(error, 500),
    color: COLORS.PROPOSAL_REJECTED,
    fields: context
      ? Object.entries(context).map(([key, value]) => ({
          name: key,
          value: String(value),
          inline: true,
        }))
      : undefined,
    timestamp: new Date().toISOString(),
  };

  await sendDiscordWebhook({
    content: '@admin',
    embeds: [embed],
  });
}
