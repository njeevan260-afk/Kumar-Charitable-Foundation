import re

with open('src/components/student/StudentProjectsTab.tsx', 'r') as f:
    text = f.read()

text = re.sub(r'\s*const \[showDocModal.*?;\n', '\n', text)
text = re.sub(r'\s*const \[docForm.*?;\n', '\n', text)
text = re.sub(r'\s*const \[activeProjectId.*?;\n', '\n', text)

with open('src/components/student/StudentProjectsTab.tsx', 'w') as f:
    f.write(text)

with open('src/components/student/StudentLogsTab.tsx', 'r') as f:
    text = f.read()

text = re.sub(r'\s*const \[showDocModal.*?;\n', '\n', text)
text = re.sub(r'\s*const \[docForm.*?;\n', '\n', text)
text = re.sub(r'\s*const \[selectedDocFile.*?;\n', '\n', text)
text = re.sub(r'\s*const \[activeProjectId.*?;\n', '\n', text)
text = re.sub(r'\s*const \[projectDocs.*?;\n', '\n', text)

with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

