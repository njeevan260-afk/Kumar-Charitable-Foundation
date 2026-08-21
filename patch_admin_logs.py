import re

with open('src/components/admin/AdminLogsTab.tsx', 'r') as f:
    text = f.read()

# ViewMode
text = text.replace(" | 'project-docs'", "")

# States
text = re.sub(r'const \[projectDocs, setProjectDocs\] = useState<EnrichedProjectDocument\[\]>\(\[\]\);\n', '', text)

# Fetches
fetch_regex = re.compile(r',\s*supabase\.from\(\'student_project_documents\'\)\.select\(\'\*\'\)\.order\(\'created_at\', \{ ascending: false \}\)')
text = fetch_regex.sub('', text)

raw_docs_regex = re.compile(r'const rawDocs: StudentProjectDocument\[\] = docsRes\.data \|\| \[\];\n')
text = raw_docs_regex.sub('', text)

set_docs_regex = re.compile(r'setProjectDocs\(rawDocs\.map\(doc => \(\{ \.\.\.doc, student: students\.find\(s => s\.id === doc\.user_id\) \}\)\)\);\n')
text = set_docs_regex.sub('', text)

prom_regex = re.compile(r'const \[notesRes, skillsRes, docsRes, learnRes\] = await Promise\.all\(\[')
text = prom_regex.sub('const [notesRes, skillsRes, learnRes] = await Promise.all([', text)

# Filter button
button_regex = re.compile(r'<button\s+onClick=\{\(\) => setViewMode\(\'project-docs\'\)\}.*?</button>', re.DOTALL)
text = button_regex.sub('', text)

# Other projectDocs references
text = text.replace(" + projectDocs.length", "")

# We need to remove it from combined items
combined_regex = re.compile(r'\.\.\.projectDocs\.map\(\(doc\) => \(\{\n.*?type: \'project-doc\' as const,\n.*?\n\s*\}\)\),', re.DOTALL)
text = combined_regex.sub('', text)

with open('src/components/admin/AdminLogsTab.tsx', 'w') as f:
    f.write(text)
