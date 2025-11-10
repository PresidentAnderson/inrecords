import { z } from 'zod';

// =====================================================
// Sentiment Schema
// =====================================================
export const SentimentSchema = z.enum(['optimistic', 'stable', 'critical', 'mixed']);
export type Sentiment = z.infer<typeof SentimentSchema>;

// =====================================================
// Key Metrics Schemas
// =====================================================
export const ProposalMetricsSchema = z.object({
  new: z.number().int().nonnegative(),
  approved: z.number().int().nonnegative(),
  rejected: z.number().int().nonnegative(),
  funded: z.number().int().nonnegative(),
  total_funding: z.number().nonnegative(),
});

export const VotingMetricsSchema = z.object({
  votes_cast: z.number().int().nonnegative(),
  unique_voters: z.number().int().nonnegative(),
  participation_rate: z.number().min(0).max(1),
  avg_votes_per_proposal: z.number().nonnegative().optional(),
});

export const TreasuryMetricsSchema = z.object({
  deposits: z.number().nonnegative(),
  withdrawals: z.number().nonnegative(),
  net_change: z.number(),
  ending_balance: z.number().nonnegative().optional(),
});

export const MemberMetricsSchema = z.object({
  new_members: z.number().int().nonnegative(),
  total_members: z.number().int().nonnegative(),
  active_members: z.number().int().nonnegative(),
});

export const KeyMetricsSchema = z.object({
  proposals: ProposalMetricsSchema,
  voting: VotingMetricsSchema,
  treasury: TreasuryMetricsSchema,
  members: MemberMetricsSchema,
});

export type KeyMetrics = z.infer<typeof KeyMetricsSchema>;

// =====================================================
// Weekly Stats Schema (from database)
// =====================================================
export const WeeklyStatsSchema = KeyMetricsSchema.extend({
  week_start: z.string().or(z.date()),
  week_end: z.string().or(z.date()),
});

export type WeeklyStats = z.infer<typeof WeeklyStatsSchema>;

// =====================================================
// AI Digest Schema (Database Model)
// =====================================================
export const DigestSchema = z.object({
  id: z.string().uuid(),
  week_start: z.string().or(z.date()),
  week_end: z.string().or(z.date()),

  // Content
  summary_en: z.string().min(100).max(5000),
  summary_fr: z.string().min(100).max(5000).nullable(),
  summary_pt: z.string().min(100).max(5000).nullable(),

  // Analysis
  sentiment: SentimentSchema.nullable(),

  // Metrics
  key_metrics: KeyMetricsSchema,
  highlights: z.array(z.string()).min(1).max(10),

  // Audio
  audio_url_en: z.string().url().nullable(),
  audio_url_fr: z.string().url().nullable(),
  audio_url_pt: z.string().url().nullable(),
  audio_duration_seconds: z.number().int().positive().nullable(),

  // Publication
  published: z.boolean(),
  published_at: z.string().or(z.date()).nullable(),

  // Distribution
  discord_sent: z.boolean(),
  email_sent: z.boolean(),

  // Metadata
  created_at: z.string().or(z.date()),
  updated_at: z.string().or(z.date()).optional(),
  generated_by: z.string().default('gpt-4'),
});

export type Digest = z.infer<typeof DigestSchema>;

// =====================================================
// Digest Creation Schema (for API input)
// =====================================================
export const CreateDigestSchema = z.object({
  week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  week_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  force_regenerate: z.boolean().optional().default(false),
});

export type CreateDigestInput = z.infer<typeof CreateDigestSchema>;

// =====================================================
// Digest Update Schema (for API input)
// =====================================================
export const UpdateDigestSchema = z.object({
  summary_en: z.string().min(100).max(5000).optional(),
  summary_fr: z.string().min(100).max(5000).optional(),
  summary_pt: z.string().min(100).max(5000).optional(),
  sentiment: SentimentSchema.optional(),
  highlights: z.array(z.string()).min(1).max(10).optional(),
  published: z.boolean().optional(),
});

export type UpdateDigestInput = z.infer<typeof UpdateDigestSchema>;

// =====================================================
// Distribution Channel Schema
// =====================================================
export const DistributionChannelSchema = z.enum(['discord', 'email', 'rss', 'twitter']);
export type DistributionChannel = z.infer<typeof DistributionChannelSchema>;

// =====================================================
// Distribution Status Schema
// =====================================================
export const DistributionStatusSchema = z.enum(['pending', 'sent', 'failed']);
export type DistributionStatus = z.infer<typeof DistributionStatusSchema>;

// =====================================================
// Distribution Schema (Database Model)
// =====================================================
export const DistributionSchema = z.object({
  id: z.string().uuid(),
  digest_id: z.string().uuid(),
  channel: DistributionChannelSchema,
  status: DistributionStatusSchema,
  recipient_count: z.number().int().nonnegative(),
  sent_at: z.string().or(z.date()).nullable(),
  created_at: z.string().or(z.date()),
  error_message: z.string().nullable(),
  retry_count: z.number().int().nonnegative().default(0),
});

export type Distribution = z.infer<typeof DistributionSchema>;

// =====================================================
// Language Schema
// =====================================================
export const LanguageSchema = z.enum(['en', 'fr', 'pt']);
export type Language = z.infer<typeof LanguageSchema>;

// =====================================================
// Digest Query Params Schema (for API queries)
// =====================================================
export const DigestQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional().default(10),
  offset: z.number().int().nonnegative().optional().default(0),
  sentiment: SentimentSchema.optional(),
  published: z.boolean().optional(),
  week_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type DigestQuery = z.infer<typeof DigestQuerySchema>;

// =====================================================
// OpenAI Response Schemas
// =====================================================
export const OpenAISummarySchema = z.object({
  summary: z.string().min(100).max(5000),
  sentiment: SentimentSchema,
  highlights: z.array(z.string()).min(3).max(5),
});

export type OpenAISummary = z.infer<typeof OpenAISummarySchema>;

export const OpenAITranslationSchema = z.object({
  translated_text: z.string().min(100).max(5000),
});

export type OpenAITranslation = z.infer<typeof OpenAITranslationSchema>;

// =====================================================
// Audio Generation Schema
// =====================================================
export const AudioGenerationSchema = z.object({
  text: z.string().min(100),
  language: LanguageSchema,
  voice_id: z.string().optional(),
});

export type AudioGenerationInput = z.infer<typeof AudioGenerationSchema>;

export const AudioResultSchema = z.object({
  url: z.string().url(),
  duration_seconds: z.number().int().positive(),
  file_size_bytes: z.number().int().positive().optional(),
});

export type AudioResult = z.infer<typeof AudioResultSchema>;

// =====================================================
// Distribution Request Schema
// =====================================================
export const DistributionRequestSchema = z.object({
  digest_id: z.string().uuid(),
  channels: z.array(DistributionChannelSchema).min(1),
  force_resend: z.boolean().optional().default(false),
});

export type DistributionRequest = z.infer<typeof DistributionRequestSchema>;

// =====================================================
// Digest Archive Response Schema
// =====================================================
export const DigestArchiveSchema = z.object({
  digests: z.array(DigestSchema),
  total_count: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
  total_pages: z.number().int().nonnegative(),
});

export type DigestArchive = z.infer<typeof DigestArchiveSchema>;

// =====================================================
// Validation Helper Functions
// =====================================================

/**
 * Validates that week_end is after week_start
 */
export function validateWeekRange(weekStart: Date, weekEnd: Date): boolean {
  return weekEnd > weekStart;
}

/**
 * Validates that a date string is in YYYY-MM-DD format
 */
export function isValidDateString(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

/**
 * Converts a Date to YYYY-MM-DD string
 */
export function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Gets the start and end of the previous week (Monday to Sunday)
 */
export function getPreviousWeekRange(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate days to subtract to get to last Monday
  const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek + 6; // If Sunday, go back 6 days, otherwise dayOfWeek + 6

  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - daysToLastMonday);

  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);

  return {
    weekStart: formatDateString(lastMonday),
    weekEnd: formatDateString(lastSunday),
  };
}

/**
 * Gets the week range for a specific date (Monday to Sunday)
 */
export function getWeekRangeForDate(date: Date): { weekStart: string; weekEnd: string } {
  const dayOfWeek = date.getDay();

  // Calculate start of week (Monday)
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(date);
  monday.setDate(date.getDate() - daysFromMonday);

  // Calculate end of week (Sunday)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekStart: formatDateString(monday),
    weekEnd: formatDateString(sunday),
  };
}
