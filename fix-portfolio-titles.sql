UPDATE public.student_projects p
SET 
    title = COALESCE(doc.title, 'Project'),
    description = COALESCE(doc.description, 'No description provided.')
FROM (
    SELECT 
        project_id, 
        title, 
        description,
        ROW_NUMBER() OVER(PARTITION BY project_id ORDER BY created_at DESC) as rn
    FROM public.student_project_documents
    WHERE project_id IS NOT NULL
) doc
WHERE p.id = doc.project_id
  AND doc.rn = 1
  AND p.title = 'My Portfolio'
  AND p.description = 'Legacy project documentation.';
