import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import {
  WeeklyStats,
  Sentiment,
  OpenAISummarySchema,
  OpenAITranslationSchema,
  KeyMetrics,
  Digest,
} from '../schemas/digest';
import { calculateWeeklyStats, generateHighlights } from '../analytics/weekly-stats';

// Lazy initialization to avoid build-time errors
let openai: OpenAI;
let supabase: ReturnType<typeof createClient>;

function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'placeholder-key',
      organization: process.env.OPENAI_ORG_ID,
    });
  }
  return openai;
}

function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'placeholder-key';
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

// =====================================================
// System Prompts
// =====================================================

const DIGEST_SYSTEM_PROMPT = `You are a transparency reporter for inRECORD, a decentralized music label DAO.
Your job is to create a clear, engaging weekly summary of DAO activity for the community.

Style: Professional yet approachable, transparent, data-driven
Tone: Optimistic but realistic, community-focused
Length: 250-350 words
Format: Markdown with headers

Include:
- Overview of proposals (new, approved, funded)
- Voting participation metrics
- Treasury changes (deposits, spending)
- Notable events or milestones
- Community growth stats
- Call to action for next week

Be honest about challenges while celebrating wins. Use the provided statistics to tell a compelling story about the DAO's week.

IMPORTANT: Return ONLY the markdown summary. Do not include any JSON formatting or additional fields.`;

const SENTIMENT_SYSTEM_PROMPT = `You are a sentiment analyst for a DAO transparency system.
Analyze the provided weekly summary and classify the overall sentiment into ONE of these categories:

- "optimistic": Strong positive momentum, major wins, high community engagement
- "stable": Steady progress, normal operations, no major changes
- "critical": Significant challenges, low participation, concerning trends
- "mixed": Combination of positive and negative elements

Also extract 3-5 key highlights (brief bullet points) from the summary.

Return a JSON object with:
{
  "sentiment": "optimistic" | "stable" | "critical" | "mixed",
  "highlights": ["highlight 1", "highlight 2", "highlight 3"]
}`;

const TRANSLATION_SYSTEM_PROMPT = `You are a professional translator specializing in blockchain and DAO terminology.
Translate the provided text accurately while maintaining the tone, style, and technical accuracy.

Preserve:
- Markdown formatting
- Technical terms (DAO, proposal, treasury, etc.)
- Numbers and percentages
- URLs if present

Return a JSON object with:
{
  "translated_text": "the translated content"
}`;

// =====================================================
// Main Digest Generation
// =====================================================

/**
 * Generate a complete weekly digest with translations and audio
 */
export async function generateWeeklyDigest(
  weekStart: string,
  weekEnd: string
): Promise<Partial<Digest>> {
  console.log(`Starting digest generation for week ${weekStart} to ${weekEnd}`);

  try {
    // Step 1: Fetch weekly statistics
    console.log('Fetching weekly statistics...');
    const stats = await fetchWeeklyStats(weekStart, weekEnd);

    // Step 2: Generate English summary
    console.log('Generating English summary with GPT-4...');
    const englishResult = await generateEnglishSummary(stats);

    // Step 3: Analyze sentiment and extract highlights
    console.log('Analyzing sentiment...');
    const { sentiment, highlights } = await analyzeSentimentAndHighlights(
      englishResult.summary
    );

    // Step 4: Translate to French
    console.log('Translating to French...');
    const frenchSummary = await translateToFrench(englishResult.summary);

    // Step 5: Translate to Portuguese
    console.log('Translating to Portuguese...');
    const portugueseSummary = await translateToPortuguese(englishResult.summary);

    // Step 6: Extract key metrics from stats
    const keyMetrics: KeyMetrics = {
      proposals: stats.proposals,
      voting: stats.voting,
      treasury: stats.treasury,
      members: stats.members,
    };

    // Create digest object (audio URLs will be added later)
    const digest: Partial<Digest> = {
      week_start: weekStart,
      week_end: weekEnd,
      summary_en: englishResult.summary,
      summary_fr: frenchSummary,
      summary_pt: portugueseSummary,
      sentiment,
      key_metrics: keyMetrics,
      highlights,
      published: false,
      discord_sent: false,
      email_sent: false,
      generated_by: 'gpt-4',
    };

    console.log('Digest generation completed successfully');
    return digest;
  } catch (error) {
    console.error('Error generating weekly digest:', error);
    throw error;
  }
}

/**
 * Save digest to database
 */
export async function saveDigestToDatabase(digest: Partial<Digest>): Promise<string> {
  try {
    const { data, error } = await (getSupabase()
      .from('ai_digests') as any)
      .insert([digest])
      .select('id')
      .single();

    if (error) {
      console.error('Error saving digest to database:', error);
      throw new Error(`Failed to save digest: ${error.message}`);
    }

    console.log('Digest saved to database with ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('Error in saveDigestToDatabase:', error);
    throw error;
  }
}

/**
 * Update digest in database
 */
export async function updateDigestInDatabase(
  digestId: string,
  updates: Partial<Digest>
): Promise<void> {
  try {
    const { error } = await (getSupabase()
      .from('ai_digests') as any)
      .update(updates)
      .eq('id', digestId);

    if (error) {
      console.error('Error updating digest in database:', error);
      throw new Error(`Failed to update digest: ${error.message}`);
    }

    console.log('Digest updated successfully:', digestId);
  } catch (error) {
    console.error('Error in updateDigestInDatabase:', error);
    throw error;
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Fetch weekly statistics from database
 */
export async function fetchWeeklyStats(
  weekStart: string,
  weekEnd: string
): Promise<WeeklyStats> {
  try {
    const stats = await calculateWeeklyStats(weekStart, weekEnd);
    return stats;
  } catch (error) {
    console.error('Error fetching weekly stats:', error);
    throw error;
  }
}

/**
 * Generate English summary using GPT-4
 */
export async function generateEnglishSummary(
  stats: WeeklyStats,
  retries: number = 3
): Promise<{ summary: string }> {
  try {
    // Format stats for the prompt
    const statsText = `
Week: ${stats.week_start} to ${stats.week_end}

PROPOSALS:
- New proposals submitted: ${stats.proposals.new}
- Proposals approved: ${stats.proposals.approved}
- Proposals rejected: ${stats.proposals.rejected}
- Proposals funded: ${stats.proposals.funded}
- Total funding allocated: $${stats.proposals.total_funding}

VOTING:
- Total votes cast: ${stats.voting.votes_cast}
- Unique voters: ${stats.voting.unique_voters}
- Participation rate: ${(stats.voting.participation_rate * 100).toFixed(1)}%

TREASURY:
- Deposits: $${stats.treasury.deposits}
- Withdrawals: $${stats.treasury.withdrawals}
- Net change: ${stats.treasury.net_change >= 0 ? '+' : ''}$${stats.treasury.net_change}
${stats.treasury.ending_balance ? `- Ending balance: $${stats.treasury.ending_balance}` : ''}

COMMUNITY:
- New members: ${stats.members.new_members}
- Total members: ${stats.members.total_members}
- Active members: ${stats.members.active_members}
`;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: DIGEST_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Create a weekly digest for inRECORD DAO based on these statistics:\n\n${statsText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content || '';

    if (!summary || summary.length < 100) {
      throw new Error('Generated summary is too short or empty');
    }

    return { summary };
  } catch (error: any) {
    console.error('Error generating English summary:', error);

    if (retries > 0) {
      console.log(`Retrying... (${retries} attempts remaining)`);
      await sleep(1000); // Wait 1 second before retry
      return generateEnglishSummary(stats, retries - 1);
    }

    throw new Error(`Failed to generate English summary: ${error.message}`);
  }
}

/**
 * Analyze sentiment and extract highlights
 */
export async function analyzeSentimentAndHighlights(
  summary: string,
  retries: number = 3
): Promise<{ sentiment: Sentiment; highlights: string[] }> {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SENTIMENT_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this weekly digest and extract sentiment + highlights:\n\n${summary}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    // Validate with schema
    const validated = OpenAISummarySchema.parse({
      summary: summary, // We already have the summary, just need to validate the response
      sentiment: parsed.sentiment,
      highlights: parsed.highlights,
    });

    return {
      sentiment: validated.sentiment,
      highlights: validated.highlights,
    };
  } catch (error: any) {
    console.error('Error analyzing sentiment:', error);

    if (retries > 0) {
      console.log(`Retrying sentiment analysis... (${retries} attempts remaining)`);
      await sleep(1000);
      return analyzeSentimentAndHighlights(summary, retries - 1);
    }

    // Fallback to stable sentiment and empty highlights
    console.warn('Using fallback sentiment and highlights');
    return {
      sentiment: 'stable',
      highlights: ['Weekly digest generated', 'Community activity tracked', 'Governance ongoing'],
    };
  }
}

/**
 * Translate text to French
 */
export async function translateToFrench(
  text: string,
  retries: number = 3
): Promise<string> {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Translate this text to French (France):\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    // Validate with schema
    const validated = OpenAITranslationSchema.parse(parsed);

    return validated.translated_text;
  } catch (error: any) {
    console.error('Error translating to French:', error);

    if (retries > 0) {
      console.log(`Retrying French translation... (${retries} attempts remaining)`);
      await sleep(1000);
      return translateToFrench(text, retries - 1);
    }

    // Return original text as fallback
    console.warn('French translation failed, returning original text');
    return text;
  }
}

/**
 * Translate text to Portuguese
 */
export async function translateToPortuguese(
  text: string,
  retries: number = 3
): Promise<string> {
  try {
    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Translate this text to Portuguese (Brazilian):\n\n${text}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    // Validate with schema
    const validated = OpenAITranslationSchema.parse(parsed);

    return validated.translated_text;
  } catch (error: any) {
    console.error('Error translating to Portuguese:', error);

    if (retries > 0) {
      console.log(`Retrying Portuguese translation... (${retries} attempts remaining)`);
      await sleep(1000);
      return translateToPortuguese(text, retries - 1);
    }

    // Return original text as fallback
    console.warn('Portuguese translation failed, returning original text');
    return text;
  }
}

/**
 * Get existing digest for a week
 */
export async function getExistingDigest(weekStart: string): Promise<Digest | null> {
  try {
    const { data, error } = await (getSupabase()
      .from('ai_digests') as any)
      .select('*')
      .eq('week_start', weekStart)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      throw error;
    }

    return data as Digest;
  } catch (error) {
    console.error('Error getting existing digest:', error);
    return null;
  }
}

/**
 * Check if digest exists for a week
 */
export async function digestExists(weekStart: string): Promise<boolean> {
  const digest = await getExistingDigest(weekStart);
  return digest !== null;
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Estimate OpenAI cost for digest generation
 */
export function estimateOpenAICost(): {
  summaryGeneration: number;
  translations: number;
  sentimentAnalysis: number;
  total: number;
} {
  // GPT-4 pricing (approximate):
  // Input: $0.03 per 1K tokens
  // Output: $0.06 per 1K tokens

  const estimatedTokens = {
    summaryGeneration: { input: 500, output: 800 },
    frenchTranslation: { input: 1000, output: 1000 },
    portugueseTranslation: { input: 1000, output: 1000 },
    sentimentAnalysis: { input: 1000, output: 200 },
  };

  const inputCostPer1K = 0.03;
  const outputCostPer1K = 0.06;

  const costs = {
    summaryGeneration:
      (estimatedTokens.summaryGeneration.input / 1000) * inputCostPer1K +
      (estimatedTokens.summaryGeneration.output / 1000) * outputCostPer1K,
    translations:
      ((estimatedTokens.frenchTranslation.input +
        estimatedTokens.portugueseTranslation.input) /
        1000) *
        inputCostPer1K +
      ((estimatedTokens.frenchTranslation.output +
        estimatedTokens.portugueseTranslation.output) /
        1000) *
        outputCostPer1K,
    sentimentAnalysis:
      (estimatedTokens.sentimentAnalysis.input / 1000) * inputCostPer1K +
      (estimatedTokens.sentimentAnalysis.output / 1000) * outputCostPer1K,
    total: 0,
  };

  costs.total = costs.summaryGeneration + costs.translations + costs.sentimentAnalysis;

  return costs;
}

/**
 * Log OpenAI usage for monitoring
 */
export async function logOpenAIUsage(
  digestId: string,
  operation: string,
  tokensUsed: number
): Promise<void> {
  // This could be extended to save to a usage tracking table
  console.log(`OpenAI Usage - Digest: ${digestId}, Operation: ${operation}, Tokens: ${tokensUsed}`);
}
