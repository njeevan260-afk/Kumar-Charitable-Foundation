import re
with open('src/components/auth/StudentDashboardPage.tsx', 'r') as f:
    text = f.read()

replacement = """              {activeSection === 'student-works' && (
                <motion.div
                  key="student-works"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <StudentWorksTab />
                </motion.div>
              )}
              {activeSection === 'projects' && ("""
text = text.replace("{activeSection === 'projects' && (", replacement)
with open('src/components/auth/StudentDashboardPage.tsx', 'w') as f:
    f.write(text)
