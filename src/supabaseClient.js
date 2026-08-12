import { createClient } from "@supabase/supabase-js";

// Paste the complete Supabase Project URL here.
// Example: https://abcdefghijk.supabase.co
const SUPABASE_URL = "https://bfinvtuujysbrhtakfya.supabase.co";

// Paste the Supabase Publishable/Public key here.
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmaW52dHV1anlzYnJodGFrZnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTc0OTksImV4cCI6MjEwMTg5MzQ5OX0.IXcINSByk26BMvr2jzweXs8ma0ijE96Fj2b7g1Urt2E";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLIC_KEY
);
