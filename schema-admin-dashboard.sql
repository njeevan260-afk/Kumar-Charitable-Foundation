-- ==============================================================================
-- KUMAR CHARITABLE FOUNDATION
-- COMPLETE ADMIN DASHBOARD SQL SCHEMA & SAFE NON-RECURSIVE RLS POLICIES
-- ==============================================================================
-- Run this script in your Supabase SQL Editor.
-- It safely enables Admin access to student profiles, academic records,
-- documents, English learning summaries, notifications, and private storage.
-- ==============================================================================

-- 1. HELPER FUNCTION TO SAFELY CHECK ADMIN ROLE (NO RLS RECURSION)
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
  );
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;


-- ==============================================================================
-- 2. PROFILES TABLE POLICIES (ADMINS CAN VIEW & MANAGE ALL STUDENT PROFILES)
-- ==============================================================================

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow Admins to view all profiles without recursive loop
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles'
    ) THEN
        CREATE POLICY "Admins can view all profiles"
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
        WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles'
    ) THEN
        CREATE POLICY "Admins can update all profiles"
        ON public.profiles
        FOR UPDATE
        USING (public.is_admin())
        WITH CHECK (public.is_admin());
    END IF;
END $$;


-- ==============================================================================
-- 3. ACADEMIC RECORDS POLICIES (ADMINS CAN VIEW ALL RECORDS)
-- ==============================================================================

ALTER TABLE IF EXISTS public.academic_records ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_records' AND policyname = 'Admins can view all academic records'
    ) THEN
        CREATE POLICY "Admins can view all academic records"
        ON public.academic_records
        FOR SELECT
        USING (public.is_admin());
    END IF;
END $$;


-- ==============================================================================
-- 4. ACADEMIC DOCUMENTS POLICIES (ADMINS CAN VIEW ALL DOCUMENT METADATA)
-- ==============================================================================

ALTER TABLE IF EXISTS public.academic_documents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'academic_documents' AND policyname = 'Admins can view all academic documents'
    ) THEN
        CREATE POLICY "Admins can view all academic documents"
        ON public.academic_documents
        FOR SELECT
        USING (public.is_admin());
    END IF;
END $$;


-- ==============================================================================
-- 5. ENGLISH LEARNING SUMMARIES POLICIES (ADMINS CAN VIEW ALL SUMMARIES)
-- ==============================================================================

ALTER TABLE IF EXISTS public.english_learning_summaries ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'english_learning_summaries' AND policyname = 'Admins can view all english summaries'
    ) THEN
        CREATE POLICY "Admins can view all english summaries"
        ON public.english_learning_summaries
        FOR SELECT
        USING (public.is_admin());
    END IF;
END $$;


-- ==============================================================================
-- 6. NOTIFICATIONS POLICIES (ADMINS CAN VIEW, INSERT & DELETE NOTIFICATIONS)
-- ==============================================================================

ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' AND policyname = 'Admins can view all notifications'
    ) THEN
        CREATE POLICY "Admins can view all notifications"
        ON public.notifications
        FOR SELECT
        USING (public.is_admin());
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


-- ==============================================================================
-- 7. STORAGE BUCKET POLICIES (ADMINS CAN SECURELY VIEW & DOWNLOAD ALL FILES)
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can view all student storage documents'
    ) THEN
        CREATE POLICY "Admins can view all student storage documents"
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
END $$;


-- ==============================================================================
-- 8. PERFORMANCE INDEXES
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_academic_records_user_id ON public.academic_records (user_id);
CREATE INDEX IF NOT EXISTS idx_academic_documents_user_id ON public.academic_documents (user_id);
CREATE INDEX IF NOT EXISTS idx_english_summaries_user_date ON public.english_learning_summaries (user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
