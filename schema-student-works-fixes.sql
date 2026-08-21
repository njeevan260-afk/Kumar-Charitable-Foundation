-- Backfill: link existing orphaned project documents to a project when the
-- student has exactly one project (the only unambiguous case).
UPDATE public.student_project_documents spd
SET project_id = sp.id
FROM public.student_projects sp
WHERE spd.project_id IS NULL
  AND spd.user_id = sp.user_id
  AND (SELECT COUNT(*) FROM public.student_projects sp2 WHERE sp2.user_id = spd.user_id) = 1;

-- Let any authenticated student see the profile (name) of a student who
-- submitted a project that's been featured in Student Works.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'profiles' AND policyname = 'Authenticated users can view featured project submitters'
    ) THEN
        CREATE POLICY "Authenticated users can view featured project submitters"
        ON public.profiles
        FOR SELECT
        USING (
            id IN (SELECT user_id FROM public.student_projects WHERE is_featured = true)
        );
    END IF;
END $$;
