import re

with open('src/components/student/StudentLogsTab.tsx', 'r') as f:
    text = f.read()

# Remove handleUploadProjectDoc
upload_regex = re.compile(r'  const handleUploadProjectDoc = async \(\) => \{.*?(?=\n  const handleSaveLearningNote)', re.DOTALL)
text = upload_regex.sub('', text)

# Remove handleDeleteProjectDoc
delete_regex = re.compile(r'  const handleDeleteProjectDoc = async \(id: string, filePath: string\) => \{.*?(?=\n  const handleSaveLearningNote)', re.DOTALL)
text = delete_regex.sub('', text)

with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

