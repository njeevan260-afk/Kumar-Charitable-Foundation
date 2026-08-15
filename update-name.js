import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://bfinvtuujysbrhtakfya.supabase.co";
const SUPABASE_PUBLIC_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmaW52dHV1anlzYnJodGFrZnlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTc0OTksImV4cCI6MjEwMTg5MzQ5OX0.IXcINSByk26BMvr2jzweXs8ma0ijE96Fj2b7g1Urt2E";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY);

async function run() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: 'Rudrakumar' })
    .eq('email', 'rudrakumar25@gmail.com')
    .select();
  console.log("Updated Profile:", data, error);
}

run();
