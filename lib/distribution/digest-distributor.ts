import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import {
  Digest,
  DistributionChannel,
  DistributionStatus,
  Distribution,
} from '../schemas/digest';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Resend for email
const resend = new Resend(process.env.RESEND_API_KEY);

// Discord webhook URL
const DISCORD_WEBHOOK_URL = process.env.DISCORD_DIGEST_WEBHOOK_URL!;

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'digest@inrecord.xyz';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://inrecord.xyz';

// =====================================================
// Main Distribution Orchestrator
// =====================================================

/**
 * Distribute digest to all configured channels
 */
export async function distributeDigest(
  digestId: string,
  channels: DistributionChannel[] = ['discord', 'email']
): Promise<{
  success: boolean;
  results: Record<DistributionChannel, { success: boolean; error?: string }>;
}> {
  console.log(`Starting distribution for digest ${digestId} to channels:`, channels);

  const results: Record<string, { success: boolean; error?: string }> = {};

  try {
    // Fetch digest from database
    const digest = await getDigestById(digestId);

    if (!digest) {
      throw new Error(`Digest ${digestId} not found`);
    }

    // Distribute to each channel
    for (const channel of channels) {
      try {
        switch (channel) {
          case 'discord':
            await sendToDiscord(digest);
            results[channel] = { success: true };
            break;

          case 'email':
            await sendToEmail(digest);
            results[channel] = { success: true };
            break;

          case 'rss':
            await publishToRSS(digest);
            results[channel] = { success: true };
            break;

          case 'twitter':
            // Twitter integration would go here
            console.log('Twitter distribution not yet implemented');
            results[channel] = { success: false, error: 'Not implemented' };
            break;

          default:
            results[channel] = { success: false, error: 'Unknown channel' };
        }

        // Track successful distribution
        await trackDistribution(digestId, channel, 'sent', undefined);
      } catch (error: any) {
        console.error(`Error distributing to ${channel}:`, error);
        results[channel] = { success: false, error: error.message };

        // Track failed distribution
        await trackDistribution(digestId, channel, 'failed', error.message);
      }
    }

    // Check if all channels succeeded
    const allSuccess = Object.values(results).every((r) => r.success);

    return {
      success: allSuccess,
      results: results as any,
    };
  } catch (error) {
    console.error('Error in distributeDigest:', error);
    throw error;
  }
}

// =====================================================
// Discord Distribution
// =====================================================

/**
 * Send digest to Discord via webhook
 */
export async function sendToDiscord(digest: Digest): Promise<void> {
  console.log('Sending digest to Discord...');

  try {
    const weekStart = new Date(digest.week_start).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const weekEnd = new Date(digest.week_end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    // Get sentiment color
    const color = getSentimentColor(digest.sentiment);

    // Truncate summary for Discord (max 4096 characters)
    const description = digest.summary_en.substring(0, 200) + '...';

    // Build Discord embed
    const embed = {
      title: `📊 Weekly DAO Digest - Week of ${weekStart} - ${weekEnd}`,
      description,
      color,
      fields: [
        {
          name: '💰 Treasury',
          value: `$${digest.key_metrics.treasury.net_change >= 0 ? '+' : ''}${digest.key_metrics.treasury.net_change.toLocaleString()}`,
          inline: true,
        },
        {
          name: '📋 Proposals',
          value: `${digest.key_metrics.proposals.new} new, ${digest.key_metrics.proposals.funded} funded`,
          inline: true,
        },
        {
          name: '🗳️ Votes Cast',
          value: digest.key_metrics.voting.votes_cast.toString(),
          inline: true,
        },
        {
          name: '😊 Sentiment',
          value: capitalize(digest.sentiment || 'stable'),
          inline: true,
        },
        {
          name: '👥 Participation',
          value: `${(digest.key_metrics.voting.participation_rate * 100).toFixed(1)}%`,
          inline: true,
        },
        {
          name: '🆕 New Members',
          value: digest.key_metrics.members.new_members.toString(),
          inline: true,
        },
      ],
      footer: {
        text: 'Read full digest and listen to audio narration →',
      },
      url: `${BASE_URL}/digests/week-${digest.week_start}`,
      timestamp: new Date().toISOString(),
    };

    // Add audio link if available
    const components = [];
    if (digest.audio_url_en) {
      components.push({
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: '🎧 Listen to Audio',
            url: digest.audio_url_en,
          },
          {
            type: 2,
            style: 5,
            label: '📖 Read Full Digest',
            url: `${BASE_URL}/digests/week-${digest.week_start}`,
          },
        ],
      });
    }

    // Send to Discord
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'inRECORD Digest Bot',
        avatar_url: `${BASE_URL}/logo.png`,
        embeds: [embed],
        components: components.length > 0 ? components : undefined,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Discord webhook failed: ${response.status} - ${errorText}`);
    }

    // Update digest
    await supabase.from('ai_digests').update({ discord_sent: true }).eq('id', digest.id);

    console.log('Digest sent to Discord successfully');
  } catch (error) {
    console.error('Error sending to Discord:', error);
    throw error;
  }
}

// =====================================================
// Email Distribution
// =====================================================

/**
 * Send digest via email newsletter
 */
export async function sendToEmail(digest: Digest): Promise<void> {
  console.log('Sending digest via email...');

  try {
    // Get subscriber list
    const subscribers = await getEmailSubscribers();

    if (subscribers.length === 0) {
      console.log('No email subscribers found');
      return;
    }

    // Format email content
    const emailHtml = formatEmailContent(digest);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: subscribers.map((s) => s.email),
      subject: `📊 Weekly DAO Digest - Week of ${formatDate(digest.week_start)}`,
      html: emailHtml,
      tags: [
        {
          name: 'digest',
          value: digest.id,
        },
        {
          name: 'week',
          value: digest.week_start.toString(),
        },
      ],
    });

    if (error) {
      throw new Error(`Resend error: ${error.message}`);
    }

    // Update digest
    await supabase.from('ai_digests').update({ email_sent: true }).eq('id', digest.id);

    console.log('Digest sent via email successfully to', subscribers.length, 'recipients');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Get email subscribers from database
 */
async function getEmailSubscribers(): Promise<Array<{ email: string; name?: string }>> {
  try {
    // This assumes you have a subscribers table
    // If not, this will return an empty array
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('email, name')
      .eq('active', true);

    if (error) {
      console.log('No subscribers table or error fetching:', error.message);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
}

/**
 * Format digest content for email
 */
function formatEmailContent(digest: Digest): string {
  const weekStart = formatDate(digest.week_start);
  const weekEnd = formatDate(digest.week_end);

  // Convert markdown to HTML (basic conversion)
  const htmlContent = markdownToHtml(digest.summary_en);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly DAO Digest</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin-bottom: 10px;
    }
    h1 {
      color: #0099FF;
      font-size: 24px;
      margin: 10px 0;
    }
    .date-range {
      color: #666;
      font-size: 14px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    .metric {
      text-align: center;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #0099FF;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .content {
      margin: 20px 0;
    }
    .sentiment-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }
    .sentiment-optimistic {
      background-color: #d4edda;
      color: #155724;
    }
    .sentiment-stable {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    .sentiment-critical {
      background-color: #f8d7da;
      color: #721c24;
    }
    .sentiment-mixed {
      background-color: #fff3cd;
      color: #856404;
    }
    .cta {
      text-align: center;
      margin: 30px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #0099FF;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 5px;
    }
    .button:hover {
      background-color: #0077CC;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Weekly DAO Digest</h1>
      <div class="date-range">${weekStart} - ${weekEnd}</div>
      <div style="margin-top: 10px;">
        <span class="sentiment-badge sentiment-${digest.sentiment || 'stable'}">
          ${capitalize(digest.sentiment || 'stable')}
        </span>
      </div>
    </div>

    <div class="metrics">
      <div class="metric">
        <div class="metric-value">${digest.key_metrics.proposals.new}</div>
        <div class="metric-label">New Proposals</div>
      </div>
      <div class="metric">
        <div class="metric-value">${digest.key_metrics.voting.votes_cast}</div>
        <div class="metric-label">Votes Cast</div>
      </div>
      <div class="metric">
        <div class="metric-value">${(digest.key_metrics.voting.participation_rate * 100).toFixed(1)}%</div>
        <div class="metric-label">Participation</div>
      </div>
      <div class="metric">
        <div class="metric-value">$${digest.key_metrics.treasury.net_change >= 0 ? '+' : ''}${digest.key_metrics.treasury.net_change.toLocaleString()}</div>
        <div class="metric-label">Treasury Change</div>
      </div>
    </div>

    <div class="content">
      ${htmlContent}
    </div>

    <div class="cta">
      <a href="${BASE_URL}/digests/week-${digest.week_start}" class="button">📖 Read Full Digest</a>
      ${digest.audio_url_en ? `<a href="${digest.audio_url_en}" class="button">🎧 Listen to Audio</a>` : ''}
    </div>

    <div class="footer">
      <p>You're receiving this because you subscribed to inRECORD weekly digests.</p>
      <p><a href="${BASE_URL}/unsubscribe">Unsubscribe</a> | <a href="${BASE_URL}/digests">View Archive</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

// =====================================================
// RSS Distribution
// =====================================================

/**
 * Publish digest to RSS feed
 */
export async function publishToRSS(digest: Digest): Promise<void> {
  console.log('Publishing digest to RSS feed...');

  try {
    // The RSS feed is generated dynamically via API route
    // This function just marks that the digest should be included
    // The actual RSS generation happens in app/api/rss/digests/route.ts

    console.log('Digest will be included in RSS feed');
  } catch (error) {
    console.error('Error publishing to RSS:', error);
    throw error;
  }
}

// =====================================================
// Distribution Tracking
// =====================================================

/**
 * Track distribution attempt in database
 */
export async function trackDistribution(
  digestId: string,
  channel: DistributionChannel,
  status: DistributionStatus,
  errorMessage?: string,
  recipientCount?: number
): Promise<void> {
  try {
    const distribution = {
      digest_id: digestId,
      channel,
      status,
      error_message: errorMessage || null,
      recipient_count: recipientCount || 0,
      sent_at: status === 'sent' ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from('digest_distributions')
      .upsert(distribution, {
        onConflict: 'digest_id,channel',
      });

    if (error) {
      console.error('Error tracking distribution:', error);
    }
  } catch (error) {
    console.error('Error in trackDistribution:', error);
  }
}

/**
 * Get distribution status for a digest
 */
export async function getDistributionStatus(digestId: string): Promise<Distribution[]> {
  try {
    const { data, error } = await supabase
      .from('digest_distributions')
      .select('*')
      .eq('digest_id', digestId);

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting distribution status:', error);
    return [];
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Get digest by ID
 */
async function getDigestById(digestId: string): Promise<Digest | null> {
  try {
    const { data, error } = await supabase
      .from('ai_digests')
      .select('*')
      .eq('id', digestId)
      .single();

    if (error) {
      throw error;
    }

    return data as Digest;
  } catch (error) {
    console.error('Error fetching digest:', error);
    return null;
  }
}

/**
 * Get sentiment color for Discord embeds
 */
function getSentimentColor(sentiment: string | null): number {
  switch (sentiment) {
    case 'optimistic':
      return 0x00ff00; // Green
    case 'stable':
      return 0x0099ff; // Blue (aurora)
    case 'critical':
      return 0xff0000; // Red
    case 'mixed':
      return 0xffaa00; // Orange
    default:
      return 0x0099ff; // Default blue
  }
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format date for display
 */
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Basic markdown to HTML conversion
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p>');
  html = `<p>${html}</p>`;

  return html;
}
