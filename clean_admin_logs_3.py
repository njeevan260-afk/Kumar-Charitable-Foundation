import re

with open('src/components/admin/AdminLogsTab.tsx', 'r') as f:
    text = f.read()

# 224: filteredProjectDocs
filter_docs_loop_regex = re.compile(r'\s*filteredProjectDocs\.forEach\(\(doc\) => \{\n.*?\}\);\n', re.DOTALL)
text = filter_docs_loop_regex.sub('', text)

# 245: timelineItems deps
text = text.replace(", filteredProjectDocs", "")

# 363, 398, etc: projectDocs.length
text = text.replace(" + projectDocs.length", "")
text = text.replace("projectDocs.length", "0")

# 470, 553: filteredProjectDocs.length
text = text.replace(" + filteredProjectDocs.length", "")
text = text.replace(" • {filteredProjectDocs.length} Docs", "")

# 830: item.type === 'project-doc'
render_doc_regex = re.compile(r'\{\s*item\.type === \'project-doc\' && \(.*?\)\s*\}\n', re.DOTALL)
text = render_doc_regex.sub('', text)

with open('src/components/admin/AdminLogsTab.tsx', 'w') as f:
    f.write(text)

