import { createClient } from '@supabase/supabase-js';
import { Language, AudioResult, AudioResultSchema } from '../schemas/digest';

// Lazy initialization to avoid build-time errors
let supabase: ReturnType<typeof createClient>;

function getSupabase() {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.getSupabase().co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || 'placeholder-key';
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
}

// Play.ht API configuration
const PLAYHT_API_KEY = process.env.PLAYHT_API_KEY || '';
const PLAYHT_USER_ID = process.env.PLAYHT_USER_ID || '';
const PLAYHT_API_URL = 'https://api.play.ht/api/v2';

// Voice configuration for different languages
const VOICE_CONFIG = {
  en: {
    voice_id: 's3://voice-cloning-zero-shot/d9ff78ba-d016-47f6-b0ef-dd630f59414e/female-cs/manifest.json', // Charlotte - Professional female
    name: 'Charlotte',
    language: 'english',
  },
  fr: {
    voice_id: 's3://voice-cloning-zero-shot/a0c3d2e5-9f8a-4b7c-8d1e-2f3a4b5c6d7e/french-female/manifest.json', // French female
    name: 'Amélie',
    language: 'french',
  },
  pt: {
    voice_id: 's3://voice-cloning-zero-shot/b1d4e3f6-0a9b-5c8d-9e2f-3a4b5c6d7e8f/portuguese-br-female/manifest.json', // Brazilian Portuguese
    name: 'Isabella',
    language: 'portuguese',
  },
};

// =====================================================
// Main Audio Generation
// =====================================================

/**
 * Generate audio from text using Play.ht
 */
export async function generateAudio(
  text: string,
  language: Language
): Promise<AudioResult> {
  console.log(`Generating ${language} audio...`);

  try {
    // Clean text for TTS (remove markdown, special characters, etc.)
    const cleanText = cleanTextForTTS(text);

    // Get voice configuration
    const voiceConfig = VOICE_CONFIG[language];

    // Call Play.ht API to generate audio
    const audioUrl = await generateWithPlayHT(cleanText, voiceConfig.voice_id);

    // Download audio buffer
    const audioBuffer = await downloadAudio(audioUrl);

    // Upload to Supabase Storage
    const storageUrl = await uploadAudioToStorage(audioBuffer, language);

    // Get audio duration
    const duration = await getAudioDuration(audioBuffer);

    const result: AudioResult = {
      url: storageUrl,
      duration_seconds: duration,
      file_size_bytes: audioBuffer.length,
    };

    // Validate result
    AudioResultSchema.parse(result);

    console.log(`${language} audio generated successfully:`, result);
    return result;
  } catch (error) {
    console.error(`Error generating ${language} audio:`, error);
    throw error;
  }
}

/**
 * Generate audio for all languages
 */
export async function generateAllAudioVersions(
  summaryEn: string,
  summaryFr: string,
  summaryPt: string
): Promise<{
  audio_url_en: string;
  audio_url_fr: string;
  audio_url_pt: string;
  audio_duration_seconds: number;
}> {
  try {
    // Generate audio for all three languages in parallel
    const [enAudio, frAudio, ptAudio] = await Promise.all([
      generateAudio(summaryEn, 'en'),
      generateAudio(summaryFr, 'fr'),
      generateAudio(summaryPt, 'pt'),
    ]);

    // Use English duration as reference (they should be similar)
    return {
      audio_url_en: enAudio.url,
      audio_url_fr: frAudio.url,
      audio_url_pt: ptAudio.url,
      audio_duration_seconds: enAudio.duration_seconds,
    };
  } catch (error) {
    console.error('Error generating all audio versions:', error);
    throw error;
  }
}

// =====================================================
// Play.ht Integration
// =====================================================

/**
 * Generate audio using Play.ht API
 */
async function generateWithPlayHT(text: string, voiceId: string): Promise<string> {
  try {
    // Step 1: Create TTS job
    const createResponse = await fetch(`${PLAYHT_API_URL}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'AUTHORIZATION': PLAYHT_API_KEY,
        'X-USER-ID': PLAYHT_USER_ID,
      },
      body: JSON.stringify({
        text: text,
        voice: voiceId,
        output_format: 'mp3',
        voice_engine: 'PlayHT2.0-turbo',
        sample_rate: 24000,
        quality: 'high',
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Play.ht API error: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    const jobId = createData.id;

    console.log('Play.ht job created:', jobId);

    // Step 2: Poll for completion
    const audioUrl = await pollForCompletion(jobId);

    return audioUrl;
  } catch (error) {
    console.error('Error in generateWithPlayHT:', error);
    throw error;
  }
}

/**
 * Poll Play.ht job until completion
 */
async function pollForCompletion(jobId: string, maxAttempts: number = 30): Promise<string> {
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${PLAYHT_API_URL}/tts/${jobId}`, {
        method: 'GET',
        headers: {
          'AUTHORIZATION': PLAYHT_API_KEY,
          'X-USER-ID': PLAYHT_USER_ID,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check job status: ${response.status}`);
      }

      const data = await response.json();

      if (data.status === 'completed' && data.output?.url) {
        console.log('Audio generation completed');
        return data.output.url;
      }

      if (data.status === 'failed') {
        throw new Error(`Audio generation failed: ${data.error || 'Unknown error'}`);
      }

      // Wait 2 seconds before next poll
      await sleep(2000);
      attempts++;
    } catch (error) {
      console.error('Error polling for completion:', error);
      if (attempts >= maxAttempts - 1) {
        throw error;
      }
      await sleep(2000);
      attempts++;
    }
  }

  throw new Error('Audio generation timed out');
}

// =====================================================
// Storage Management
// =====================================================

/**
 * Download audio from URL
 */
async function downloadAudio(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download audio: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error('Error downloading audio:', error);
    throw error;
  }
}

/**
 * Upload audio to Supabase Storage
 */
export async function uploadAudioToStorage(
  audioBuffer: Buffer,
  language: Language,
  weekStart?: string
): Promise<string> {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const filename = weekStart
      ? `digests/${weekStart}-${language}.mp3`
      : `digests/${timestamp}-${language}.mp3`;

    // Upload to Supabase Storage
    const { data, error } = await getSupabase().storage
      .from('audio')
      .upload(filename, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.error('Error uploading to Supabase Storage:', error);
      throw new Error(`Failed to upload audio: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = getSupabase().storage.from('audio').getPublicUrl(filename);

    console.log(`Audio uploaded to: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadAudioToStorage:', error);
    throw error;
  }
}

/**
 * Delete audio from storage
 */
export async function deleteAudioFromStorage(audioUrl: string): Promise<void> {
  try {
    // Extract filename from URL
    const urlParts = audioUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const path = `digests/${filename}`;

    const { error } = await getSupabase().storage.from('audio').remove([path]);

    if (error) {
      console.error('Error deleting audio from storage:', error);
      throw error;
    }

    console.log('Audio deleted from storage:', path);
  } catch (error) {
    console.error('Error in deleteAudioFromStorage:', error);
    // Don't throw - deletion failures shouldn't break the flow
  }
}

// =====================================================
// Audio Processing
// =====================================================

/**
 * Get audio duration from buffer
 * Note: This is a simple estimation. For accurate duration, you'd need to parse the MP3 headers
 */
export async function getAudioDuration(audioBuffer: Buffer): Promise<number> {
  try {
    // Estimate based on file size and bitrate
    // Assuming 128kbps MP3 encoding
    const bitrate = 128000; // bits per second
    const fileSizeInBits = audioBuffer.length * 8;
    const durationSeconds = Math.round(fileSizeInBits / bitrate);

    return durationSeconds;
  } catch (error) {
    console.error('Error getting audio duration:', error);
    // Return a reasonable default (3 minutes)
    return 180;
  }
}

/**
 * Validate audio quality
 */
export async function validateAudioQuality(audioUrl: string): Promise<boolean> {
  try {
    // Check if audio is accessible
    const response = await fetch(audioUrl, { method: 'HEAD' });

    if (!response.ok) {
      console.error('Audio URL not accessible:', response.status);
      return false;
    }

    // Check content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('audio')) {
      console.error('Invalid content type:', contentType);
      return false;
    }

    // Check file size (should be at least 100KB)
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) < 100000) {
      console.error('Audio file too small:', contentLength);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating audio quality:', error);
    return false;
  }
}

// =====================================================
// Text Processing
// =====================================================

/**
 * Clean text for TTS (remove markdown, special characters)
 */
function cleanTextForTTS(text: string): string {
  let cleaned = text;

  // Remove markdown headers
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');

  // Remove markdown bold/italic
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');

  // Remove markdown links but keep text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```[^`]*```/g, '');
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  // Remove markdown lists
  cleaned = cleaned.replace(/^[\*\-\+]\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');

  // Replace multiple newlines with single newline
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Trim whitespace
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Estimate words per minute for audio
 */
export function estimateAudioDuration(text: string, wpm: number = 150): number {
  const words = text.split(/\s+/).length;
  const minutes = words / wpm;
  return Math.ceil(minutes * 60); // Return seconds
}

/**
 * Format duration for display (e.g., "3:45")
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}

/**
 * Estimate Play.ht cost for audio generation
 */
export function estimatePlayHTCost(characterCount: number): number {
  // Play.ht pricing: ~$0.016 per 1000 characters
  const costPer1K = 0.016;
  return (characterCount / 1000) * costPer1K;
}

/**
 * Calculate total audio generation cost
 */
export function estimateTotalAudioCost(
  enText: string,
  frText: string,
  ptText: string
): number {
  const totalChars = enText.length + frText.length + ptText.length;
  return estimatePlayHTCost(totalChars);
}
