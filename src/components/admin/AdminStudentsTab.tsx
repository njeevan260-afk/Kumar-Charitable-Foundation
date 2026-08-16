import React, { useState, useMemo } from 'react';
import { StudentProfile, AcademicRecord, AcademicDocument, EnglishLearningSummary } from '../../types/student';
import {
  Search,
  Filter,
  Users,
  Eye,
  GraduationCap,
  Mail,
  Phone,
  BookOpen,
  FileText,
  Sparkles,
  X,
  Building,
} from 'lucide-react';

interface AdminStudentsTabProps {
  students: StudentProfile[];
  academicRecords: AcademicRecord[];
  documents: AcademicDocument[];
  englishSummaries: EnglishLearningSummary[];
  onSelectStudent: (student: StudentProfile) => void;
}

export const AdminStudentsTab: React.FC<AdminStudentsTabProps> = ({
  students,
  academicRecords,
  documents,
  englishSummaries,
  onSelectStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('ALL');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedSemester, setSelectedSemester] = useState('ALL');

  // Extract unique filter options from real data
  const colleges = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.college_name && set.add(s.college_name));
    return Array.from(set).sort();
  }, [students]);

  const courses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.course && set.add(s.course));
    return Array.from(set).sort();
  }, [students]);

  const branches = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.branch && set.add(s.branch));
    return Array.from(set).sort();
  }, [students]);

  const semesters = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.current_semester && set.add(s.current_semester));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      // Search term matching
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        (s.full_name && s.full_name.toLowerCase().includes(term)) ||
        (s.email && s.email.toLowerCase().includes(term)) ||
        (s.mobile_number && s.mobile_number.includes(term)) ||
        (s.college_name && s.college_name.toLowerCase().includes(term)) ||
        (s.course && s.course.toLowerCase().includes(term));

      if (!matchSearch) return false;

      // Filter matching
      if (selectedCollege !== 'ALL' && s.college_name !== selectedCollege) return false;
      if (selectedCourse !== 'ALL' && s.course !== selectedCourse) return false;
      if (selectedBranch !== 'ALL' && s.branch !== selectedBranch) return false;
      if (selectedSemester !== 'ALL' && s.current_semester !== selectedSemester) return false;

      return true;
    });
  }, [students, searchTerm, selectedCollege, selectedCourse, selectedBranch, selectedSemester]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCollege('ALL');
    setSelectedCourse('ALL');
    setSelectedBranch('ALL');
    setSelectedSemester('ALL');
  };

  const hasActiveFilters =
    searchTerm || selectedCollege !== 'ALL' || selectedCourse !== 'ALL' || selectedBranch !== 'ALL' || selectedSemester !== 'ALL';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Title and Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E8DED0]">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1F2937]">Students Directory</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Showing {filteredStudents.length} of {students.length} registered students
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#A09080] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, college..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DED0] focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] rounded-xl text-xs text-[#1F2937] transition-all outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09080] hover:text-[#1F2937]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Bars */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DED0] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1F2937] uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-[#1E3A8A]" />
            Filter Students
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#1E3A8A] hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* College Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#A09080] uppercase mb-1">College</label>
            <select
              value={selectedCollege}
              onChange={(e) => setSelectedCollege(e.target.value)}
              className="w-full py-2 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none cursor-pointer focus:border-[#1E3A8A]"
            >
              <option value="ALL">All Colleges ({colleges.length})</option>
              {colleges.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Course Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#A09080] uppercase mb-1">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full py-2 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none cursor-pointer focus:border-[#1E3A8A]"
            >
              <option value="ALL">All Courses ({courses.length})</option>
              {courses.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#A09080] uppercase mb-1">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full py-2 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none cursor-pointer focus:border-[#1E3A8A]"
            >
              <option value="ALL">All Branches ({branches.length})</option>
              {branches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#A09080] uppercase mb-1">Current Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full py-2 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none cursor-pointer focus:border-[#1E3A8A]"
            >
              <option value="ALL">All Semesters ({semesters.length})</option>
              {semesters.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table / Grid */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#E8DED0]">
          <Users className="w-12 h-12 text-[#A09080] mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold text-[#1F2937]">No Students Match Criteria</p>
          <p className="text-xs text-[#737373] mt-1">Try adjusting search terms or clearing active filters.</p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-[#1E3A8A] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DED0] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF8] border-b border-[#E8DED0] text-[11px] font-bold text-[#A09080] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">College & Course</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Submissions</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EFE9] text-xs text-[#1F2937]">
                {filteredStudents.map((st) => {
                  const recCount = academicRecords.filter((r) => r.user_id === st.id).length;
                  const docCount = documents.filter((d) => d.user_id === st.id).length;
                  const engCount = englishSummaries.filter((s) => s.user_id === st.id).length;

                  return (
                    <tr
                      key={st.id}
                      onClick={() => onSelectStudent(st)}
                      className="hover:bg-[#FFFDF8] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {st.full_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-[#1F2937]">{st.full_name || 'Unnamed Student'}</p>
                            <p className="text-[11px] text-[#737373]">{st.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#1F2937]">{st.college_name || 'Not provided'}</p>
                        <p className="text-[11px] text-[#737373]">
                          {st.course || 'Course N/A'} {st.branch ? `• ${st.branch}` : ''}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 bg-[#1E3A8A]/10 text-[#1E3A8A] font-bold rounded-lg text-[11px]">
                          {st.current_semester || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[11px] text-[#737373]">
                        {st.mobile_number ? (
                          <div className="flex items-center gap-1 text-[#1F2937] font-medium">
                            <Phone className="w-3 h-3 text-[#A09080]" />
                            {st.mobile_number}
                          </div>
                        ) : (
                          <span className="text-[#A09080] italic">No phone</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2 text-[11px] font-semibold">
                          <span className="flex items-center gap-1 text-[#9C7A4A]" title="Academic Records">
                            <BookOpen className="w-3 h-3" />
                            {recCount}
                          </span>
                          <span className="text-[#E8DED0]">•</span>
                          <span className="flex items-center gap-1 text-blue-600" title="Uploaded Documents">
                            <FileText className="w-3 h-3" />
                            {docCount}
                          </span>
                          <span className="text-[#E8DED0]">•</span>
                          <span className="flex items-center gap-1 text-[#1E3A8A]" title="English Summaries">
                            <Sparkles className="w-3 h-3" />
                            {engCount}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(st);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#FFFDF8] hover:bg-[#1E3A8A] hover:text-white border border-[#E8DED0] text-[#1E3A8A] rounded-lg font-bold text-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
