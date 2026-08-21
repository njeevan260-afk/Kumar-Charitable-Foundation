import re

with open('src/components/student/StudentProjectsTab.tsx', 'r') as f:
    text = f.read()

button_regex = re.compile(r'<button\s+onClick=\{\(\) => \{\s*setActiveProjectId\(project\.id\);\s*setShowDocModal\(true\);\s*\}\}.*?Upload Document\s*</button>', re.DOTALL)
text = button_regex.sub('', text)

modal_regex = re.compile(r'\{\/\* UPLOAD DOCUMENT MODAL \*\/.*?\{\/\* DOCUMENT PREVIEW MODAL \*\/\}', re.DOTALL)
text = modal_regex.sub('{/* DOCUMENT PREVIEW MODAL */}', text)

with open('src/components/student/StudentProjectsTab.tsx', 'w') as f:
    f.write(text)

