// ============================================
// SUPABASE CLIENT — reads from .env via Vite
// ============================================
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export let supabase = null;
export let supabaseReady = false;

export function initSupabase() {
  if (supabaseReady) return supabase !== null;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('[AlphaOS] Supabase credentials not found in .env');
    supabaseReady = true;
    return false;
  }
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
    });
    supabaseReady = true;
    return true;
  } catch (e) {
    console.error('[AlphaOS] Supabase init failed:', e);
    supabaseReady = true;
    return false;
  }
}

export function isConfigured() {
  return supabase !== null;
}
