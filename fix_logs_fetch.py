import re

with open('src/components/student/StudentLogsTab.tsx', 'r') as f:
    text = f.read()

old_fetch = """      const [notesRes, skillsRes, docsRes, learnRes] = await Promise.all([
        supabase.from('student_meeting_notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_skills_updates').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })]);
      
      if (notesRes.data) setMeetingNotes(notesRes.data as StudentMeetingNote[]);
      if (skillsRes.data) setSkillUpdates(skillsRes.data as StudentSkillUpdate[]);
      
      if (learnRes.data) setLearningNotes(learnRes.data as StudentLearningProcessNote[]);"""

new_fetch = """      const [notesRes, skillsRes, learnRes] = await Promise.all([
        supabase.from('student_meeting_notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_skills_updates').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_learning_process').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      ]);
      
      if (notesRes.data) setMeetingNotes(notesRes.data as StudentMeetingNote[]);
      if (skillsRes.data) setSkillUpdates(skillsRes.data as StudentSkillUpdate[]);
      if (learnRes.data) setLearningNotes(learnRes.data as StudentLearningProcessNote[]);"""

text = text.replace(old_fetch, new_fetch)

# Also remove handleFileSelection and its unused states if they are still there
handler_regex = re.compile(r'  const handleFileSelection = \(e: React.ChangeEvent<HTMLInputElement>\) => \{.*?\n  \};\n', re.DOTALL)
text = handler_regex.sub('', text)

with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

