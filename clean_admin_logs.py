import re

with open('src/components/admin/AdminLogsTab.tsx', 'r') as f:
    text = f.read()

# Remove the enriched docs code
enriched_docs_regex = re.compile(r'const enrichedDocs.*?\}\)\);\n', re.DOTALL)
text = enriched_docs_regex.sub('', text)

set_project_docs_regex = re.compile(r'\s*setProjectDocs\(enrichedDocs\);\n')
text = set_project_docs_regex.sub('', text)

project_docs_merge_regex = re.compile(r'\.\.\.projectDocs,\n')
text = project_docs_merge_regex.sub('', text)

project_docs_filter_regex = re.compile(r'projectDocs\.filter\(doc => doc\.user_id === selectedStudentId\)')
text = project_docs_filter_regex.sub('[]', text)

project_docs_len1_regex = re.compile(r'\s*\+\s*projectDocs\.length')
text = project_docs_len1_regex.sub('', text)

project_docs_len2_regex = re.compile(r'\+\s*projectDocs\.length')
text = project_docs_len2_regex.sub('', text)

modal_regex = re.compile(r'\{previewDoc && \(.*?\)\}\n', re.DOTALL)
text = modal_regex.sub('', text)

# Just clean up everything that references previewDoc
rest_modal_regex = re.compile(r'\{\/\* DOCUMENT PREVIEW MODAL \*\/.*', re.DOTALL)
text = rest_modal_regex.sub('', text)

with open('src/components/admin/AdminLogsTab.tsx', 'w') as f:
    f.write(text + "\n    </div>\n  );\n};\n")

