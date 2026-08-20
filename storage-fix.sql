-- 1. Create the storage bucket if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('student-documents', 'student-documents', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Students and Admins can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Students upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Students delete own documents" ON storage.objects;

-- 3. Allow public or authenticated viewing (since it's a public bucket, we can just allow SELECT for everyone or authenticated users)
CREATE POLICY "Anyone can view student-documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'student-documents');

-- 4. Allow authenticated users to upload to student-documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'student-documents'
    AND auth.role() = 'authenticated'
);

-- 5. Allow authenticated users to update/delete their documents
CREATE POLICY "Authenticated users can update documents"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'student-documents'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete documents"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'student-documents'
    AND auth.role() = 'authenticated'
);
