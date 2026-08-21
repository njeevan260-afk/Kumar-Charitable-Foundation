import re

with open('src/components/student/StudentProjectsTab.tsx', 'r') as f:
    text = f.read()

# Fix bucket name in handleDeleteProjectDoc
text = text.replace("supabase.storage.from('student_documents').remove([storagePath])", "supabase.storage.from('student-documents').remove([storagePath])")

with open('src/components/student/StudentProjectsTab.tsx', 'w') as f:
    f.write(text)

