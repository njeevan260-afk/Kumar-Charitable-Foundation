import React, { useState } from 'react';
import { EnglishLearningSummary } from '../../types/student';
import { supabase } from '../../supabaseClient';
import { Sparkles, ExternalLink, Calendar, ChevronLeft, ChevronRight, Save, Trash2, Edit3, CheckCircle2, AlertCircle, Loader2, BookOpen, Clock } from 'lucide-react';

interface StudentEnglishTabProps {
  studentId: string;
  summaries: EnglishLearningSummary[];
  onSummariesChange: (summaries: EnglishLearningSummary[]) => void;
}

// Configured English Companion URL
const ENGLISH_COMPANION_URL =
  (import.meta as any).env?.VITE_ENGLISH_COMPANION_URL ||
  'https://remix-kumar-charity-english-companion-2616.ai.studio/';

export const StudentEnglishTab: React.FC<StudentEnglishTabProps> = ({
  studentId,
  summaries,
  onSummariesChange,
}) => {
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const existingTodaySummary = summaries.find((s) => s.entry_date === todayStr);

  const [todayText, setTodayText] = useState(existingTodaySummary?.summary || '');
  const [savingToday, setSavingToday] = useState(false);
  const [todaySuccess, setTodaySuccess] = useState<string | null>(null);
  const [todayError, setTodayError] = useState<string | null>(null);

  // Month navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDaySummary, setSelectedDaySummary] = useState<EnglishLearningSummary | null>(null);
  const [editingModalSummary, setEditingModalSummary] = useState<EnglishLearningSummary | null>(null);
  const [modalText, setModalText] = useState('');
  const [savingModal, setSavingModal] = useState(false);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDaySummary(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDaySummary(null);
  };

  const handleSaveTodaySummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayText.trim()) {
      setTodayError('Please enter what you learned or practiced today.');
      return;
    }

    setSavingToday(true);
    setTodayError(null);
    setTodaySuccess(null);

    const now = new Date().toISOString();

    try {
      if (existingTodaySummary) {
        // Update existing
        let { error: dbError } = await supabase
          .from('english_learning_summaries')
          .update({
            summary: todayText.trim(),
            updated_at: now,
          })
          .eq('id', existingTodaySummary.id)
          .eq('user_id', studentId);

        if (dbError && dbError.message?.includes('user_id')) {
          const fallback = await supabase
            .from('english_learning_summaries')
            .update({
              summary: todayText.trim(),
              updated_at: now,
            })
            .eq('id', existingTodaySummary.id)
            .eq('student_id', studentId);
          dbError = fallback.error;
        }

        if (dbError) {
          console.warn('DB update notice (fallback to local state):', dbError.message);
        }

        const updated = summaries.map((s) =>
          s.id === existingTodaySummary.id
            ? { ...s, user_id: studentId, summary: todayText.trim(), updated_at: now }
            : s
        );
        onSummariesChange(updated);
        setTodaySuccess("Today's learning summary updated successfully!");
      } else {
        // Insert new entry
        const newId = crypto.randomUUID ? crypto.randomUUID() : `eng-${Date.now()}`;
        const newRecordPayload: any = {
          id: newId,
          user_id: studentId,
          summary: todayText.trim(),
          entry_date: todayStr,
          created_at: now,
          updated_at: now,
        };

        let { error: dbError } = await supabase
          .from('english_learning_summaries')
          .insert(newRecordPayload);

        if (dbError && dbError.message?.includes('user_id')) {
          delete newRecordPayload.user_id;
          newRecordPayload.student_id = studentId;
          const fallback = await supabase
            .from('english_learning_summaries')
            .insert(newRecordPayload);
          dbError = fallback.error;
        }

        if (dbError) {
          console.warn('DB insert notice (fallback to local state):', dbError.message);
        }

        const newObj: EnglishLearningSummary = {
          id: newId,
          user_id: studentId,
          summary: todayText.trim(),
          entry_date: todayStr,
          created_at: now,
          updated_at: now,
        };

        onSummariesChange([newObj, ...summaries]);
        setTodaySuccess("Today's learning summary saved successfully!");
      }
    } catch (err: any) {
      setTodayError(err.message || 'Failed to save learning summary.');
    } finally {
      setSavingToday(false);
    }
  };

  const handleDeleteSummary = async (summaryId: string) => {
    if (!window.confirm('Are you sure you want to delete this summary entry?')) return;

    try {
      let { error: dbError } = await supabase
        .from('english_learning_summaries')
        .delete()
        .eq('id', summaryId)
        .eq('user_id', studentId);

      if (dbError && dbError.message?.includes('user_id')) {
        const fallback = await supabase
          .from('english_learning_summaries')
          .delete()
          .eq('id', summaryId)
          .eq('student_id', studentId);
        dbError = fallback.error;
      }

      if (dbError) {
        console.warn('DB delete warning:', dbError.message);
      }

      const updated = summaries.filter((s) => s.id !== summaryId);
      onSummariesChange(updated);
      setSelectedDaySummary(null);
      if (existingTodaySummary?.id === summaryId) {
        setTodayText('');
      }
    } catch (err: any) {
      alert('Failed to delete summary: ' + err.message);
    }
  };

  const handleOpenEditModal = (s: EnglishLearningSummary) => {
    setEditingModalSummary(s);
    setModalText(s.summary);
  };

  const handleSaveModalEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingModalSummary) return;

    setSavingModal(true);
    const now = new Date().toISOString();

    try {
      let { error: dbError } = await supabase
        .from('english_learning_summaries')
        .update({
          summary: modalText.trim(),
          updated_at: now,
        })
        .eq('id', editingModalSummary.id)
        .eq('user_id', studentId);

      if (dbError && dbError.message?.includes('user_id')) {
        const fallback = await supabase
          .from('english_learning_summaries')
          .update({
            summary: modalText.trim(),
            updated_at: now,
          })
          .eq('id', editingModalSummary.id)
          .eq('student_id', studentId);
        dbError = fallback.error;
      }

      if (dbError) console.warn('DB update warning:', dbError.message);

      const updated = summaries.map((s) =>
        s.id === editingModalSummary.id
          ? { ...s, user_id: studentId, summary: modalText.trim(), updated_at: now }
          : s
      );
      onSummariesChange(updated);
      setSelectedDaySummary({ ...editingModalSummary, user_id: studentId, summary: modalText.trim(), updated_at: now });
      if (editingModalSummary.entry_date === todayStr) {
        setTodayText(modalText.trim());
      }
      setEditingModalSummary(null);
    } catch (err: any) {
      alert('Failed to update summary: ' + err.message);
    } finally {
      setSavingModal(false);
    }
  };

  // Filter summaries for active month
  const targetYearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthSummaries = summaries
    .filter((s) => s.entry_date.startsWith(targetYearMonth))
    .sort((a, b) => b.entry_date.localeCompare(a.entry_date));

  // Find most recent summary across all records
  const mostRecentSummary = summaries.length > 0
    ? [...summaries].sort((a, b) => b.entry_date.localeCompare(a.entry_date))[0]
    : null;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-br from-[#1E3A8A] via-[#1e40af] to-[#172554] text-white p-6 md:p-8 rounded-2xl shadow-sm border border-[#1E3A8A]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-blue-100 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Communication & Fluency Program
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">
            English Companion
          </h2>
          <p className="text-blue-100 text-sm leading-relaxed">
            Improve your English communication and speaking skills. Practice pronunciation, vocabulary, and active conversations every day.
          </p>
        </div>

        <a
          href={ENGLISH_COMPANION_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#FFFDF8] text-[#1E3A8A] text-sm font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] flex-shrink-0 cursor-pointer"
        >
          <span>Open English Companion</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Activity Consistency Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#E8DED0] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#A09080] tracking-wider block mb-1">
            Days with summaries this month ({monthName})
          </span>
          <p className="text-2xl font-serif font-bold text-[#1F2937]">
            {monthSummaries.length} {monthSummaries.length === 1 ? 'day' : 'days'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E8DED0] shadow-xs">
          <span className="text-xs uppercase font-bold text-[#A09080] tracking-wider block mb-1">
            Most Recent Summary Date
          </span>
          <p className="text-2xl font-serif font-bold text-[#1F2937]">
            {mostRecentSummary ? new Date(mostRecentSummary.entry_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'No entries yet'}
          </p>
        </div>
      </div>

      {/* Today's Learning Summary Box */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-[#E8DED0]">
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-[#F3EFE9]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-[#1E3A8A]" />
            <h3 className="text-lg font-serif font-bold text-[#1F2937]">
              Today's Learning Summary
            </h3>
          </div>
          <span className="text-xs font-semibold text-[#1E3A8A] bg-blue-50 px-3 py-1 rounded-full">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>

        <p className="text-xs text-[#737373] mb-4">
          Record your daily speaking practice, new vocabulary words, grammar concepts, pronunciation drills, or reflections.
        </p>

        {todaySuccess && (
          <div className="mb-4 p-3 bg-emerald-50 rounded-xl flex items-start gap-2 text-emerald-800 text-xs font-medium border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{todaySuccess}</span>
          </div>
        )}

        {todayError && (
          <div className="mb-4 p-3 bg-red-50 rounded-xl flex items-start gap-2 text-red-700 text-xs border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{todayError}</span>
          </div>
        )}

        <form onSubmit={handleSaveTodaySummary} className="space-y-4">
          <textarea
            rows={4}
            value={todayText}
            onChange={(e) => setTodayText(e.target.value)}
            placeholder="What did you learn or practice today? (e.g. Practiced conversational English for 20 minutes, learned 5 new vocabulary words, improved syllable stress on complex terms...)"
            className="w-full p-4 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] resize-y"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#A09080]">
              {existingTodaySummary ? 'Editing existing entry for today' : 'Date and timestamp will be saved automatically'}
            </span>
            <button
              type="submit"
              disabled={savingToday}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-[#1e40af] text-white rounded-xl text-sm font-semibold transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {savingToday ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {existingTodaySummary ? "Edit Today's Summary" : "Save Today's Summary"}
            </button>
          </div>
        </form>
      </div>

      {/* Monthly Learning View & Calendar */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xs border border-[#E8DED0]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F3EFE9]">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#1F2937]">English Companion Progress</h3>
            <p className="text-xs text-[#737373] mt-0.5">Track your daily learning consistency month by month</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 border border-[#E8DED0] hover:bg-[#FFFDF8] rounded-xl text-[#1F2937] transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-[#1F2937] min-w-[130px] text-center">
              {monthName} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 border border-[#E8DED0] hover:bg-[#FFFDF8] rounded-xl text-[#1F2937] transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1E3A8A] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            </span>
            <span className="text-[#1F2937] font-medium">● Summary added</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-[#D1D5DB] bg-white"></span>
            <span className="text-[#737373]">○ No summary</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="border border-[#E8DED0] rounded-2xl overflow-hidden mb-6">
          <div className="grid grid-cols-7 bg-[#F9F6F0] text-center text-xs font-bold text-[#A09080] py-2.5 border-b border-[#E8DED0]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 divide-x divide-y divide-[#E8DED0] bg-[#FFFDF8]">
            {/* Blank leading days */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`blank-${idx}`} className="h-14 md:h-16 bg-[#FDFBF7]/60"></div>
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const daySummary = summaries.find((s) => s.entry_date === dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = selectedDaySummary?.entry_date === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    if (daySummary) setSelectedDaySummary(daySummary);
                  }}
                  disabled={!daySummary}
                  className={`h-14 md:h-16 p-1.5 md:p-2 flex flex-col justify-between text-left transition-all ${
                    daySummary ? 'hover:bg-blue-50/50 cursor-pointer' : 'cursor-default opacity-60'
                  } ${isSelected ? 'ring-2 ring-[#1E3A8A] bg-blue-50/80 z-10' : ''}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-[#1E3A8A] text-white flex items-center justify-center'
                          : 'text-[#1F2937]'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {daySummary && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" title="Summary recorded"></span>
                    )}
                  </div>

                  {daySummary ? (
                    <span className="text-[10px] text-[#1E3A8A] font-semibold truncate hidden sm:block">
                      Summary added
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#A09080] truncate hidden sm:block">
                      —
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Summary Display */}
        {selectedDaySummary && (
          <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-200 mb-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1E3A8A]" />
                <h4 className="text-sm font-bold text-[#1F2937]">
                  {new Date(selectedDaySummary.entry_date).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedDaySummary)}
                  className="text-xs text-[#1E3A8A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <span className="text-blue-300">|</span>
                <button
                  onClick={() => handleDeleteSummary(selectedDaySummary.id)}
                  className="text-xs text-red-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>

            <p className="text-sm text-[#1F2937] leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-xl border border-blue-100">
              {selectedDaySummary.summary}
            </p>
          </div>
        )}

        {/* Monthly List View */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-[#1F2937] uppercase tracking-wider text-[#A09080]">
            {monthName} {year} Summaries List
          </h4>

          {monthSummaries.length === 0 ? (
            <div className="p-6 bg-[#FFFDF8] rounded-xl border border-[#F3EFE9] text-center text-xs text-[#737373]">
              No learning summaries have been added for this month yet.
            </div>
          ) : (
            <div className="divide-y divide-[#F3EFE9] border border-[#E8DED0] rounded-xl overflow-hidden">
              {monthSummaries.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white hover:bg-[#FFFDF8] flex items-center justify-between gap-4 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#1E3A8A]"></span>
                      <span className="text-xs font-bold text-[#1F2937]">
                        {new Date(item.entry_date).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#737373] line-clamp-1 max-w-md">{item.summary}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => setSelectedDaySummary(item)}
                      className="px-3 py-1.5 bg-[#FFFDF8] hover:bg-[#F3EFE9] border border-[#E8DED0] text-[#1E3A8A] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-1.5 text-[#737373] hover:text-[#1E3A8A] rounded-lg transition-colors cursor-pointer"
                      title="Edit Entry"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSummary(item.id)}
                      className="p-1.5 text-[#737373] hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Entry Modal */}
      {editingModalSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E8DED0] animate-fadeIn">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F3EFE9]">
              <h3 className="text-lg font-serif font-bold text-[#1F2937]">Edit Learning Summary</h3>
              <button
                onClick={() => setEditingModalSummary(null)}
                className="text-[#737373] hover:text-[#1F2937] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModalEdit} className="space-y-4">
              <span className="text-xs text-[#A09080] font-semibold block">
                Entry Date: {new Date(editingModalSummary.entry_date).toLocaleDateString()}
              </span>
              <textarea
                rows={4}
                required
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                className="w-full p-3 bg-[#FFFDF8] border border-[#E8DED0] rounded-xl text-sm text-[#1F2937] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-[#F3EFE9]">
                <button
                  type="button"
                  onClick={() => setEditingModalSummary(null)}
                  className="px-4 py-2 bg-white border border-[#E8DED0] text-xs font-medium rounded-xl text-[#4F4F4F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingModal}
                  className="px-5 py-2 bg-[#1E3A8A] hover:bg-[#1e40af] text-white text-xs font-semibold rounded-xl"
                >
                  {savingModal ? 'Saving...' : 'Save Summary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
