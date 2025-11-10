import { NextRequest, NextResponse } from 'next/server';
import {
  generateWeeklyDigest,
  saveDigestToDatabase,
  updateDigestInDatabase,
  digestExists,
} from '@/lib/openai/digest-generator';
import { generateAllAudioVersions } from '@/lib/audio/text-to-speech';
import { distributeDigest } from '@/lib/distribution/digest-distributor';
import { getPreviousWeekRange } from '@/lib/schemas/digest';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Weekly Cron Job for AI Digest Generation
 *
 * This endpoint should be called by Vercel Cron or similar scheduling service
 * every Monday at 9:00 AM UTC to generate the previous week's digest.
 *
 * Vercel Cron configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/digest",
 *     "schedule": "0 9 * * 1"
 *   }]
 * }
 *
 * For manual execution, add ?force=true query parameter
 *
 * Security: Requires CRON_SECRET environment variable for authentication
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Security check: Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron job request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check for manual force parameter
    const searchParams = request.nextUrl.searchParams;
    const forceRegenerate = searchParams.get('force') === 'true';
    const customWeekStart = searchParams.get('week_start');
    const customWeekEnd = searchParams.get('week_end');

    // Determine week range
    let weekStart: string;
    let weekEnd: string;

    if (customWeekStart && customWeekEnd) {
      weekStart = customWeekStart;
      weekEnd = customWeekEnd;
      console.log(`Using custom week range: ${weekStart} to ${weekEnd}`);
    } else {
      const previousWeek = getPreviousWeekRange();
      weekStart = previousWeek.weekStart;
      weekEnd = previousWeek.weekEnd;
      console.log(`Using previous week range: ${weekStart} to ${weekEnd}`);
    }

    // Check if digest already exists
    if (!forceRegenerate && await digestExists(weekStart)) {
      console.log(`Digest for week ${weekStart} already exists, skipping generation`);
      return NextResponse.json({
        status: 'skipped',
        message: `Digest for week ${weekStart} already exists. Use ?force=true to regenerate.`,
        week_start: weekStart,
        week_end: weekEnd,
      });
    }

    console.log('==============================================');
    console.log('Starting AI Digest Generation Job');
    console.log(`Week: ${weekStart} to ${weekEnd}`);
    console.log('==============================================');

    // Step 1: Generate digest content (text summaries in all languages)
    console.log('\n[1/4] Generating digest content...');
    const digest = await generateWeeklyDigest(weekStart, weekEnd);

    // Step 2: Save digest to database (without audio URLs yet)
    console.log('\n[2/4] Saving digest to database...');
    const digestId = await saveDigestToDatabase(digest);

    // Step 3: Generate audio files
    console.log('\n[3/4] Generating audio narration...');
    let audioUrls;
    try {
      audioUrls = await generateAllAudioVersions(
        digest.summary_en!,
        digest.summary_fr || '',
        digest.summary_pt || ''
      );

      // Update digest with audio URLs
      await updateDigestInDatabase(digestId, audioUrls);
    } catch (audioError) {
      console.error('Audio generation failed (continuing without audio):', audioError);
      audioUrls = {
        audio_url_en: null,
        audio_url_fr: null,
        audio_url_pt: null,
        audio_duration_seconds: 0,
      };
    }

    // Step 4: Distribute digest
    console.log('\n[4/4] Distributing digest...');
    let distributionResult;
    try {
      distributionResult = await distributeDigest(digestId, ['discord', 'email']);
      console.log('Distribution completed:', distributionResult);
    } catch (distributionError) {
      console.error('Distribution failed (digest still saved):', distributionError);
      distributionResult = { success: false, error: 'Distribution failed' };
    }

    // Calculate execution time
    const executionTime = Date.now() - startTime;
    const executionMinutes = (executionTime / 1000 / 60).toFixed(2);

    console.log('\n==============================================');
    console.log('Digest Generation Job Completed');
    console.log(`Execution time: ${executionMinutes} minutes`);
    console.log('==============================================');

    // Mark as published
    await updateDigestInDatabase(digestId, {
      published: true,
      published_at: new Date().toISOString(),
    });

    // Return success response
    return NextResponse.json({
      status: 'success',
      message: 'Weekly digest generated and distributed successfully',
      digest_id: digestId,
      week_start: weekStart,
      week_end: weekEnd,
      audio_generated: !!audioUrls?.audio_url_en,
      distribution: distributionResult,
      execution_time_minutes: parseFloat(executionMinutes),
      digest_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://inrecord.xyz'}/digests/week-${weekStart}`,
    });
  } catch (error: any) {
    console.error('Error in digest cron job:', error);

    return NextResponse.json(
      {
        status: 'error',
        error: error.message || 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual digest generation with custom parameters
 */
export async function POST(request: NextRequest) {
  try {
    // Security check
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { week_start, week_end, force_regenerate = false, auto_distribute = true } = body;

    if (!week_start || !week_end) {
      return NextResponse.json(
        { error: 'week_start and week_end are required' },
        { status: 400 }
      );
    }

    // Check if digest exists
    if (!force_regenerate && await digestExists(week_start)) {
      return NextResponse.json({
        status: 'exists',
        message: 'Digest already exists. Use force_regenerate: true to overwrite.',
        week_start,
        week_end,
      });
    }

    console.log(`Manual digest generation requested for ${week_start} to ${week_end}`);

    // Generate digest
    const digest = await generateWeeklyDigest(week_start, week_end);
    const digestId = await saveDigestToDatabase(digest);

    // Generate audio
    try {
      const audioUrls = await generateAllAudioVersions(
        digest.summary_en!,
        digest.summary_fr || '',
        digest.summary_pt || ''
      );
      await updateDigestInDatabase(digestId, audioUrls);
    } catch (audioError) {
      console.error('Audio generation failed:', audioError);
    }

    // Auto-distribute if requested
    let distributionResult;
    if (auto_distribute) {
      try {
        distributionResult = await distributeDigest(digestId, ['discord', 'email']);
      } catch (error) {
        console.error('Distribution failed:', error);
      }
    }

    // Mark as published
    await updateDigestInDatabase(digestId, {
      published: true,
      published_at: new Date().toISOString(),
    });

    return NextResponse.json({
      status: 'success',
      digest_id: digestId,
      week_start,
      week_end,
      distribution: distributionResult,
      digest_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://inrecord.xyz'}/digests/week-${week_start}`,
    });
  } catch (error: any) {
    console.error('Error in POST digest generation:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS endpoint for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
