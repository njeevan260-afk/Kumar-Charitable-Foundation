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
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [studentSearch, setStudentSearch] = useState('');

  // Calendar month state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // If initial student wasn't set yet but students loaded
  React.useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Summaries for this selected student
  const studentSummaries = useMemo(() => {
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

  const currentYearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#E8DED0]">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-[#1F2937]">English Companion Progress</h2>
          <p className="text-xs text-[#737373] mt-0.5">
            Review student daily learning reflections, streaks, and monthly progress
          </p>
        </div>

        {/* Student Selector Dropdown / Search */}
        <div className="w-full md:w-80">
          <label className="block text-[11px] font-bold text-[#A09080] uppercase mb-1">Select Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full py-2.5 px-3.5 bg-white border border-[#E8DED0] focus:border-[#1E3A8A] rounded-xl text-xs font-bold text-[#1F2937] outline-none cursor-pointer shadow-2xs"
          >
            {students.length === 0 ? (
              <option value="">No registered students</option>
            ) : (
              students.map((s) => {
                const count = summaries.filter((sum) => sum.user_id === s.id).length;
                return (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.email} ({count} reflections)
                  </option>
                );
              })
            )}
          </select>
        </div>
      </div>

      {/* Selected Student Banner & Stats */}
      {selectedStudent && (
        <div className="bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center font-bold text-lg">
              {selectedStudent.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-[#1F2937]">{selectedStudent.full_name}</h3>
                <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-[#1E3A8A] font-bold rounded-full">
                  {selectedStudent.current_semester || 'Active'}
                </span>
              </div>
              <p className="text-xs text-[#737373]">
                {selectedStudent.college_name || 'College N/A'} • {selectedStudent.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 divide-x divide-[#E8DED0] pt-2 md:pt-0">
            <div className="text-center px-3">
              <p className="text-[11px] font-bold text-[#A09080] uppercase">This Month</p>
              <p className="text-2xl font-serif font-bold text-[#1E3A8A]">{thisMonthSummaries.length}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[11px] font-bold text-[#A09080] uppercase">Total Submitted</p>
              <p className="text-2xl font-serif font-bold text-[#9C7A4A]">{studentSummaries.length}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-[11px] font-bold text-[#A09080] uppercase">Monthly Goal</p>
              <p className="text-2xl font-serif font-bold text-green-700">
                {daysInMonth > 0 ? `${Math.round((thisMonthSummaries.length / daysInMonth) * 100)}%` : '0%'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Calendar on Left, Selected Summary on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Card */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E8DED0] shadow-xs">
          <div className="flex items-center justify-between mb-6">
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
              <div key={`empty-${i}`} className="h-12 rounded-xl bg-transparent" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const hasSummary = summariesByDate.has(dateStr);
              const isSelected = selectedDateStr === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-12 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1E3A8A] text-white font-bold shadow-xs'
                      : hasSummary
                      ? 'bg-blue-50 hover:bg-blue-100 text-[#1F2937] font-bold border border-blue-200'
                      : 'hover:bg-[#FFFDF8] text-[#737373] border border-transparent'
                  } ${isToday && !isSelected ? 'ring-2 ring-[#C5A880]' : ''}`}
                >
                  <span className="text-xs">{day}</span>
                  {hasSummary && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-white' : 'bg-[#1E3A8A]'
                      }`}
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
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                      selectedDateStr === sum.entry_date
                        ? 'bg-[#1E3A8A] text-white font-bold'
                        : 'bg-[#FFFDF8] hover:bg-[#F3EFE9] text-[#1F2937] border border-[#E8DED0]'
                    }`}
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
    </div>
  );
};
