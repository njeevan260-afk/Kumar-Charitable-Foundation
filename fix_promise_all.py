import re

with open('src/components/student/StudentLogsTab.tsx', 'r') as f:
    text = f.read()

old_fetch = """      const [notesRes, skillsRes, docsRes, learnRes] = await Promise.all([
        supabase.from('student_meeting_notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_skills_updates').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })]);"""

new_fetch = """      const [notesRes, skillsRes, learnRes] = await Promise.all([
        supabase.from('student_meeting_notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_skills_updates').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false }),
        supabase.from('student_learning_process_notes').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
      ]);"""

text = text.replace(old_fetch, new_fetch)

with open('src/components/student/StudentLogsTab.tsx', 'w') as f:
    f.write(text)

