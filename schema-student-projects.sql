-- ==============================================================================
-- STUDENT PROJECTS SCHEMA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.student_projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    project_link TEXT NOT NULL,
    admin_feedback TEXT,
    admin_rating INTEGER CHECK (admin_rating >= 1 AND admin_rating <= 5),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE IF EXISTS public.student_projects ENABLE ROW LEVEL SECURITY;

-- Students can read their own projects
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'student_projects' AND policyname = 'Students can view their own projects'
    ) THEN
        CREATE POLICY "Students can view their own projects"
        ON public.student_projects
        FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'student_projects' AND policyname = 'Students can insert their own projects'
    ) THEN
        CREATE POLICY "Students can insert their own projects"
        ON public.student_projects
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'student_projects' AND policyname = 'Students can update their own pending projects'
    ) THEN
        CREATE POLICY "Students can update their own pending projects"
        ON public.student_projects
        FOR UPDATE
        USING (auth.uid() = user_id AND status = 'pending')
        WITH CHECK (auth.uid() = user_id AND status = 'pending');
    END IF;
    
    -- Admins can view all projects
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'student_projects' AND policyname = 'Admins can view all projects'
    ) THEN
        CREATE POLICY "Admins can view all projects"
        ON public.student_projects
        FOR SELECT
        USING (public.is_admin());
    END IF;

    -- Admins can update all projects
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'student_projects' AND policyname = 'Admins can update all projects'
    ) THEN
        CREATE POLICY "Admins can update all projects"
        ON public.student_projects
        FOR UPDATE
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
    END IF;
END $$;
