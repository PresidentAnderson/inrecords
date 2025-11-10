'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Digest } from '@/lib/schemas/digest';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Language = 'en' | 'fr' | 'pt';

const LANGUAGE_LABELS = {
  en: 'English',
  fr: 'Français',
  pt: 'Português',
};

export default function DigestDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [digest, setDigest] = useState<Digest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Extract week_start from slug (format: week-2025-01-08)
  const weekStart = slug?.replace('week-', '');

  useEffect(() => {
    if (weekStart) {
      fetchDigest();
    }
  }, [weekStart]);

  async function fetchDigest() {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_digests')
        .select('*')
        .eq('week_start', weekStart)
        .eq('published', true)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        throw new Error('Digest not found');
      }

      setDigest(data as Digest);
    } catch (err: any) {
      console.error('Error fetching digest:', err);
      setError(err.message || 'Failed to load digest');
    } finally {
      setLoading(false);
    }
  }

  function getSentimentColor(sentiment: string | null): string {
    switch (sentiment) {
      case 'optimistic':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'stable':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'mixed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  function getSentimentEmoji(sentiment: string | null): string {
    switch (sentiment) {
      case 'optimistic':
        return '📈';
      case 'stable':
        return '➡️';
      case 'critical':
        return '⚠️';
      case 'mixed':
        return '↗️';
      default:
        return '📊';
    }
  }

  function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatDuration(seconds: number | null): string {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  function getSummary(): string {
    if (!digest) return '';
    switch (selectedLanguage) {
      case 'fr':
        return digest.summary_fr || digest.summary_en;
      case 'pt':
        return digest.summary_pt || digest.summary_en;
      default:
        return digest.summary_en;
    }
  }

  function getAudioUrl(): string | null {
    if (!digest) return null;
    switch (selectedLanguage) {
      case 'fr':
        return digest.audio_url_fr;
      case 'pt':
        return digest.audio_url_pt;
      default:
        return digest.audio_url_en;
    }
  }

  // Convert markdown to HTML (basic conversion)
  function renderMarkdown(text: string): React.ReactNode {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-xl font-semibold mt-6 mb-3 text-aurora">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold mt-8 mb-4 text-white">
            {line.replace('## ', '')}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-3xl font-bold mt-8 mb-4 text-white">
            {line.replace('# ', '')}
          </h1>
        );
      }

      // Bullet points
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-6 text-gray-300 mb-2">
            {line.replace('- ', '')}
          </li>
        );
      }

      // Empty lines
      if (line.trim() === '') {
        return <br key={index} />;
      }

      // Regular paragraphs
      return (
        <p key={index} className="text-gray-300 mb-4 leading-relaxed">
          {line}
        </p>
      );
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-aurora border-r-transparent"></div>
          <p className="mt-4 text-gray-400">Loading digest...</p>
        </div>
      </div>
    );
  }

  if (error || !digest) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Digest Not Found</h1>
            <p className="text-red-400 mb-6">{error || 'The requested digest could not be found.'}</p>
            <Link
              href="/digests"
              className="inline-block px-6 py-3 bg-aurora hover:bg-aurora/80 rounded-lg transition"
            >
              View All Digests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const audioUrl = getAudioUrl();

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Link
            href="/digests"
            className="inline-flex items-center text-aurora hover:text-aurora/80 mb-4 transition"
          >
            ← Back to Archive
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-playfair mb-2">
                Week of {formatDate(digest.week_start)}
              </h1>
              <p className="text-gray-400">
                {formatDate(digest.week_start)} - {formatDate(digest.week_end)}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium border ${getSentimentColor(
                digest.sentiment
              )}`}
            >
              {getSentimentEmoji(digest.sentiment)} {digest.sentiment || 'stable'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Key Metrics Dashboard */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-aurora mb-1">
                {digest.key_metrics?.proposals?.new || 0}
              </div>
              <div className="text-sm text-gray-400">New Proposals</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {digest.key_metrics?.proposals?.funded || 0}
              </div>
              <div className="text-sm text-gray-400">Funded</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {digest.key_metrics?.voting?.votes_cast || 0}
              </div>
              <div className="text-sm text-gray-400">Votes Cast</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {digest.key_metrics?.voting?.participation_rate
                  ? `${(digest.key_metrics.voting.participation_rate * 100).toFixed(1)}%`
                  : '0%'}
              </div>
              <div className="text-sm text-gray-400">Participation</div>
            </div>
          </div>

          {/* Treasury Info */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400 mb-1">Treasury Change</div>
                <div className="text-2xl font-bold">
                  {digest.key_metrics?.treasury?.net_change !== undefined ? (
                    <span
                      className={
                        digest.key_metrics.treasury.net_change >= 0
                          ? 'text-green-400'
                          : 'text-red-400'
                      }
                    >
                      {digest.key_metrics.treasury.net_change >= 0 ? '+' : ''}$
                      {digest.key_metrics.treasury.net_change.toLocaleString()}
                    </span>
                  ) : (
                    '$0'
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">New Members</div>
                <div className="text-2xl font-bold text-purple-400">
                  +{digest.key_metrics?.members?.new_members || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights */}
        {digest.highlights && digest.highlights.length > 0 && (
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">Highlights</h2>
            <ul className="space-y-3">
              {digest.highlights.map((highlight, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-aurora mr-3 mt-1 text-lg">✓</span>
                  <span className="text-gray-300">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Language Selector & Audio Player */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            {/* Language Selector */}
            <div className="flex gap-2">
              {(['en', 'fr', 'pt'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-4 py-2 rounded-lg border transition ${
                    selectedLanguage === lang
                      ? 'bg-aurora text-white border-aurora'
                      : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div className="flex items-center gap-3">
                <audio
                  controls
                  src={audioUrl}
                  className="h-10"
                  onPlay={() => setIsAudioPlaying(true)}
                  onPause={() => setIsAudioPlaying(false)}
                  onEnded={() => setIsAudioPlaying(false)}
                >
                  Your browser does not support the audio element.
                </audio>
                {digest.audio_duration_seconds && (
                  <span className="text-sm text-gray-400">
                    {formatDuration(digest.audio_duration_seconds)}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Summary Content */}
          <div className="prose prose-invert max-w-none">
            <div className="text-gray-300 leading-relaxed">{renderMarkdown(getSummary())}</div>
          </div>
        </div>

        {/* Metadata Footer */}
        <div className="text-center text-sm text-gray-500 mt-12 pb-8">
          <p>
            Published on {formatDate(digest.published_at || digest.created_at)} • Generated by{' '}
            {digest.generated_by || 'GPT-4'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            {digest.discord_sent && (
              <span className="text-green-500">✓ Sent to Discord</span>
            )}
            {digest.email_sent && (
              <span className="text-green-500">✓ Sent via Email</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
