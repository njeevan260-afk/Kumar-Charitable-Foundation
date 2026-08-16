import React from 'react';
import { StudentProfile, AcademicRecord, AcademicDocument, EnglishLearningSummary } from '../../types/student';
import {
  Users,
  BookOpen,
  FileText,
  Sparkles,
  Clock,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Calendar,
  ArrowUpRight,
} from 'lucide-react';

interface AdminOverviewTabProps {
  students: StudentProfile[];
  academicRecords: AcademicRecord[];
  documents: AcademicDocument[];
  englishSummaries: EnglishLearningSummary[];
  onNavigateTab: (tab: any) => void;
  onSelectStudent: (student: StudentProfile) => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  students,
  academicRecords,
  documents,
  englishSummaries,
  onNavigateTab,
  onSelectStudent,
}) => {
  // Compute Real Statistics
  const totalStudents = students.length;
  const totalAcademicRecords = academicRecords.length;
  const totalDocuments = documents.length;
  const totalEnglishSummaries = englishSummaries.length;

  // Real recent student activities derived from database entries
  interface ActivityItem {
    id: string;
    type: 'document' | 'academic' | 'english';
    studentName: string;
    studentId: string;
    description: string;
    timestamp: string;
  }

  const activities: ActivityItem[] = [];

  // Add recent documents
  documents.slice(0, 10).forEach((doc) => {
    const student = students.find((s) => s.id === doc.user_id);
    activities.push({
      id: `doc-${doc.id}`,
      type: 'document',
      studentName: student?.full_name || 'Student',
      studentId: doc.user_id,
      description: `Uploaded ${doc.document_type} for ${doc.semester} (${doc.file_name})`,
      timestamp: doc.uploaded_at,
    });
  });

  // Add recent academic records
  academicRecords.slice(0, 10).forEach((rec) => {
    const student = students.find((s) => s.id === rec.user_id);
    activities.push({
      id: `rec-${rec.id}`,
      type: 'academic',
      studentName: student?.full_name || 'Student',
      studentId: rec.user_id,
      description: `Added ${rec.semester} record (${rec.score_type}: ${rec.score})`,
      timestamp: rec.updated_at || rec.created_at || '',
    });
  });

  // Add recent English summaries
  englishSummaries.slice(0, 10).forEach((sum) => {
    const student = students.find((s) => s.id === sum.user_id);
    activities.push({
      id: `sum-${sum.id}`,
      type: 'english',
      studentName: student?.full_name || 'Student',
      studentId: sum.user_id,
      description: `Submitted English summary for ${sum.entry_date}`,
      timestamp: sum.created_at,
    });
  });

  // Sort activities by timestamp descending
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const recentActivities = activities.slice(0, 8);

  const formatActivityTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white p-6 rounded-2xl border border-[#E8DED0] hover:border-[#1E3A8A] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#A09080] group-hover:text-[#1E3A8A] transition-colors" />
          </div>
          <p className="text-xs uppercase font-bold tracking-wider text-[#A09080] mb-1">Total Students</p>
          <h3 className="text-3xl font-serif font-bold text-[#1F2937]">{totalStudents}</h3>
          <p className="text-xs text-[#737373] mt-2 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-green-600" />
            Registered Student Profiles
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('academic-records')}
          className="bg-white p-6 rounded-2xl border border-[#E8DED0] hover:border-[#1E3A8A] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#C5A880]/15 text-[#9C7A4A] flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#A09080] group-hover:text-[#1E3A8A] transition-colors" />
          </div>
          <p className="text-xs uppercase font-bold tracking-wider text-[#A09080] mb-1">Academic Records</p>
          <h3 className="text-3xl font-serif font-bold text-[#1F2937]">{totalAcademicRecords}</h3>
          <p className="text-xs text-[#737373] mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#9C7A4A]" />
            Semester Scores & Performance
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('documents')}
          className="bg-white p-6 rounded-2xl border border-[#E8DED0] hover:border-[#1E3A8A] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#A09080] group-hover:text-[#1E3A8A] transition-colors" />
          </div>
          <p className="text-xs uppercase font-bold tracking-wider text-[#A09080] mb-1">Uploaded Documents</p>
          <h3 className="text-3xl font-serif font-bold text-[#1F2937]">{totalDocuments}</h3>
          <p className="text-xs text-[#737373] mt-2 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Marks Cards & Certificates
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('english-progress')}
          className="bg-white p-6 rounded-2xl border border-[#E8DED0] hover:border-[#1E3A8A] shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#A09080] group-hover:text-[#1E3A8A] transition-colors" />
          </div>
          <p className="text-xs uppercase font-bold tracking-wider text-[#A09080] mb-1">English Summaries</p>
          <h3 className="text-3xl font-serif font-bold text-[#1F2937]">{totalEnglishSummaries}</h3>
          <p className="text-xs text-[#737373] mt-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Daily Learning Reflections
          </p>
        </div>
      </div>

      {/* Main Split: Recent Activity & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Real Recent Student Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8DED0] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#F3EFE9]">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="text-lg font-serif font-bold text-[#1F2937]">Recent Student Activity</h2>
            </div>
            <span className="text-xs text-[#A09080] font-medium">Live database events</span>
          </div>

          {recentActivities.length === 0 ? (
            <div className="py-12 text-center text-[#737373]">
              <Clock className="w-10 h-10 text-[#A09080] mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-[#1F2937]">No Recent Activity</p>
              <p className="text-xs text-[#737373] mt-1">Student submissions and document uploads will appear here in real-time.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start justify-between gap-4 p-3.5 bg-[#FFFDF8] hover:bg-[#F9F6F0] rounded-xl border border-[#F3EFE9] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        act.type === 'document'
                          ? 'bg-blue-100 text-blue-700'
                          : act.type === 'academic'
                          ? 'bg-[#C5A880]/20 text-[#9C7A4A]'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {act.type === 'document' ? (
                        <FileText className="w-4 h-4" />
                      ) : act.type === 'academic' ? (
                        <BookOpen className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1F2937]">
                        {act.studentName}
                      </p>
                      <p className="text-xs text-[#4F4F4F] mt-0.5">{act.description}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#A09080] whitespace-nowrap font-medium flex-shrink-0">
                    {formatActivityTime(act.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Administration Actions & Registered Students summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8DED0] p-6 shadow-xs">
            <h2 className="text-base font-serif font-bold text-[#1F2937] mb-4">Quick Management</h2>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateTab('students')}
                className="w-full flex items-center justify-between p-3 bg-[#FFFDF8] hover:bg-[#F3EFE9] rounded-xl border border-[#E8DED0] text-left text-sm font-semibold text-[#1F2937] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-[#1E3A8A]" />
                  Search & Filter Students
                </span>
                <ChevronRight className="w-4 h-4 text-[#A09080]" />
              </button>

              <button
                onClick={() => onNavigateTab('documents')}
                className="w-full flex items-center justify-between p-3 bg-[#FFFDF8] hover:bg-[#F3EFE9] rounded-xl border border-[#E8DED0] text-left text-sm font-semibold text-[#1F2937] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#1E3A8A]" />
                  Review Academic Documents
                </span>
                <ChevronRight className="w-4 h-4 text-[#A09080]" />
              </button>

              <button
                onClick={() => onNavigateTab('logs')}
                className="w-full flex items-center justify-between p-3 bg-[#FFFDF8] hover:bg-[#F3EFE9] rounded-xl border border-[#E8DED0] text-left text-sm font-semibold text-[#1F2937] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-[#1E3A8A]" />
                  Review Logs & Reflections
                </span>
                <ChevronRight className="w-4 h-4 text-[#A09080]" />
              </button>

              <button
                onClick={() => onNavigateTab('english-progress')}
                className="w-full flex items-center justify-between p-3 bg-[#FFFDF8] hover:bg-[#F3EFE9] rounded-xl border border-[#E8DED0] text-left text-sm font-semibold text-[#1F2937] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                  View English Reflections
                </span>
                <ChevronRight className="w-4 h-4 text-[#A09080]" />
              </button>

              <button
                onClick={() => onNavigateTab('notifications')}
                className="w-full flex items-center justify-between p-3 bg-[#FFFDF8] hover:bg-[#F3EFE9] rounded-xl border border-[#E8DED0] text-left text-sm font-semibold text-[#1F2937] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#1E3A8A]" />
                  Send Student Notification
                </span>
                <ChevronRight className="w-4 h-4 text-[#A09080]" />
              </button>
            </div>
          </div>

          {/* Latest Registered Students */}
          <div className="bg-white rounded-2xl border border-[#E8DED0] p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-serif font-bold text-[#1F2937]">Registered Students</h2>
              <button
                onClick={() => onNavigateTab('students')}
                className="text-xs text-[#1E3A8A] hover:underline font-semibold cursor-pointer"
              >
                View All
              </button>
            </div>

            {students.length === 0 ? (
              <p className="text-xs text-[#737373] text-center py-4">No students registered yet.</p>
            ) : (
              <div className="space-y-3">
                {students.slice(0, 4).map((st) => (
                  <div
                    key={st.id}
                    onClick={() => onSelectStudent(st)}
                    className="flex items-center justify-between p-2.5 hover:bg-[#FFFDF8] rounded-xl border border-transparent hover:border-[#E8DED0] transition-colors cursor-pointer"
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="text-xs font-bold text-[#1F2937] truncate">{st.full_name}</p>
                      <p className="text-[11px] text-[#737373] truncate">
                        {st.course ? `${st.course} • ${st.college_name || 'College'}` : st.email}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold rounded-full flex-shrink-0">
                      {st.current_semester || 'Active'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
