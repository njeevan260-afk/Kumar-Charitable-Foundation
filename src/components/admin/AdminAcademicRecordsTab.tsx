import React, { useState, useMemo } from 'react';
import { AcademicRecord, StudentProfile } from '../../types/student';
import {
  Search,
  BookOpen,
  Filter,
  User,
  Calendar,
  Award,
  X,
  TrendingUp,
} from 'lucide-react';

interface AdminAcademicRecordsTabProps {
  records: AcademicRecord[];
  students: StudentProfile[];
  onSelectStudent: (student: StudentProfile) => void;
}

export const AdminAcademicRecordsTab: React.FC<AdminAcademicRecordsTabProps> = ({
  records,
  students,
  onSelectStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('ALL');
  const [selectedScoreType, setSelectedScoreType] = useState('ALL');

  // Unique semesters from real records
  const semesters = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.semester && set.add(r.semester));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [records]);

  // Unique score types
  const scoreTypes = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => r.score_type && set.add(r.score_type));
    return Array.from(set).sort();
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const student = students.find((s) => s.id === r.user_id);
      const studentName = student?.full_name?.toLowerCase() || '';
      const studentEmail = student?.email?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();

      const matchesSearch =
        !term ||
        studentName.includes(term) ||
        studentEmail.includes(term) ||
        r.semester.toLowerCase().includes(term) ||
        r.score.toLowerCase().includes(term) ||
        r.academic_year.toLowerCase().includes(term) ||
        (r.remarks && r.remarks.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      if (selectedSemester !== 'ALL' && r.semester !== selectedSemester) return false;
      if (selectedScoreType !== 'ALL' && r.score_type !== selectedScoreType) return false;

      return true;
    });
  }, [records, students, searchTerm, selectedSemester, selectedScoreType]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSemester('ALL');
    setSelectedScoreType('ALL');
  };

  const hasActiveFilters = searchTerm || selectedSemester !== 'ALL' || selectedScoreType !== 'ALL';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E8DED0]">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1F2937]">Academic Performance Records</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Showing {filteredRecords.length} of {records.length} semester records
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#A09080] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student, score, semester..."
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

      {/* Filter Options */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DED0] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1F2937]">
            <Filter className="w-3.5 h-3.5 text-[#1E3A8A]" />
            Filters:
          </div>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="py-1.5 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none cursor-pointer focus:border-[#1E3A8A]"
          >
            <option value="ALL">All Semesters ({semesters.length})</option>
            {semesters.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedScoreType}
            onChange={(e) => setSelectedScoreType(e.target.value)}
            className="py-1.5 px-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-xs text-[#1F2937] outline-none cursor-pointer focus:border-[#1E3A8A]"
          >
            <option value="ALL">All Score Types ({scoreTypes.length})</option>
            {scoreTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
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

      {/* Records Table */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-[#E8DED0]">
          <BookOpen className="w-12 h-12 text-[#A09080] mx-auto mb-3 opacity-40" />
          <p className="text-base font-bold text-[#1F2937]">No Academic Records Found</p>
          <p className="text-xs text-[#737373] mt-1">Adjust search keywords or clear active filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DED0] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF8] border-b border-[#E8DED0] text-[11px] font-bold text-[#A09080] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Academic Year</th>
                  <th className="py-3.5 px-4">Score Type</th>
                  <th className="py-3.5 px-4">Score / Grade</th>
                  <th className="py-3.5 px-4">Remarks</th>
                  <th className="py-3.5 px-4 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EFE9] text-xs text-[#1F2937]">
                {filteredRecords.map((rec) => {
                  const student = students.find((s) => s.id === rec.user_id);

                  return (
                    <tr
                      key={rec.id}
                      onClick={() => student && onSelectStudent(student)}
                      className="hover:bg-[#FFFDF8] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] flex items-center justify-center font-bold text-xs">
                            {student?.full_name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-bold text-[#1F2937] hover:text-[#1E3A8A] transition-colors">
                              {student?.full_name || 'Student'}
                            </p>
                            <p className="text-[11px] text-[#737373]">{student?.email || rec.user_id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#1F2937]">
                        <span className="whitespace-nowrap px-3 py-1 bg-[#F8F5F0] rounded-xl border border-[#E8DED0]">
                          {rec.semester}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#4F4F4F]">
                        {rec.academic_year || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-bold text-[#A09080] uppercase">
                          {rec.score_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-sm font-bold text-[#1E3A8A]">
                          {rec.score}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#737373] max-w-xs truncate">
                        {rec.remarks || <span className="text-[#A09080] italic">None</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[11px] text-[#A09080]">
                        {rec.created_at ? new Date(rec.created_at).toLocaleDateString() : 'N/A'}
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
