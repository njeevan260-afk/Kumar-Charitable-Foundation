INSERT INTO storage.buckets (id, name, public) VALUES ('student-documents', 'student-documents', true) ON CONFLICT DO NOTHING;
