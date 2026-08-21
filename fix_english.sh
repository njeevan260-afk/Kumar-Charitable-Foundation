cat << 'INNER_EOF' > src/components/admin/AdminEnglishProgressTab.tsx
import React, { useState, useMemo } from 'react';
import { EnglishLearningSummary, StudentProfile } from '../../types/student';
import {
  Sparkles,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  User,
  BookOpen,
  Search,
  Clock,
  Flame,
  CheckCircle2,
  FileText,
  Building2,
  GraduationCap,
  X
} from 'lucide-react';

interface AdminEnglishProgressTabProps {
  summaries: EnglishLearningSummary[];
  students: StudentProfile[];
  onSelectStudentProfile?: (student: StudentProfile) => void;
}

export const AdminEnglishProgressTab: React.FC<AdminEnglishProgressTabProps> = ({
  summaries,
  students,
}) => {
  // Currently selected student ID
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null;
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Summaries for this selected student
  const studentSummaries = useMemo(() => {
    if (!selectedStudentId) return [];
    return summaries.filter((s) => s.user_id === selectedStudentId);
  }, [summaries, selectedStudentId]);

  // Map of date string -> summary
  const summariesByDate = useMemo(() => {
    const map = new Map<string, EnglishLearningSummary>();
    studentSummaries.forEach((s) => {
      map.set(s.entry_date, s);
    });
    return map;
  }, [studentSummaries]);

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const currentYearMonth = \`\${year}-\${String(month + 1).padStart(2, '0')}\`;
  const thisMonthSummaries = studentSummaries.filter((s) => s.entry_date.startsWith(currentYearMonth));
  
  // Selected date summary
  const selectedSummary = summariesByDate.get(selectedDateStr);

  // Students list filtered by search
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students;
    const term = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(term) ||
        s.email?.toLowerCase().includes(term) ||
        s.college_name?.toLowerCase().includes(term)
    );
  }, [students, studentSearch]);

  const studentSummaryCounts = useMemo(() => {
    return filteredStudents.map(student => {
      const studentSums = summaries.filter(s => s.user_id === student.id);
      const count = studentSums.length;
      const latest = studentSums.sort((a, b) => b.entry_date.localeCompare(a.entry_date))[0]?.entry_date;
      return { student, count, latest };
    }).sort((a, b) => {
        const nameA = a.student.full_name || '';
        const nameB = b.student.full_name || '';
        return nameA.localeCompare(nameB);
    });
  }, [filteredStudents, summaries]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E8DED0]">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1F2937]">English Companion Progress</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            {selectedStudent 
              ? \`Reviewing English progress for \${selectedStudent.full_name}\`
              : 'Review student daily learning reflections, streaks, and monthly progress'
            }
          </p>
        </div>

        {!selectedStudentId ? (
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#A09080] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or college..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E8DED0] focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] rounded-xl text-xs text-[#1F2937] transition-all outline-none"
            />
            {studentSearch && (
              <button
                onClick={() => setStudentSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09080] hover:text-[#1F2937]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSelectedStudentId(null)}
            className="px-4 py-2 bg-white border border-[#E8DED0] text-[#1F2937] hover:bg-[#F9F6F0] rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to All Students
          </button>
        )}
      </div>

      {!selectedStudentId ? (
        /* Student Cards List */
        studentSummaryCounts.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-[#E8DED0]">
            <BookOpen className="w-12 h-12 text-[#A09080] mx-auto mb-3 opacity-40" />
            <p className="text-base font-bold text-[#1F2937]">No Students Found</p>
            <p className="text-xs text-[#737373] mt-1">Adjust search keywords or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {studentSummaryCounts.map(({ student, count, latest }) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className="bg-white p-5 rounded-2xl border border-[#E8DED0] hover:border-[#1E3A8A] shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between group h-full cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 border border-purple-100 group-hover:bg-[#1E3A8A] transition-colors">
                      <Sparkles className="w-5 h-5 text-[#1E3A8A] group-hover:text-white transition-colors" />
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-purple-50 text-[#1E3A8A] text-xs font-bold border border-purple-100 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      {count} {count === 1 ? 'Log' : 'Logs'}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#1F2937] line-clamp-1 mb-1 group-hover:text-[#1E3A8A] transition-colors">
                    {student.full_name || 'Unknown Student'}
                  </h3>
                  <p className="text-xs text-[#737373] line-clamp-1 mb-4">
                    {student.email}
                  </p>

                  <div className="space-y-2">
                    {student.college_name && (
                      <div className="flex items-center gap-2 text-[11px] text-[#6B5A4D]">
                        <Building2 className="w-3.5 h-3.5 text-[#A09080]" />
                        <span className="line-clamp-1">{student.college_name}</span>
                      </div>
                    )}
                    {latest && (
                      <div className="flex items-center gap-2 text-[11px] text-[#6B5A4D]">
                        <Clock className="w-3.5 h-3.5 text-[#A09080]" />
                        <span className="line-clamp-1">Last active: {latest}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E8DED0]/60 flex items-center justify-between text-xs font-bold text-[#1E3A8A] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View Progress</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        /* Selected Student's Progress View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* Main Calendar View */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs">
            {/* Calendar Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F3EFE9]">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-[#1E3A8A]" />
                <h3 className="text-base font-serif font-bold text-[#1F2937]">
                  {monthName} {year}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl p-1">
                <button
                  onClick={prevMonth}
                  className="p-1.5 hover:bg-[#F3EFE9] text-[#737373] hover:text-[#1F2937] rounded-lg transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-2.5 py-1 text-xs font-bold text-[#1E3A8A] hover:bg-[#F3EFE9] rounded-lg transition-colors cursor-pointer"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1.5 hover:bg-[#F3EFE9] text-[#737373] hover:text-[#1F2937] rounded-lg transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-[11px] font-bold text-[#A09080] uppercase">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={\`empty-\${i}\`} className="h-12 rounded-xl bg-transparent" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = \`\${year}-\${String(month + 1).padStart(2, '0')}-\${String(day).padStart(2, '0')}\`;
                const hasSummary = summariesByDate.has(dateStr);
                const isSelected = selectedDateStr === dateStr;
                const isToday = new Date().toISOString().split('T')[0] === dateStr;

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDateStr(dateStr)}
                    className={\`h-12 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer \${
                      isSelected
                        ? 'bg-[#1E3A8A] text-white font-bold shadow-xs'
                        : hasSummary
                        ? 'bg-blue-50 hover:bg-blue-100 text-[#1F2937] font-bold border border-blue-200'
                        : 'hover:bg-[#FFFDF8] text-[#737373] border border-transparent'
                    } \${isToday && !isSelected ? 'ring-2 ring-[#C5A880]' : ''}\`}
                  >
                    <span className="text-xs">{day}</span>
                    {hasSummary && (
                      <span
                        className={\`w-1.5 h-1.5 rounded-full mt-0.5 \${
                          isSelected ? 'bg-white' : 'bg-[#1E3A8A]'
                        }\`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#F3EFE9] text-xs text-[#737373]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]"></span>
                <span>Summary Submitted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-[#C5A880]"></span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Selected Date Summary Reader */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F3EFE9]">
                <div>
                  <p className="text-[11px] font-bold text-[#A09080] uppercase">Selected Date</p>
                  <h3 className="text-base font-serif font-bold text-[#1F2937] flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-[#1E3A8A]" />
                    {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h3>
                </div>
                {selectedSummary && (
                  <span className="text-[11px] px-2.5 py-1 bg-green-50 text-green-700 font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Submitted
                  </span>
                )}
              </div>

              {selectedSummary ? (
                <div className="space-y-4">
                  <div className="bg-[#FFFDF8] p-4 rounded-xl border border-[#F3EFE9]">
                    <p className="text-xs font-bold text-[#A09080] uppercase mb-2">Student Reflection</p>
                    <p className="text-sm text-[#1F2937] leading-relaxed whitespace-pre-wrap">
                      {selectedSummary.summary}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#737373]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#A09080]" />
                      <span>
                        Logged at:{' '}
                        <span className="font-semibold text-[#1F2937]">
                          {new Date(selectedSummary.created_at).toLocaleString()}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#A09080]" />
                      <span>
                        Author:{' '}
                        <span className="font-semibold text-[#1F2937]">
                          {selectedStudent?.full_name || 'Student'}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-[#737373]">
                  <FileText className="w-10 h-10 text-[#A09080] mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold text-[#1F2937]">No Summary on This Date</p>
                  <p className="text-xs text-[#737373] mt-1">
                    The student did not submit an English reflection for this date.
                  </p>
                </div>
              )}
            </div>

            {/* List of Recent Month Summaries for this Student */}
            {thisMonthSummaries.length > 0 && (
              <div className="pt-4 mt-6 border-t border-[#F3EFE9]">
                <p className="text-xs font-bold text-[#A09080] uppercase mb-2">
                  All Reflections in {monthName} ({thisMonthSummaries.length})
                </p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {thisMonthSummaries.map((sum) => (
                    <button
                      key={sum.id}
                      onClick={() => setSelectedDateStr(sum.entry_date)}
                      className={\`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors cursor-pointer \${
                        selectedDateStr === sum.entry_date
                          ? 'bg-[#1E3A8A] text-white font-bold'
                          : 'bg-[#FFFDF8] hover:bg-[#F3EFE9] text-[#1F2937] border border-[#E8DED0]'
                      }\`}
                    >
                      <span className="font-medium">{sum.entry_date}</span>
                      <span className="truncate max-w-[160px] opacity-80">{sum.summary}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
INNER_EOF
