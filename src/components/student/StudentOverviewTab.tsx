import React from 'react';
import { StudentProfile, AcademicRecord, AcademicDocument, EnglishLearningSummary } from '../../types/student';
import { User, BookOpen, UploadCloud, Sparkles, ArrowRight, GraduationCap, Building2, Layers, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface StudentOverviewTabProps {
  profile: StudentProfile | null;
  academicRecords: AcademicRecord[];
  documents: AcademicDocument[];
  englishSummaries: EnglishLearningSummary[];
  onNavigateTab: (tabId: string) => void;
}

export const StudentOverviewTab: React.FC<StudentOverviewTabProps> = ({
  profile,
  academicRecords,
  documents,
  englishSummaries,
  onNavigateTab,
}) => {
  const displayName = profile?.full_name || 'Student';
  const collegeName = profile?.college_name || profile?.metadata?.college_name;
  const course = profile?.course || profile?.metadata?.course;
  const branch = profile?.branch || profile?.metadata?.branch;
  const currentSemester = profile?.current_semester || profile?.metadata?.current_semester;

  const isProfileComplete = Boolean(collegeName && course && branch && currentSemester);

  // Real summary metrics for current month
  const currentYearMonth = new Date().toISOString().slice(0, 7);
  const thisMonthSummariesCount = englishSummaries.filter(s => s.entry_date.startsWith(currentYearMonth)).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1e40af] text-white p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 mb-3 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Active Scholar Account
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-white mb-2">
            Welcome back, {displayName}
          </h1>
          <p className="text-blue-100 text-sm md:text-base leading-relaxed">
            Track your semester progress, upload academic documentation, and log your daily English Companion summaries.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Academic Profile Snapshot */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#E8DED0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F3EFE9]">
          <div>
            <h2 className="text-lg md:text-xl font-serif text-[#1F2937] font-bold">Academic Overview</h2>
            <p className="text-xs text-[#737373] mt-0.5">Your registered program and institution details</p>
          </div>
          {!isProfileComplete && (
            <button
              onClick={() => onNavigateTab('profile')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E3A8A] hover:underline"
            >
              Complete your profile
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#E8DED0]">
            <div className="flex items-center gap-2.5 text-[#A09080] mb-2">
              <Building2 className="w-4 h-4 text-[#1E3A8A]" />
              <span className="text-xs uppercase font-bold tracking-wider">College Name</span>
            </div>
            <p className="text-sm font-semibold text-[#1F2937] truncate" title={collegeName || 'Not updated'}>
              {collegeName || <span className="text-[#A09080] font-normal italic">Not updated</span>}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#E8DED0]">
            <div className="flex items-center gap-2.5 text-[#A09080] mb-2">
              <GraduationCap className="w-4 h-4 text-[#1E3A8A]" />
              <span className="text-xs uppercase font-bold tracking-wider">Current Course</span>
            </div>
            <p className="text-sm font-semibold text-[#1F2937] truncate" title={course || 'Not updated'}>
              {course || <span className="text-[#A09080] font-normal italic">Not updated</span>}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#E8DED0]">
            <div className="flex items-center gap-2.5 text-[#A09080] mb-2">
              <Layers className="w-4 h-4 text-[#1E3A8A]" />
              <span className="text-xs uppercase font-bold tracking-wider">Branch / Stream</span>
            </div>
            <p className="text-sm font-semibold text-[#1F2937] truncate" title={branch || 'Not updated'}>
              {branch || <span className="text-[#A09080] font-normal italic">Not updated</span>}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FFFDF8] border border-[#E8DED0]">
            <div className="flex items-center gap-2.5 text-[#A09080] mb-2">
              <Calendar className="w-4 h-4 text-[#1E3A8A]" />
              <span className="text-xs uppercase font-bold tracking-wider">Current Semester</span>
            </div>
            <p className="text-sm font-semibold text-[#1F2937] truncate" title={currentSemester || 'Not updated'}>
              {currentSemester || <span className="text-[#A09080] font-normal italic">Not updated</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Useful Quick Actions */}
      <div>
        <h2 className="text-lg md:text-xl font-serif text-[#1F2937] font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigateTab('profile')}
            className="flex items-start gap-4 p-5 bg-white border border-[#E8DED0] hover:border-[#1E3A8A] hover:bg-[#FFFDF8] rounded-2xl transition-all text-left shadow-xs hover:shadow-sm group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E3A8A] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2937] group-hover:text-[#1E3A8A] transition-colors">
                Update Profile
              </h3>
              <p className="text-xs text-[#737373] mt-1">Manage personal and academic institution info</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('academic')}
            className="flex items-start gap-4 p-5 bg-white border border-[#E8DED0] hover:border-[#1E3A8A] hover:bg-[#FFFDF8] rounded-2xl transition-all text-left shadow-xs hover:shadow-sm group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2937] group-hover:text-[#1E3A8A] transition-colors">
                Add Academic Record
              </h3>
              <p className="text-xs text-[#737373] mt-1">Enter semester scores, SGPA, or percentages</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('documents')}
            className="flex items-start gap-4 p-5 bg-white border border-[#E8DED0] hover:border-[#1E3A8A] hover:bg-[#FFFDF8] rounded-2xl transition-all text-left shadow-xs hover:shadow-sm group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2937] group-hover:text-[#1E3A8A] transition-colors">
                Upload Marks Report
              </h3>
              <p className="text-xs text-[#737373] mt-1">Submit marks cards, certificates, and results</p>
            </div>
          </button>

          <button
            onClick={() => onNavigateTab('english')}
            className="flex items-start gap-4 p-5 bg-white border border-[#E8DED0] hover:border-[#1E3A8A] hover:bg-[#FFFDF8] rounded-2xl transition-all text-left shadow-xs hover:shadow-sm group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2937] group-hover:text-[#1E3A8A] transition-colors">
                English Companion
              </h3>
              <p className="text-xs text-[#737373] mt-1">Practice speaking & record daily summaries</p>
            </div>
          </button>
        </div>
      </div>

      {/* Real Verified Student Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#A09080] uppercase tracking-wider">Academic Records</span>
            <BookOpen className="w-4 h-4 text-[#1E3A8A]" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1F2937]">{academicRecords.length}</p>
          <p className="text-xs text-[#737373] mt-1">
            {academicRecords.length === 0 ? 'No semester records added yet' : `${academicRecords.length} semester record(s) logged`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#A09080] uppercase tracking-wider">Uploaded Documents</span>
            <UploadCloud className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1F2937]">{documents.length}</p>
          <p className="text-xs text-[#737373] mt-1">
            {documents.length === 0 ? 'No files uploaded yet' : `${documents.length} document(s) securely stored`}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#A09080] uppercase tracking-wider">English Summaries (This Month)</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-serif font-bold text-[#1F2937]">{thisMonthSummariesCount}</p>
          <p className="text-xs text-[#737373] mt-1">
            {thisMonthSummariesCount === 0 ? 'No summaries logged this month' : `${thisMonthSummariesCount} day(s) practiced`}
          </p>
        </div>
      </div>
    </div>
  );
};
