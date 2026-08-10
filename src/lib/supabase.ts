import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bfinvtuujysbrhtakfya.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmaW52dHV1anlzYnJodGFrZnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTc0OTksImV4cCI6MjEwMTg5MzQ5OX0.IXcINSByk26BMvr2jzweXs8ma0ijE96Fj2b7g1Urt2E';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
