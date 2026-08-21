-- 1. Create a default project for users who have orphaned documents but NO projects at all
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
    project_link
)
SELECT 
    user_id,
    'My Portfolio',
    'Legacy project documentation.',
    ''
FROM users_needing_projects;

-- 2. Link ALL orphaned documents to the user's most recent project
UPDATE public.student_project_documents spd
SET project_id = latest_project.id
FROM (
    SELECT id, user_id
    FROM (
        SELECT id, user_id,
               ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY created_at DESC) as rn
        FROM public.student_projects
    ) sub
    WHERE rn = 1
) latest_project
WHERE spd.project_id IS NULL
  AND spd.user_id = latest_project.user_id;
