import re

with open('src/components/admin/AdminLogsTab.tsx', 'r') as f:
    text = f.read()

text = text.replace("                  const studentDocsCount = projectDocs.filter((d) => d.user_id === st.id).length;\n", "")
text = text.replace("studentNotesCount + studentSkillsCount + studentDocsCount + studentLearnCount;", "studentNotesCount + studentSkillsCount + studentLearnCount;")

with open('src/components/admin/AdminLogsTab.tsx', 'w') as f:
    f.write(text)

