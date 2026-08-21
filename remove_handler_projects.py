import re

with open('src/components/student/StudentProjectsTab.tsx', 'r') as f:
    text = f.read()

handler_regex = re.compile(r'  const handleUploadProjectDoc = async \(\) => \{.*?(?=\n  const handleDeleteProjectDoc)', re.DOTALL)
text = handler_regex.sub('', text)

with open('src/components/student/StudentProjectsTab.tsx', 'w') as f:
    f.write(text)

