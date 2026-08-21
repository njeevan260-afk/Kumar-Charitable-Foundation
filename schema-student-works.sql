-- Link project documents to a specific project
ALTER TABLE public.student_project_documents
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.student_projects(id) ON DELETE CASCADE;

-- Flag for whether a project is published to the public "Student Works" section
ALTER TABLE public.student_projects
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Allow ALL authenticated students to view projects the admin has featured
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'student_projects' AND policyname = 'Authenticated users can view featured projects'
    ) THEN
        CREATE POLICY "Authenticated users can view featured projects"
        ON public.student_projects
        FOR SELECT
        USING (is_featured = true);
    END IF;
END $$;

-- Allow ALL authenticated students to view documents belonging to a featured project
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'student_project_documents' AND policyname = 'Authenticated users can view featured project documents'
    ) THEN
        CREATE POLICY "Authenticated users can view featured project documents"
        ON public.student_project_documents
        FOR SELECT
        USING (
            project_id IN (SELECT id FROM public.student_projects WHERE is_featured = true)
        );
    END IF;
END $$;
