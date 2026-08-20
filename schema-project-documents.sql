CREATE TABLE IF NOT EXISTS public.student_project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.student_project_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'student_project_documents' AND policyname = 'Students can view own project documents'
    ) THEN
        CREATE POLICY "Students can view own project documents" ON public.student_project_documents FOR SELECT USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'student_project_documents' AND policyname = 'Students can insert own project documents'
    ) THEN
        CREATE POLICY "Students can insert own project documents" ON public.student_project_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'student_project_documents' AND policyname = 'Students can delete own project documents'
    ) THEN
        CREATE POLICY "Students can delete own project documents" ON public.student_project_documents FOR DELETE USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'student_project_documents' AND policyname = 'Admins can view all project documents'
    ) THEN
        CREATE POLICY "Admins can view all project documents" ON public.student_project_documents FOR SELECT USING (public.is_admin());
    END IF;
END $$;
