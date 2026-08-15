-- Drop the existing foreign key to auth.users (Supabase uses standard naming like student_projects_user_id_fkey)
ALTER TABLE IF EXISTS public.student_projects
  DROP CONSTRAINT IF EXISTS student_projects_user_id_fkey;

-- Add the correct foreign key to public.profiles so the join works
ALTER TABLE public.student_projects
  ADD CONSTRAINT student_projects_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;
