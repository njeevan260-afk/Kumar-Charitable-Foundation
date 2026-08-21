UPDATE public.student_projects p
SET 
    title = doc.title,
    description = doc.description
FROM (
    SELECT 
        project_id, 
        title, 
        description,
        ROW_NUMBER() OVER(PARTITION BY project_id ORDER BY created_at DESC) as rn
    FROM public.student_project_documents
) doc
WHERE p.id = doc.project_id
  AND doc.rn = 1
  AND p.title = 'My Portfolio'
  AND p.description = 'Legacy project documentation.';
