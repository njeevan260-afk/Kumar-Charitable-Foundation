import re

with open('src/components/auth/AdminDashboardPage.tsx', 'r') as f:
    text = f.read()

if "'student-works'" not in text:
    text = text.replace("  | 'projects'\n  | 'logs'", "  | 'projects'\n  | 'student-works'\n  | 'logs'")
    
if "StudentWorksTab" not in text:
    text = text.replace("import { AdminLogsTab } from '../admin/AdminLogsTab';", "import { AdminLogsTab } from '../admin/AdminLogsTab';\nimport { StudentWorksTab } from '../student/StudentWorksTab';")

nav_regex = re.compile(r'(\{ id: \'projects\', label: \'My Projects\', icon: Briefcase \},)')
text = nav_regex.sub(r"\1\n    { id: 'student-works', label: 'Student Works', icon: Award },", text)

if "import { Award" not in text:
    text = text.replace("Briefcase,", "Briefcase,\n  Award,")
    
render_regex = re.compile(r'(\{\s*activeSection === \'projects\' && <AdminProjectsTab />\s*\})')
text = render_regex.sub(r"\1\n        {activeSection === 'student-works' && <StudentWorksTab />}", text)

with open('src/components/auth/AdminDashboardPage.tsx', 'w') as f:
    f.write(text)
