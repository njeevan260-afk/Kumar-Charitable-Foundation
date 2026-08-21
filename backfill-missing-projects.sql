-- Create a default project for users who have orphaned documents but NO projects at all
WITH users_needing_projects AS (
    SELECT DISTINCT spd.user_id
    FROM public.student_project_documents spd
    LEFT JOIN public.student_projects sp ON spd.user_id = sp.user_id
    WHERE sp.id IS NULL
)
INSERT INTO public.student_projects (
    user_id,
    title,
    description,
    tags,
    is_featured,
    created_at,
    updated_at
)
SELECT 
    user_id,
    'My Project Portfolio',
    'Automatically generated project to hold legacy documents.',
    '{}',
    false,
    NOW(),
    NOW()
FROM users_needing_projects;

-- Now link all orphaned documents where the user has exactly 1 project (which will now include the users we just inserted for)
UPDATE public.student_project_documents spd
SET project_id = sp.id
FROM public.student_projects sp
WHERE spd.project_id IS NULL
  AND spd.user_id = sp.user_id
  AND (SELECT COUNT(*) FROM public.student_projects sp2 WHERE sp2.user_id = spd.user_id) = 1;
