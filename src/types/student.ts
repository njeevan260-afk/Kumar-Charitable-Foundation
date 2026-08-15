export interface StudentProfile {
  id: string;
  email: string;
  full_name: string;
  mobile_number?: string;
  college_name?: string;
  course?: string;
  branch?: string;
  current_semester?: string;
  role: 'student' | 'admin';
  status?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export type ScoreType = 'SGPA' | 'CGPA' | 'Percentage' | 'Other';

export interface AcademicRecord {
  id: string;
  user_id: string;
  student_id?: string;
  semester: string;
  academic_year: string;
  score_type: ScoreType;
  score: string;
  remarks?: string;
  created_at?: string;
  updated_at?: string;
}

export type DocumentType =
  | 'Marks Card'
  | 'Result'
  | 'Internal Assessment'
  | 'Academic Certificate'
  | 'Other'
  | string;

export interface AcademicDocument {
  id: string;
  user_id: string;
  student_id?: string;
  academic_record_id?: string;
  semester: string;
  document_type: DocumentType;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  uploaded_at: string;
}

export interface EnglishLearningSummary {
  id: string;
  user_id: string;
  student_id?: string;
  summary: string;
  entry_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at?: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  student_id?: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type?: 'announcement' | 'academic' | 'general';
}

export interface StudentProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  project_link: string;
  admin_feedback?: string;
  admin_rating?: number;
  status: 'pending' | 'reviewed';
  created_at: string;
  updated_at?: string;
}

