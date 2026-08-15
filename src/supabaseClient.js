import { createClient } from "@supabase/supabase-js";

// Supabase configuration loaded from environment variables
// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLIC_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLIC_KEY) {
  throw new Error(
    "CRITICAL: Supabase credentials not found. The application cannot start safely. " +
    "Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables."
  );
}

const customStorageAdapter = {
  getItem: (key) => {
    if (typeof window === 'undefined') return null;
    if (window.localStorage.getItem('session_persistence') === 'session') {
      return window.sessionStorage.getItem(key);
    }
    return window.localStorage.getItem(key);
  },
  setItem: (key, value) => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem('session_persistence') === 'session') {
      window.sessionStorage.setItem(key, value);
    } else {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window === 'undefined') return;
    window.sessionStorage.removeItem(key);
    window.localStorage.removeItem(key);
  }
};

// Ensure the URL is just the base origin, even if the user accidentally included /rest/v1 in their secrets
let cleanSupabaseUrl = SUPABASE_URL;
try {
  const urlObj = new URL(SUPABASE_URL);
  cleanSupabaseUrl = urlObj.origin;
} catch (e) {
  // Fallback if somehow it's not a valid URL
  cleanSupabaseUrl = SUPABASE_URL;
}

export const supabase = createClient(
  cleanSupabaseUrl,
  SUPABASE_PUBLIC_KEY,
  {
    auth: {
      storage: customStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);
