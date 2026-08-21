import re

with open('src/components/auth/StudentDashboardPage.tsx', 'r') as f:
    text = f.read()

# find "const TABS ="
# add '{ id: 'student-works', label: 'Student Works', icon: Award },'

if "id: 'student-works'" not in text:
    text = re.sub(
        r"(\{ id: 'projects', label: 'Projects', icon: Briefcase \},)",
        r"\1\n  { id: 'student-works', label: 'Student Works', icon: Award },",
        text
    )

if "<StudentWorksTab />" not in text:
    text = re.sub(
        r"(\{activeTab === 'projects' && \([\s\S]*?<StudentProjectsTab />\n\s*</motion\.div>\n\s*\)\})",
        r"\1\n              {activeTab === 'student-works' && (\n                <motion.div\n                  key=\"student-works\"\n                  initial={{ opacity: 0, y: 10 }}\n                  animate={{ opacity: 1, y: 0 }}\n                  exit={{ opacity: 0, y: -10 }}\n                  transition={{ duration: 0.2 }}\n                >\n                  <StudentWorksTab />\n                </motion.div>\n              )}",
        text
    )

if "import { Award }" not in text:
    text = text.replace("import {", "import { Award,", 1)

with open('src/components/auth/StudentDashboardPage.tsx', 'w') as f:
    f.write(text)

