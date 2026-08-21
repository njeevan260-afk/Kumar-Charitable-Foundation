import re

with open('src/components/admin/AdminLogsTab.tsx', 'r') as f:
    text = f.read()

# Remove the 'project-doc' rendering block
render_doc_regex = re.compile(r'\s*// 3\. PROJECT DOCUMENT & PROMPT ARTIFACT CARD\s*if \(item\.type === \'project-doc\'\) \{.*?(?=\s*// 4\. LEARNING PROCESS)', re.DOTALL)
text = render_doc_regex.sub('', text)

# There is still one `projectDocs` usage around line 363, 398?
# Let's find projectDocs explicitly
text = text.replace("0", "0") # already replaced "projectDocs.length" with "0" earlier

with open('src/components/admin/AdminLogsTab.tsx', 'w') as f:
    f.write(text)

