/**
 * Supabase Client Configuration
 * Provides both client-side and server-side Supabase clients
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Only throw error if we're not in build time
  if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'production') {
    console.warn('Missing Supabase environment variables - using placeholder values for build');
  }
}

/**
 * Client-side Supabase client
 * Uses anon key for public operations with RLS
 */
export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

/**
 * Server-side Supabase client with service role
 * Use only in API routes and server components
 * Bypasses RLS - use with caution
 */
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseServiceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    )
  : null;

/**
 * Helper to create a Supabase client for server components
 * Use in Server Components and API Routes
 */
export function createServerClient() {
  return createClient<Database>(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
