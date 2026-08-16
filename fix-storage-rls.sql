-- Fix the RLS policy for storage to allow project_docs

DROP POLICY IF EXISTS "Students and Admins can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all student storage documents" ON storage.objects;
DROP POLICY IF EXISTS "Students delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Students upload to own folder" ON storage.objects;

CREATE POLICY "Students and Admins can view documents"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'student-documents'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (storage.foldername(name))[1] = 'project_docs' AND (storage.foldername(name))[2] = auth.uid()::text
        OR public.is_admin()
    )
);

CREATE POLICY "Students upload to own folder"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'student-documents'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (storage.foldername(name))[1] = 'project_docs' AND (storage.foldername(name))[2] = auth.uid()::text
    )
);

CREATE POLICY "Students delete own documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'student-documents'
    AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR (storage.foldername(name))[1] = 'project_docs' AND (storage.foldername(name))[2] = auth.uid()::text
    )
);
