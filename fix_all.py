import re

with open('src/components/student/StudentLogsTab.tsx', 'r') as f:
    text = f.read()

# Replace any activeSectionView options for project-docs
text = text.replace(" | 'project-docs'", "")
text = text.replace(" + projectDocs.length", "")

# Remove the 'Project & Prompt Docs' button
proj_doc_tab_regex = re.compile(r'<button type="button"\s*onClick=\{\(\) => setActiveSectionView\(\'project-docs\'\)\}.*?</button>', re.DOTALL)
text = proj_doc_tab_regex.sub('', text)

# Remove Quick Add 'Upload Project Doc' button
quick_add_doc_regex = re.compile(r'<button type="button"\s*onClick=\{\(\) => setShowDocModal\(true\)\}.*?</button>', re.DOTALL)
text = quick_add_doc_regex.sub('', text)

# Remove docsRes fetching
fetch_docs_regex = re.compile(r',\s*supabase\.from\(\'student_project_documents\'\).*?\]\);', re.DOTALL)
text = fetch_docs_regex.sub(']);', text)

set_project_docs_regex = re.compile(r'\s*if \(docsRes\.data\) setProjectDocs.*?;\n', re.DOTALL)
text = set_project_docs_regex.sub('\n', text)

text = text.replace("const [res, skillsRes, docsRes, learningRes]", "const [res, skillsRes, learningRes]")

with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

with open('src/components/student/StudentProjectsTab.tsx', 'r') as f:
    text = f.read()

text = re.sub(r'const handleUploadProjectDoc = async.*?finally \{\s*setSubmitting\(false\);\s*\}\s*\};', '', text, flags=re.DOTALL)
text = text.replace('setActiveProjectId(null);', '')
text = text.replace('setDocForm({ title: \'\', description: \'\' });', '')
text = text.replace('setShowDocModal(false);', '')

with open('src/components/student/StudentProjectsTab.tsx', 'w') as f:
    f.write(text)

