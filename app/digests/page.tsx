'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Digest } from '@/lib/schemas/digest';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DigestWithCount extends Digest {
  total_count?: number;
}

export default function DigestsArchivePage() {
  const [digests, setDigests] = useState<DigestWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentimentFilter, setSentimentFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Fetch digests
  useEffect(() => {
    fetchDigests();
  }, [page, sentimentFilter]);

  async function fetchDigests() {
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * pageSize;

      // Call database function for paginated results
      const { data, error: fetchError } = await supabase.rpc('get_digest_archive', {
        p_limit: pageSize,
        p_offset: offset,
        p_sentiment: sentimentFilter,
      });

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        setDigests(data);
        const totalCount = data[0]?.total_count || 0;
        setTotalPages(Math.ceil(totalCount / pageSize));
      } else {
        setDigests([]);
        setTotalPages(1);
      }
    } catch (err: any) {
      console.error('Error fetching digests:', err);
      setError(err.message || 'Failed to load digests');
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
      month: 'short',
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-playfair mb-2">📊 Weekly DAO Digests</h1>
          <p className="text-gray-400 text-lg">
            AI-generated transparency reports on inRECORD DAO activity
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => {
              setSentimentFilter(null);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg border transition ${
              sentimentFilter === null
                ? 'bg-aurora text-white border-aurora'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
            }`}
          >
            All Digests
          </button>
          <button
            onClick={() => {
              setSentimentFilter('optimistic');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg border transition ${
              sentimentFilter === 'optimistic'
                ? 'bg-green-600 text-white border-green-500'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
            }`}
          >
            📈 Optimistic
          </button>
          <button
            onClick={() => {
              setSentimentFilter('stable');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg border transition ${
              sentimentFilter === 'stable'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
            }`}
          >
            ➡️ Stable
          </button>
          <button
            onClick={() => {
              setSentimentFilter('mixed');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg border transition ${
              sentimentFilter === 'mixed'
                ? 'bg-yellow-600 text-white border-yellow-500'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
            }`}
          >
            ↗️ Mixed
          </button>
          <button
            onClick={() => {
              setSentimentFilter('critical');
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg border transition ${
              sentimentFilter === 'critical'
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600'
            }`}
          >
            ⚠️ Critical
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-aurora border-r-transparent"></div>
            <p className="mt-4 text-gray-400">Loading digests...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={() => fetchDigests()}
              className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && digests.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No digests found</p>
            <p className="text-gray-500 text-sm mt-2">
              {sentimentFilter
                ? 'Try removing filters or check back later.'
                : 'Check back soon for the first digest!'}
            </p>
          </div>
        )}

        {/* Digest List */}
        {!loading && !error && digests.length > 0 && (
          <div className="space-y-6">
            {digests.map((digest) => (
              <Link
                key={digest.id}
                href={`/digests/week-${digest.week_start}`}
                className="block bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-aurora hover:shadow-lg hover:shadow-aurora/20 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-playfair mb-2">
                      Week of {formatDate(digest.week_start)} - {formatDate(digest.week_end)}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      Published {formatDate(digest.published_at || digest.created_at)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getSentimentColor(
                      digest.sentiment
                    )}`}
                  >
                    {getSentimentEmoji(digest.sentiment)} {digest.sentiment || 'stable'}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-aurora">
                      {digest.key_metrics?.proposals?.new || 0}
                    </div>
                    <div className="text-xs text-gray-400">New Proposals</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">
                      {digest.key_metrics?.voting?.votes_cast || 0}
                    </div>
                    <div className="text-xs text-gray-400">Votes Cast</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-400">
                      {digest.key_metrics?.voting?.participation_rate
                        ? `${(digest.key_metrics.voting.participation_rate * 100).toFixed(1)}%`
                        : '0%'}
                    </div>
                    <div className="text-xs text-gray-400">Participation</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-400">
                      {digest.key_metrics?.treasury?.net_change !== undefined
                        ? `$${digest.key_metrics.treasury.net_change >= 0 ? '+' : ''}${digest.key_metrics.treasury.net_change.toLocaleString()}`
                        : '$0'}
                    </div>
                    <div className="text-xs text-gray-400">Treasury Change</div>
                  </div>
                </div>

                {/* Highlights */}
                {digest.highlights && digest.highlights.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Highlights:</h3>
                    <ul className="space-y-1">
                      {digest.highlights.slice(0, 3).map((highlight, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start">
                          <span className="text-aurora mr-2">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Audio Badge */}
                {digest.audio_url_en && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>🎧 Audio narration available</span>
                    {digest.audio_duration_seconds && (
                      <span>({formatDuration(digest.audio_duration_seconds)})</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 rounded-lg transition"
            >
              Previous
            </button>
            <span className="text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 disabled:text-gray-600 rounded-lg transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
