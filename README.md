# School Admin & Student Portal

A comprehensive portal built with React and Vite.

## Security Warning

⚠️ **IMPORTANT SECURITY NOTICE** ⚠️

During development, certain API keys (including a Supabase Anon Key and URL) were previously hardcoded directly into the application source code (`src/supabaseClient.js`). 

Even though they have now been moved to environment variables, the original values **still exist in the git history** of this repository.

**ACTION REQUIRED:**
1. If this repository is public, you must immediately go to your Supabase dashboard and rotate your API keys.
2. The current Anon Key in Supabase is only safe if you have Row Level Security (RLS) properly configured on *every single table* in your database. 
3. Never expose your Supabase `service_role` secret key.

## Environment Setup

Create a `.env` file in the root directory and add the following variables:

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

Start the application:
```bash
npm run dev
```
