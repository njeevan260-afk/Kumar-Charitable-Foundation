-- =====================================================
-- KUMAR CHARITABLE FOUNDATION
-- COMPLETE UNIFIED DATABASE SCHEMA & RLS POLICIES
-- (FOR BOTH STUDENTS AND ADMIN DASHBOARDS)
-- =====================================================

-- 0. ADMIN ROLE CHECK HELPER (NON-RECURSIVE)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  ) OR COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  ) OR EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;


-- =====================================================
-- 1. PROFILES TABLE
-- =====================================================

ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS mobile_number TEXT,
ADD COLUMN IF NOT EXISTS college_name TEXT,
ADD COLUMN IF NOT EXISTS course TEXT,
ADD COLUMN IF NOT EXISTS branch TEXT,
ADD COLUMN IF NOT EXISTS current_semester TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users and admins can view profiles'
    ) THEN
        CREATE POLICY "Users and admins can view profiles"
        ON public.profiles
        FOR SELECT
        USING (
            auth.uid() = id
            OR COALESCE((auth.jwt() -> 'user_metadata' ->> 'role'), '') = 'admin'
            OR COALESCE((auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin'
            OR public.is_admin()
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
        ON public.profiles
        FOR UPDATE
        USING (auth.uid() = id OR public.is_admin())
        WITH CHECK (auth.uid() = id OR public.is_admin());
    END IF;
END $$;


-- =====================================================
-- 2. ACADEMIC RECORDS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.academic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    semester TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    score_type TEXT NOT NULL,
    score TEXT NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_records' AND policyname = 'Students and Admins can view academic records'
    ) THEN
        CREATE POLICY "Students and Admins can view academic records"
        ON public.academic_records
        FOR SELECT
        USING (auth.uid() = user_id OR public.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_records' AND policyname = 'Students can insert own academic records'
    ) THEN
        CREATE POLICY "Students can insert own academic records"
        ON public.academic_records
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_records' AND policyname = 'Students can update own academic records'
    ) THEN
        CREATE POLICY "Students can update own academic records"
        ON public.academic_records
        FOR UPDATE
        USING (auth.uid() = user_id OR public.is_admin())
        WITH CHECK (auth.uid() = user_id OR public.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_records' AND policyname = 'Students can delete own academic records'
    ) THEN
        CREATE POLICY "Students can delete own academic records"
        ON public.academic_records
        FOR DELETE
        USING (auth.uid() = user_id OR public.is_admin());
    END IF;
END $$;


-- =====================================================
-- 3. ACADEMIC DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.academic_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    academic_record_id UUID
        REFERENCES public.academic_records(id)
        ON DELETE SET NULL,
    semester TEXT NOT NULL,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.academic_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_documents' AND policyname = 'Students and Admins can view academic documents'
    ) THEN
        CREATE POLICY "Students and Admins can view academic documents"
        ON public.academic_documents
        FOR SELECT
        USING (auth.uid() = user_id OR public.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_documents' AND policyname = 'Students can insert own academic documents'
    ) THEN
        CREATE POLICY "Students can insert own academic documents"
        ON public.academic_documents
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_documents' AND policyname = 'Students can delete own academic documents'
    ) THEN
        CREATE POLICY "Students can delete own academic documents"
        ON public.academic_documents
        FOR DELETE
        USING (auth.uid() = user_id OR public.is_admin());
    END IF;
END $$;


-- =====================================================
-- 4. ENGLISH LEARNING SUMMARIES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.english_learning_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_entry_date UNIQUE (user_id, entry_date)
);

ALTER TABLE public.english_learning_summaries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'english_learning_summaries' AND policyname = 'Students and Admins can view english summaries'
    ) THEN
        CREATE POLICY "Students and Admins can view english summaries"
        ON public.english_learning_summaries
        FOR SELECT
        USING (auth.uid() = user_id OR public.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'english_learning_summaries' AND policyname = 'Students can insert own english summaries'
    ) THEN
        CREATE POLICY "Students can insert own english summaries"
        ON public.english_learning_summaries
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'english_learning_summaries' AND policyname = 'Students can update own english summaries'
    ) THEN
        CREATE POLICY "Students can update own english summaries"
        ON public.english_learning_summaries
        FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'english_learning_summaries' AND policyname = 'Students can delete own english summaries'
    ) THEN
        CREATE POLICY "Students can delete own english summaries"
        ON public.english_learning_summaries
        FOR DELETE
        USING (auth.uid() = user_id OR public.is_admin());
    END IF;
END $$;


-- =====================================================
-- 5. NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Students and Admins can view notifications'
    ) THEN
        CREATE POLICY "Students and Admins can view notifications"
        ON public.notifications
        FOR SELECT
        USING (user_id IS NULL OR user_id = auth.uid() OR public.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Students can update own notifications'
    ) THEN
        CREATE POLICY "Students can update own notifications"
        ON public.notifications
        FOR UPDATE
        USING (user_id IS NULL OR user_id = auth.uid() OR public.is_admin())
        WITH CHECK (user_id IS NULL OR user_id = auth.uid() OR public.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Admins can insert notifications'
    ) THEN
        CREATE POLICY "Admins can insert notifications"
        ON public.notifications
        FOR INSERT
        WITH CHECK (public.is_admin());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Admins can delete notifications'
    ) THEN
        CREATE POLICY "Admins can delete notifications"
        ON public.notifications
        FOR DELETE
        USING (public.is_admin());
    END IF;
END $$;


-- =====================================================
-- 6. PRIVATE STUDENT DOCUMENT STORAGE (2MB Limit)
-- =====================================================

INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'student-documents',
    'student-documents',
    false,
    2097152, -- 2 MB
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Students upload to own folder'
    ) THEN
        CREATE POLICY "Students upload to own folder"
        ON storage.objects
        FOR INSERT
        WITH CHECK (
            bucket_id = 'student-documents'
            AND (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Students and Admins can view documents'
    ) THEN
        CREATE POLICY "Students and Admins can view documents"
        ON storage.objects
        FOR SELECT
        USING (
            bucket_id = 'student-documents'
            AND (
                (storage.foldername(name))[1] = auth.uid()::text
                OR public.is_admin()
            )
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Students delete own documents'
    ) THEN
        CREATE POLICY "Students delete own documents"
        ON storage.objects
        FOR DELETE
        USING (
            bucket_id = 'student-documents'
            AND (
                (storage.foldername(name))[1] = auth.uid()::text
                OR public.is_admin()
            )
        );
    END IF;
END $$;


-- =====================================================
-- 7. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_academic_records_user_id ON public.academic_records (user_id);
CREATE INDEX IF NOT EXISTS idx_academic_documents_user_id ON public.academic_documents (user_id);
CREATE INDEX IF NOT EXISTS idx_english_summaries_user_date ON public.english_learning_summaries (user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
